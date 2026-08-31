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

  getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    const all = this.getAllUsers();
    return all.length > 0 ? all[0] : null;
  },

  async login(usernameOrEmail: string, _password?: string): Promise<UserProfile> {
    const cleanQuery = usernameOrEmail.toLowerCase().trim();

    try {
      const isEmail = cleanQuery.includes('@');
      const query = isEmail
        ? supabase.from('profiles').select('*').eq('email', cleanQuery).maybeSingle()
        : supabase.from('profiles').select('*').eq('username', cleanQuery).maybeSingle();

      const { data, error } = await query;
      if (data && !error) {
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
    } catch {
      // Fallback
    }

    const all = this.getAllUsers();
    const existing = all.find(u => u.username.toLowerCase() === cleanQuery || u.email.toLowerCase() === cleanQuery);
    
    if (existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return existing;
    }

    // Auto-create registered real user session if first time entering
    const newCode = generateUniqueReferralCode(all);
    const user: UserProfile = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail,
      username: usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0].toLowerCase() : usernameOrEmail.toLowerCase(),
      email: usernameOrEmail.includes('@') ? usernameOrEmail.toLowerCase() : `${usernameOrEmail.toLowerCase()}@ivestbot.io`,
      referralCode: newCode,
      level: 1,
      status: 'ACTIVE',
      kycStatus: 'NOT_SUBMITTED',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.upsertUser(user);
    return user;
  },

  async register(data: { name: string; username: string; email: string; referralCode?: string }): Promise<UserProfile> {
    const all = this.getAllUsers();
    const newRefCode = generateUniqueReferralCode(all);
    const cleanUsername = data.username.toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();
    const referredByClean = data.referralCode?.trim() || undefined;

    try {
      const { data: inserted, error } = await supabase
        .from('profiles')
        .insert({
          name: data.name.trim(),
          username: cleanUsername,
          email: cleanEmail,
          referral_code: newRefCode,
          referred_by_code: referredByClean || null,
          level: 1,
          status: 'ACTIVE',
          kyc_status: 'NOT_SUBMITTED'
        })
        .select()
        .single();

      if (inserted && !error) {
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
    } catch {
      // Fallback to local
    }

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
