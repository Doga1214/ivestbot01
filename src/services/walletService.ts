import { WALLET_CONFIG } from '../config/walletConfig';
import { supabase } from './supabaseClient';
import { authService } from './authService';

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
  getWallet(): WalletState {
    try {
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

  saveWallet(wallet: WalletState): void {
    const data = {
      ...wallet,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(data));
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
          return this.getWallet();
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
          this.saveWallet(data);
        }
      } catch {
        // ignore
      }
    }

    // Sync to Supabase in background
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
  },

  async syncWalletFromSupabase(userId: string): Promise<WalletState | null> {
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
      const allUsers = authService.getAllUsers();
      const txMap = new Map<string, WalletTransaction>();

      // 1. Fetch from wallet_transactions table
      let txQuery = supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false });
      if (userId) {
        txQuery = txQuery.eq('user_id', userId);
      }
      const { data: txData } = await txQuery;

      if (txData && txData.length > 0) {
        txData.forEach(d => {
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
            address: d.metadata?.address,
            txHash: d.metadata?.txHash,
            adminRemarks: d.metadata?.adminRemarks
          });
        });
      }

      // 2. Fetch from deposits table (captures all pending deposits directly submitted)
      let depQuery = supabase.from('deposits').select('*').order('created_at', { ascending: false });
      if (userId) {
        depQuery = depQuery.eq('user_id', userId);
      }
      const { data: depData } = await depQuery;

      if (depData && depData.length > 0) {
        depData.forEach(d => {
          const user = allUsers.find(u => u.id === d.user_id);
          const depId = d.id;
          const exists = Array.from(txMap.values()).some(
            t => t.id === depId || (d.tx_hash && t.txHash === d.tx_hash)
          );

          if (!exists) {
            txMap.set(depId, {
              id: depId,
              userId: d.user_id,
              userName: user?.name || user?.username || 'User',
              userEmail: user?.email,
              type: 'DEPOSIT',
              amount: parseFloat(d.amount) || 0,
              currency: d.currency || 'USDT',
              status: (d.status?.toUpperCase() || 'PENDING') as TransactionStatus,
              description: `USDT Deposit Submitted (${(d.deposit_address || '').slice(0, 8)}...) - Pending Admin Verification`,
              referenceId: `DEP-${depId.toString().slice(-6)}`,
              createdAt: d.created_at || new Date().toISOString(),
              address: d.deposit_address,
              txHash: d.tx_hash
            });
          }
        });
      }

      // 3. Fetch from withdrawals table
      let wthQuery = supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
      if (userId) {
        wthQuery = wthQuery.eq('user_id', userId);
      }
      const { data: wthData } = await wthQuery;

      if (wthData && wthData.length > 0) {
        wthData.forEach(d => {
          const user = allUsers.find(u => u.id === d.user_id);
          const wthId = d.id;
          const exists = Array.from(txMap.values()).some(t => t.id === wthId);

          if (!exists) {
            txMap.set(wthId, {
              id: wthId,
              userId: d.user_id,
              userName: user?.name || user?.username || 'User',
              userEmail: user?.email,
              type: 'WITHDRAWAL',
              amount: parseFloat(d.amount) || 0,
              currency: d.currency || 'USDT',
              status: (d.status?.toUpperCase() || 'PENDING') as TransactionStatus,
              description: `USDT Withdrawal Request (${(d.withdrawal_address || '').slice(0, 8)}...) - Pending Admin Review`,
              referenceId: `WTH-${wthId.toString().slice(-6)}`,
              createdAt: d.created_at || new Date().toISOString(),
              address: d.withdrawal_address
            });
          }
        });
      }

      // 4. Merge local transactions
      const local = this.getTransactions();
      local.forEach(t => {
        if (!txMap.has(t.id)) {
          txMap.set(t.id, t);
        }
      });

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
   * Submits a Deposit request into PENDING status under Admin Verification.
   */
  async submitDeposit(amount: number, address: string, txHash: string, userMeta?: { id?: string; name?: string; email?: string }): Promise<{
    depositTx: WalletTransaction;
    newWallet: WalletState;
  }> {
    const wallet = userMeta?.id ? this.getWalletForUser(userMeta.id) : this.getWallet();

    // Check WP Swings style restrictions
    if (wallet.status === 'INACTIVE' || wallet.status === 'FROZEN') {
      throw new Error(`Wallet is ${wallet.status}. Deposits are currently disabled on your account.`);
    }
    if (wallet.restrictions && !wallet.restrictions.canDeposit) {
      throw new Error(wallet.restrictionReason || 'Deposit feature is restricted on your wallet by Admin.');
    }

    // Add to pending balance
    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: Number((wallet.pendingBalance + amount).toFixed(4)),
      totalBalance: Number((wallet.totalBalance + amount).toFixed(4))
    };

    if (userMeta?.id) {
      this.saveWalletForUser(userMeta.id, updatedWallet);
    } else {
      this.saveWallet(updatedWallet);
    }

    // Record pending deposit transaction
    const depositTx = this.addTransaction({
      userId: userMeta?.id,
      userName: userMeta?.name,
      userEmail: userMeta?.email,
      type: 'DEPOSIT',
      amount,
      currency: 'USDT',
      status: 'PENDING',
      description: `USDT Deposit Submitted (${address.slice(0, 8)}...) - Pending Admin Verification`,
      referenceId: `DEP-${Date.now().toString().slice(-6)}`,
      address,
      txHash
    });

    // Write to Supabase deposits table
    try {
      await supabase.from('deposits').insert({
        user_id: userMeta?.id || null,
        amount,
        currency: 'USDT',
        network: 'TRC20',
        deposit_address: address,
        tx_hash: txHash,
        status: 'PENDING'
      });
    } catch {
      // ignore
    }

    // Dispatch instant real-time event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ivestbot_deposit_submitted'));
    }

    return {
      depositTx,
      newWallet: updatedWallet
    };
  },

  /**
   * Submits a Withdrawal request into PENDING status under Admin Verification.
   */
  async submitWithdrawal(amount: number, address: string, userMeta?: { id?: string; name?: string; email?: string }): Promise<{ success: boolean; message: string; newWallet: WalletState }> {
    const wallet = userMeta?.id ? this.getWalletForUser(userMeta.id) : this.getWallet();

    // Check restrictions
    if (wallet.status === 'INACTIVE' || wallet.status === 'FROZEN') {
      throw new Error(`Wallet is ${wallet.status}. Withdrawals are temporarily locked on your account.`);
    }
    if (wallet.restrictions && !wallet.restrictions.canWithdraw) {
      throw new Error(wallet.restrictionReason || 'Withdrawal feature is restricted on your wallet by Admin.');
    }

    if (amount > wallet.availableBalance) {
      throw new Error(`Insufficient available balance (${wallet.availableBalance.toFixed(2)} USDT)`);
    }

    // Deduct from available balance, hold in pending balance until admin approves
    const updatedWallet: WalletState = {
      ...wallet,
      availableBalance: Number((wallet.availableBalance - amount).toFixed(4)),
      pendingBalance: Number((wallet.pendingBalance + amount).toFixed(4))
    };

    if (userMeta?.id) {
      this.saveWalletForUser(userMeta.id, updatedWallet);
    } else {
      this.saveWallet(updatedWallet);
    }

    // Add to transactions ledger with PENDING status
    this.addTransaction({
      userId: userMeta?.id,
      userName: userMeta?.name,
      userEmail: userMeta?.email,
      type: 'WITHDRAWAL',
      amount,
      currency: 'USDT',
      status: 'PENDING',
      description: `Withdrawal Request to ${address.slice(0, 8)}...${address.slice(-6)} - Pending Admin Review`,
      referenceId: `WTH-${Date.now().toString().slice(-6)}`,
      address
    });

    // Write to Supabase withdrawals table
    try {
      await supabase.from('withdrawals').insert({
        user_id: userMeta?.id || null,
        amount,
        currency: 'USDT',
        recipient_address: address,
        status: 'PENDING'
      });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Withdrawal request of ${amount.toFixed(2)} USDT submitted! Amount held in pending until admin verification.`,
      newWallet: updatedWallet
    };
  },

  /**
   * Admin Action: Approve a Pending Deposit
   */
  approveDeposit(txId: string, hasSponsor: boolean = true, adminRemarks?: string): {
    updatedWallet: WalletState;
    approvedTx: WalletTransaction;
    welcomeBonus: number;
    sponsorBonus: number;
  } {
    const transactions = this.getTransactions();
    const txIndex = transactions.findIndex(t => t.id === txId && t.type === 'DEPOSIT');
    if (txIndex === -1) throw new Error('Deposit transaction not found');

    const tx = transactions[txIndex];
    if (tx.status !== 'PENDING') throw new Error('Transaction is not in PENDING status');

    const amount = tx.amount;
    const userId = tx.userId;
    const wallet = userId ? this.getWalletForUser(userId) : this.getWallet();

    // 1. Find depositor profile & activate account status
    const allUsers = authService.getAllUsers();
    const depositor = allUsers.find(
      u => (userId && u.id === userId) ||
           (tx.userEmail && u.email.toLowerCase() === tx.userEmail.toLowerCase()) ||
           (tx.userName && u.username.toLowerCase() === tx.userName.toLowerCase())
    );

    if (depositor) {
      depositor.status = 'ACTIVE';
      authService.upsertUser(depositor);
      supabase.from('profiles').update({ status: 'ACTIVE' }).eq('id', depositor.id).then(() => {}, () => {});
    }

    // 2. Calculate referral milestone bonus
    let welcomeBonus = 0;
    let sponsorBonus = 0;
    const hasEffectiveSponsor = !!(depositor?.referredBy || hasSponsor);

    if (hasEffectiveSponsor && amount >= WALLET_CONFIG.depositBonusRatio.minDeposit) {
      const units = Math.floor(Math.min(amount, WALLET_CONFIG.depositBonusRatio.maxDeposit) / WALLET_CONFIG.depositBonusRatio.unitDeposit);
      sponsorBonus = units * WALLET_CONFIG.depositBonusRatio.sponsorBonusPerUnit;
      welcomeBonus = units * WALLET_CONFIG.depositBonusRatio.newUserBonusPerUnit;
    }

    // Move from pending to available for depositor
    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newAvailable = Number((wallet.availableBalance + amount + welcomeBonus).toFixed(4));
    const newTotal = Number((newAvailable + newPending).toFixed(4));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      availableBalance: newAvailable,
      totalBalance: newTotal
    };

    if (userId) {
      this.saveWalletForUser(userId, updatedWallet);
    } else {
      this.saveWallet(updatedWallet);
    }

    // Update transaction to APPROVED
    const approvedTx: WalletTransaction = {
      ...tx,
      status: 'APPROVED',
      description: `USDT Deposit Verified & Approved (+${amount} USDT credited)`,
      adminRemarks: adminRemarks || 'Deposit verified and credited by Admin.'
    };
    transactions[txIndex] = approvedTx;

    // Log welcome bonus for depositor if applicable
    if (welcomeBonus > 0) {
      const bonusTx: WalletTransaction = {
        id: `tx-${Date.now().toString().slice(-6)}-wel`,
        userId: tx.userId,
        userName: tx.userName,
        type: 'WELCOME_BONUS',
        amount: welcomeBonus,
        currency: 'USDT',
        status: 'COMPLETED',
        description: `Deposit Referral Welcome Bonus (+${welcomeBonus} USDT for verified ${amount} USDT deposit)`,
        referenceId: `BON-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString()
      };
      transactions.unshift(bonusTx);
    }

    // 3. AUTOMATIC COMMISSION DISTRIBUTION TO UPLINE SPONSORS (Tiers A, B, C)
    const depositorRefCode = depositor?.referredBy?.trim();
    if (depositorRefCode) {
      // Find Tier A (Direct) Sponsor
      const sponsorA = allUsers.find(
        u => u.referralCode?.toUpperCase() === depositorRefCode.toUpperCase() ||
             u.username.toLowerCase() === depositorRefCode.toLowerCase()
      );

      if (sponsorA && sponsorA.id !== depositor?.id) {
        const directCommission = Number((amount * (WALLET_CONFIG.referralRates.A / 100)).toFixed(4));
        const tierAReward = sponsorBonus > 0 ? (sponsorBonus + directCommission) : directCommission;

        if (tierAReward > 0) {
          const wA = this.getWalletForUser(sponsorA.id);
          const updatedWA: WalletState = {
            ...wA,
            availableBalance: Number((wA.availableBalance + tierAReward).toFixed(4)),
            totalBalance: Number((wA.totalBalance + tierAReward).toFixed(4))
          };
          this.saveWalletForUser(sponsorA.id, updatedWA);

          const bonusTxA: WalletTransaction = {
            id: `tx-${Date.now().toString().slice(-6)}-refA`,
            userId: sponsorA.id,
            userName: sponsorA.username,
            userEmail: sponsorA.email,
            type: 'REFERRAL_BONUS',
            amount: tierAReward,
            currency: 'USDT',
            status: 'COMPLETED',
            description: `Direct Referral Commission (+${tierAReward.toFixed(2)} USDT from @${depositor?.username || tx.userName || 'downline'} deposit of ${amount} USDT)`,
            referenceId: `REF-${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString()
          };
          transactions.unshift(bonusTxA);

          // Supabase sync for Tier A
          supabase.from('wallets').upsert({
            user_id: sponsorA.id,
            total_balance: updatedWA.totalBalance,
            available_balance: updatedWA.availableBalance,
            pending_balance: updatedWA.pendingBalance,
            currency: updatedWA.currency || 'USDT',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' }).then(() => {}, () => {});

          supabase.from('wallet_transactions').insert({
            user_id: sponsorA.id,
            type: 'REFERRAL_BONUS',
            amount: tierAReward,
            currency: 'USDT',
            status: 'COMPLETED',
            description: bonusTxA.description,
            reference_id: bonusTxA.referenceId
          }).then(() => {}, () => {});
        }

        // Find Tier B (Indirect 2nd Tier) Sponsor
        if (sponsorA.referredBy?.trim()) {
          const sponsorBCode = sponsorA.referredBy.trim();
          const sponsorB = allUsers.find(
            u => u.referralCode?.toUpperCase() === sponsorBCode.toUpperCase() ||
                 u.username.toLowerCase() === sponsorBCode.toLowerCase()
          );

          if (sponsorB && sponsorB.id !== sponsorA.id && sponsorB.id !== depositor?.id) {
            const tierBReward = Number((amount * (WALLET_CONFIG.referralRates.B / 100)).toFixed(4));
            if (tierBReward > 0) {
              const wB = this.getWalletForUser(sponsorB.id);
              const updatedWB: WalletState = {
                ...wB,
                availableBalance: Number((wB.availableBalance + tierBReward).toFixed(4)),
                totalBalance: Number((wB.totalBalance + tierBReward).toFixed(4))
              };
              this.saveWalletForUser(sponsorB.id, updatedWB);

              const bonusTxB: WalletTransaction = {
                id: `tx-${Date.now().toString().slice(-6)}-refB`,
                userId: sponsorB.id,
                userName: sponsorB.username,
                userEmail: sponsorB.email,
                type: 'REFERRAL_BONUS',
                amount: tierBReward,
                currency: 'USDT',
                status: 'COMPLETED',
                description: `Tier-B Referral Commission (+${tierBReward.toFixed(2)} USDT from @${depositor?.username || tx.userName || 'downline'} deposit of ${amount} USDT)`,
                referenceId: `REF-${Date.now().toString().slice(-6)}`,
                createdAt: new Date().toISOString()
              };
              transactions.unshift(bonusTxB);

              supabase.from('wallets').upsert({
                user_id: sponsorB.id,
                total_balance: updatedWB.totalBalance,
                available_balance: updatedWB.availableBalance,
                pending_balance: updatedWB.pendingBalance,
                currency: updatedWB.currency || 'USDT',
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' }).then(() => {}, () => {});

              supabase.from('wallet_transactions').insert({
                user_id: sponsorB.id,
                type: 'REFERRAL_BONUS',
                amount: tierBReward,
                currency: 'USDT',
                status: 'COMPLETED',
                description: bonusTxB.description,
                reference_id: bonusTxB.referenceId
              }).then(() => {}, () => {});
            }

            // Find Tier C (Indirect 3rd Tier) Sponsor
            if (sponsorB.referredBy?.trim()) {
              const sponsorCCode = sponsorB.referredBy.trim();
              const sponsorC = allUsers.find(
                u => u.referralCode?.toUpperCase() === sponsorCCode.toUpperCase() ||
                     u.username.toLowerCase() === sponsorCCode.toLowerCase()
              );

              if (sponsorC && sponsorC.id !== sponsorB.id && sponsorC.id !== sponsorA.id && sponsorC.id !== depositor?.id) {
                const tierCReward = Number((amount * (WALLET_CONFIG.referralRates.C / 100)).toFixed(4));
                if (tierCReward > 0) {
                  const wC = this.getWalletForUser(sponsorC.id);
                  const updatedWC: WalletState = {
                    ...wC,
                    availableBalance: Number((wC.availableBalance + tierCReward).toFixed(4)),
                    totalBalance: Number((wC.totalBalance + tierCReward).toFixed(4))
                  };
                  this.saveWalletForUser(sponsorC.id, updatedWC);

                  const bonusTxC: WalletTransaction = {
                    id: `tx-${Date.now().toString().slice(-6)}-refC`,
                    userId: sponsorC.id,
                    userName: sponsorC.username,
                    userEmail: sponsorC.email,
                    type: 'REFERRAL_BONUS',
                    amount: tierCReward,
                    currency: 'USDT',
                    status: 'COMPLETED',
                    description: `Tier-C Referral Commission (+${tierCReward.toFixed(2)} USDT from @${depositor?.username || tx.userName || 'downline'} deposit of ${amount} USDT)`,
                    referenceId: `REF-${Date.now().toString().slice(-6)}`,
                    createdAt: new Date().toISOString()
                  };
                  transactions.unshift(bonusTxC);

                  supabase.from('wallets').upsert({
                    user_id: sponsorC.id,
                    total_balance: updatedWC.totalBalance,
                    available_balance: updatedWC.availableBalance,
                    pending_balance: updatedWC.pendingBalance,
                    currency: updatedWC.currency || 'USDT',
                    updated_at: new Date().toISOString()
                  }, { onConflict: 'user_id' }).then(() => {}, () => {});

                  supabase.from('wallet_transactions').insert({
                    user_id: sponsorC.id,
                    type: 'REFERRAL_BONUS',
                    amount: tierCReward,
                    currency: 'USDT',
                    status: 'COMPLETED',
                    description: bonusTxC.description,
                    reference_id: bonusTxC.referenceId
                  }).then(() => {}, () => {});
                }
              }
            }
          }
        }
      }
    }

    this.saveTransactions(transactions);

    // Sync depositor updates to Supabase
    if (userId) {
      supabase.from('deposits').update({ status: 'APPROVED' }).eq('user_id', userId).eq('status', 'PENDING').then(() => {}, () => {});
      supabase.from('wallet_transactions').update({ status: 'APPROVED' }).eq('user_id', userId).eq('type', 'DEPOSIT').eq('status', 'PENDING').then(() => {}, () => {});
      supabase.from('wallets').upsert({
        user_id: userId,
        total_balance: updatedWallet.totalBalance,
        available_balance: updatedWallet.availableBalance,
        pending_balance: updatedWallet.pendingBalance,
        currency: updatedWallet.currency || 'USDT',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' }).then(() => {}, () => {});
    }

    return {
      updatedWallet,
      approvedTx,
      welcomeBonus,
      sponsorBonus
    };
  },

  /**
   * Admin Action: Reject a Pending Deposit
   */
  rejectDeposit(txId: string, adminRemarks?: string): { updatedWallet: WalletState; rejectedTx: WalletTransaction } {
    const transactions = this.getTransactions();
    const txIndex = transactions.findIndex(t => t.id === txId && t.type === 'DEPOSIT');
    if (txIndex === -1) throw new Error('Deposit transaction not found');

    const tx = transactions[txIndex];
    const amount = tx.amount;
    const userId = tx.userId;
    const wallet = userId ? this.getWalletForUser(userId) : this.getWallet();

    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newTotal = Math.max(0, Number((wallet.totalBalance - amount).toFixed(4)));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      totalBalance: newTotal
    };

    if (userId) {
      this.saveWalletForUser(userId, updatedWallet);
    } else {
      this.saveWallet(updatedWallet);
    }

    const rejectedTx: WalletTransaction = {
      ...tx,
      status: 'REJECTED',
      description: `USDT Deposit Verification Rejected by Admin: ${adminRemarks || 'Invalid TxID or receipt'}`,
      adminRemarks: adminRemarks || 'Rejected by Admin'
    };
    transactions[txIndex] = rejectedTx;
    this.saveTransactions(transactions);

    if (userId) {
      supabase.from('deposits').update({ status: 'REJECTED' }).eq('user_id', userId).eq('status', 'PENDING').then(() => {}, () => {});
      supabase.from('wallet_transactions').update({ status: 'REJECTED' }).eq('user_id', userId).eq('type', 'DEPOSIT').eq('status', 'PENDING').then(() => {}, () => {});
    }

    return { updatedWallet, rejectedTx };
  },

  /**
   * Admin Action: Approve a Pending Withdrawal
   */
  approveWithdrawal(txId: string, adminRemarks?: string): { updatedWallet: WalletState; approvedTx: WalletTransaction } {
    const transactions = this.getTransactions();
    const txIndex = transactions.findIndex(t => t.id === txId && t.type === 'WITHDRAWAL');
    if (txIndex === -1) throw new Error('Withdrawal transaction not found');

    const tx = transactions[txIndex];
    const amount = tx.amount;
    const userId = tx.userId;
    const wallet = userId ? this.getWalletForUser(userId) : this.getWallet();

    // Deduct pending balance permanently
    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newTotal = Math.max(0, Number((wallet.totalBalance - amount).toFixed(4)));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      totalBalance: newTotal
    };

    if (userId) {
      this.saveWalletForUser(userId, updatedWallet);
    } else {
      this.saveWallet(updatedWallet);
    }

    const approvedTx: WalletTransaction = {
      ...tx,
      status: 'APPROVED',
      description: `Withdrawal Approved & Dispatched (-${amount} USDT)`,
      adminRemarks: adminRemarks || 'Dispatched by Admin'
    };
    transactions[txIndex] = approvedTx;
    this.saveTransactions(transactions);

    if (userId) {
      supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('user_id', userId).eq('status', 'PENDING').then(() => {}, () => {});
      supabase.from('wallet_transactions').update({ status: 'APPROVED' }).eq('user_id', userId).eq('type', 'WITHDRAWAL').eq('status', 'PENDING').then(() => {}, () => {});
    }

    return { updatedWallet, approvedTx };
  },

  /**
   * Admin Action: Reject a Pending Withdrawal (Refunds back to available balance)
   */
  rejectWithdrawal(txId: string, adminRemarks?: string): { updatedWallet: WalletState; rejectedTx: WalletTransaction } {
    const transactions = this.getTransactions();
    const txIndex = transactions.findIndex(t => t.id === txId && t.type === 'WITHDRAWAL');
    if (txIndex === -1) throw new Error('Withdrawal transaction not found');

    const tx = transactions[txIndex];
    const amount = tx.amount;
    const userId = tx.userId;
    const wallet = userId ? this.getWalletForUser(userId) : this.getWallet();

    // Refund from pending back to available balance
    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newAvailable = Number((wallet.availableBalance + amount).toFixed(4));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      availableBalance: newAvailable
    };

    if (userId) {
      this.saveWalletForUser(userId, updatedWallet);
    } else {
      this.saveWallet(updatedWallet);
    }

    const rejectedTx: WalletTransaction = {
      ...tx,
      status: 'REJECTED',
      description: `Withdrawal Rejected by Admin (Refunded ${amount} USDT to available balance)`,
      adminRemarks: adminRemarks || 'Rejected and refunded by Admin'
    };
    transactions[txIndex] = rejectedTx;
    this.saveTransactions(transactions);

    if (userId) {
      supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('user_id', userId).eq('status', 'PENDING').then(() => {}, () => {});
      supabase.from('wallet_transactions').update({ status: 'REJECTED' }).eq('user_id', userId).eq('type', 'WITHDRAWAL').eq('status', 'PENDING').then(() => {}, () => {});
    }

    return { updatedWallet, rejectedTx };
  },

  /**
   * User Action: Cancel a Pending Withdrawal and refund back to available balance
   */
  cancelWithdrawal(txId: string, reason: string = 'Withdrawal request cancelled by user'): {
    updatedWallet: WalletState;
    cancelledTx: WalletTransaction;
  } {
    const transactions = this.getTransactions();
    const txIndex = transactions.findIndex(t => t.id === txId && t.type === 'WITHDRAWAL');
    if (txIndex === -1) throw new Error('Withdrawal transaction not found');

    const tx = transactions[txIndex];
    if (tx.status !== 'PENDING') throw new Error('Only PENDING withdrawal requests can be cancelled');

    const amount = tx.amount;
    const userId = tx.userId;
    const wallet = userId ? this.getWalletForUser(userId) : this.getWallet();

    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newAvailable = Number((wallet.availableBalance + amount).toFixed(4));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      availableBalance: newAvailable
    };

    if (userId) {
      this.saveWalletForUser(userId, updatedWallet);
    } else {
      this.saveWallet(updatedWallet);
    }

    const cancelledTx: WalletTransaction = {
      ...tx,
      status: 'REJECTED',
      description: `Withdrawal Cancelled by User (Refunded ${amount} USDT back to Available Balance)`,
      adminRemarks: reason
    };
    transactions[txIndex] = cancelledTx;
    this.saveTransactions(transactions);

    return { updatedWallet, cancelledTx };
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

  getKycStatus(): KycSubmission {
    try {
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

  submitKyc(data: { fullName: string; documentType: string; documentNumber: string; documentFileName?: string }, userMeta?: { id?: string }): Promise<KycSubmission> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const kyc: KycSubmission = {
          userId: userMeta?.id,
          fullName: data.fullName,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          documentFileName: data.documentFileName || 'id_document_scan.jpg',
          status: 'PENDING',
          submittedAt: new Date().toISOString()
        };
        localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(kyc));
        resolve(kyc);
      }, 400);
    });
  },

  adminVerifyKyc(status: 'VERIFIED' | 'REJECTED', notes?: string): KycSubmission {
    const current = this.getKycStatus();
    const updated: KycSubmission = {
      ...current,
      status,
      reviewedAt: new Date().toISOString(),
      adminNotes: notes || (status === 'VERIFIED' ? 'Approved by Compliance Officer' : 'ID rejected')
    };
    localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};
