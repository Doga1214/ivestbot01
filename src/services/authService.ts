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
  isEmailVerified?: boolean;
  avatarUrl?: string;
  hasWithdrawalPin?: boolean;
  withdrawalPinHash?: string;
  pinFailedAttempts?: number;
  pinLockedUntil?: string;
  createdAt: string;
}

export interface PinSecurityState {
  hasPin: boolean;
  pinHash?: string;
  failedAttempts: number;
  lockedUntil?: string | null;
}

export async function hashWithdrawalPin(pin: string, salt: string = 'ivestbot_sec_pin_'): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(salt + pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fallback
  }
  let hash = 0;
  const str = salt + pin;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'fb_' + Math.abs(hash).toString(16);
}

export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

const STORAGE_KEY = 'ivestbot_auth_user';
const ALL_USERS_KEY = 'ivestbot_all_users_list';
const DELETED_USERS_KEY = 'ivestbot_deleted_user_ids';

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
  getDeletedUserIds(): Set<string> {
    try {
      const stored = localStorage.getItem(DELETED_USERS_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    return new Set<string>();
  },

  saveDeletedUserIds(ids: Set<string>): void {
    localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(Array.from(ids)));
  },

  getAllUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(ALL_USERS_KEY);
      if (stored) {
        const parsed: UserProfile[] = JSON.parse(stored);
        const deleted = this.getDeletedUserIds();
        return parsed.filter(u => !deleted.has(u.id));
      }
    } catch {
      // ignore
    }
    return [];
  },

  saveAllUsers(users: UserProfile[]): void {
    const deleted = this.getDeletedUserIds();
    const cleanList = users.filter(u => !deleted.has(u.id));
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(cleanList));
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
   */
  async syncAllUsersFromSupabase(): Promise<UserProfile[]> {
    try {
      // 1. Fetch remote users directly from Supabase profiles table
      const { data: remoteProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase sync users fetch error:', error.message);
      }

      const deleted = this.getDeletedUserIds();

      if (remoteProfiles && remoteProfiles.length >= 0) {
        const remoteUsers: UserProfile[] = remoteProfiles
          .filter(d => !deleted.has(d.id))
          .map(d => ({
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

        // Keep current active user session up to date with remote Supabase profile
        const current = this.getCurrentUser();
        if (current) {
          const matched = remoteUsers.find(u => u.id === current.id || (u.email && u.email.toLowerCase() === current.email.toLowerCase()));
          if (matched) {
            const updatedCurrent = { ...current, ...matched };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCurrent));
          }
        }

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

  /**
   * Sends 6-digit OTP code to the provided email address via Supabase Auth.
   */
  async sendEmailOtp(email: string, password?: string, metadata?: { name?: string; username?: string }): Promise<{ success: boolean; message: string; isSimulated?: boolean; simulatedOtp?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    // Check if user already exists in profiles table
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        throw new Error('An account with this email already exists. Please log in.');
      }
    } catch (err: any) {
      if (err?.message?.includes('already exists')) throw err;
    }

    try {
      // Trigger Supabase Auth OTP / Confirmation email
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password || 'Ivestbot@Secured2026',
        options: {
          data: {
            name: metadata?.name || 'Trader',
            username: metadata?.username || cleanEmail.split('@')[0]
          }
        }
      });

      if (error) {
        console.warn('[Supabase Auth Warning]', error.message);
        // If Supabase free tier rate-limits or SMTP is pending, generate fallback OTP in sessionStorage
        if (error.message.includes('rate limit') || error.message.includes('over_email_send_rate_limit') || error.message.includes('SMTP') || error.message.includes('security purposes')) {
          const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
          sessionStorage.setItem(`ivestbot_otp_${cleanEmail}`, JSON.stringify({ otp: fallbackOtp, expiresAt: Date.now() + 10 * 60 * 1000 }));
          return {
            success: true,
            message: `Supabase default rate limit reached. Verification OTP: ${fallbackOtp}`,
            isSimulated: true,
            simulatedOtp: fallbackOtp
          };
        }
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `6-digit verification code sent to ${cleanEmail}. Please check your inbox or spam.`
      };
    } catch (err: any) {
      if (err?.message?.includes('already exists')) throw err;
      // Fallback resilience for local/test environments
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem(`ivestbot_otp_${cleanEmail}`, JSON.stringify({ otp: fallbackOtp, expiresAt: Date.now() + 10 * 60 * 1000 }));
      return {
        success: true,
        message: `Verification code generated: ${fallbackOtp}`,
        isSimulated: true,
        simulatedOtp: fallbackOtp
      };
    }
  },

  /**
   * Resends the 6-digit OTP code to the email address.
   */
  async resendEmailOtp(email: string): Promise<{ success: boolean; message: string; simulatedOtp?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail
      });
      if (error) {
        const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem(`ivestbot_otp_${cleanEmail}`, JSON.stringify({ otp: fallbackOtp, expiresAt: Date.now() + 10 * 60 * 1000 }));
        return {
          success: true,
          message: `New code generated: ${fallbackOtp}`,
          simulatedOtp: fallbackOtp
        };
      }
      return { success: true, message: `New verification code sent to ${cleanEmail}.` };
    } catch {
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem(`ivestbot_otp_${cleanEmail}`, JSON.stringify({ otp: fallbackOtp, expiresAt: Date.now() + 10 * 60 * 1000 }));
      return { success: true, message: `New verification code generated: ${fallbackOtp}`, simulatedOtp: fallbackOtp };
    }
  },

  /**
   * Verifies the 6-digit OTP code and completes registration.
   */
  async verifyOtpAndRegister(data: {
    name: string;
    username: string;
    email: string;
    password?: string;
    referralCode?: string;
    otp: string;
  }): Promise<UserProfile> {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanOtp = data.otp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      throw new Error('Please enter the full 6-digit verification code.');
    }

    let verified = false;

    // 1. Try Supabase Auth verifyOtp
    try {
      const { data: authData, error: authErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: 'signup'
      });
      if (!authErr && authData.user) {
        verified = true;
      }
    } catch {
      // proceed to fallback
    }

    // 2. Check fallback OTP in sessionStorage
    if (!verified) {
      try {
        const storedStr = sessionStorage.getItem(`ivestbot_otp_${cleanEmail}`);
        if (storedStr) {
          const stored = JSON.parse(storedStr);
          if (stored.otp === cleanOtp && Date.now() <= stored.expiresAt) {
            verified = true;
            sessionStorage.removeItem(`ivestbot_otp_${cleanEmail}`);
          }
        }
      } catch {
        // ignore
      }
    }

    // Master test code for testing
    if (cleanOtp === '123456') {
      verified = true;
    }

    if (!verified) {
      throw new Error('Invalid or expired verification code. Please check and try again.');
    }

    // 3. Register user profile
    const registered = await this.register({
      name: data.name,
      username: data.username,
      email: cleanEmail,
      password: data.password,
      referralCode: data.referralCode
    });

    registered.isEmailVerified = true;
    this.updateUserProfile({ isEmailVerified: true });

    return registered;
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

    // Sync to Supabase profiles table in background
    if (isValidUuid(current.id)) {
      const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.username !== undefined) dbUpdates.username = updates.username.toLowerCase();
      if (updates.email !== undefined) dbUpdates.email = updates.email.toLowerCase();
      if (updates.kycStatus !== undefined) dbUpdates.kyc_status = updates.kycStatus;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.level !== undefined) dbUpdates.level = updates.level;

      supabase.from('profiles').update(dbUpdates).eq('id', current.id).then(({ error }) => {
        if (error) console.warn('Error updating Supabase profile:', error);
      });
    }

    return updated;
  },

  adminUpdateUser(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const all = this.getAllUsers();
    let index = all.findIndex(u => u.id === userId);
    let updatedUser: UserProfile | null = null;

    if (index === -1) {
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        updatedUser = { ...current, ...updates };
        all.push(updatedUser);
      }
    } else {
      all[index] = { ...all[index], ...updates };
      updatedUser = all[index];
    }

    if (updatedUser) {
      this.saveAllUsers(all);
    }

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      const newCurrent = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCurrent));
    }

    // Sync to Supabase profiles table
    if (isValidUuid(userId)) {
      const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.username !== undefined) dbUpdates.username = updates.username.toLowerCase();
      if (updates.email !== undefined) dbUpdates.email = updates.email.toLowerCase();
      if (updates.kycStatus !== undefined) dbUpdates.kyc_status = updates.kycStatus;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.level !== undefined) dbUpdates.level = updates.level;

      supabase.from('profiles').update(dbUpdates).eq('id', userId).then(({ error }) => {
        if (error) console.warn('Error updating profile in Supabase:', error);
      });
    }

    return updatedUser || (current && current.id === userId ? { ...current, ...updates } : null);
  },

  async deleteUser(userId: string): Promise<boolean> {
    if (!userId) return false;

    // 1. Resolve canonical Supabase UUID if non-UUID identifier or email/username was provided
    let canonicalId = userId;
    if (!isValidUuid(canonicalId)) {
      try {
        const { data: matched } = await supabase
          .from('profiles')
          .select('id')
          .or(`email.eq.${userId},username.eq.${userId}`)
          .maybeSingle();
        if (matched?.id) {
          canonicalId = matched.id;
        }
      } catch (err) {
        console.warn('Could not resolve canonical UUID for deletion:', err);
      }
    }

    // 2. Add to deleted IDs set immediately to block in-flight renders and syncs
    const deletedIds = this.getDeletedUserIds();
    deletedIds.add(userId);
    if (canonicalId && canonicalId !== userId) {
      deletedIds.add(canonicalId);
    }
    this.saveDeletedUserIds(deletedIds);

    // 3. Call PostgreSQL SECURITY DEFINER RPC functions
    try {
      if (isValidUuid(canonicalId)) {
        await supabase.rpc('admin_delete_user', { p_user_id: canonicalId });
      }
      await supabase.rpc('admin_delete_user_by_identifier', { p_identifier: userId });
    } catch (err) {
      console.warn('[RPC Delete User Note]:', err);
    }

    // 4. Guaranteed Direct Cascading Deletes in Supabase Database
    try {
      const idsToDelete = Array.from(new Set([userId, canonicalId].filter(Boolean)));

      for (const id of idsToDelete) {
        await supabase.from('wallet_transactions').delete().eq('user_id', id);
        await supabase.from('deposits').delete().eq('user_id', id);
        await supabase.from('withdrawals').delete().eq('user_id', id);
        await supabase.from('kyc_records').delete().eq('user_id', id);
        await supabase.from('reservations').delete().eq('user_id', id);
        await supabase.from('crypto_trades').delete().eq('user_id', id);
        await supabase.from('wallets').delete().eq('user_id', id);
        
        // Delete from profiles
        await supabase.from('profiles').delete().eq('id', id);
      }

      // Also delete by email or username if matching
      if (!isValidUuid(userId)) {
        await supabase.from('profiles').delete().or(`email.eq.${userId},username.eq.${userId}`);
      }
    } catch (err) {
      console.error('[Direct DB Delete Error]:', err);
    }

    // 5. Clean up all localStorage artifacts for this user
    const all = this.getAllUsers();
    const filtered = all.filter(u => u.id !== userId && u.id !== canonicalId);
    this.saveAllUsers(filtered);

    localStorage.removeItem(`ivestbot_wallet_${userId}`);
    localStorage.removeItem(`ivestbot_wallet_${canonicalId}`);
    localStorage.removeItem(`ivestbot_ref_balance_${userId}`);
    localStorage.removeItem(`ivestbot_ref_balance_${canonicalId}`);
    localStorage.removeItem(`ivestbot_transactions_${userId}`);
    localStorage.removeItem(`ivestbot_transactions_${canonicalId}`);
    localStorage.removeItem(`ivestbot_deposits_${userId}`);
    localStorage.removeItem(`ivestbot_deposits_${canonicalId}`);
    localStorage.removeItem(`ivestbot_withdrawals_${userId}`);
    localStorage.removeItem(`ivestbot_withdrawals_${canonicalId}`);
    localStorage.removeItem(`ivestbot_kyc_${userId}`);
    localStorage.removeItem(`ivestbot_kyc_${canonicalId}`);

    // 6. If currently logged-in user is the deleted user, log out immediately
    const current = this.getCurrentUser();
    if (current && (current.id === userId || current.id === canonicalId)) {
      this.logout();
    }

    // 7. Dispatch instant event across all windows / components
    try {
      window.dispatchEvent(new CustomEvent('ivestbot_user_deleted', { detail: { userId, canonicalId } }));
    } catch {
      // ignore
    }

    return true;
  },

  getPinSecurityState(userId?: string): PinSecurityState {
    const targetId = userId || this.getCurrentUser()?.id;
    if (!targetId) {
      return { hasPin: false, failedAttempts: 0, lockedUntil: null };
    }
    try {
      const stored = localStorage.getItem(`ivestbot_pin_${targetId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hasPin: !!parsed.pinHash,
          pinHash: parsed.pinHash,
          failedAttempts: parsed.failedAttempts || 0,
          lockedUntil: parsed.lockedUntil || null
        };
      }
    } catch {
      // ignore
    }
    return { hasPin: false, failedAttempts: 0, lockedUntil: null };
  },

  hasWithdrawalPin(userId?: string): boolean {
    return this.getPinSecurityState(userId).hasPin;
  },

  async setWithdrawalPin(userId: string, newPin: string): Promise<boolean> {
    if (!newPin || !/^\d{6}$/.test(newPin)) {
      throw new Error('Withdrawal Security PIN must be exactly 6 digits.');
    }
    const hash = await hashWithdrawalPin(newPin);
    const data: PinSecurityState = {
      hasPin: true,
      pinHash: hash,
      failedAttempts: 0,
      lockedUntil: null
    };
    localStorage.setItem(`ivestbot_pin_${userId}`, JSON.stringify(data));
    this.updateUser(userId, { hasWithdrawalPin: true });
    return true;
  },

  async verifyWithdrawalPin(
    userId: string,
    pin: string
  ): Promise<{ success: boolean; message?: string; attemptsLeft?: number; isLocked?: boolean; unlockTime?: string }> {
    const state = this.getPinSecurityState(userId);

    if (!state.hasPin || !state.pinHash) {
      return {
        success: false,
        message: 'Withdrawal PIN is not set yet. Please set a 6-digit PIN first.',
        attemptsLeft: 3,
        isLocked: false
      };
    }

    // Check if account is currently locked out
    if (state.lockedUntil) {
      const lockExpiry = new Date(state.lockedUntil).getTime();
      const now = Date.now();
      if (now < lockExpiry) {
        const minutesLeft = Math.ceil((lockExpiry - now) / (60 * 1000));
        return {
          success: false,
          message: `Withdrawal PIN is locked due to multiple failed attempts. Try again in ${minutesLeft} minute(s).`,
          isLocked: true,
          unlockTime: state.lockedUntil
        };
      }
    }

    const inputHash = await hashWithdrawalPin(pin);
    if (inputHash === state.pinHash) {
      // Reset failed attempts on success
      const updated: PinSecurityState = {
        ...state,
        failedAttempts: 0,
        lockedUntil: null
      };
      localStorage.setItem(`ivestbot_pin_${userId}`, JSON.stringify(updated));
      return { success: true };
    }

    // Incorrect PIN
    const newFailed = (state.failedAttempts || 0) + 1;
    const maxAttempts = 3;
    const attemptsLeft = Math.max(0, maxAttempts - newFailed);

    let lockedUntil: string | null = null;
    if (newFailed >= maxAttempts) {
      // Lock for 12 hours (or 1 hour for test/safety)
      lockedUntil = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    }

    const updated: PinSecurityState = {
      ...state,
      failedAttempts: newFailed,
      lockedUntil
    };
    localStorage.setItem(`ivestbot_pin_${userId}`, JSON.stringify(updated));

    if (lockedUntil) {
      return {
        success: false,
        message: 'Too many incorrect PIN attempts. Withdrawals are temporarily locked for 12 hours.',
        attemptsLeft: 0,
        isLocked: true,
        unlockTime: lockedUntil
      };
    }

    return {
      success: false,
      message: `Incorrect 6-digit PIN. ${attemptsLeft} attempt(s) remaining before security lockout.`,
      attemptsLeft,
      isLocked: false
    };
  },

  async changeWithdrawalPin(
    userId: string,
    currentPin: string,
    newPin: string
  ): Promise<{ success: boolean; message: string }> {
    const verifyRes = await this.verifyWithdrawalPin(userId, currentPin);
    if (!verifyRes.success) {
      return { success: false, message: verifyRes.message || 'Current PIN verification failed' };
    }
    await this.setWithdrawalPin(userId, newPin);
    return { success: true, message: 'Withdrawal PIN updated successfully!' };
  }
};
