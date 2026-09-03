import { supabase } from './supabaseClient';
import { authService, type UserProfile } from './authService';
import { walletService, type WalletState, type WalletTransaction, type WalletStatus, type WalletRestrictions, type KycSubmission, type TransactionType, type TransactionStatus } from './walletService';
import { reservationService } from './reservationService';
import { referralService, type ReferralSummary } from './referralService';

export interface AdminUserListItem {
  profile: UserProfile;
  wallet: WalletState;
  pendingDepositsCount: number;
  pendingDepositsSum: number;
  totalTransactionsCount: number;
}

export interface UserDetailed360 {
  profile: UserProfile;
  wallet: WalletState;
  referralSummary: ReferralSummary;
  lifetimeDeposits: number;
  lifetimeWithdrawals: number;
  lifetimeProfits: number;
  transactions: WalletTransaction[];
  cycleLock: {
    isLocked: boolean;
    secondsRemaining: number;
  };
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalPendingDepositsCount: number;
  totalPendingDepositsSum: number;
  totalPendingWithdrawalsCount: number;
  totalPendingWithdrawalsSum: number;
  totalPlatformCirculation: number;
  restrictedWalletsCount: number;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  active: boolean;
}

const ADMIN_SESSION_KEY = 'ivestbot_admin_session';
const ANNOUNCEMENTS_KEY = 'ivestbot_admin_announcements';

export const adminService = {
  /**
   * Check if current session is authenticated as Admin
   */
  isAdminAuthenticated(): boolean {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true' || localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  },

  /**
   * Authenticate admin securely via PostgreSQL RPC
   */
  async adminLogin(passwordOrPin: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('verify_admin_access', {
        p_passkey: passwordOrPin.trim()
      });

      if (!error && data?.authenticated) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        return true;
      }
    } catch {
      // fallback check
    }
    return false;
  },

  adminLogout(): void {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  /**
   * Fetch all users with their combined wallet and pending queue metrics directly from Supabase
   */
  async getAdminUsersList(): Promise<AdminUserListItem[]> {
    try {
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: wallets } = await supabase.from('wallets').select('*');
      const { data: deposits } = await supabase.from('deposits').select('*').eq('status', 'PENDING');
      const { data: txs } = await supabase.from('wallet_transactions').select('id, user_id');

      const deleted = authService.getDeletedUserIds();

      if (profiles && !pErr) {
        const cleanProfiles = profiles.filter(p => !deleted.has(p.id) && !deleted.has(p.email) && !deleted.has(p.username));
        const walletMap = new Map((wallets || []).map(w => [w.user_id, w]));
        const depList = deposits || [];
        const txList = txs || [];

        return cleanProfiles.map(p => {
          const w = walletMap.get(p.id);
          const userDeps = depList.filter(d => d.user_id === p.id);
          const depSum = userDeps.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
          const userTxCount = txList.filter(t => t.user_id === p.id).length;

          const walletState: WalletState = {
            totalBalance: parseFloat(w?.total_balance) || 0,
            availableBalance: parseFloat(w?.available_balance) || 0,
            pendingBalance: parseFloat(w?.pending_balance) || 0,
            currency: w?.currency || 'USDT',
            status: (p.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as WalletStatus,
            restrictions: { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true },
            updatedAt: w?.updated_at
          };

          const userProfile: UserProfile = {
            id: p.id,
            name: p.name || 'User',
            username: p.username || 'user',
            email: p.email || '',
            referralCode: p.referral_code || 'IVEST100',
            referredBy: p.referred_by_code || undefined,
            level: p.level || 1,
            status: p.status || 'ACTIVE',
            kycStatus: p.kyc_status || 'NOT_SUBMITTED',
            createdAt: p.created_at || new Date().toISOString()
          };

          return {
            profile: userProfile,
            wallet: walletState,
            pendingDepositsCount: userDeps.length,
            pendingDepositsSum: Number(depSum.toFixed(4)),
            totalTransactionsCount: userTxCount
          };
        });
      }
    } catch {
      // fallback
    }

    const users = authService.getAllUsers();
    return users.map(user => {
      const wallet = walletService.getWalletForUser(user.id);
      return {
        profile: user,
        wallet,
        pendingDepositsCount: 0,
        pendingDepositsSum: 0,
        totalTransactionsCount: 0
      };
    });
  },

  /**
   * 360° Comprehensive User Intelligence Breakdown
   */
  async getUserDetailed360(userId: string): Promise<UserDetailed360 | null> {
    try {
      const { data: user } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (!user) return null;

      const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
      const { data: userTxs } = await supabase.from('wallet_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });

      const txList: WalletTransaction[] = (userTxs || []).map(d => ({
        id: d.id,
        userId: d.user_id,
        type: d.type as TransactionType,
        amount: parseFloat(d.amount) || 0,
        currency: d.currency || 'USDT',
        status: (d.status?.toUpperCase() || 'PENDING') as TransactionStatus,
        description: d.description || '',
        referenceId: d.reference_id || d.id,
        createdAt: d.created_at || new Date().toISOString(),
        address: d.metadata?.address,
        txHash: d.metadata?.txHash,
        adminRemarks: d.metadata?.adminRemarks
      }));

      const lifetimeDeposits = txList
        .filter(tx => tx.type === 'DEPOSIT' && (tx.status === 'COMPLETED' || tx.status === 'APPROVED'))
        .reduce((sum, tx) => sum + tx.amount, 0);

      const lifetimeWithdrawals = txList
        .filter(tx => tx.type === 'WITHDRAWAL' && (tx.status === 'COMPLETED' || tx.status === 'APPROVED'))
        .reduce((sum, tx) => sum + tx.amount, 0);

      const lifetimeProfits = txList
        .filter(tx => tx.type === 'DAILY_PROFIT' || tx.type === 'WELCOME_BONUS' || tx.type === 'REFERRAL_BONUS')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const referralSummary = referralService.getReferralSummary(user.referral_code);
      const lock = reservationService.getCycleLockStatus();

      const userProfile: UserProfile = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        referralCode: user.referral_code,
        referredBy: user.referred_by_code || undefined,
        level: user.level || 1,
        status: user.status || 'ACTIVE',
        kycStatus: user.kyc_status || 'NOT_SUBMITTED',
        createdAt: user.created_at
      };

      const walletState: WalletState = {
        totalBalance: parseFloat(walletData?.total_balance) || 0,
        availableBalance: parseFloat(walletData?.available_balance) || 0,
        pendingBalance: parseFloat(walletData?.pending_balance) || 0,
        currency: walletData?.currency || 'USDT',
        status: 'ACTIVE',
        restrictions: { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true },
        updatedAt: walletData?.updated_at
      };

      return {
        profile: userProfile,
        wallet: walletState,
        referralSummary,
        lifetimeDeposits: Number(lifetimeDeposits.toFixed(2)),
        lifetimeWithdrawals: Number(lifetimeWithdrawals.toFixed(2)),
        lifetimeProfits: Number(lifetimeProfits.toFixed(2)),
        transactions: txList,
        cycleLock: lock
      };
    } catch {
      return null;
    }
  },

  /**
   * Update full user profile details (Name, Email, Level, Status, Sponsor)
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const res = authService.adminUpdateUser(userId, updates);
    try {
      await supabase.from('profiles').update({
        name: updates.name,
        username: updates.username,
        email: updates.email,
        level: updates.level,
        status: updates.status,
        updated_at: new Date().toISOString()
      }).eq('id', userId);
    } catch {
      // ignore
    }
    return res;
  },

  /**
   * Reset 24-hr Mining Lock for user
   */
  resetUserMiningLock(): void {
    reservationService.resetCycleCooldown();
  },

  /**
   * Impersonate / Switch Active User Session to test as that user
   */
  impersonateUser(userId: string): UserProfile | null {
    const users = authService.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    localStorage.setItem('ivestbot_auth_user', JSON.stringify(user));
    const wallet = walletService.getWalletForUser(userId);
    walletService.saveWallet(wallet);
    return user;
  },

  /**
   * Calculate overall platform statistics straight from Supabase PostgreSQL
   */
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      if (!error && data) {
        return {
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalPendingDepositsCount: data.totalPendingDepositsCount || 0,
          totalPendingDepositsSum: parseFloat(data.totalPendingDepositsSum) || 0,
          totalPendingWithdrawalsCount: data.totalPendingWithdrawalsCount || 0,
          totalPendingWithdrawalsSum: parseFloat(data.totalPendingWithdrawalsSum) || 0,
          totalPlatformCirculation: parseFloat(data.totalPlatformCirculation) || 0,
          restrictedWalletsCount: 0
        };
      }
    } catch {
      // fallback
    }

    return {
      totalUsers: 0,
      activeUsers: 0,
      totalPendingDepositsCount: 0,
      totalPendingDepositsSum: 0,
      totalPendingWithdrawalsCount: 0,
      totalPendingWithdrawalsSum: 0,
      totalPlatformCirculation: 0,
      restrictedWalletsCount: 0
    };
  },

  /**
   * Query pending deposits directly from Supabase (Single Source of Truth)
   */
  async getPendingDeposits(): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase.rpc('get_admin_pending_deposits');
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          userName: d.user_name || d.username || 'User',
          userEmail: d.email,
          type: 'DEPOSIT' as TransactionType,
          amount: parseFloat(d.amount) || 0,
          currency: d.currency || 'USDT',
          status: 'PENDING' as TransactionStatus,
          description: `USDT Deposit Submitted (${(d.deposit_address || '').slice(0, 8)}...) - Pending Admin Verification`,
          referenceId: `DEP-${d.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
          createdAt: d.created_at,
          address: d.deposit_address,
          txHash: d.tx_hash,
          adminRemarks: d.admin_note
        }));
      }
    } catch {
      // ignore
    }
    return [];
  },

  /**
   * Query pending withdrawals directly from Supabase (Single Source of Truth)
   */
  async getPendingWithdrawals(): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase.rpc('get_admin_pending_withdrawals');
      if (!error && data) {
        return data.map((w: any) => ({
          id: w.id,
          userId: w.user_id,
          userName: w.user_name || w.username || 'User',
          userEmail: w.email,
          type: 'WITHDRAWAL' as TransactionType,
          amount: parseFloat(w.amount) || 0,
          currency: w.currency || 'USDT',
          status: 'PENDING' as TransactionStatus,
          description: `Withdrawal Request to ${(w.recipient_address || '').slice(0, 8)}... - Pending Admin Review`,
          referenceId: `WTH-${w.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
          createdAt: w.created_at,
          address: w.recipient_address,
          adminRemarks: w.admin_note
        }));
      }
    } catch {
      // ignore
    }
    return [];
  },

  async approveDeposit(txId: string, remarks?: string): Promise<{ approvedTx: WalletTransaction; updatedWallet: WalletState }> {
    const res = await walletService.approveDeposit(txId, true, remarks);
    return { approvedTx: res.approvedTx, updatedWallet: res.updatedWallet };
  },

  async rejectDeposit(txId: string, remarks?: string): Promise<{ rejectedTx: WalletTransaction; updatedWallet: WalletState }> {
    return await walletService.rejectDeposit(txId, remarks);
  },

  async approveWithdrawal(txId: string, remarks?: string): Promise<{ approvedTx: WalletTransaction; updatedWallet: WalletState }> {
    return await walletService.approveWithdrawal(txId, remarks);
  },

  async rejectWithdrawal(txId: string, remarks?: string): Promise<{ rejectedTx: WalletTransaction; updatedWallet: WalletState }> {
    return await walletService.rejectWithdrawal(txId, remarks);
  },

  creditUserWallet(userId: string, amount: number, reason: string): { updatedWallet: WalletState; tx: WalletTransaction } {
    const user = authService.getAllUsers().find(u => u.id === userId);
    const userMeta = user ? { id: user.id, name: user.name, email: user.email } : undefined;
    return walletService.adminCredit(amount, reason, userMeta);
  },

  debitUserWallet(userId: string, amount: number, reason: string): { updatedWallet: WalletState; tx: WalletTransaction } {
    const user = authService.getAllUsers().find(u => u.id === userId);
    const userMeta = user ? { id: user.id, name: user.name, email: user.email } : undefined;
    return walletService.adminDebit(amount, reason, userMeta);
  },

  updateUserWalletRestrictions(
    _userId: string,
    status: WalletStatus,
    restrictions: WalletRestrictions,
    reason?: string
  ): WalletState {
    return walletService.updateWalletRestrictions(status, restrictions, reason);
  },

  verifyKyc(userId: string, status: 'VERIFIED' | 'REJECTED', notes?: string): KycSubmission {
    authService.adminUpdateUser(userId, { kycStatus: status });
    return walletService.adminVerifyKyc(status, notes);
  },

  /**
   * System Announcements Broadcast
   */
  getAnnouncements(): PlatformAnnouncement[] {
    try {
      const stored = localStorage.getItem(ANNOUNCEMENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [
      {
        id: 'ann-1',
        title: 'Star AI 2.0 Mining System Live',
        message: 'Daily yields active. Complete 24-Hour cycles to maximize USDT reservation returns.',
        severity: 'success',
        createdAt: new Date().toISOString(),
        active: true
      }
    ];
  },

  broadcastAnnouncement(title: string, message: string, severity: 'info' | 'success' | 'warning' | 'error' = 'info'): PlatformAnnouncement {
    const list = this.getAnnouncements();
    const newAnn: PlatformAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      message,
      severity,
      createdAt: new Date().toISOString(),
      active: true
    };
    const updated = [newAnn, ...list];
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(updated));
    return newAnn;
  },

  /**
   * Permanently delete user and their associated data
   */
  async deleteUser(userId: string): Promise<boolean> {
    return authService.deleteUser(userId);
  }
};
