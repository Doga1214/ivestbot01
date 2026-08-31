import { authService, type UserProfile } from './authService';
import { walletService, type WalletState, type WalletTransaction, type WalletStatus, type WalletRestrictions, type KycSubmission } from './walletService';
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
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  },

  /**
   * Authenticate admin via credentials or master passkey
   */
  adminLogin(passwordOrPin: string): boolean {
    const validKeys = ['admin123', 'admin', 'ivestbot2026', 'masterkey'];
    if (validKeys.includes(passwordOrPin.trim())) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  },

  adminLogout(): void {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  /**
   * Fetch all users with their combined wallet and pending queue metrics
   */
  getAdminUsersList(): AdminUserListItem[] {
    const users = authService.getAllUsers();
    const allTransactions = walletService.getTransactions();

    return users.map(user => {
      const wallet = walletService.getWalletForUser(user.id);
      const userTx = allTransactions.filter(tx => tx.userId === user.id || (!tx.userId && user.id === users[0].id));
      const pendingDeposits = userTx.filter(tx => tx.type === 'DEPOSIT' && tx.status === 'PENDING');
      const pendingSum = pendingDeposits.reduce((acc, curr) => acc + curr.amount, 0);

      return {
        profile: user,
        wallet,
        pendingDepositsCount: pendingDeposits.length,
        pendingDepositsSum: Number(pendingSum.toFixed(4)),
        totalTransactionsCount: userTx.length
      };
    });
  },

  /**
   * 360° Comprehensive User Intelligence Breakdown
   */
  getUserDetailed360(userId: string): UserDetailed360 | null {
    const users = authService.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const wallet = walletService.getWalletForUser(userId);
    const allTransactions = walletService.getTransactions();
    const userTx = allTransactions.filter(tx => tx.userId === userId || (!tx.userId && userId === users[0].id));

    const lifetimeDeposits = userTx
      .filter(tx => tx.type === 'DEPOSIT' && (tx.status === 'COMPLETED' || tx.status === 'APPROVED'))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const lifetimeWithdrawals = userTx
      .filter(tx => tx.type === 'WITHDRAWAL' && (tx.status === 'COMPLETED' || tx.status === 'APPROVED'))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const lifetimeProfits = userTx
      .filter(tx => tx.type === 'DAILY_PROFIT' || tx.type === 'WELCOME_BONUS' || tx.type === 'REFERRAL_BONUS')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const referralSummary = referralService.getReferralSummary(user.referralCode);
    const lock = reservationService.getCycleLockStatus();

    return {
      profile: user,
      wallet,
      referralSummary,
      lifetimeDeposits: Number(lifetimeDeposits.toFixed(2)),
      lifetimeWithdrawals: Number(lifetimeWithdrawals.toFixed(2)),
      lifetimeProfits: Number(lifetimeProfits.toFixed(2)),
      transactions: userTx,
      cycleLock: lock
    };
  },

  /**
   * Update full user profile details (Name, Email, Level, Status, Sponsor)
   */
  updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    return authService.adminUpdateUser(userId, updates);
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
   * Calculate overall platform statistics
   */
  getPlatformStats(): PlatformStats {
    const users = this.getAdminUsersList();
    const transactions = walletService.getTransactions();

    const pendingDeposits = transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING');
    const pendingWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING');

    const totalCirculation = users.reduce((acc, u) => acc + (u.wallet.totalBalance || 0), 0);
    const restrictedCount = users.filter(u => u.wallet.status !== 'ACTIVE' || (u.wallet.restrictions && (!u.wallet.restrictions.canDeposit || !u.wallet.restrictions.canWithdraw))).length;

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.profile.status === 'ACTIVE').length,
      totalPendingDepositsCount: pendingDeposits.length,
      totalPendingDepositsSum: Number(pendingDeposits.reduce((sum, t) => sum + t.amount, 0).toFixed(2)),
      totalPendingWithdrawalsCount: pendingWithdrawals.length,
      totalPendingWithdrawalsSum: Number(pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0).toFixed(2)),
      totalPlatformCirculation: Number(totalCirculation.toFixed(2)),
      restrictedWalletsCount: restrictedCount
    };
  },

  getPendingDeposits(): WalletTransaction[] {
    return walletService.getTransactions().filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING');
  },

  getPendingWithdrawals(): WalletTransaction[] {
    return walletService.getTransactions().filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING');
  },

  approveDeposit(txId: string, remarks?: string): { approvedTx: WalletTransaction; updatedWallet: WalletState } {
    const res = walletService.approveDeposit(txId, true, remarks);
    return { approvedTx: res.approvedTx, updatedWallet: res.updatedWallet };
  },

  rejectDeposit(txId: string, remarks?: string): { rejectedTx: WalletTransaction; updatedWallet: WalletState } {
    return walletService.rejectDeposit(txId, remarks);
  },

  approveWithdrawal(txId: string, remarks?: string): { approvedTx: WalletTransaction; updatedWallet: WalletState } {
    return walletService.approveWithdrawal(txId, remarks);
  },

  rejectWithdrawal(txId: string, remarks?: string): { rejectedTx: WalletTransaction; updatedWallet: WalletState } {
    return walletService.rejectWithdrawal(txId, remarks);
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
  }
};
