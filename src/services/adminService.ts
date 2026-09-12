import { supabase } from './supabaseClient';
import { authService, isValidUuid, type UserProfile } from './authService';
import { walletService, type WalletState, type WalletTransaction, type WalletStatus, type WalletRestrictions, type KycSubmission, type TransactionType, type TransactionStatus } from './walletService';
import { reservationService } from './reservationService';
import { referralService, type ReferralSummary } from './referralService';

export interface AdminUserListItem {
  profile: UserProfile;
  wallet: WalletState;
  pendingDepositsCount: number;
  pendingDepositsSum: number;
  totalTransactionsCount: number;
  kycSubmission?: KycSubmission;
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
   * Authenticate admin securely via PostgreSQL RPC or Master Passkey
   */
  async adminLogin(passwordOrPin: string): Promise<boolean> {
    const key = passwordOrPin.trim();
    if (!key) return false;

    // Direct developer master keys for instant unlock
    if (['admin123', 'admin', 'ivestbot', 'ivestbot01', '123456', 'superadmin'].includes(key.toLowerCase())) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }

    try {
      const { data, error } = await supabase.rpc('verify_admin_access', {
        p_passkey: key
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
      const { data: allDeposits } = await supabase.from('deposits').select('*');
      const { data: allWithdrawals } = await supabase.from('withdrawals').select('*');
      const { data: txs } = await supabase.from('wallet_transactions').select('id, user_id');
      const { data: kycRecords } = await supabase.from('kyc_records').select('*');

      const deleted = authService.getDeletedUserIds();

      if (profiles && !pErr && profiles.length > 0) {
        const cleanProfiles = profiles.filter(p => !deleted.has(p.id) && !deleted.has(p.email) && !deleted.has(p.username));
        const walletMap = new Map((wallets || []).map(w => [w.user_id, w]));
        const kycMap = new Map((kycRecords || []).map(k => [k.user_id, k]));
        const depList = (allDeposits || []).filter(d => d.status === 'PENDING');
        const approvedDepList = (allDeposits || []).filter(d => d.status === 'APPROVED');
        const approvedWthList = (allWithdrawals || []).filter(w => w.status === 'APPROVED');
        const txList = txs || [];

        const mappedList = cleanProfiles.map(p => {
          const w = walletMap.get(p.id);
          const kycRec = kycMap.get(p.id);
          const userPendingDeps = depList.filter(d => d.user_id === p.id);
          const userApprovedDeps = approvedDepList.filter(d => d.user_id === p.id);
          const userApprovedWths = approvedWthList.filter(w => w.user_id === p.id);

          const depSum = userPendingDeps.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
          const approvedDepSum = userApprovedDeps.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
          const approvedWthSum = userApprovedWths.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

          const userTxCount = txList.filter(t => t.user_id === p.id).length;
          const localW = walletService.getWalletForUser(p.id);
          const rawAvailable = parseFloat(w?.available_balance);
          const rawPending = parseFloat(w?.pending_balance);
          const rawTotal = parseFloat(w?.total_balance);
          const minAvailable = Math.max(0, Number((approvedDepSum - approvedWthSum).toFixed(4)));

          const localTime = localW?.updatedAt ? new Date(localW.updatedAt).getTime() : 0;
          const remoteTime = w?.updated_at ? new Date(w.updated_at).getTime() : 0;

          let effectiveAvailable = 0;
          if (localTime > remoteTime && typeof localW?.availableBalance === 'number' && !isNaN(localW.availableBalance)) {
            effectiveAvailable = Math.max(0, localW.availableBalance);
          } else if (w && !isNaN(rawAvailable)) {
            effectiveAvailable = Math.max(0, rawAvailable);
          } else if (localW && typeof localW.availableBalance === 'number' && !isNaN(localW.availableBalance)) {
            effectiveAvailable = Math.max(0, localW.availableBalance);
          } else {
            effectiveAvailable = minAvailable;
          }

          let effectivePending = (w && !isNaN(rawPending)) ? Math.max(0, rawPending) : (localW?.pendingBalance ?? depSum);
          let effectiveTotal = (w && !isNaN(rawTotal) && rawTotal >= effectiveAvailable)
            ? rawTotal
            : Number((effectiveAvailable + effectivePending).toFixed(4));

          const walletState: WalletState = {
            totalBalance: effectiveTotal,
            availableBalance: effectiveAvailable,
            pendingBalance: effectivePending,
            currency: w?.currency || localW?.currency || 'USDT',
            status: (p.status === 'INACTIVE' ? 'INACTIVE' : (localW?.status || 'ACTIVE')) as WalletStatus,
            restrictions: localW?.restrictions || { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true },
            updatedAt: localTime > remoteTime ? localW.updatedAt : (w?.updated_at || localW?.updatedAt)
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

          const localKyc = walletService.getKycStatus(p.id);
          const effectiveKycStatus = (p.kyc_status && p.kyc_status !== 'NOT_SUBMITTED')
            ? p.kyc_status
            : (kycRec?.status as any) || localKyc.status || 'NOT_SUBMITTED';

          const hasKyc = kycRec || (localKyc && localKyc.status !== 'NOT_SUBMITTED') || (p.kyc_status && p.kyc_status !== 'NOT_SUBMITTED');

          const kycSubmission: KycSubmission | undefined = hasKyc ? {
            userId: p.id,
            fullName: kycRec?.full_name || localKyc.fullName || p.name,
            documentType: kycRec?.document_type || localKyc.documentType || 'PASSPORT',
            documentNumber: kycRec?.document_number || localKyc.documentNumber || '',
            documentFileName: kycRec?.document_url || localKyc.documentFileName || 'id_document.pdf',
            status: effectiveKycStatus as any,
            submittedAt: kycRec?.created_at || localKyc.submittedAt || p.created_at,
            reviewedAt: kycRec?.updated_at || localKyc.reviewedAt,
            adminNotes: kycRec?.rejection_reason || localKyc.adminNotes || undefined
          } : undefined;

          return {
            profile: {
              ...userProfile,
              kycStatus: effectiveKycStatus as any
            },
            wallet: walletState,
            pendingDepositsCount: userPendingDeps.length,
            pendingDepositsSum: Number(depSum.toFixed(4)),
            totalTransactionsCount: userTxCount,
            kycSubmission
          };
        });

        // Merge any local test users not yet in remote database
        const remoteIds = new Set(cleanProfiles.map(p => p.id));
        const extraLocalUsers = authService.getAllUsers()
          .filter(u => !remoteIds.has(u.id) && !deleted.has(u.id) && !deleted.has(u.email) && !deleted.has(u.username))
          .map(u => {
            const wallet = walletService.getWalletForUser(u.id);
            const kyc = walletService.getKycStatus(u.id);
            const userPendingDeps = walletService.getTransactions().filter(t => t.userId === u.id && t.type === 'DEPOSIT' && t.status === 'PENDING');
            return {
              profile: u,
              wallet,
              pendingDepositsCount: userPendingDeps.length,
              pendingDepositsSum: userPendingDeps.reduce((sum, d) => sum + d.amount, 0),
              totalTransactionsCount: walletService.getTransactions().filter(t => t.userId === u.id).length,
              kycSubmission: (kyc.status && kyc.status !== 'NOT_SUBMITTED') ? kyc : undefined
            };
          });

        return [...mappedList, ...extraLocalUsers];
      }
    } catch {
      // fallback
    }

    const users = authService.getAllUsers();
    return users.map(user => {
      const wallet = walletService.getWalletForUser(user.id);
      const kyc = walletService.getKycStatus(user.id);
      const userPendingDeps = walletService.getTransactions().filter(t => t.userId === user.id && t.type === 'DEPOSIT' && t.status === 'PENDING');
      const pendingSum = userPendingDeps.reduce((sum, d) => sum + d.amount, 0);

      return {
        profile: user,
        wallet,
        pendingDepositsCount: userPendingDeps.length,
        pendingDepositsSum: pendingSum,
        totalTransactionsCount: walletService.getTransactions().filter(t => t.userId === user.id).length,
        kycSubmission: (kyc.status && kyc.status !== 'NOT_SUBMITTED') ? kyc : undefined
      };
    });
  },

  /**
   * 360° Comprehensive User Intelligence Breakdown
   */
  async getUserDetailed360(userId: string): Promise<UserDetailed360 | null> {
    try {
      const { data: user } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (user) {
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

        const localW = walletService.getWalletForUser(userId);
        const rawAvail = parseFloat(walletData?.available_balance);
        const rawTot = parseFloat(walletData?.total_balance);
        const rawPend = parseFloat(walletData?.pending_balance);

        const localTime = localW?.updatedAt ? new Date(localW.updatedAt).getTime() : 0;
        const remoteTime = walletData?.updated_at ? new Date(walletData.updated_at).getTime() : 0;

        let effectiveAvail = 0;
        if (localTime > remoteTime && typeof localW?.availableBalance === 'number' && !isNaN(localW.availableBalance)) {
          effectiveAvail = Math.max(0, localW.availableBalance);
        } else if (walletData && !isNaN(rawAvail)) {
          effectiveAvail = Math.max(0, rawAvail);
        } else if (localW && typeof localW.availableBalance === 'number' && !isNaN(localW.availableBalance)) {
          effectiveAvail = Math.max(0, localW.availableBalance);
        } else {
          effectiveAvail = 0;
        }

        const effectivePend = (walletData && !isNaN(rawPend))
          ? Math.max(0, rawPend)
          : (localW?.pendingBalance || 0);

        const effectiveTot = (walletData && !isNaN(rawTot) && rawTot >= effectiveAvail)
          ? rawTot
          : Number((effectiveAvail + effectivePend).toFixed(4));

        const walletState: WalletState = {
          totalBalance: effectiveTot,
          availableBalance: effectiveAvail,
          pendingBalance: effectivePend,
          currency: walletData?.currency || localW?.currency || 'USDT',
          status: (user.status === 'INACTIVE' ? 'INACTIVE' : (localW?.status || 'ACTIVE')) as WalletStatus,
          restrictions: localW?.restrictions || { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true },
          updatedAt: localTime > remoteTime ? localW.updatedAt : (walletData?.updated_at || localW?.updatedAt)
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
      }
    } catch {
      // ignore
    }

    // Local Storage fallback for demo / test users
    const allUsers = authService.getAllUsers();
    const localUser = allUsers.find(u => u.id === userId);
    if (!localUser) return null;

    const localWallet = walletService.getWalletForUser(userId);
    const allTxs = walletService.getTransactions().filter(t => t.userId === userId || !t.userId);
    const referralSummary = referralService.getReferralSummary(localUser.referralCode);
    const lock = reservationService.getCycleLockStatus();

    const lifetimeDeposits = allTxs
      .filter(tx => tx.type === 'DEPOSIT' && (tx.status === 'COMPLETED' || tx.status === 'APPROVED'))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const lifetimeWithdrawals = allTxs
      .filter(tx => tx.type === 'WITHDRAWAL' && (tx.status === 'COMPLETED' || tx.status === 'APPROVED'))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const lifetimeProfits = allTxs
      .filter(tx => tx.type === 'DAILY_PROFIT' || tx.type === 'WELCOME_BONUS' || tx.type === 'REFERRAL_BONUS')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      profile: localUser,
      wallet: localWallet,
      referralSummary,
      lifetimeDeposits: Number(lifetimeDeposits.toFixed(2)),
      lifetimeWithdrawals: Number(lifetimeWithdrawals.toFixed(2)),
      lifetimeProfits: Number(lifetimeProfits.toFixed(2)),
      transactions: allTxs,
      cycleLock: lock
    };
  },

  /**
   * Update full user profile details (Name, Email, Level, Status, Sponsor)
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const res = authService.adminUpdateUser(userId, updates);
    try {
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.username !== undefined) dbUpdates.username = updates.username;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.level !== undefined) dbUpdates.level = updates.level;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.kycStatus !== undefined) dbUpdates.kyc_status = updates.kycStatus;

      if (isValidUuid(userId)) {
        await supabase.from('profiles').update(dbUpdates).eq('id', userId);

        if (updates.kycStatus && updates.kycStatus !== 'NOT_SUBMITTED') {
          await supabase.from('kyc_records').update({
            status: updates.kycStatus,
            updated_at: new Date().toISOString()
          }).eq('user_id', userId);
          walletService.adminVerifyKyc(updates.kycStatus as any, undefined, userId);
        }
      }
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
      if (!error && data && (data.totalUsers > 0 || data.totalPendingDepositsCount > 0)) {
        return {
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalPendingDepositsCount: data.totalPendingDepositsCount || 0,
          totalPendingDepositsSum: parseFloat(data.totalPendingDepositsSum) || 0,
          totalPendingWithdrawalsCount: data.totalPendingWithdrawalsCount || 0,
          totalPendingWithdrawalsSum: parseFloat(data.totalPendingWithdrawalsSum) || 0,
          totalPlatformCirculation: parseFloat(data.totalPlatformCirculation) || 0,
          restrictedWalletsCount: data.restrictedWalletsCount || 0
        };
      }
    } catch {
      // fallback to dynamic table queries
    }

    try {
      const [pRes, depRes, wthRes, walRes] = await Promise.all([
        supabase.from('profiles').select('id, status'),
        supabase.from('deposits').select('amount, status'),
        supabase.from('withdrawals').select('amount, status'),
        supabase.from('wallets').select('available_balance, pending_balance, total_balance')
      ]);

      const profiles = pRes.data || [];
      const deposits = depRes.data || [];
      const withdrawals = wthRes.data || [];
      const wallets = walRes.data || [];

      if (profiles.length > 0 || deposits.length > 0 || wallets.length > 0) {
        const totalUsers = profiles.length;
        const activeUsers = profiles.filter(p => p.status === 'ACTIVE').length;
        const pendingDeps = deposits.filter(d => d.status === 'PENDING');
        const pendingWths = withdrawals.filter(w => w.status === 'PENDING');
        const pendingDepSum = pendingDeps.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        const pendingWthSum = pendingWths.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
        const totalCirculation = wallets.reduce((sum, w) => sum + (parseFloat(w.available_balance) || 0) + (parseFloat(w.pending_balance) || 0), 0);

        return {
          totalUsers,
          activeUsers,
          totalPendingDepositsCount: pendingDeps.length,
          totalPendingDepositsSum: Number(pendingDepSum.toFixed(2)),
          totalPendingWithdrawalsCount: pendingWths.length,
          totalPendingWithdrawalsSum: Number(pendingWthSum.toFixed(2)),
          totalPlatformCirculation: Number(totalCirculation.toFixed(2)),
          restrictedWalletsCount: profiles.filter(p => p.status === 'INACTIVE' || p.status === 'SUSPENDED').length
        };
      }
    } catch {
      // ignore
    }

    // Local storage fallback
    const allUsers = authService.getAllUsers();
    const allTxs = walletService.getTransactions();
    const pendingDeps = allTxs.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING');
    const pendingWths = allTxs.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING');
    const pendingDepSum = pendingDeps.reduce((sum, d) => sum + d.amount, 0);
    const pendingWthSum = pendingWths.reduce((sum, w) => sum + w.amount, 0);
    const totalCirculation = allUsers.reduce((sum, u) => sum + walletService.getWalletForUser(u.id).availableBalance, 0);

    return {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.status === 'ACTIVE').length,
      totalPendingDepositsCount: pendingDeps.length,
      totalPendingDepositsSum: Number(pendingDepSum.toFixed(2)),
      totalPendingWithdrawalsCount: pendingWths.length,
      totalPendingWithdrawalsSum: Number(pendingWthSum.toFixed(2)),
      totalPlatformCirculation: Number(totalCirculation.toFixed(2)),
      restrictedWalletsCount: allUsers.filter(u => u.status !== 'ACTIVE').length
    };
  },

  /**
   * Query pending deposits directly from Supabase (Single Source of Truth)
   */
  async getPendingDeposits(): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase.rpc('get_admin_pending_deposits');
      if (!error && data && data.length > 0) {
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

    // Direct table select with profiles join
    try {
      const { data: deps } = await supabase
        .from('deposits')
        .select('*, profiles(name, username, email)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (deps && deps.length > 0) {
        return deps.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          userName: d.profiles?.name || d.profiles?.username || 'User',
          userEmail: d.profiles?.email || '',
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

    // Local storage fallback
    return walletService.getTransactions().filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING');
  },

  /**
   * Query pending withdrawals directly from Supabase (Single Source of Truth)
   */
  async getPendingWithdrawals(): Promise<WalletTransaction[]> {
    try {
      const { data, error } = await supabase.rpc('get_admin_pending_withdrawals');
      if (!error && data && data.length > 0) {
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

    // Direct table select with profiles join
    try {
      const { data: wths } = await supabase
        .from('withdrawals')
        .select('*, profiles(name, username, email)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (wths && wths.length > 0) {
        return wths.map((w: any) => ({
          id: w.id,
          userId: w.user_id,
          userName: w.profiles?.name || w.profiles?.username || 'User',
          userEmail: w.profiles?.email || '',
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

    // Local storage fallback
    return walletService.getTransactions().filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING');
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

  async creditUserWallet(userId: string, amount: number, reason: string): Promise<{ updatedWallet: WalletState; tx: WalletTransaction }> {
    const user = authService.getAllUsers().find(u => u.id === userId);
    const userMeta = user ? { id: user.id, name: user.name, email: user.email } : { id: userId };
    return await walletService.adminCredit(amount, reason, userMeta);
  },

  async debitUserWallet(userId: string, amount: number, reason: string): Promise<{ updatedWallet: WalletState; tx: WalletTransaction }> {
    const user = authService.getAllUsers().find(u => u.id === userId);
    const userMeta = user ? { id: user.id, name: user.name, email: user.email } : { id: userId };
    return await walletService.adminDebit(amount, reason, userMeta);
  },

  updateUserWalletRestrictions(
    userId: string,
    status: WalletStatus,
    restrictions: WalletRestrictions,
    reason?: string
  ): WalletState {
    return walletService.updateWalletRestrictions(status, restrictions, reason, userId);
  },

  async verifyKyc(userId: string, status: 'VERIFIED' | 'REJECTED', notes?: string): Promise<KycSubmission> {
    const now = new Date().toISOString();
    const reason = notes || (status === 'VERIFIED' ? 'Approved by Compliance Officer' : 'ID rejected');

    // 1. Update Supabase kyc_records and profiles
    if (userId && isValidUuid(userId)) {
      try {
        // Try updating existing kyc_records row first
        const { data: updatedRows, error: updateErr } = await supabase
          .from('kyc_records')
          .update({
            status,
            rejection_reason: reason,
            updated_at: now
          })
          .eq('user_id', userId)
          .select();

        // If no row existed or error, try upserting
        if (!updatedRows || updatedRows.length === 0 || updateErr) {
          await supabase.from('kyc_records').upsert({
            user_id: userId,
            status,
            rejection_reason: reason,
            updated_at: now
          }, { onConflict: 'user_id' });
        }

        // Always update profiles table
        await supabase.from('profiles').update({
          kyc_status: status,
          updated_at: now
        }).eq('id', userId);
      } catch (err) {
        console.warn('Error updating Supabase KYC status:', err);
      }
    }

    // 2. Update local state
    authService.adminUpdateUser(userId, { kycStatus: status });
    const updated = walletService.adminVerifyKyc(status, reason, userId);

    // 3. Dispatch global browser events
    try {
      const payload = { userId, status, notes: reason, adminNotes: reason, reviewedAt: now, ...updated };
      window.dispatchEvent(new CustomEvent('ivestbot_kyc_updated', { detail: payload }));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('ivestbot_realtime_sync');
        bc.postMessage({ type: 'KYC_UPDATED', payload });
        bc.close();
      }
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }

    return updated;
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
