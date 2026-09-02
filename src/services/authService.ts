import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string; // Canonical PostgreSQL UUID
  name: string;
  username: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  level: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLOCKED';
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  avatarUrl?: string;
  createdAt: string;
}

export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

const STORAGE_KEY = 'ivestbot_auth_user';
const ALL_USERS_KEY = 'ivestbot_all_users_list';

function generateUniqueReferralCode(existingUsers: UserProfile[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const existingCodes = new Set(existingUsers.map(u => (u.referralCode || '').toUpperCase()));
  for (let i = 0; i < 1000; i++) {
    let rand = '';
    for (let j = 0; j < 6; j++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `IVEST${rand}`;
    if (!existingCodes.has(code)) {
      return code;
    }
  }
  return `IVEST${Date.now().toString(36).toUpperCase()}`;
}

export const authService = {
  getAllUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(ALL_USERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  },

  saveAllUsers(users: UserProfile[]): void {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  },

  updateUser(userId: string, data: Partial<UserProfile>): UserProfile | null {
    const all = this.getAllUsers();
    const index = all.findIndex(u => u.id === userId);
    let updated: UserProfile | null = null;
    if (index >= 0) {
      all[index] = { ...all[index], ...data };
      updated = all[index];
      this.saveAllUsers(all);
    }
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      updated = { ...current, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  },

  /**
   * Synchronizes all user profiles directly from Supabase (Single Source of Truth).
   * Also safely migrates any legacy local browser accounts into Supabase profiles automatically.
   */
  async syncAllUsersFromSupabase(): Promise<UserProfile[]> {
    try {
      // 1. Fetch remote users from Supabase
      const { data: initialRemote, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase sync users fetch error:', error.message);
      }

      const localUsers = this.getAllUsers();

      // 2. Safe Auto-Recovery Migration:
      // If local storage in the active browser has legacy accounts not yet stored in Supabase,
      // upload them safely to Supabase public.profiles and create their wallets.
      if (localUsers.length > 0 && initialRemote) {
        const remoteUsernames = new Set(initialRemote.map(d => (d.username || '').toLowerCase()));
        const remoteEmails = new Set(initialRemote.map(d => (d.email || '').toLowerCase()));

        for (const u of localUsers) {
          const uName = (u.username || '').toLowerCase().trim();
          const uEmail = (u.email || '').toLowerCase().trim();
          if (uName && !remoteUsernames.has(uName) && (!uEmail || !remoteEmails.has(uEmail))) {
            try {
              await supabase.rpc('resolve_or_create_profile', {
                p_name: u.name || uName,
                p_username: uName,
                p_email: uEmail || `${uName}@ivestbot.io`,
                p_password: null,
                p_referral_code: u.referralCode || undefined,
                p_referred_by: u.referredBy || undefined
              });
            } catch {
              // ignore
            }
          }
        }
      }

      // 3. Re-fetch all profiles from Supabase as authoritative source of truth
      const { data: finalRemote } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (finalRemote && finalRemote.length > 0) {
        const remoteUsers: UserProfile[] = finalRemote.map(d => ({
          id: d.id,
          name: d.name || 'User',
          username: d.username || 'user',
          email: d.email || '',
          referralCode: d.referral_code || 'IVEST100',
          referredBy: d.referred_by_code || undefined,
          level: d.level || 1,
          status: (d.status || 'INACTIVE') as any,
          kycStatus: d.kyc_status || 'NOT_SUBMITTED',
          createdAt: d.created_at || new Date().toISOString()
        }));

        this.saveAllUsers(remoteUsers);
        return remoteUsers;
      }
    } catch {
      // ignore network errors
    }
    return this.getAllUsers();
  },

  getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  },

  /**
   * Validates active session and automatically migrates any legacy non-UUID IDs (e.g. usr-xxxxxx)
   * to canonical Supabase UUIDs by querying profiles by email/username.
   */
  async verifyUserAlive(userId: string): Promise<UserProfile | null> {
    const currentUser = this.getCurrentUser();

    // 1. If userId is a valid UUID, fetch by ID directly from Supabase
    if (isValidUuid(userId)) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (data && !error) {
          const user: UserProfile = {
            id: data.id,
            name: data.name,
            username: data.username,
            email: data.email,
            referralCode: data.referral_code,
            referredBy: data.referred_by_code || undefined,
            level: data.level || 1,
            status: (data.status || 'INACTIVE') as any,
            kycStatus: data.kyc_status || 'NOT_SUBMITTED',
            createdAt: data.created_at
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          this.upsertUser(user);
          return user;
        }
      } catch {
        // network issue
      }
    }

    // 2. Legacy Migration Strategy: If userId is non-UUID (e.g. usr-643103), resolve canonical UUID from Supabase profiles
    if (currentUser?.email || currentUser?.username) {
      try {
        const cleanEmail = (currentUser.email || '').toLowerCase().trim();
        const cleanUsername = (currentUser.username || '').toLowerCase().trim();

        let query = supabase.from('profiles').select('*');
        if (cleanEmail && cleanUsername) {
          query = query.or(`email.eq.${cleanEmail},username.eq.${cleanUsername}`);
        } else if (cleanEmail) {
          query = query.eq('email', cleanEmail);
        } else if (cleanUsername) {
          query = query.eq('username', cleanUsername);
        }

        const { data: matchedProfile } = await query.maybeSingle();

        if (matchedProfile && isValidUuid(matchedProfile.id)) {
          const migratedUser: UserProfile = {
            id: matchedProfile.id,
            name: matchedProfile.name,
            username: matchedProfile.username,
            email: matchedProfile.email,
            referralCode: matchedProfile.referral_code,
            referredBy: matchedProfile.referred_by_code || undefined,
            level: matchedProfile.level || 1,
            status: (matchedProfile.status || 'INACTIVE') as any,
            kycStatus: matchedProfile.kyc_status || 'NOT_SUBMITTED',
            createdAt: matchedProfile.created_at
          };

          // Overwrite legacy ID with canonical UUID
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedUser));
          this.upsertUser(migratedUser);
          return migratedUser;
        }
      } catch {
        // ignore
      }
    }

    return currentUser;
  },

  async login(usernameOrEmail: string, password?: string): Promise<UserProfile> {
    const cleanQuery = usernameOrEmail.toLowerCase().trim();
    if (!cleanQuery) {
      throw new Error('Please enter your username or email.');
    }

    try {
      const isEmail = cleanQuery.includes('@');
      let query = supabase.from('profiles').select('*');
      if (isEmail) {
        query = query.eq('email', cleanQuery);
      } else {
        query = query.or(`username.eq.${cleanQuery},name.ilike.${cleanQuery}`);
      }

      const { data, error } = await query.maybeSingle();
      if (data && !error && isValidUuid(data.id)) {
        // If password_hash is recorded and user entered a password, check
        if (data.password_hash && password && data.password_hash !== password) {
          throw new Error('Invalid password. Please try again.');
        }

        const user: UserProfile = {
          id: data.id,
          name: data.name,
          username: data.username,
          email: data.email,
          referralCode: data.referral_code,
          referredBy: data.referred_by_code || undefined,
          level: data.level || 1,
          status: (data.status || 'INACTIVE') as any,
          kycStatus: data.kyc_status || 'NOT_SUBMITTED',
          createdAt: data.created_at
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.upsertUser(user);
        return user;
      }

      // Safe recovery for existing local users
      const localUsers = this.getAllUsers();
      const existingLocal = localUsers.find(
        u => u.username.toLowerCase() === cleanQuery || u.email.toLowerCase() === cleanQuery || (u.name && u.name.toLowerCase() === cleanQuery)
      );

      if (existingLocal) {
        const { data: rpcRes } = await supabase.rpc('resolve_or_create_profile', {
          p_name: existingLocal.name || cleanQuery,
          p_username: existingLocal.username || cleanQuery,
          p_email: existingLocal.email || (isEmail ? cleanQuery : `${cleanQuery}@ivestbot.io`),
          p_password: password || null,
          p_referral_code: existingLocal.referralCode || undefined,
          p_referred_by: existingLocal.referredBy || undefined
        });

        if (rpcRes?.profile?.id && isValidUuid(rpcRes.profile.id)) {
          const profile = rpcRes.profile;
          const recoveredUser: UserProfile = {
            id: profile.id,
            name: profile.name,
            username: profile.username,
            email: profile.email,
            referralCode: profile.referral_code,
            referredBy: profile.referred_by_code || undefined,
            level: profile.level || 1,
            status: profile.status || 'ACTIVE',
            kycStatus: profile.kyc_status || 'NOT_SUBMITTED',
            createdAt: profile.created_at
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(recoveredUser));
          this.upsertUser(recoveredUser);
          return recoveredUser;
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('password')) {
        throw err;
      }
    }

    throw new Error('Account not found with this username or email. Please register first.');
  },

  async register(data: { name: string; username: string; email: string; password?: string; referralCode?: string }): Promise<UserProfile> {
    const cleanUsername = data.username.toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();
    const referredByClean = data.referralCode?.trim() || undefined;

    if (!cleanUsername || !cleanEmail) {
      throw new Error('Username and email are required.');
    }

    // Call PostgreSQL atomic RPC function to resolve or create profile and initialize wallet
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('resolve_or_create_profile', {
      p_name: data.name.trim() || 'User',
      p_username: cleanUsername,
      p_email: cleanEmail,
      p_password: data.password || null,
      p_referral_code: generateUniqueReferralCode(this.getAllUsers()),
      p_referred_by: referredByClean || null
    });

    if (rpcErr || !rpcRes?.success || !rpcRes?.profile?.id || !isValidUuid(rpcRes.profile.id)) {
      console.error('[Registration Error]', rpcErr || rpcRes);
      throw new Error(rpcErr?.message || 'Registration failed on server. Please try again.');
    }

    const profile = rpcRes.profile;
    const user: UserProfile = {
      id: profile.id, // Guaranteed canonical UUID
      name: profile.name,
      username: profile.username,
      email: profile.email,
      referralCode: profile.referral_code,
      referredBy: profile.referred_by_code || undefined,
      level: profile.level || 1,
      status: profile.status || 'INACTIVE',
      kycStatus: profile.kyc_status || 'NOT_SUBMITTED',
      createdAt: profile.created_at
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.upsertUser(user);
    return user;
  },

  upsertUser(user: UserProfile): void {
    const all = this.getAllUsers();
    const index = all.findIndex(u => u.id === user.id || (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase()));
    if (index >= 0) {
      all[index] = { ...all[index], ...user };
    } else {
      all.unshift(user);
    }
    this.saveAllUsers(all);
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    this.upsertUser(updated);
    return updated;
  },

  adminUpdateUser(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const all = this.getAllUsers();
    const index = all.findIndex(u => u.id === userId);
    if (index === -1) return null;

    all[index] = { ...all[index], ...updates };
    this.saveAllUsers(all);

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all[index]));
    }
    return all[index];
  },

  async deleteUser(userId: string): Promise<boolean> {
    if (!isValidUuid(userId)) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        p_user_id: userId
      });

      if (error || !data?.success) {
        // Fallback direct delete
        await supabase.from('deposits').delete().eq('user_id', userId);
        await supabase.from('withdrawals').delete().eq('user_id', userId);
        await supabase.from('wallet_transactions').delete().eq('user_id', userId);
        await supabase.from('wallets').delete().eq('user_id', userId);
        await supabase.from('kyc_records').delete().eq('user_id', userId);
        await supabase.from('reservations').delete().eq('user_id', userId);
        await supabase.from('profiles').delete().eq('id', userId);
      }
    } catch {
      // ignore
    }

    const all = this.getAllUsers();
    const filtered = all.filter(u => u.id !== userId);
    this.saveAllUsers(filtered);

    localStorage.removeItem(`ivestbot_wallet_${userId}`);

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.logout();
    }

    return true;
  }
};
