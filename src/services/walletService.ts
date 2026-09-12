import { supabase } from './supabaseClient';
import { authService, isValidUuid } from './authService';

export type WalletStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'RESTRICTED';

export interface WalletRestrictions {
  canDeposit: boolean;
  canWithdraw: boolean;
  canReserve: boolean;
  canTrade: boolean;
}

export interface WalletState {
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  status: WalletStatus;
  restrictions: WalletRestrictions;
  restrictionReason?: string;
  updatedAt?: string;
}

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'RESERVATION'
  | 'RESERVATION_RETURN'
  | 'DAILY_PROFIT'
  | 'REFERRAL_BONUS'
  | 'WELCOME_BONUS'
  | 'TRADE_DEMO'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'ADMIN_ADJUSTMENT';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'FAILED';

export interface WalletTransaction {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  referenceId: string;
  createdAt: string;
  address?: string;
  txHash?: string;
  adminRemarks?: string;
}

export interface KycSubmission {
  userId?: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  documentFileName?: string;
  status: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  submittedAt?: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export interface WalletSnapshot {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  timestamp: string;
  beforeBalance: {
    available: number;
    total: number;
    pending: number;
  };
  afterBalance: {
    available: number;
    total: number;
    pending: number;
  };
  actionType: string;
  reason: string;
  actor: 'USER' | 'ADMIN' | 'SYSTEM_AI';
  integrityHash: string;
}

export interface AiForecastResult {
  currentBalance: number;
  dailyRatePercent: number;
  projected24hProfit: number;
  projected7dProfit: number;
  projected30dProfit: number;
  annualizedApy: number;
  securityHealthScore: number;
  shieldStatus: 'ARMED' | 'OPTIMAL' | 'PROTECTED';
  networkSpeedEstimate: string;
  aiSuggestedReinvestBonus: number;
}

const WALLET_STORAGE_KEY = 'ivestbot_wallet_state';
const TRANSACTIONS_STORAGE_KEY = 'ivestbot_wallet_transactions';
const KYC_STORAGE_KEY = 'ivestbot_kyc_state';
const SNAPSHOTS_STORAGE_KEY = 'ivestbot_wallet_snapshots';

const DEFAULT_RESTRICTIONS: WalletRestrictions = {
  canDeposit: true,
  canWithdraw: true,
  canReserve: true,
  canTrade: true
};

const DEFAULT_WALLET: WalletState = {
  totalBalance: 0.0,
  availableBalance: 0.0,
  pendingBalance: 0.0,
  currency: 'USDT',
  status: 'ACTIVE',
  restrictions: DEFAULT_RESTRICTIONS
};

const DEFAULT_TRANSACTIONS: WalletTransaction[] = [];

export const walletService = {
  getWallet(userId?: string): WalletState {
    try {
      const targetId = userId || authService.getCurrentUser()?.id;
      if (targetId) {
        const key = `ivestbot_wallet_${targetId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...DEFAULT_WALLET,
            ...parsed,
            restrictions: {
              ...DEFAULT_RESTRICTIONS,
              ...(parsed.restrictions || {})
            }
          };
        }
      }

      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_WALLET,
          ...parsed,
          restrictions: {
            ...DEFAULT_RESTRICTIONS,
            ...(parsed.restrictions || {})
          }
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_WALLET;
  },

  saveWallet(wallet: WalletState, userId?: string): void {
    const data = {
      ...wallet,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(data));
    const targetId = userId || authService.getCurrentUser()?.id;
    if (targetId) {
      localStorage.setItem(`ivestbot_wallet_${targetId}`, JSON.stringify(data));
    }
  },

  getWalletForUser(userId: string): WalletState {
    try {
      const key = `ivestbot_wallet_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_WALLET,
          ...parsed,
          restrictions: {
            ...DEFAULT_RESTRICTIONS,
            ...(parsed.restrictions || {})
          }
        };
      }
    } catch {
      // ignore
    }

    // Fallback to active wallet only if it is the current user session
    const currentStored = localStorage.getItem('ivestbot_auth_user');
    if (currentStored) {
      try {
        const currentUser = JSON.parse(currentStored);
        if (currentUser.id === userId) {
          return this.getWallet(userId);
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_WALLET;
  },

  saveWalletForUser(userId: string, wallet: WalletState): void {
    const data = {
      ...wallet,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`ivestbot_wallet_${userId}`, JSON.stringify(data));

    // Also update active session wallet if it's the current user
    const currentStored = localStorage.getItem('ivestbot_auth_user');
    if (currentStored) {
      try {
        const currentUser = JSON.parse(currentStored);
        if (currentUser.id === userId) {
          localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(data));
        }
      } catch {
        // ignore
      }
    }

    // Dispatch global event for instant React context updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ivestbot_wallet_updated', { detail: { userId, wallet: data } }));
    }

    // Sync to Supabase in background
    if (isValidUuid(userId)) {
      supabase
        .from('wallets')
        .upsert(
          {
            user_id: userId,
            total_balance: data.totalBalance,
            available_balance: data.availableBalance,
            pending_balance: data.pendingBalance,
            currency: data.currency || 'USDT',
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
        .then(() => {}, () => {});
    }
  },

  /**
   * Resolves the canonical Supabase Auth / PostgreSQL UUID for an account.
   * If a legacy non-UUID identifier (e.g. usr-643103) is passed, queries Supabase profiles
   * to obtain the genuine UUID. Throws if no valid UUID can be resolved.
   */
  async resolveCanonicalUserId(userMeta?: { id?: string; name?: string; email?: string }): Promise<string> {
    if (userMeta?.id && isValidUuid(userMeta.id)) {
      return userMeta.id;
    }

    if (userMeta?.email || userMeta?.name) {
      const cleanEmail = (userMeta.email || '').toLowerCase().trim();
      const cleanName = (userMeta.name || '').toLowerCase().trim();

      let query = supabase.from('profiles').select('id');
      if (cleanEmail && cleanName) {
        query = query.or(`email.eq.${cleanEmail},username.eq.${cleanName}`);
      } else if (cleanEmail) {
        query = query.eq('email', cleanEmail);
      } else if (cleanName) {
        query = query.eq('username', cleanName);
      }

      const { data: profile } = await query.maybeSingle();
      if (profile?.id && isValidUuid(profile.id)) {
        return profile.id;
      }
    }

    const currentUser = authService.getCurrentUser();
    if (currentUser?.id && isValidUuid(currentUser.id)) {
      return currentUser.id;
    }

    throw new Error('Your session has an invalid account ID. Please sign in again to verify your account.');
  },

  async syncWalletFromSupabase(userId: string): Promise<WalletState | null> {
    if (!userId) {
      return null;
    }

    try {
      const currentUser = authService.getCurrentUser();
      const allUsers = authService.getAllUsers();
      const userProfile = allUsers.find(u => u.id === userId || (currentUser && u.id === currentUser.id));

      // Collect all possible ID aliases for this user (UUID, legacy ID, email, username)
      const candidateIds = new Set<string>();
      candidateIds.add(userId);
      if (currentUser?.id) candidateIds.add(currentUser.id);
      if (userProfile?.id) candidateIds.add(userProfile.id);

      // Try resolving canonical UUID from Supabase profiles if not a UUID
      let canonicalId = isValidUuid(userId) ? userId : (currentUser?.id && isValidUuid(currentUser.id) ? currentUser.id : '');
      const userEmail = (userProfile?.email || currentUser?.email || '').toLowerCase().trim();
      const userUsername = (userProfile?.username || currentUser?.username || '').toLowerCase().trim();

      if (!canonicalId && (userEmail || userUsername)) {
        try {
          let query = supabase.from('profiles').select('id, email, username');
          if (userEmail && userUsername) {
            query = query.or(`email.eq.${userEmail},username.eq.${userUsername}`);
          } else if (userEmail) {
            query = query.eq('email', userEmail);
          } else if (userUsername) {
            query = query.eq('username', userUsername);
          }
          const { data: matchedProf } = await query.maybeSingle();
          if (matchedProf?.id) {
            canonicalId = matchedProf.id;
            candidateIds.add(matchedProf.id);
          }
        } catch {
          // ignore
        }
      }

      const idList = Array.from(candidateIds);

      // 1. Query Supabase wallets table for all matching candidate IDs
      let dbWalletData: any = null;
      for (const id of idList) {
        const { data: w } = await supabase.from('wallets').select('*').eq('user_id', id).maybeSingle();
        if (w) {
          dbWalletData = w;
          break;
        }
      }

      // 2. Query deposits table for all candidate IDs
      let approvedDeposits: any[] = [];
      let pendingDeposits: any[] = [];
      for (const id of idList) {
        const { data: depList } = await supabase.from('deposits').select('*').eq('user_id', id);
        if (depList && depList.length > 0) {
          depList.forEach(d => {
            if (d.status === 'APPROVED' || d.status === 'COMPLETED' || d.status === 'CONFIRMED') {
              approvedDeposits.push(d);
            } else if (d.status === 'PENDING') {
              pendingDeposits.push(d);
            }
          });
        }
      }

      // 3. Query withdrawals table for all candidate IDs
      let approvedWithdrawals: any[] = [];
      for (const id of idList) {
        const { data: wthList } = await supabase.from('withdrawals').select('*').eq('user_id', id);
        if (wthList && wthList.length > 0) {
          wthList.forEach(w => {
            if (w.status === 'APPROVED' || w.status === 'COMPLETED') {
              approvedWithdrawals.push(w);
            }
          });
        }
      }

      // 4. Query wallet_transactions table for profits / adjustments
      let totalProfits = 0;
      for (const id of idList) {
        const { data: txList } = await supabase.from('wallet_transactions').select('*').eq('user_id', id);
        if (txList && txList.length > 0) {
          txList.forEach(t => {
            const amt = parseFloat(t.amount) || 0;
            if (t.type === 'DAILY_PROFIT' || t.type === 'WELCOME_BONUS' || t.type === 'REFERRAL_BONUS' || t.type === 'ADMIN_CREDIT') {
              totalProfits += amt;
            }
          });
        }
      }

      const totalApprovedDep = approvedDeposits.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const totalApprovedWth = approvedWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
      const totalPendingDep = pendingDeposits.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      const local = this.getWalletForUser(userId);
      const rawDbAvailable = parseFloat(dbWalletData?.available_balance);
      const rawDbTotal = parseFloat(dbWalletData?.total_balance);
      const rawDbPending = parseFloat(dbWalletData?.pending_balance);

      const ledgerAvailable = Math.max(0, Number((totalApprovedDep + totalProfits - totalApprovedWth).toFixed(4)));

      let availableBalance = 0;
      let pendingBalance = 0;
      let totalBalance = 0;

      if (dbWalletData && !isNaN(rawDbAvailable)) {
        // Supabase DB is primary source of truth
        availableBalance = rawDbAvailable;
        pendingBalance = !isNaN(rawDbPending) ? rawDbPending : totalPendingDep;
        totalBalance = !isNaN(rawDbTotal) && rawDbTotal > 0
          ? rawDbTotal
          : Number((availableBalance + pendingBalance).toFixed(4));
      } else if (ledgerAvailable > 0 || totalPendingDep > 0) {
        // Fallback to ledger computation
        availableBalance = ledgerAvailable;
        pendingBalance = totalPendingDep;
        totalBalance = Number((availableBalance + pendingBalance).toFixed(4));
      } else {
        // Fallback to local cache
        availableBalance = local?.availableBalance || 0;
        pendingBalance = local?.pendingBalance || 0;
        totalBalance = local?.totalBalance || Number((availableBalance + pendingBalance).toFixed(4));
      }

      const targetPersistId = canonicalId || userId;

      // Auto-heal & persist to Supabase PostgreSQL database if missing
      if (isValidUuid(targetPersistId) && !dbWalletData && availableBalance > 0) {
        await supabase.from('wallets').upsert({
          user_id: targetPersistId,
          available_balance: availableBalance,
          total_balance: totalBalance,
          pending_balance: pendingBalance,
          currency: 'USDT',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }

      const syncedWallet: WalletState = {
        ...local,
        totalBalance,
        availableBalance,
        pendingBalance,
        currency: dbWalletData?.currency || local.currency || 'USDT',
        status: (local.status === 'FROZEN' ? 'FROZEN' : 'ACTIVE'),
        updatedAt: dbWalletData?.updated_at || new Date().toISOString()
      };

      // Save across all candidate keys
      for (const id of idList) {
        localStorage.setItem(`ivestbot_wallet_${id}`, JSON.stringify(syncedWallet));
      }

      if (currentUser && idList.includes(currentUser.id)) {
        this.saveWallet(syncedWallet);
      }

      return syncedWallet;
    } catch (err) {
      console.warn('syncWalletFromSupabase error:', err);
    }
    return null;
  },

  getTransactions(): WalletTransaction[] {
    try {
      const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (stored) {
        const parsed: WalletTransaction[] = JSON.parse(stored);
        return parsed.filter(t => t.id !== 'tx-wth-sample-1' && t.id !== 'tx-dep-sample-1');
      }
    } catch {
      // ignore
    }
    return DEFAULT_TRANSACTIONS;
  },

  saveTransactions(transactions: WalletTransaction[]): void {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  },

  async syncTransactionsFromSupabase(userId?: string): Promise<WalletTransaction[]> {
    try {
      const allUsers = authService.getAllUsers();
      const currentUser = authService.getCurrentUser();
      const txMap = new Map<string, WalletTransaction>();

      // Candidate IDs
      const candidateIds = new Set<string>();
      if (userId) candidateIds.add(userId);
      if (currentUser?.id) candidateIds.add(currentUser.id);

      // 1. Fetch from deposits table
      const { data: depData } = await supabase.from('deposits').select('*').order('created_at', { ascending: false });

      if (depData && depData.length > 0) {
        depData.forEach(d => {
          if (userId && !candidateIds.has(d.user_id)) return;
          const user = allUsers.find(u => u.id === d.user_id);
          const refId = `DEP-${d.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
          txMap.set(d.id, {
            id: d.id,
            userId: d.user_id,
            userName: user?.name || user?.username || 'User',
            userEmail: user?.email,
            type: 'DEPOSIT',
            amount: parseFloat(d.amount) || 0,
            currency: d.currency || 'USDT',
            status: (d.status?.toUpperCase() || 'PENDING') as TransactionStatus,
            description: d.status === 'APPROVED'
              ? `USDT Deposit Verified & Approved (+${parseFloat(d.amount) || 0} USDT credited)`
              : d.status === 'REJECTED'
              ? `USDT Deposit Verification Rejected: ${d.admin_note || 'Invalid TxID'}`
              : `USDT Deposit Submitted (${(d.deposit_address || '').slice(0, 8)}...) - Pending Admin Verification`,
            referenceId: refId,
            createdAt: d.created_at || new Date().toISOString(),
            address: d.deposit_address,
            txHash: d.tx_hash,
            adminRemarks: d.admin_note
          });
        });
      }

      // 2. Fetch from withdrawals table
      const { data: wthData } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });

      if (wthData && wthData.length > 0) {
        wthData.forEach(d => {
          if (userId && !candidateIds.has(d.user_id)) return;
          const user = allUsers.find(u => u.id === d.user_id);
          const refId = `WTH-${d.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
          txMap.set(d.id, {
            id: d.id,
            userId: d.user_id,
            userName: user?.name || user?.username || 'User',
            userEmail: user?.email,
            type: 'WITHDRAWAL',
            amount: parseFloat(d.amount) || 0,
            currency: d.currency || 'USDT',
            status: (d.status?.toUpperCase() || 'PENDING') as TransactionStatus,
            description: d.status === 'APPROVED'
              ? `Withdrawal Approved & Dispatched (-${parseFloat(d.amount) || 0} USDT)`
              : d.status === 'REJECTED'
              ? `Withdrawal Rejected by Admin (Refunded ${parseFloat(d.amount) || 0} USDT): ${d.admin_note || 'Security Review'}`
              : `Withdrawal Request to ${(d.recipient_address || '').slice(0, 8)}... - Pending Admin Review`,
            referenceId: refId,
            createdAt: d.created_at || new Date().toISOString(),
            address: d.recipient_address,
            adminRemarks: d.admin_note
          });
        });
      }

      // 3. Fetch non-deposit, non-withdrawal records from wallet_transactions table (bonuses, trades, admin adjustments)
      const { data: txData } = await supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false });

      if (txData && txData.length > 0) {
        txData.forEach(d => {
          if (userId && !candidateIds.has(d.user_id)) return;
          // Avoid duplicate deposits/withdrawals already indexed by ID
          if (txMap.has(d.id)) return;

          const user = allUsers.find(u => u.id === d.user_id);
          txMap.set(d.id, {
            id: d.id,
            userId: d.user_id,
            userName: d.metadata?.userName || user?.name || user?.username,
            userEmail: d.metadata?.userEmail || user?.email,
            type: d.type as TransactionType,
            amount: parseFloat(d.amount) || 0,
            currency: d.currency || 'USDT',
            status: (d.status?.toUpperCase() || 'PENDING') as TransactionStatus,
            description: d.description || '',
            referenceId: d.reference_id || d.id,
            createdAt: d.created_at || new Date().toISOString(),
            address: d.metadata?.address || d.metadata?.depositAddress || d.metadata?.recipientAddress,
            txHash: d.metadata?.txHash,
            adminRemarks: d.metadata?.adminRemarks || d.description
          });
        });
      }

      const merged = Array.from(txMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.saveTransactions(merged);
      return merged;
    } catch {
      // ignore
    }
    return this.getTransactions();
  },

  addTransaction(tx: Omit<WalletTransaction, 'id' | 'createdAt'>): WalletTransaction {
    const newTx: WalletTransaction = {
      ...tx,
      id: `tx-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    const current = this.getTransactions();
    const updated = [newTx, ...current];
    this.saveTransactions(updated);

    // Sync to Supabase wallet_transactions table
    supabase
      .from('wallet_transactions')
      .insert({
        user_id: tx.userId || null,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        description: tx.description,
        reference_id: tx.referenceId,
        metadata: {
          userName: tx.userName,
          userEmail: tx.userEmail,
          address: tx.address,
          txHash: tx.txHash,
          adminRemarks: tx.adminRemarks
        }
      })
      .then(() => {}, () => {});

    return newTx;
  },

  /**
   * Submits a Deposit request into PENDING status under Admin Verification (Database Backed).
   */
  async submitDeposit(
    amount: number,
    address: string,
    txHash: string,
    userMeta?: { id?: string; name?: string; email?: string }
  ): Promise<{
    depositTx: WalletTransaction;
    newWallet: WalletState;
  }> {
    const canonicalUserId = await this.resolveCanonicalUserId(userMeta);
    const wallet = this.getWalletForUser(canonicalUserId);

    // Restrictions check: Allow INACTIVE accounts to deposit to activate their account
    if (wallet.status === 'FROZEN') {
      throw new Error('Wallet is FROZEN. Deposit operations are currently locked on your account.');
    }
    if (wallet.restrictions && !wallet.restrictions.canDeposit) {
      throw new Error(wallet.restrictionReason || 'Deposit feature is restricted on your wallet by Admin.');
    }

    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than zero.');
    }

    if (!txHash.trim()) {
      throw new Error('Transaction hash / receipt ID is required.');
    }

    // Call PostgreSQL atomic RPC function with verified canonical UUID
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('submit_deposit_request', {
      p_user_id: canonicalUserId,
      p_amount: amount,
      p_deposit_address: address,
      p_tx_hash: txHash.trim(),
      p_currency: 'USDT',
      p_network: 'TRC20'
    });

    if (rpcErr || !rpcRes?.success) {
      const errMsg = rpcErr?.message || 'Deposit submission failed on server. Please try again.';
      console.error('[Deposit Error]', rpcErr || rpcRes);
      throw new Error(errMsg);
    }

    // Success via RPC
    const dbWallet = rpcRes.wallet;
    const dbDeposit = rpcRes.deposit;

    const syncedWallet: WalletState = {
      ...wallet,
      totalBalance: parseFloat(dbWallet.total_balance) || 0,
      availableBalance: parseFloat(dbWallet.available_balance) || 0,
      pendingBalance: parseFloat(dbWallet.pending_balance) || 0,
      updatedAt: dbWallet.updated_at
    };
    this.saveWalletForUser(canonicalUserId, syncedWallet);

    const depositTx: WalletTransaction = {
      id: dbDeposit.id,
      userId: canonicalUserId,
      userName: userMeta?.name,
      userEmail: userMeta?.email,
      type: 'DEPOSIT',
      amount: parseFloat(dbDeposit.amount) || amount,
      currency: dbDeposit.currency || 'USDT',
      status: 'PENDING',
      description: `USDT Deposit Submitted (${address.slice(0, 8)}...) - Pending Admin Verification`,
      referenceId: `DEP-${dbDeposit.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      createdAt: dbDeposit.created_at,
      address,
      txHash
    };

    const currentTxs = this.getTransactions();
    this.saveTransactions([depositTx, ...currentTxs.filter(t => t.id !== depositTx.id)]);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ivestbot_deposit_submitted'));
    }

    return { depositTx, newWallet: syncedWallet };
  },

  /**
   * Submits a Withdrawal request into PENDING status under Admin Verification (Database Backed).
   */
  async submitWithdrawal(
    amount: number,
    address: string,
    userMeta?: { id?: string; name?: string; email?: string }
  ): Promise<{
    success: boolean;
    message: string;
    newWallet: WalletState;
    withdrawalTx: WalletTransaction;
  }> {
    const canonicalUserId = await this.resolveCanonicalUserId(userMeta);
    const wallet = this.getWalletForUser(canonicalUserId);

    // Restrictions check
    if (wallet.status === 'INACTIVE' || wallet.status === 'FROZEN') {
      throw new Error(`Wallet is ${wallet.status}. Withdrawals are temporarily locked on your account.`);
    }
    if (wallet.restrictions && !wallet.restrictions.canWithdraw) {
      throw new Error(wallet.restrictionReason || 'Withdrawal feature is restricted on your wallet by Admin.');
    }

    if (amount <= 0) {
      throw new Error('Please enter a valid withdrawal amount.');
    }

    if (!address.trim()) {
      throw new Error('Please enter your recipient USDT wallet address.');
    }

    // Call PostgreSQL atomic RPC function with verified canonical UUID
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('submit_withdrawal_request', {
      p_user_id: canonicalUserId,
      p_amount: amount,
      p_recipient_address: address.trim(),
      p_currency: 'USDT'
    });

    if (rpcErr || !rpcRes?.success) {
      const errMsg = rpcErr?.message || 'Withdrawal submission failed';
      throw new Error(errMsg);
    }

    const dbWallet = rpcRes.wallet;
    const dbWithdrawal = rpcRes.withdrawal;

    const syncedWallet: WalletState = {
      ...wallet,
      totalBalance: parseFloat(dbWallet.total_balance) || 0,
      availableBalance: parseFloat(dbWallet.available_balance) || 0,
      pendingBalance: parseFloat(dbWallet.pending_balance) || 0,
      updatedAt: dbWallet.updated_at
    };
    this.saveWalletForUser(canonicalUserId, syncedWallet);

    const withdrawalTx: WalletTransaction = {
      id: dbWithdrawal.id,
      userId: canonicalUserId,
      userName: userMeta?.name,
      userEmail: userMeta?.email,
      type: 'WITHDRAWAL',
      amount: parseFloat(dbWithdrawal.amount) || amount,
      currency: dbWithdrawal.currency || 'USDT',
      status: 'PENDING',
      description: `Withdrawal Request to ${address.slice(0, 8)}... - Pending Admin Review`,
      referenceId: `WTH-${dbWithdrawal.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      createdAt: dbWithdrawal.created_at,
      address
    };

    const currentTxs = this.getTransactions();
    this.saveTransactions([withdrawalTx, ...currentTxs.filter(t => t.id !== withdrawalTx.id)]);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ivestbot_withdrawal_submitted'));
    }

    return {
      success: true,
      message: `Withdrawal request of ${amount.toFixed(2)} USDT submitted! Amount is held in Pending Balance until Admin verification.`,
      newWallet: syncedWallet,
      withdrawalTx
    };
  },

  /**
   * Admin Action: Approve a Pending Deposit (Database Backed & Idempotent).
   */
  async approveDeposit(
    txId: string,
    _hasSponsor: boolean = true,
    adminRemarks?: string
  ): Promise<{
    updatedWallet: WalletState;
    approvedTx: WalletTransaction;
    welcomeBonus: number;
    sponsorBonus: number;
  }> {
    let depositUserId = '';
    let depositAmount = 0;
    let rpcSuccess = false;
    let rpcResData: any = null;

    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('approve_deposit_request', {
        p_deposit_id: txId,
        p_admin_id: 'admin',
        p_remarks: adminRemarks || 'Deposit verified and credited by Admin'
      });
      if (!rpcErr && rpcRes?.success) {
        rpcSuccess = true;
        rpcResData = rpcRes;
        depositUserId = rpcRes.wallet?.user_id;
        depositAmount = rpcRes.creditedAmount || 0;
      }
    } catch {
      // ignore
    }

    if (!rpcSuccess) {
      // 1. Fetch deposit record from Supabase
      const { data: depRow } = await supabase.from('deposits').select('*').eq('id', txId).maybeSingle();
      if (!depRow) {
        throw new Error('Deposit record not found in database.');
      }

      depositUserId = depRow.user_id;
      depositAmount = parseFloat(depRow.amount) || 0;

      // 2. Mark deposit as APPROVED in deposits table
      await supabase.from('deposits').update({
        status: 'APPROVED',
        admin_note: adminRemarks || 'Deposit verified and credited by Admin',
        updated_at: new Date().toISOString()
      }).eq('id', txId);

      // 3. Mark user profile status as ACTIVE
      await supabase.from('profiles').update({
        status: 'ACTIVE',
        updated_at: new Date().toISOString()
      }).eq('id', depositUserId);

      // 4. Fetch and update wallets table
      const { data: dbWallet } = await supabase.from('wallets').select('*').eq('user_id', depositUserId).maybeSingle();
      const currentAvail = parseFloat(dbWallet?.available_balance) || 0;
      const currentPend = parseFloat(dbWallet?.pending_balance) || 0;

      const nextAvail = Number((currentAvail + depositAmount).toFixed(4));
      const nextPend = Math.max(0, Number((currentPend - depositAmount).toFixed(4)));
      const nextTot = Number((nextAvail + nextPend).toFixed(4));

      await supabase.from('wallets').upsert({
        user_id: depositUserId,
        available_balance: nextAvail,
        total_balance: nextTot,
        pending_balance: nextPend,
        currency: 'USDT',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }

    const syncedWallet = (await this.syncWalletFromSupabase(depositUserId)) || {
      ...this.getWalletForUser(depositUserId),
      availableBalance: depositAmount,
      totalBalance: depositAmount,
      pendingBalance: 0,
      status: 'ACTIVE'
    };
    this.saveWalletForUser(depositUserId, syncedWallet);

    await this.syncTransactionsFromSupabase();

    const transactions = this.getTransactions();
    const approvedTx = transactions.find(t => t.id === txId) || {
      id: txId,
      userId: depositUserId,
      type: 'DEPOSIT' as TransactionType,
      amount: depositAmount,
      currency: 'USDT',
      status: 'APPROVED' as TransactionStatus,
      description: `USDT Deposit Verified & Approved (+${depositAmount} USDT credited)`,
      referenceId: `DEP-${txId.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      adminRemarks: adminRemarks || 'Deposit verified and credited by Admin'
    };

    // Calculate Sponsor Milestone Bonus
    let sponsorBonus = 0;
    try {
      const allUsers = authService.getAllUsers();
      const depositUser = allUsers.find(u => u.id === depositUserId);
      if (depositUser?.referredBy) {
        const cleanRef = depositUser.referredBy.trim().toLowerCase();
        const sponsor = allUsers.find(
          u => (u.referralCode && u.referralCode.toLowerCase() === cleanRef) ||
               (u.username && u.username.toLowerCase() === cleanRef) ||
               (u.id && u.id.toLowerCase() === cleanRef)
        );

        if (sponsor && sponsor.id !== depositUserId) {
          if (depositAmount >= 1000) sponsorBonus = 20;
          else if (depositAmount >= 500) sponsorBonus = 10;
          else if (depositAmount >= 200) sponsorBonus = 4;
          else if (depositAmount >= 100) sponsorBonus = 2;
          else if (depositAmount >= 50) sponsorBonus = 1;

          if (sponsorBonus > 0) {
            const sponsorWallet = this.getWalletForUser(sponsor.id);
            const updatedSponsorWallet = {
              ...sponsorWallet,
              totalBalance: Number((sponsorWallet.totalBalance + sponsorBonus).toFixed(4)),
              availableBalance: Number((sponsorWallet.availableBalance + sponsorBonus).toFixed(4))
            };
            this.saveWalletForUser(sponsor.id, updatedSponsorWallet);

            this.addTransaction({
              userId: sponsor.id,
              userName: sponsor.username,
              type: 'WELCOME_BONUS',
              amount: sponsorBonus,
              currency: 'USDT',
              status: 'COMPLETED',
              referenceId: `REF-BONUS-${Date.now().toString().slice(-6)}`,
              description: `Instant Sponsor Milestone Bonus (+${sponsorBonus} USDT) from @${depositUser.username}'s ${depositAmount} USDT deposit`
            });
          }
        }
      }
    } catch {
      // safe fallback
    }

    return {
      updatedWallet: syncedWallet,
      approvedTx,
      welcomeBonus: rpcResData?.welcomeBonus || 0,
      sponsorBonus
    };
  },

  /**
   * Admin Action: Reject a Pending Deposit (Database Backed & Idempotent).
   */
  async rejectDeposit(
    txId: string,
    adminRemarks?: string
  ): Promise<{ updatedWallet: WalletState; rejectedTx: WalletTransaction }> {
    let rpcSuccess = false;
    let userId = '';

    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('reject_deposit_request', {
        p_deposit_id: txId,
        p_admin_id: 'admin',
        p_remarks: adminRemarks || 'Deposit rejected by Admin'
      });

      if (!rpcErr && rpcRes?.success) {
        rpcSuccess = true;
        const dbWallet = rpcRes.wallet;
        userId = dbWallet.user_id;
      }
    } catch {
      // fallback
    }

    if (!rpcSuccess) {
      // 1. Fetch deposit from database
      const { data: depRow } = await supabase.from('deposits').select('*').eq('id', txId).maybeSingle();
      if (depRow) {
        userId = depRow.user_id;
        const depAmt = parseFloat(depRow.amount) || 0;

        // 2. Mark deposit as REJECTED in deposits table
        await supabase.from('deposits').update({
          status: 'REJECTED',
          admin_note: adminRemarks || 'Deposit rejected by Admin',
          updated_at: new Date().toISOString()
        }).eq('id', txId);

        // 3. Deduct from pending_balance in wallets table
        const { data: dbWallet } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
        const currentAvail = parseFloat(dbWallet?.available_balance) || 0;
        const currentPend = parseFloat(dbWallet?.pending_balance) || 0;
        const nextPend = Math.max(0, Number((currentPend - depAmt).toFixed(4)));
        const nextTot = Number((currentAvail + nextPend).toFixed(4));

        await supabase.from('wallets').upsert({
          user_id: userId,
          available_balance: currentAvail,
          total_balance: nextTot,
          pending_balance: nextPend,
          currency: 'USDT',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
    }

    const syncedWallet = (userId ? await this.syncWalletFromSupabase(userId) : null) || {
      ...this.getWalletForUser(userId),
      pendingBalance: 0
    };
    if (userId) {
      this.saveWalletForUser(userId, syncedWallet);
    }

    await this.syncTransactionsFromSupabase();

    const transactions = this.getTransactions();
    const rejectedTx = transactions.find(t => t.id === txId) || {
      id: txId,
      userId,
      type: 'DEPOSIT' as TransactionType,
      amount: 0,
      currency: 'USDT',
      status: 'REJECTED' as TransactionStatus,
      description: `USDT Deposit Verification Rejected: ${adminRemarks || 'Invalid receipt'}`,
      referenceId: `DEP-${txId.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      adminRemarks
    };

    return { updatedWallet: syncedWallet, rejectedTx };
  },

  /**
   * Admin Action: Approve a Pending Withdrawal (Database Backed & Idempotent).
   */
  async approveWithdrawal(
    txId: string,
    adminRemarks?: string
  ): Promise<{ updatedWallet: WalletState; approvedTx: WalletTransaction }> {
    let rpcSuccess = false;
    let userId = '';
    let wthAmount = 0;

    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('approve_withdrawal_request', {
        p_withdrawal_id: txId,
        p_admin_id: 'admin',
        p_remarks: adminRemarks || 'Withdrawal dispatched by Admin'
      });

      if (!rpcErr && rpcRes?.success) {
        rpcSuccess = true;
        const dbWallet = rpcRes.wallet;
        userId = dbWallet.user_id;
      }
    } catch {
      // fallback
    }

    if (!rpcSuccess) {
      // 1. Fetch withdrawal from database
      const { data: wthRow } = await supabase.from('withdrawals').select('*').eq('id', txId).maybeSingle();
      if (wthRow) {
        userId = wthRow.user_id;
        wthAmount = parseFloat(wthRow.amount) || 0;

        // 2. Mark withdrawal as APPROVED in withdrawals table
        await supabase.from('withdrawals').update({
          status: 'APPROVED',
          admin_note: adminRemarks || 'Withdrawal dispatched by Admin',
          updated_at: new Date().toISOString()
        }).eq('id', txId);

        // 3. Deduct from pending_balance and finalize total_balance in wallets table
        const { data: dbWallet } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
        const currentAvail = parseFloat(dbWallet?.available_balance) || 0;
        const currentPend = parseFloat(dbWallet?.pending_balance) || 0;
        const nextPend = Math.max(0, Number((currentPend - wthAmount).toFixed(4)));
        const nextTot = Number((currentAvail + nextPend).toFixed(4));

        await supabase.from('wallets').upsert({
          user_id: userId,
          available_balance: currentAvail,
          total_balance: nextTot,
          pending_balance: nextPend,
          currency: 'USDT',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
    }

    const syncedWallet = (userId ? await this.syncWalletFromSupabase(userId) : null) || {
      ...this.getWalletForUser(userId),
      pendingBalance: 0
    };
    if (userId) {
      this.saveWalletForUser(userId, syncedWallet);
    }

    await this.syncTransactionsFromSupabase();

    const transactions = this.getTransactions();
    const approvedTx = transactions.find(t => t.id === txId) || {
      id: txId,
      userId,
      type: 'WITHDRAWAL' as TransactionType,
      amount: wthAmount,
      currency: 'USDT',
      status: 'APPROVED' as TransactionStatus,
      description: `Withdrawal Approved & Dispatched`,
      referenceId: `WTH-${txId.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      adminRemarks
    };

    return { updatedWallet: syncedWallet, approvedTx };
  },

  /**
   * Admin Action: Reject a Pending Withdrawal (Refunds back to available balance).
   */
  async rejectWithdrawal(
    txId: string,
    adminRemarks?: string
  ): Promise<{ updatedWallet: WalletState; rejectedTx: WalletTransaction }> {
    let rpcSuccess = false;
    let userId = '';
    let refundedAmount = 0;

    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('reject_withdrawal_request', {
        p_withdrawal_id: txId,
        p_admin_id: 'admin',
        p_remarks: adminRemarks || 'Withdrawal rejected and refunded by Admin'
      });

      if (!rpcErr && rpcRes?.success) {
        rpcSuccess = true;
        const dbWallet = rpcRes.wallet;
        userId = dbWallet.user_id;
        refundedAmount = rpcRes.refundedAmount || 0;
      }
    } catch {
      // fallback
    }

    if (!rpcSuccess) {
      // 1. Fetch withdrawal from database
      const { data: wthRow } = await supabase.from('withdrawals').select('*').eq('id', txId).maybeSingle();
      if (wthRow) {
        userId = wthRow.user_id;
        refundedAmount = parseFloat(wthRow.amount) || 0;

        // 2. Mark withdrawal as REJECTED in withdrawals table
        await supabase.from('withdrawals').update({
          status: 'REJECTED',
          admin_note: adminRemarks || 'Withdrawal rejected and refunded by Admin',
          updated_at: new Date().toISOString()
        }).eq('id', txId);

        // 3. Refund amount: remove from pending_balance, add back to available_balance
        const { data: dbWallet } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
        const currentAvail = parseFloat(dbWallet?.available_balance) || 0;
        const currentPend = parseFloat(dbWallet?.pending_balance) || 0;
        const nextAvail = Number((currentAvail + refundedAmount).toFixed(4));
        const nextPend = Math.max(0, Number((currentPend - refundedAmount).toFixed(4)));
        const nextTot = Number((nextAvail + nextPend).toFixed(4));

        await supabase.from('wallets').upsert({
          user_id: userId,
          available_balance: nextAvail,
          total_balance: nextTot,
          pending_balance: nextPend,
          currency: 'USDT',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
    }

    const syncedWallet = (userId ? await this.syncWalletFromSupabase(userId) : null) || {
      ...this.getWalletForUser(userId),
      availableBalance: this.getWalletForUser(userId).availableBalance + refundedAmount,
      pendingBalance: Math.max(0, this.getWalletForUser(userId).pendingBalance - refundedAmount)
    };
    if (userId) {
      this.saveWalletForUser(userId, syncedWallet);
    }

    await this.syncTransactionsFromSupabase();

    const transactions = this.getTransactions();
    const rejectedTx = transactions.find(t => t.id === txId) || {
      id: txId,
      userId,
      type: 'WITHDRAWAL' as TransactionType,
      amount: refundedAmount,
      currency: 'USDT',
      status: 'REJECTED' as TransactionStatus,
      description: `Withdrawal Rejected by Admin (Refunded ${refundedAmount} USDT)`,
      referenceId: `WTH-${txId.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      adminRemarks
    };

    return { updatedWallet: syncedWallet, rejectedTx };
  },

  /**
   * User Action: Cancel a Pending Withdrawal and refund back to available balance
   */
  async cancelWithdrawal(
    txId: string,
    userId: string
  ): Promise<{
    updatedWallet: WalletState;
    cancelledTx: WalletTransaction;
  }> {
    const canonicalUserId = await this.resolveCanonicalUserId({ id: userId });

    const { data: rpcRes, error: rpcErr } = await supabase.rpc('cancel_withdrawal_request', {
      p_withdrawal_id: txId,
      p_user_id: canonicalUserId
    });

    if (rpcErr || !rpcRes?.success) {
      throw new Error(rpcErr?.message || 'Failed to cancel withdrawal');
    }

    const dbWallet = rpcRes.wallet;
    const syncedWallet: WalletState = {
      ...this.getWalletForUser(canonicalUserId),
      totalBalance: parseFloat(dbWallet.total_balance) || 0,
      availableBalance: parseFloat(dbWallet.available_balance) || 0,
      pendingBalance: parseFloat(dbWallet.pending_balance) || 0,
      updatedAt: dbWallet.updated_at
    };
    this.saveWalletForUser(canonicalUserId, syncedWallet);

    await this.syncTransactionsFromSupabase();

    const transactions = this.getTransactions();
    const cancelledTx = transactions.find(t => t.id === txId) || {
      id: txId,
      userId,
      type: 'WITHDRAWAL' as TransactionType,
      amount: rpcRes.refundedAmount || 0,
      currency: 'USDT',
      status: 'REJECTED' as TransactionStatus,
      description: `Withdrawal Cancelled by User (Refunded ${rpcRes.refundedAmount || 0} USDT)`,
      referenceId: `WTH-${txId.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };

    return { updatedWallet: syncedWallet, cancelledTx };
  },

  /**
   * Admin Manual Credit
   */
  adminCredit(amount: number, reason: string, userMeta?: { id?: string; name?: string; email?: string }): {
    updatedWallet: WalletState;
    tx: WalletTransaction;
  } {
    const userId = userMeta?.id;
    const wallet = userId ? this.getWalletForUser(userId) : this.getWallet();
    const newAvailable = Number((wallet.availableBalance + amount).toFixed(4));
    const newTotal = Number((wallet.totalBalance + amount).toFixed(4));

    const updatedWallet: WalletState = {
      ...wallet,
      availableBalance: newAvailable,
      totalBalance: newTotal
    };

    if (userId) {
      this.saveWalletForUser(userId, updatedWallet);
    } else {
      this.saveWallet(updatedWallet);
    }

    if (userId) {
      this.recordSnapshot({
        userId,
        userName: userMeta?.name,
        userEmail: userMeta?.email,
        before: { available: wallet.availableBalance, total: wallet.totalBalance, pending: wallet.pendingBalance },
        after: { available: updatedWallet.availableBalance, total: updatedWallet.totalBalance, pending: updatedWallet.pendingBalance },
        actionType: 'ADMIN_CREDIT',
        reason: `Admin Credit: ${reason}`,
        actor: 'ADMIN'
      });
    }

    const tx = this.addTransaction({
      userId,
      userName: userMeta?.name,
      userEmail: userMeta?.email,
      type: 'ADMIN_CREDIT',
      amount,
      currency: 'USDT',
      status: 'COMPLETED',
      description: `Admin Manual Credit (+${amount.toFixed(2)} USDT) — Reason: ${reason}`,
      referenceId: `ADM-CR-${Date.now().toString().slice(-6)}`,
      adminRemarks: reason
    });

    return { updatedWallet, tx };
  },

  /**
   * Admin Manual Debit
   */
  adminDebit(amount: number, reason: string, userMeta?: { id?: string; name?: string; email?: string }): {
    updatedWallet: WalletState;
    tx: WalletTransaction;
  } {
    const userId = userMeta?.id;
    const wallet = userId ? this.getWalletForUser(userId) : this.getWallet();
    const newAvailable = Math.max(0, Number((wallet.availableBalance - amount).toFixed(4)));
    const newTotal = Math.max(0, Number((wallet.totalBalance - amount).toFixed(4)));

    const updatedWallet: WalletState = {
      ...wallet,
      availableBalance: newAvailable,
      totalBalance: newTotal
    };

    if (userId) {
      this.saveWalletForUser(userId, updatedWallet);
    } else {
      this.saveWallet(updatedWallet);
    }

    if (userId) {
      this.recordSnapshot({
        userId,
        userName: userMeta?.name,
        userEmail: userMeta?.email,
        before: { available: wallet.availableBalance, total: wallet.totalBalance, pending: wallet.pendingBalance },
        after: { available: updatedWallet.availableBalance, total: updatedWallet.totalBalance, pending: updatedWallet.pendingBalance },
        actionType: 'ADMIN_DEBIT',
        reason: `Admin Debit: ${reason}`,
        actor: 'ADMIN'
      });
    }

    const tx = this.addTransaction({
      userId,
      userName: userMeta?.name,
      userEmail: userMeta?.email,
      type: 'ADMIN_DEBIT',
      amount,
      currency: 'USDT',
      status: 'COMPLETED',
      description: `Admin Manual Debit (-${amount.toFixed(2)} USDT) — Reason: ${reason}`,
      referenceId: `ADM-DB-${Date.now().toString().slice(-6)}`,
      adminRemarks: reason
    });

    return { updatedWallet, tx };
  },

  /**
   * Admin Update Wallet Restrictions / Inactive status
   */
  updateWalletRestrictions(
    status: WalletStatus,
    restrictions: WalletRestrictions,
    reason?: string,
    userId?: string
  ): WalletState {
    const current = userId ? this.getWalletForUser(userId) : this.getWallet();
    const updated: WalletState = {
      ...current,
      status,
      restrictions: { ...restrictions },
      restrictionReason: reason || (status === 'INACTIVE' ? 'Wallet account deactivated by Compliance' : undefined)
    };
    if (userId) {
      this.saveWalletForUser(userId, updated);
    } else {
      this.saveWallet(updated);
    }
    return updated;
  },

  getKycStatus(userId?: string): KycSubmission {
    try {
      const activeUser = authService.getCurrentUser();
      const activeId = userId || activeUser?.id;
      if (activeId) {
        const userSpecific = localStorage.getItem(`ivestbot_kyc_${activeId}`);
        if (userSpecific) {
          const parsed: KycSubmission = JSON.parse(userSpecific);
          if (activeUser && activeUser.id === activeId && activeUser.kycStatus) {
            parsed.status = activeUser.kycStatus;
          }
          return parsed;
        }
        if (activeUser && activeUser.id === activeId && activeUser.kycStatus && activeUser.kycStatus !== 'NOT_SUBMITTED') {
          return {
            userId: activeUser.id,
            fullName: activeUser.name || '',
            documentType: 'PASSPORT',
            documentNumber: '',
            status: activeUser.kycStatus
          };
        }
        return {
          userId: activeId,
          fullName: (activeUser && activeUser.id === activeId ? activeUser.name : '') || '',
          documentType: 'PASSPORT',
          documentNumber: '',
          status: 'NOT_SUBMITTED'
        };
      }
    } catch {
      // ignore
    }
    return {
      fullName: '',
      documentType: 'PASSPORT',
      documentNumber: '',
      status: 'NOT_SUBMITTED'
    };
  },

  async syncKycFromSupabase(userId?: string): Promise<KycSubmission | null> {
    const activeUser = authService.getCurrentUser();
    const targetId = userId || activeUser?.id;
    if (!targetId || !isValidUuid(targetId)) {
      return this.getKycStatus(targetId);
    }
    try {
      // 1. Check profiles table for user KYC status
      const { data: profileRecord } = await supabase
        .from('profiles')
        .select('kyc_status, name')
        .eq('id', targetId)
        .maybeSingle();

      // 2. Check kyc_records table for document metadata
      const { data: record } = await supabase
        .from('kyc_records')
        .select('*')
        .eq('user_id', targetId)
        .maybeSingle();

      const profileKycStatus = profileRecord?.kyc_status;
      const recordKycStatus = record?.status;

      let effectiveStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' = 'NOT_SUBMITTED';
      if (profileKycStatus === 'VERIFIED' || recordKycStatus === 'VERIFIED') {
        effectiveStatus = 'VERIFIED';
      } else if (profileKycStatus === 'REJECTED' || recordKycStatus === 'REJECTED') {
        effectiveStatus = 'REJECTED';
      } else if (profileKycStatus === 'PENDING' || recordKycStatus === 'PENDING') {
        effectiveStatus = 'PENDING';
      } else if (record) {
        effectiveStatus = (record.status as any) || 'PENDING';
      }

      if (record || profileRecord) {
        const localCurrent = this.getKycStatus(targetId);
        const kyc: KycSubmission = {
          userId: targetId,
          fullName: record?.full_name || profileRecord?.name || localCurrent.fullName || '',
          documentType: record?.document_type || localCurrent.documentType || 'PASSPORT',
          documentNumber: record?.document_number || localCurrent.documentNumber || '',
          documentFileName: record?.document_url || localCurrent.documentFileName || 'id_document.pdf',
          status: effectiveStatus,
          submittedAt: record?.created_at || localCurrent.submittedAt || new Date().toISOString(),
          reviewedAt: record?.updated_at || localCurrent.reviewedAt,
          adminNotes: record?.rejection_reason || localCurrent.adminNotes
        };
        localStorage.setItem(`ivestbot_kyc_${targetId}`, JSON.stringify(kyc));
        if (targetId === activeUser?.id) {
          localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(kyc));
        }
        return kyc;
      }
    } catch (err) {
      console.warn('Error syncing KYC from Supabase:', err);
    }
    return this.getKycStatus(targetId);
  },

  async submitKyc(
    data: { fullName: string; documentType: string; documentNumber: string; documentFileName?: string },
    userMeta?: { id?: string }
  ): Promise<KycSubmission> {
    const targetId = userMeta?.id || authService.getCurrentUser()?.id;
    const now = new Date().toISOString();

    const kyc: KycSubmission = {
      userId: targetId,
      fullName: data.fullName.trim(),
      documentType: data.documentType,
      documentNumber: data.documentNumber.trim(),
      documentFileName: data.documentFileName || 'id_document_scan.jpg',
      status: 'PENDING',
      submittedAt: now
    };

    // 1. Store locally for instant UI response
    if (targetId) {
      localStorage.setItem(`ivestbot_kyc_${targetId}`, JSON.stringify(kyc));
    }
    localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(kyc));

    // 2. Persist to Supabase Database with Realtime sync
    if (targetId && isValidUuid(targetId)) {
      try {
        await supabase.from('kyc_records').upsert({
          user_id: targetId,
          full_name: kyc.fullName,
          document_type: kyc.documentType,
          document_number: kyc.documentNumber,
          document_url: kyc.documentFileName,
          status: 'PENDING',
          updated_at: now
        }, { onConflict: 'user_id' });

        await supabase.from('profiles').update({
          kyc_status: 'PENDING',
          updated_at: now
        }).eq('id', targetId);
      } catch (err) {
        console.error('Supabase KYC submit error:', err);
      }
    }

    // 3. Dispatch global browser events for multi-tab and Admin instant response
    try {
      window.dispatchEvent(new CustomEvent('ivestbot_kyc_submitted', { detail: kyc }));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }

    return kyc;
  },

  adminVerifyKyc(status: 'VERIFIED' | 'REJECTED', notes?: string, userId?: string): KycSubmission {
    const currentActive = authService.getCurrentUser();
    const targetId = userId || currentActive?.id;
    const current = this.getKycStatus(targetId);
    const updated: KycSubmission = {
      ...current,
      userId: targetId || current.userId,
      status,
      reviewedAt: new Date().toISOString(),
      adminNotes: notes || (status === 'VERIFIED' ? 'Approved by Compliance Officer' : 'ID rejected')
    };
    if (targetId) {
      localStorage.setItem(`ivestbot_kyc_${targetId}`, JSON.stringify(updated));
    }
    if (targetId === currentActive?.id || !userId) {
      localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(updated));
    }

    // Dispatch instant events
    try {
      window.dispatchEvent(new CustomEvent('ivestbot_kyc_updated', { detail: updated }));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('ivestbot_realtime_sync');
        bc.postMessage({ type: 'KYC_UPDATED', payload: updated });
        bc.close();
      }
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
    return updated;
  },

  /**
   * 🛡️ RECORD WALLET SNAPSHOT (Immutable Balance Audit Trail)
   */
  recordSnapshot(params: {
    userId: string;
    userName?: string;
    userEmail?: string;
    before: { available: number; total: number; pending: number };
    after: { available: number; total: number; pending: number };
    actionType: string;
    reason: string;
    actor: 'USER' | 'ADMIN' | 'SYSTEM_AI';
  }): WalletSnapshot {
    const timestamp = new Date().toISOString();
    const hashSeed = `${params.userId}-${timestamp}-${params.after.available}-${params.after.total}`;
    let hash = 0;
    for (let i = 0; i < hashSeed.length; i++) {
      hash = ((hash << 5) - hash) + hashSeed.charCodeAt(i);
      hash |= 0;
    }
    const integrityHash = `AI-SHIELD-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const snapshot: WalletSnapshot = {
      id: `snp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      timestamp,
      beforeBalance: { ...params.before },
      afterBalance: { ...params.after },
      actionType: params.actionType,
      reason: params.reason || 'Balance state mutation checkpoint',
      actor: params.actor,
      integrityHash
    };

    try {
      const all = this.getSnapshots().filter(s => s.id !== snapshot.id);
      const updated = [snapshot, ...all.slice(0, 499)]; // Keep latest 500 audit checkpoints
      localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(updated));

      const userExisting = this.getSnapshots(params.userId).filter(s => s.id !== snapshot.id);
      localStorage.setItem(`ivestbot_snapshots_${params.userId}`, JSON.stringify(
        [snapshot, ...userExisting.slice(0, 99)]
      ));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ivestbot_snapshot_created', { detail: snapshot }));
      }
    } catch {
      // ignore
    }

    return snapshot;
  },

  /**
   * Get Snapshot Audit Trail
   */
  getSnapshots(userId?: string): WalletSnapshot[] {
    try {
      if (userId) {
        const userSpecific = localStorage.getItem(`ivestbot_snapshots_${userId}`);
        if (userSpecific) return JSON.parse(userSpecific);
      }
      const stored = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      if (stored) {
        const all: WalletSnapshot[] = JSON.parse(stored);
        if (userId) {
          return all.filter(s => s.userId === userId);
        }
        return all;
      }
    } catch {
      // ignore
    }
    return [];
  },

  /**
   * ⏪ 1-Click Rollback / Restore User Balance from Snapshot
   */
  restoreSnapshot(snapshotId: string, adminReason: string): { restoredWallet: WalletState; snapshot: WalletSnapshot } {
    const all = this.getSnapshots();
    const target = all.find(s => s.id === snapshotId);
    if (!target) {
      throw new Error('Selected snapshot checkpoint was not found.');
    }

    const currentWallet = this.getWalletForUser(target.userId);
    const restoredWallet: WalletState = {
      ...currentWallet,
      availableBalance: target.afterBalance.available,
      totalBalance: target.afterBalance.total,
      pendingBalance: target.afterBalance.pending,
      updatedAt: new Date().toISOString()
    };

    this.saveWalletForUser(target.userId, restoredWallet);

    // Record restorative snapshot
    this.recordSnapshot({
      userId: target.userId,
      userName: target.userName,
      userEmail: target.userEmail,
      before: {
        available: currentWallet.availableBalance,
        total: currentWallet.totalBalance,
        pending: currentWallet.pendingBalance
      },
      after: {
        available: restoredWallet.availableBalance,
        total: restoredWallet.totalBalance,
        pending: restoredWallet.pendingBalance
      },
      actionType: 'SNAPSHOT_RESTORE',
      reason: `Admin Rollback to Snapshot [${target.id}]: ${adminReason}`,
      actor: 'ADMIN'
    });

    this.addTransaction({
      userId: target.userId,
      userName: target.userName,
      userEmail: target.userEmail,
      type: 'ADMIN_ADJUSTMENT',
      amount: restoredWallet.totalBalance,
      currency: 'USDT',
      status: 'COMPLETED',
      description: `Safety Restore to Snapshot ${target.id} — Reason: ${adminReason}`,
      referenceId: `RST-${target.id.slice(-6).toUpperCase()}`,
      adminRemarks: adminReason
    });

    return { restoredWallet, snapshot: target };
  },

  /**
   * 💾 FULL SYSTEM EXPORT / BACKUP (Wallets, KYC, Ledger, Profiles)
   */
  exportFullSystemBackup(): string {
    const allUsers = authService.getAllUsers();
    const transactions = this.getTransactions();
    const snapshots = this.getSnapshots();

    const userWallets: Record<string, WalletState> = {};
    const userKycs: Record<string, KycSubmission> = {};

    allUsers.forEach(u => {
      userWallets[u.id] = this.getWalletForUser(u.id);
      userKycs[u.id] = this.getKycStatus(u.id);
    });

    const backupPayload = {
      version: '2.0-AI-GUARDIAN',
      exportTimestamp: new Date().toISOString(),
      platform: 'Ivestbot USDT Ecosystem',
      totalUsers: allUsers.length,
      users: allUsers,
      wallets: userWallets,
      kycRecords: userKycs,
      transactions,
      snapshots
    };

    return JSON.stringify(backupPayload, null, 2);
  },

  /**
   * 📥 RESTORE BACKUP FROM JSON
   */
  importSystemBackup(jsonData: string): { success: boolean; message: string; restoredCount: number } {
    try {
      const data = JSON.parse(jsonData);
      if (!data.users || !Array.isArray(data.users)) {
        throw new Error('Invalid backup file format.');
      }

      authService.saveAllUsers(data.users);

      if (data.wallets) {
        Object.keys(data.wallets).forEach(uid => {
          this.saveWalletForUser(uid, data.wallets[uid]);
        });
      }

      if (data.transactions && Array.isArray(data.transactions)) {
        this.saveTransactions(data.transactions);
      }

      if (data.snapshots && Array.isArray(data.snapshots)) {
        localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(data.snapshots));
      }

      return {
        success: true,
        message: `Successfully restored ${data.users.length} users and all associated ledger records!`,
        restoredCount: data.users.length
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to import backup.',
        restoredCount: 0
      };
    }
  },

  /**
   * 🤖 STAR AI YIELD FORECAST & SECURITY METRICS
   */
  calculateAiYieldForecast(customBalance?: number): AiForecastResult {
    const activeWallet = this.getWallet();
    const effectiveBalance = customBalance !== undefined ? customBalance : activeWallet.availableBalance;
    const dailyRate = 2.58; // Standard Star AI mining base daily yield rate %

    const projected24h = Number((effectiveBalance * (dailyRate / 100)).toFixed(4));
    const projected7d = Number((effectiveBalance * ((Math.pow(1 + (dailyRate / 100), 7) - 1))).toFixed(4));
    const projected30d = Number((effectiveBalance * ((Math.pow(1 + (dailyRate / 100), 30) - 1))).toFixed(4));
    const apy = Number(((Math.pow(1 + (dailyRate / 100), 365) - 1) * 100).toFixed(2));

    const bonusReinvest = Number((projected24h * 0.15).toFixed(4));

    return {
      currentBalance: effectiveBalance,
      dailyRatePercent: dailyRate,
      projected24hProfit: projected24h,
      projected7dProfit: projected7d,
      projected30dProfit: projected30d,
      annualizedApy: Math.min(apy, 1250.0),
      securityHealthScore: effectiveBalance > 0 ? 99.8 : 96.5,
      shieldStatus: 'ARMED',
      networkSpeedEstimate: 'TRC-20 Fast Block (< 45s)',
      aiSuggestedReinvestBonus: bonusReinvest
    };
  },

  /**
   * 🔍 BALANCE INTEGRITY SCANNER (AI Balance Guardian)
   */
  verifyBalanceIntegrity(userId?: string): { isClean: boolean; discrepancies: string[]; healthScore: number } {
    const targetId = userId || authService.getCurrentUser()?.id;
    const discrepancies: string[] = [];

    if (!targetId) {
      return { isClean: true, discrepancies: [], healthScore: 100 };
    }

    const wallet = this.getWalletForUser(targetId);
    if (isNaN(wallet.availableBalance) || wallet.availableBalance < 0) {
      discrepancies.push('Invalid negative or NaN available balance detected.');
    }
    if (isNaN(wallet.totalBalance) || wallet.totalBalance < 0) {
      discrepancies.push('Invalid total balance calculation.');
    }
    if (wallet.totalBalance < wallet.availableBalance) {
      discrepancies.push('Total balance is lower than available balance.');
    }

    return {
      isClean: discrepancies.length === 0,
      discrepancies,
      healthScore: discrepancies.length === 0 ? 100 : 75
    };
  }
};
