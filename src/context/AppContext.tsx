import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';
import type { UserProfile } from '../services/authService';
import { walletService } from '../services/walletService';
import type { WalletState, WalletTransaction, KycSubmission, WalletStatus, WalletRestrictions } from '../services/walletService';
import { adminService } from '../services/adminService';
import { reservationService } from '../services/reservationService';
import type { ReservationState, ReservationRecord, PreparedReservation } from '../services/reservationService';
import { levelService } from '../services/levelService';
import { referralService } from '../services/referralService';
import type { ReferralSummary } from '../services/referralService';
import { tradeService } from '../services/tradeService';
import type { DemoTradeRecord, MarketPair } from '../services/tradeService';

interface AppContextType {
  // Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password?: string) => Promise<void>;
  register: (data: { name: string; username: string; email: string; password?: string; referralCode?: string }) => Promise<void>;
  logout: () => void;

  // Modals
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: (initialRefCode?: string) => void;
  closeRegisterModal: () => void;
  initialReferralCode: string;
  isAnnouncementOpen: boolean;
  openAnnouncement: () => void;
  closeAnnouncement: () => void;

  // Wallet & Admin Review
  wallet: WalletState;
  transactions: WalletTransaction[];
  kyc: KycSubmission;
  refreshWallet: () => void;
  submitDeposit: (amount: number, address: string, txHash: string) => Promise<void>;
  submitWithdrawal: (amount: number, address: string) => Promise<{ success: boolean; message: string }>;
  cancelWithdrawal: (txId: string) => Promise<void>;
  submitKyc: (data: { fullName: string; documentType: string; documentNumber: string; documentFileName?: string }) => Promise<void>;
  
  // Admin Operations
  adminApproveDeposit: (txId: string, remarks?: string) => Promise<void>;
  adminRejectDeposit: (txId: string, remarks?: string) => Promise<void>;
  adminApproveWithdrawal: (txId: string, remarks?: string) => Promise<void>;
  adminRejectWithdrawal: (txId: string, remarks?: string) => Promise<void>;
  adminCreditUser: (userId: string, amount: number, reason: string) => void;
  adminDebitUser: (userId: string, amount: number, reason: string) => void;
  adminUpdateWalletRestrictions: (userId: string, status: WalletStatus, restrictions: WalletRestrictions, reason?: string) => void;
  adminVerifyKyc: (userId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => void;
  adminDeleteUser: (userId: string) => Promise<void>;

  // Reservation & Mining
  reservationState: ReservationState;
  reservationHistory: ReservationRecord[];
  startMining: () => Promise<void>;
  stopMining: (elapsedSeconds: number) => Promise<PreparedReservation>;
  executeReservation: (prepared?: PreparedReservation) => Promise<void>;
  isProcessing: boolean;
  processingSecondsLeft: number;

  // Level & Referral
  userLevel: number;
  referralSummary: ReferralSummary;

  // Demo Trades
  markets: MarketPair[];
  tradeHistory: DemoTradeRecord[];
  executeDemoTrade: (data: { pair: string; side: 'BUY' | 'SELL'; amount: number; price: number }) => Promise<void>;

  // Notification Toast
  snackbar: { open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' };
  showSnackbar: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
  closeSnackbar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [initialReferralCode, setInitialReferralCode] = useState('');
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  const [wallet, setWallet] = useState<WalletState>(() => walletService.getWallet());
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => walletService.getTransactions());
  const [kyc, setKyc] = useState<KycSubmission>(() => walletService.getKycStatus());

  const [reservationState, setReservationState] = useState<ReservationState>(() => reservationService.getReservationState());
  const [reservationHistory, setReservationHistory] = useState<ReservationRecord[]>(() => reservationService.getHistory());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSecondsLeft, setProcessingSecondsLeft] = useState(0);

  const [markets] = useState<MarketPair[]>(() => tradeService.getMarkets());
  const [tradeHistory, setTradeHistory] = useState<DemoTradeRecord[]>(() => tradeService.getTradeHistory());
  const [syncTick, setSyncTick] = useState(0);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = useCallback((message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const refreshWallet = useCallback(() => {
    setWallet(walletService.getWallet());
    setTransactions(walletService.getTransactions());
    setSyncTick(t => t + 1);
  }, []);

  // Background Fast Sync: Auto-sync wallet, transactions & all users from database in real time
  useEffect(() => {
    const syncUserData = async () => {
      try {
        await authService.syncAllUsersFromSupabase();

        if (user?.id) {
          await walletService.syncWalletFromSupabase(user.id);
          await walletService.syncTransactionsFromSupabase(user.id);
          setWallet(walletService.getWallet());
          setTransactions(walletService.getTransactions());
        }
        setSyncTick(t => t + 1);
      } catch {
        // ignore
      }
    };

    // Initial sync
    syncUserData();

    // User-scoped Supabase Realtime Channel
    let userChannel: any = null;
    if (user?.id) {
      userChannel = supabase
        .channel(`user_realtime_channel_${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` }, () => {
          walletService.syncWalletFromSupabase(user.id).then(w => { if (w) setWallet(w); });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits', filter: `user_id=eq.${user.id}` }, () => {
          walletService.syncTransactionsFromSupabase(user.id).then(txs => { setTransactions(txs); });
          walletService.syncWalletFromSupabase(user.id).then(w => { if (w) setWallet(w); });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals', filter: `user_id=eq.${user.id}` }, () => {
          walletService.syncTransactionsFromSupabase(user.id).then(txs => { setTransactions(txs); });
          walletService.syncWalletFromSupabase(user.id).then(w => { if (w) setWallet(w); });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${user.id}` }, () => {
          walletService.syncTransactionsFromSupabase(user.id).then(txs => { setTransactions(txs); });
        })
        .subscribe();
    }

    // Polling resilience fallback (every 3s)
    const interval = setInterval(syncUserData, 3000);

    return () => {
      if (userChannel) supabase.removeChannel(userChannel);
      clearInterval(interval);
    };
  }, [user?.id]);

  // Referral URL check (?ref=XXXX)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');
      if (refParam) {
        setInitialReferralCode(refParam);
        if (!user) {
          setIsRegisterModalOpen(true);
        }
      }
    }
  }, [user]);

  // Auth Handlers
  const login = async (usernameOrEmail: string, password?: string) => {
    const loggedInUser = await authService.login(usernameOrEmail, password);
    setUser(loggedInUser);
    const userWallet = walletService.getWalletForUser(loggedInUser.id);
    walletService.saveWallet(userWallet);
    setWallet(userWallet);
    setIsLoginModalOpen(false);
    refreshWallet();
    showSnackbar(`Welcome back, ${loggedInUser.name}!`, 'success');
  };

  const register = async (data: { name: string; username: string; email: string; password?: string; referralCode?: string }) => {
    const registeredUser = await authService.register(data);
    setUser(registeredUser);
    const zeroWallet: WalletState = {
      totalBalance: 0.0,
      availableBalance: 0.0,
      pendingBalance: 0.0,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: {
        canDeposit: true,
        canWithdraw: true,
        canReserve: true,
        canTrade: true
      }
    };
    walletService.saveWalletForUser(registeredUser.id, zeroWallet);
    walletService.saveWallet(zeroWallet);
    setWallet(zeroWallet);
    setIsRegisterModalOpen(false);
    refreshWallet();
    showSnackbar('Account created successfully! Wallet initialized with 0.00 USDT.', 'success');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    showSnackbar('Logged out successfully.', 'info');
  };

  // Deposit Submission (Pending Admin Verification)
  const submitDeposit = async (amount: number, address: string, txHash: string) => {
    const userMeta = user ? { id: user.id, name: user.name, email: user.email } : undefined;
    const result = await walletService.submitDeposit(amount, address, txHash, userMeta);
    setWallet(result.newWallet);
    setTransactions(walletService.getTransactions());
    showSnackbar(
      `Deposit of ${amount.toFixed(2)} USDT submitted! Status is PENDING admin verification. Funds are held in Pending Balance.`,
      'info'
    );
  };

  // Withdrawal Submission (Pending Admin Verification)
  const submitWithdrawal = async (amount: number, address: string) => {
    const userMeta = user ? { id: user.id, name: user.name, email: user.email } : undefined;
    const result = await walletService.submitWithdrawal(amount, address, userMeta);
    setWallet(result.newWallet);
    setTransactions(walletService.getTransactions());
    showSnackbar(result.message, 'info');
    return result;
  };

  // Admin Verification Actions
  const adminApproveDeposit = async (txId: string, remarks?: string) => {
    try {
      const hasSponsor = !!(user?.referredBy || initialReferralCode);
      const result = await walletService.approveDeposit(txId, hasSponsor, remarks);
      setWallet(result.updatedWallet);
      setTransactions(walletService.getTransactions());
      setSyncTick(t => t + 1);
      showSnackbar(`Deposit approved by Admin! ${result.approvedTx.amount} USDT credited to Available Balance!`, 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to approve deposit', 'error');
      throw err;
    }
  };

  const adminRejectDeposit = async (txId: string, remarks?: string) => {
    try {
      const result = await walletService.rejectDeposit(txId, remarks);
      setWallet(result.updatedWallet);
      setTransactions(walletService.getTransactions());
      setSyncTick(t => t + 1);
      showSnackbar(`Deposit rejected by Admin: ${remarks || 'Verification failed'}`, 'warning');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to reject deposit', 'error');
      throw err;
    }
  };

  const adminApproveWithdrawal = async (txId: string, remarks?: string) => {
    try {
      const result = await walletService.approveWithdrawal(txId, remarks);
      setWallet(result.updatedWallet);
      setTransactions(walletService.getTransactions());
      setSyncTick(t => t + 1);
      showSnackbar(`Withdrawal approved & dispatched by Admin!`, 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to approve withdrawal', 'error');
      throw err;
    }
  };

  const adminRejectWithdrawal = async (txId: string, remarks?: string) => {
    try {
      const result = await walletService.rejectWithdrawal(txId, remarks);
      setWallet(result.updatedWallet);
      setTransactions(walletService.getTransactions());
      setSyncTick(t => t + 1);
      showSnackbar(`Withdrawal rejected by Admin. ${result.rejectedTx.amount} USDT refunded to Available Balance.`, 'info');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to reject withdrawal', 'error');
      throw err;
    }
  };

  const cancelWithdrawal = async (txId: string) => {
    if (!user?.id) return;
    try {
      const result = await walletService.cancelWithdrawal(txId, user.id);
      setWallet(result.updatedWallet);
      setTransactions(walletService.getTransactions());
      setSyncTick(t => t + 1);
      showSnackbar(`Withdrawal request cancelled! ${result.cancelledTx.amount} USDT refunded to Available Balance.`, 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to cancel withdrawal', 'error');
      throw err;
    }
  };

  const adminCreditUser = (userId: string, amount: number, reason: string) => {
    const res = adminService.creditUserWallet(userId, amount, reason);
    refreshWallet();
    showSnackbar(`Successfully credited +${amount.toFixed(2)} USDT to user wallet!`, 'success');
    return res;
  };

  const adminDebitUser = (userId: string, amount: number, reason: string) => {
    const res = adminService.debitUserWallet(userId, amount, reason);
    refreshWallet();
    showSnackbar(`Successfully debited -${amount.toFixed(2)} USDT from user wallet!`, 'info');
    return res;
  };

  const adminUpdateWalletRestrictions = (userId: string, status: WalletStatus, restrictions: WalletRestrictions, reason?: string) => {
    adminService.updateUserWalletRestrictions(userId, status, restrictions, reason);
    refreshWallet();
    showSnackbar(`User wallet status updated to ${status} with customized restrictions!`, 'success');
  };

  const adminVerifyKyc = (userId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    const updated = adminService.verifyKyc(userId, status, notes);
    setKyc(updated);
    if (user && user.id === userId) {
      setUser({ ...user, kycStatus: status });
    }
    showSnackbar(`KYC status set to ${status}!`, 'success');
  };

  const adminDeleteUser = async (userId: string) => {
    await adminService.deleteUser(userId);
    refreshWallet();
    showSnackbar('User account and all associated records permanently deleted.', 'info');
  };

  const submitKyc = async (data: { fullName: string; documentType: string; documentNumber: string; documentFileName?: string }) => {
    const newKyc = await walletService.submitKyc(data, user ? { id: user.id } : undefined);
    setKyc(newKyc);
    if (user) {
      const updated = authService.updateUserProfile({ kycStatus: 'PENDING' });
      setUser(updated);
    }
    showSnackbar('KYC documents submitted successfully! Review pending.', 'success');
  };

  // Step 1: Start Mining (1 time per 24 hours)
  const startMining = async () => {
    // Check wallet restriction
    if (wallet.status === 'INACTIVE' || wallet.status === 'FROZEN') {
      showSnackbar(`Wallet is ${wallet.status}. Star AI Mining is restricted on your account.`, 'error');
      return;
    }
    if (wallet.restrictions && !wallet.restrictions.canReserve) {
      showSnackbar(wallet.restrictionReason || 'Mining / Reservation is disabled by Administrator.', 'error');
      return;
    }

    const lock = reservationService.getCycleLockStatus();
    if (lock.isLocked) {
      showSnackbar(
        `24-Hour cycle is active. You can only start 1 cycle per 24 hours. (${Math.floor(lock.secondsRemaining / 3600)}h ${Math.floor((lock.secondsRemaining % 3600) / 60)}m remaining)`,
        'warning'
      );
      return;
    }

    const available = wallet.availableBalance;
    if (available <= 0) {
      showSnackbar('Available balance is 0.00 USDT. Please deposit USDT to start Star AI Mining.', 'error');
      return;
    }

    const res = reservationService.startMining(available);
    setReservationState(reservationService.getReservationState());
    showSnackbar(res.message, 'success');
  };

  // Step 2: Stop Mining & Calculate Yield (Prepares reservation for user confirmation)
  const stopMining = async (elapsedSeconds: number): Promise<PreparedReservation> => {
    const prepared = reservationService.stopMiningAndPrepareReservation(elapsedSeconds);
    setReservationState(reservationService.getReservationState());
    showSnackbar(
      `Mining stopped! Duration calculated: ${Math.floor(prepared.activeDurationSeconds / 3600)}h ${Math.floor((prepared.activeDurationSeconds % 3600) / 60)}m (${prepared.effectiveRate}% yield = +${prepared.profit.toFixed(4)} USDT). Click 'Execute Reservation' below to finalize!`,
      'info'
    );
    return prepared;
  };

  // Step 3: Execute Reservation (User explicitly clicks to finalize & strictly locks for 24h)
  const executeReservation = async (prepared?: PreparedReservation) => {
    const lock = reservationService.getCycleLockStatus();
    if (lock.isLocked) {
      showSnackbar(`24-Hour reservation is already executed and locked. Please wait for countdown.`, 'warning');
      return;
    }

    const record = reservationService.initiateSettlementExecution(prepared);
    setReservationState(reservationService.getReservationState());
    setIsProcessing(true);
    setProcessingSecondsLeft(20);

    showSnackbar(`Executing 20-second smart settlement for ${record.profit.toFixed(4)} USDT profit...`, 'info');

    let timeLeft = 20;
    const interval = setInterval(() => {
      timeLeft -= 1;
      setProcessingSecondsLeft(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
        setIsProcessing(false);

        // Finalize settlement and lock strictly for 24 hours
        const { updatedWallet, completedRecord } = reservationService.finalizeSettlement(record);
        setWallet(updatedWallet);
        setReservationState(reservationService.getReservationState());
        setReservationHistory(reservationService.getHistory());
        setTransactions(walletService.getTransactions());

        showSnackbar(
          `Settlement complete! +${completedRecord.profit.toFixed(4)} USDT added to your wallet balance. 24-Hour cooldown lock active.`,
          'success'
        );
      }
    }, 1000);
  };

  // Demo Trade Handlers
  const executeDemoTrade = async (data: { pair: string; side: 'BUY' | 'SELL'; amount: number; price: number }) => {
    if (wallet.status === 'INACTIVE' || wallet.status === 'FROZEN' || (wallet.restrictions && !wallet.restrictions.canTrade)) {
      showSnackbar('Trading is temporarily disabled on your wallet.', 'error');
      return;
    }
    const trade = await tradeService.executeDemoTrade(data);
    setTradeHistory(prev => [trade, ...prev]);
    showSnackbar(`Demo ${data.side} order executed for ${data.amount} ${data.pair.split('/')[0]} @ $${data.price}`, 'success');
  };

  // Computed Levels & Referrals
  const referralSummary = useMemo(
    () => referralService.getReferralSummary(user?.referralCode || 'IVEST100'),
    [user?.referralCode, syncTick, wallet.totalBalance, transactions.length]
  );
  const userLevel = useMemo(
    () =>
      levelService.calculateUserLevel({
        walletBalance: wallet.totalBalance,
        aMembers: referralSummary.aMembersCount,
        bMembers: referralSummary.bMembersCount,
        cMembers: referralSummary.cMembersCount
      }),
    [wallet.totalBalance, referralSummary.aMembersCount, referralSummary.bMembersCount, referralSummary.cMembersCount]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoginModalOpen,
        isRegisterModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        openRegisterModal: (refCode) => {
          if (refCode) setInitialReferralCode(refCode);
          setIsRegisterModalOpen(true);
        },
        closeRegisterModal: () => setIsRegisterModalOpen(false),
        initialReferralCode,
        isAnnouncementOpen,
        openAnnouncement: () => setIsAnnouncementOpen(true),
        closeAnnouncement: () => setIsAnnouncementOpen(false),
        wallet,
        transactions,
        kyc,
        refreshWallet,
        submitDeposit,
        submitWithdrawal,
        cancelWithdrawal,
        submitKyc,
        adminApproveDeposit,
        adminRejectDeposit,
        adminApproveWithdrawal,
        adminRejectWithdrawal,
        adminCreditUser,
        adminDebitUser,
        adminUpdateWalletRestrictions,
        adminVerifyKyc,
        adminDeleteUser,
        reservationState,
        reservationHistory,
        startMining,
        stopMining,
        executeReservation,
        isProcessing,
        processingSecondsLeft,
        userLevel,
        referralSummary,
        markets,
        tradeHistory,
        executeDemoTrade,
        snackbar,
        showSnackbar,
        closeSnackbar
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
