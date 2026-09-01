import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  level: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
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

  async syncAllUsersFromSupabase(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data && !error && data.length > 0) {
        const remoteUsers: UserProfile[] = data.map(d => ({
          id: d.id,
          name: d.name || 'User',
          username: d.username || 'user',
          email: d.email || '',
          referralCode: d.referral_code || 'IVEST100',
          referredBy: d.referred_by_code || undefined,
          level: d.level || 1,
          status: d.status || 'ACTIVE',
          kycStatus: d.kyc_status || 'NOT_SUBMITTED',
          createdAt: d.created_at || new Date().toISOString()
        }));

        const local = this.getAllUsers();
        const mergedMap = new Map<string, UserProfile>();
        remoteUsers.forEach(u => mergedMap.set(u.id, u));
        local.forEach(u => {
          if (!mergedMap.has(u.id)) {
            mergedMap.set(u.id, u);
          }
        });

        const merged = Array.from(mergedMap.values());
        this.saveAllUsers(merged);
        return merged;
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
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  },

  async login(usernameOrEmail: string, password?: string): Promise<UserProfile> {
    const cleanQuery = usernameOrEmail.toLowerCase().trim();
    if (!cleanQuery) {
      throw new Error('Please enter your username or email.');
    }

    try {
      const isEmail = cleanQuery.includes('@');
      const query = isEmail
        ? supabase.from('profiles').select('*').eq('email', cleanQuery).maybeSingle()
        : supabase.from('profiles').select('*').eq('username', cleanQuery).maybeSingle();

      const { data, error } = await query;
      if (data && !error) {
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
          status: data.status || 'ACTIVE',
          kycStatus: data.kyc_status || 'NOT_SUBMITTED',
          createdAt: data.created_at
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.upsertUser(user);
        return user;
      }
    } catch (err: any) {
      if (err?.message?.includes('password')) {
        throw err;
      }
    }

    // Check local stored users
    const all = this.getAllUsers();
    const existing = all.find(u => u.username.toLowerCase() === cleanQuery || u.email.toLowerCase() === cleanQuery);
    
    if (existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return existing;
    }

    throw new Error('Account not found with this username or email. Please create an account first.');
  },

  async register(data: { name: string; username: string; email: string; password?: string; referralCode?: string }): Promise<UserProfile> {
    const all = this.getAllUsers();
    const cleanUsername = data.username.toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();
    const referredByClean = data.referralCode?.trim() || undefined;

    // Check if user already exists locally
    const existingLocal = all.find(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail);
    if (existingLocal) {
      throw new Error('An account with this username or email already exists. Please login instead.');
    }

    const newRefCode = generateUniqueReferralCode(all);

    try {
      // Check existing in Supabase
      const { data: existingSupabase } = await supabase
        .from('profiles')
        .select('id')
        .or(`username.eq.${cleanUsername},email.eq.${cleanEmail}`)
        .maybeSingle();

      if (existingSupabase) {
        throw new Error('An account with this username or email already exists in the system. Please login.');
      }

      const { data: inserted, error } = await supabase
        .from('profiles')
        .insert({
          name: data.name.trim(),
          username: cleanUsername,
          email: cleanEmail,
          password_hash: data.password || null,
          referral_code: newRefCode,
          referred_by_code: referredByClean || null,
          level: 1,
          status: 'ACTIVE',
          kyc_status: 'NOT_SUBMITTED'
        })
        .select()
        .single();

      if (inserted && !error) {
        // Initialize user wallet in database
        try {
          await supabase.from('wallets').insert({
            user_id: inserted.id,
            total_balance: 0.0,
            available_balance: 0.0,
            pending_balance: 0.0,
            currency: 'USDT'
          });
        } catch {
          // ignore
        }

        const user: UserProfile = {
          id: inserted.id,
          name: inserted.name,
          username: inserted.username,
          email: inserted.email,
          referralCode: inserted.referral_code,
          referredBy: inserted.referred_by_code || undefined,
          level: inserted.level || 1,
          status: inserted.status || 'ACTIVE',
          kycStatus: inserted.kyc_status || 'NOT_SUBMITTED',
          createdAt: inserted.created_at
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.upsertUser(user);
        return user;
      }
    } catch (err: any) {
      if (err?.message?.includes('already exists')) {
        throw err;
      }
    }

    // Fallback if offline
    const user: UserProfile = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      referralCode: newRefCode,
      referredBy: referredByClean,
      level: 1,
      status: 'ACTIVE',
      kycStatus: 'NOT_SUBMITTED',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.upsertUser(user);
    return user;
  },

  upsertUser(user: UserProfile): void {
    const all = this.getAllUsers();
    const index = all.findIndex(u => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
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
  }
};
