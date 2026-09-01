import { WALLET_CONFIG } from '../config/walletConfig';

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
  },

  getTransactions(): WalletTransaction[] {
    try {
      const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (stored) {
        const parsed: WalletTransaction[] = JSON.parse(stored);
        // Exclude dummy/sample withdrawal or deposit transactions
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

  addTransaction(tx: Omit<WalletTransaction, 'id' | 'createdAt'>): WalletTransaction {
    const newTx: WalletTransaction = {
      ...tx,
      id: `tx-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    const current = this.getTransactions();
    const updated = [newTx, ...current];
    this.saveTransactions(updated);
    return newTx;
  },

  /**
   * Submits a Deposit request into PENDING status under Admin Verification.
   */
  submitDeposit(amount: number, address: string, txHash: string, userMeta?: { id?: string; name?: string; email?: string }): Promise<{
    depositTx: WalletTransaction;
    newWallet: WalletState;
  }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const wallet = this.getWallet();

        // Check WP Swings style restrictions
        if (wallet.status === 'INACTIVE' || wallet.status === 'FROZEN') {
          reject(new Error(`Wallet is ${wallet.status}. Deposits are currently disabled on your account.`));
          return;
        }
        if (wallet.restrictions && !wallet.restrictions.canDeposit) {
          reject(new Error(wallet.restrictionReason || 'Deposit feature is restricted on your wallet by Admin.'));
          return;
        }

        // Add to pending balance (NOT available until admin verifies)
        const updatedWallet: WalletState = {
          ...wallet,
          pendingBalance: Number((wallet.pendingBalance + amount).toFixed(4)),
          totalBalance: Number((wallet.totalBalance + amount).toFixed(4))
        };
        this.saveWallet(updatedWallet);

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

        resolve({
          depositTx,
          newWallet: updatedWallet
        });
      }, 500);
    });
  },

  /**
   * Submits a Withdrawal request into PENDING status under Admin Verification.
   */
  submitWithdrawal(amount: number, address: string, userMeta?: { id?: string; name?: string; email?: string }): Promise<{ success: boolean; message: string; newWallet: WalletState }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const wallet = this.getWallet();

        // Check WP Swings style restrictions
        if (wallet.status === 'INACTIVE' || wallet.status === 'FROZEN') {
          reject(new Error(`Wallet is ${wallet.status}. Withdrawals are temporarily locked on your account.`));
          return;
        }
        if (wallet.restrictions && !wallet.restrictions.canWithdraw) {
          reject(new Error(wallet.restrictionReason || 'Withdrawal feature is restricted on your wallet by Admin.'));
          return;
        }

        if (amount > wallet.availableBalance) {
          reject(new Error(`Insufficient available balance (${wallet.availableBalance.toFixed(2)} USDT)`));
          return;
        }

        // Deduct from available balance, hold in pending balance until admin approves
        const updatedWallet: WalletState = {
          ...wallet,
          availableBalance: Number((wallet.availableBalance - amount).toFixed(4)),
          pendingBalance: Number((wallet.pendingBalance + amount).toFixed(4))
        };
        this.saveWallet(updatedWallet);

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

        resolve({
          success: true,
          message: `Withdrawal request of ${amount.toFixed(2)} USDT submitted! Amount held in pending until admin verification.`,
          newWallet: updatedWallet
        });
      }, 500);
    });
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
    const wallet = this.getWallet();

    // Calculate referral milestone bonus (5 USDT sponsor / 1 USDT user per 50 USDT deposited)
    let welcomeBonus = 0;
    let sponsorBonus = 0;
    if (hasSponsor && amount >= WALLET_CONFIG.depositBonusRatio.minDeposit) {
      const units = Math.floor(Math.min(amount, WALLET_CONFIG.depositBonusRatio.maxDeposit) / WALLET_CONFIG.depositBonusRatio.unitDeposit);
      sponsorBonus = units * WALLET_CONFIG.depositBonusRatio.sponsorBonusPerUnit;
      welcomeBonus = units * WALLET_CONFIG.depositBonusRatio.newUserBonusPerUnit;
    }

    // Move from pending to available
    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newAvailable = Number((wallet.availableBalance + amount + welcomeBonus).toFixed(4));
    const newTotal = Number((newAvailable + newPending).toFixed(4));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      availableBalance: newAvailable,
      totalBalance: newTotal
    };
    this.saveWallet(updatedWallet);

    // Update transaction to APPROVED/COMPLETED
    const approvedTx: WalletTransaction = {
      ...tx,
      status: 'APPROVED',
      description: `USDT Deposit Verified & Approved (+${amount} USDT credited)`,
      adminRemarks: adminRemarks || 'Deposit verified and credited by Admin.'
    };
    transactions[txIndex] = approvedTx;

    // Log welcome bonus if applicable
    if (welcomeBonus > 0) {
      const bonusTx: WalletTransaction = {
        id: `tx-${Date.now().toString().slice(-6)}`,
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

    this.saveTransactions(transactions);

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
    const wallet = this.getWallet();

    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newTotal = Math.max(0, Number((wallet.totalBalance - amount).toFixed(4)));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      totalBalance: newTotal
    };
    this.saveWallet(updatedWallet);

    const rejectedTx: WalletTransaction = {
      ...tx,
      status: 'REJECTED',
      description: `USDT Deposit Verification Rejected by Admin: ${adminRemarks || 'Invalid TxID or receipt'}`,
      adminRemarks: adminRemarks || 'Rejected by Admin'
    };
    transactions[txIndex] = rejectedTx;
    this.saveTransactions(transactions);

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
    const wallet = this.getWallet();

    // Deduct pending balance and total balance permanently
    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newTotal = Math.max(0, Number((wallet.totalBalance - amount).toFixed(4)));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      totalBalance: newTotal
    };
    this.saveWallet(updatedWallet);

    const approvedTx: WalletTransaction = {
      ...tx,
      status: 'APPROVED',
      description: `Withdrawal Approved & Dispatched (-${amount} USDT)`,
      adminRemarks: adminRemarks || 'Dispatched by Admin'
    };
    transactions[txIndex] = approvedTx;
    this.saveTransactions(transactions);

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
    const wallet = this.getWallet();

    // Refund from pending back to available balance
    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newAvailable = Number((wallet.availableBalance + amount).toFixed(4));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      availableBalance: newAvailable
    };
    this.saveWallet(updatedWallet);

    const rejectedTx: WalletTransaction = {
      ...tx,
      status: 'REJECTED',
      description: `Withdrawal Rejected by Admin (Refunded ${amount} USDT to available balance)`,
      adminRemarks: adminRemarks || 'Rejected and refunded by Admin'
    };
    transactions[txIndex] = rejectedTx;
    this.saveTransactions(transactions);

    return { updatedWallet, rejectedTx };
  },

  /**
   * User Action: Cancel a Pending Withdrawal and instantly refund back to available balance
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
    const wallet = this.getWallet();

    // Refund from pending back to available balance
    const newPending = Math.max(0, Number((wallet.pendingBalance - amount).toFixed(4)));
    const newAvailable = Number((wallet.availableBalance + amount).toFixed(4));

    const updatedWallet: WalletState = {
      ...wallet,
      pendingBalance: newPending,
      availableBalance: newAvailable
    };
    this.saveWallet(updatedWallet);

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
   * Admin Manual Credit (WP Swings Wallet style)
   */
  adminCredit(amount: number, reason: string, userMeta?: { id?: string; name?: string; email?: string }): {
    updatedWallet: WalletState;
    tx: WalletTransaction;
  } {
    const wallet = this.getWallet();
    const newAvailable = Number((wallet.availableBalance + amount).toFixed(4));
    const newTotal = Number((wallet.totalBalance + amount).toFixed(4));

    const updatedWallet: WalletState = {
      ...wallet,
      availableBalance: newAvailable,
      totalBalance: newTotal
    };
    this.saveWallet(updatedWallet);

    const tx = this.addTransaction({
      userId: userMeta?.id,
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
   * Admin Manual Debit (WP Swings Wallet style)
   */
  adminDebit(amount: number, reason: string, userMeta?: { id?: string; name?: string; email?: string }): {
    updatedWallet: WalletState;
    tx: WalletTransaction;
  } {
    const wallet = this.getWallet();
    const newAvailable = Math.max(0, Number((wallet.availableBalance - amount).toFixed(4)));
    const newTotal = Math.max(0, Number((wallet.totalBalance - amount).toFixed(4)));

    const updatedWallet: WalletState = {
      ...wallet,
      availableBalance: newAvailable,
      totalBalance: newTotal
    };
    this.saveWallet(updatedWallet);

    const tx = this.addTransaction({
      userId: userMeta?.id,
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
   * Admin Update Wallet Restrictions / Inactive status (WP Swings style)
   */
  updateWalletRestrictions(
    status: WalletStatus,
    restrictions: WalletRestrictions,
    reason?: string
  ): WalletState {
    const wallet = this.getWallet();
    const updatedWallet: WalletState = {
      ...wallet,
      status,
      restrictions,
      restrictionReason: reason || (status !== 'ACTIVE' ? `Wallet has been set to ${status} by Administrator.` : undefined)
    };
    this.saveWallet(updatedWallet);
    return updatedWallet;
  },

  getKycStatus(): KycSubmission {
    try {
      const stored = localStorage.getItem(KYC_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
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
        const submission: KycSubmission = {
          ...data,
          userId: userMeta?.id,
          status: 'PENDING',
          submittedAt: new Date().toISOString()
        };
        localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(submission));
        resolve(submission);
      }, 500);
    });
  },

  adminVerifyKyc(status: 'VERIFIED' | 'REJECTED', notes?: string): KycSubmission {
    const kyc = this.getKycStatus();
    const updated: KycSubmission = {
      ...kyc,
      status,
      reviewedAt: new Date().toISOString(),
      adminNotes: notes
    };
    localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};
