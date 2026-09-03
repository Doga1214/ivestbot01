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

const WALLET_STORAGE_KEY = 'ivestbot_wallet_state';
const TRANSACTIONS_STORAGE_KEY = 'ivestbot_wallet_transactions';
const KYC_STORAGE_KEY = 'ivestbot_kyc_state';

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
    if (!isValidUuid(userId)) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data && !error) {
        const local = this.getWalletForUser(userId);
        const syncedWallet: WalletState = {
          ...local,
          totalBalance: parseFloat(data.total_balance) || 0,
          availableBalance: parseFloat(data.available_balance) || 0,
          pendingBalance: parseFloat(data.pending_balance) || 0,
          currency: data.currency || 'USDT',
          updatedAt: data.updated_at
        };

        const key = `ivestbot_wallet_${userId}`;
        localStorage.setItem(key, JSON.stringify(syncedWallet));

        const currentStored = localStorage.getItem('ivestbot_auth_user');
        if (currentStored) {
          const currentUser = JSON.parse(currentStored);
          if (currentUser.id === userId) {
            this.saveWallet(syncedWallet);
          }
        }
        return syncedWallet;
      }
    } catch {
      // ignore
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
      const validUserId = userId && isValidUuid(userId) ? userId : undefined;
      const allUsers = authService.getAllUsers();
      const txMap = new Map<string, WalletTransaction>();

      // 1. Fetch from deposits table (authoritative table for deposits)
      let depQuery = supabase.from('deposits').select('*').order('created_at', { ascending: false });
      if (validUserId) {
        depQuery = depQuery.eq('user_id', validUserId);
      }
      const { data: depData } = await depQuery;

      if (depData && depData.length > 0) {
        depData.forEach(d => {
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

      // 2. Fetch from withdrawals table (authoritative table for withdrawals)
      let wthQuery = supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
      if (userId) {
        wthQuery = wthQuery.eq('user_id', userId);
      }
      const { data: wthData } = await wthQuery;

      if (wthData && wthData.length > 0) {
        wthData.forEach(d => {
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
      let txQuery = supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false });
      if (userId) {
        txQuery = txQuery.eq('user_id', userId);
      }
      const { data: txData } = await txQuery;

      if (txData && txData.length > 0) {
        txData.forEach(d => {
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
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('approve_deposit_request', {
      p_deposit_id: txId,
      p_admin_id: 'admin',
      p_remarks: adminRemarks || 'Deposit verified and credited by Admin'
    });

    if (rpcErr || !rpcRes?.success) {
      throw new Error(rpcErr?.message || 'Failed to approve deposit in database');
    }

    const dbWallet = rpcRes.wallet;
    const userId = dbWallet.user_id;
    const syncedWallet: WalletState = {
      ...this.getWalletForUser(userId),
      totalBalance: parseFloat(dbWallet.total_balance) || 0,
      availableBalance: parseFloat(dbWallet.available_balance) || 0,
      pendingBalance: parseFloat(dbWallet.pending_balance) || 0,
      updatedAt: dbWallet.updated_at
    };
    this.saveWalletForUser(userId, syncedWallet);

    await this.syncTransactionsFromSupabase();

    const transactions = this.getTransactions();
    const approvedTx = transactions.find(t => t.id === txId) || {
      id: txId,
      userId,
      type: 'DEPOSIT' as TransactionType,
      amount: rpcRes.creditedAmount || 0,
      currency: 'USDT',
      status: 'APPROVED' as TransactionStatus,
      description: `USDT Deposit Verified & Approved (+${rpcRes.creditedAmount} USDT credited)`,
      referenceId: `DEP-${txId.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };

    return {
      updatedWallet: syncedWallet,
      approvedTx,
      welcomeBonus: rpcRes.welcomeBonus || 0,
      sponsorBonus: 0
    };
  },

  /**
   * Admin Action: Reject a Pending Deposit (Database Backed & Idempotent).
   */
  async rejectDeposit(
    txId: string,
    adminRemarks?: string
  ): Promise<{ updatedWallet: WalletState; rejectedTx: WalletTransaction }> {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('reject_deposit_request', {
      p_deposit_id: txId,
      p_admin_id: 'admin',
      p_remarks: adminRemarks || 'Deposit rejected by Admin'
    });

    if (rpcErr || !rpcRes?.success) {
      throw new Error(rpcErr?.message || 'Failed to reject deposit in database');
    }

    const dbWallet = rpcRes.wallet;
    const userId = dbWallet.user_id;
    const syncedWallet: WalletState = {
      ...this.getWalletForUser(userId),
      totalBalance: parseFloat(dbWallet.total_balance) || 0,
      availableBalance: parseFloat(dbWallet.available_balance) || 0,
      pendingBalance: parseFloat(dbWallet.pending_balance) || 0,
      updatedAt: dbWallet.updated_at
    };
    this.saveWalletForUser(userId, syncedWallet);

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
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('approve_withdrawal_request', {
      p_withdrawal_id: txId,
      p_admin_id: 'admin',
      p_remarks: adminRemarks || 'Withdrawal dispatched by Admin'
    });

    if (rpcErr || !rpcRes?.success) {
      throw new Error(rpcErr?.message || 'Failed to approve withdrawal in database');
    }

    const dbWallet = rpcRes.wallet;
    const userId = dbWallet.user_id;
    const syncedWallet: WalletState = {
      ...this.getWalletForUser(userId),
      totalBalance: parseFloat(dbWallet.total_balance) || 0,
      availableBalance: parseFloat(dbWallet.available_balance) || 0,
      pendingBalance: parseFloat(dbWallet.pending_balance) || 0,
      updatedAt: dbWallet.updated_at
    };
    this.saveWalletForUser(userId, syncedWallet);

    await this.syncTransactionsFromSupabase();

    const transactions = this.getTransactions();
    const approvedTx = transactions.find(t => t.id === txId) || {
      id: txId,
      userId,
      type: 'WITHDRAWAL' as TransactionType,
      amount: 0,
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
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('reject_withdrawal_request', {
      p_withdrawal_id: txId,
      p_admin_id: 'admin',
      p_remarks: adminRemarks || 'Withdrawal rejected and refunded by Admin'
    });

    if (rpcErr || !rpcRes?.success) {
      throw new Error(rpcErr?.message || 'Failed to reject withdrawal in database');
    }

    const dbWallet = rpcRes.wallet;
    const userId = dbWallet.user_id;
    const syncedWallet: WalletState = {
      ...this.getWalletForUser(userId),
      totalBalance: parseFloat(dbWallet.total_balance) || 0,
      availableBalance: parseFloat(dbWallet.available_balance) || 0,
      pendingBalance: parseFloat(dbWallet.pending_balance) || 0,
      updatedAt: dbWallet.updated_at
    };
    this.saveWalletForUser(userId, syncedWallet);

    await this.syncTransactionsFromSupabase();

    const transactions = this.getTransactions();
    const rejectedTx = transactions.find(t => t.id === txId) || {
      id: txId,
      userId,
      type: 'WITHDRAWAL' as TransactionType,
      amount: rpcRes.refundedAmount || 0,
      currency: 'USDT',
      status: 'REJECTED' as TransactionStatus,
      description: `Withdrawal Rejected by Admin (Refunded ${rpcRes.refundedAmount || 0} USDT)`,
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
    reason?: string
  ): WalletState {
    const current = this.getWallet();
    const updated: WalletState = {
      ...current,
      status,
      restrictions: { ...restrictions },
      restrictionReason: reason || (status === 'INACTIVE' ? 'Wallet account deactivated by Compliance' : undefined)
    };
    this.saveWallet(updated);
    return updated;
  },

  getKycStatus(userId?: string): KycSubmission {
    try {
      const activeId = userId || authService.getCurrentUser()?.id;
      if (activeId) {
        const userSpecific = localStorage.getItem(`ivestbot_kyc_${activeId}`);
        if (userSpecific) {
          return JSON.parse(userSpecific);
        }
      }
      const stored = localStorage.getItem(KYC_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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
    const targetId = userId || authService.getCurrentUser()?.id;
    if (!targetId || !isValidUuid(targetId)) {
      return this.getKycStatus(targetId);
    }
    try {
      const { data: record } = await supabase
        .from('kyc_records')
        .select('*')
        .eq('user_id', targetId)
        .maybeSingle();

      if (record) {
        const kyc: KycSubmission = {
          userId: record.user_id,
          fullName: record.full_name || '',
          documentType: record.document_type || 'PASSPORT',
          documentNumber: record.document_number || '',
          documentFileName: record.document_url || 'id_document.pdf',
          status: (record.status as any) || 'PENDING',
          submittedAt: record.created_at,
          reviewedAt: record.updated_at,
          adminNotes: record.rejection_reason || undefined
        };
        localStorage.setItem(`ivestbot_kyc_${targetId}`, JSON.stringify(kyc));
        localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(kyc));
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
    const targetId = userId || authService.getCurrentUser()?.id;
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
    localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch instant events
    try {
      window.dispatchEvent(new CustomEvent('ivestbot_kyc_updated', { detail: updated }));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
    return updated;
  }
};
