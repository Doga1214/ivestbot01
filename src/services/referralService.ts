import { WALLET_CONFIG } from '../config/walletConfig';
import { authService } from './authService';
import { walletService } from './walletService';
import { supabase } from './supabaseClient';
import type {
  ReferralRecord,
  ReferralWithdrawalRequest,
  FraudLogEntry,
  ReferralLeaderboardUser,
  RewardTierInfo,
  ReferralTierLevel,
  ReferralAdminConfig
} from '../types/referral';

export interface ReferralMember {
  id: string;
  name: string;
  username: string;
  level: 'A' | 'B' | 'C' | number;
  status: 'ACTIVE' | 'INACTIVE';
  walletBalance: number;
  joinedAt: string;
  referredBy?: string;
  hasDeposited?: boolean;
  depositAmount?: number;
  rewardEarnedUSDT?: number;
}

export interface ReferralEarningRecord {
  id: string;
  fromMemberUsername: string;
  tier: 'A' | 'B' | 'C' | 'DEPOSIT_BONUS' | 'TIER_BONUS';
  rate?: number;
  amount: number;
  createdAt: string;
  description?: string;
}

export interface ReferralSummary {
  referralCode: string;
  referralLink: string;
  aMembersCount: number;
  bMembersCount: number;
  cMembersCount: number;
  totalMembersCount: number;
  activeMembersCount: number;
  inactiveMembersCount: number;
  todayEarnings: number;
  totalEarnings: number;
  pendingBonus: number;
  rewardBalanceUSDT: number;
  currentTier: ReferralTierLevel;
  currentTierName: string;
  nextTierRemaining: number;
  conversionRate: number;
  tierAMembers: ReferralMember[];
  tierBMembers: ReferralMember[];
  tierCMembers: ReferralMember[];
  tierAEarnings: number;
  tierBEarnings: number;
  tierCEarnings: number;
  earningsHistory: ReferralEarningRecord[];
  referralRecords: ReferralRecord[];
  referredBy?: {
    username: string;
    name: string;
    code: string;
    joinedAt?: string;
  };
}

const STORAGE_KEYS = {
  WITHDRAWALS: 'ivestbot_referral_withdrawals',
  FRAUD_LOGS: 'ivestbot_referral_fraud_logs',
  ADMIN_CONFIG: 'ivestbot_referral_admin_config',
  REWARD_BALANCE_PREFIX: 'ivestbot_ref_balance_'
};

export const referralService = {
  // ─── ADMIN CONFIGURATION ──────────────────────────────────────────
  getAdminConfig(): ReferralAdminConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_CONFIG);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }

    const sys = WALLET_CONFIG.referralSystem;
    return {
      minWithdrawalUSDT: sys?.minWithdrawalUSDT || 100,
      minAccountAgeDays: sys?.minAccountAgeDays || 0,
      requireKycForWithdrawal: sys?.requireKycForWithdrawal || false,
      baseRewardUSDT: sys?.baseRewardUSDT || 5,
      tierRates: {
        tier1Reward: sys?.tiers[0]?.rewardPerReferralUSDT || 5,
        tier1Bonus: sys?.tiers[0]?.tierBonusUSDT || 25,
        tier2Reward: sys?.tiers[1]?.rewardPerReferralUSDT || 7.5,
        tier2Bonus: sys?.tiers[1]?.tierBonusUSDT || 50,
        tier3Reward: sys?.tiers[2]?.rewardPerReferralUSDT || 10,
        tier3Bonus: sys?.tiers[2]?.tierBonusUSDT || 100,
        tier4Reward: sys?.tiers[3]?.rewardPerReferralUSDT || 15,
        tier4Bonus: sys?.tiers[3]?.tierBonusUSDT || 250
      },
      commissionRates: {
        A: WALLET_CONFIG.referralRates.A,
        B: WALLET_CONFIG.referralRates.B,
        C: WALLET_CONFIG.referralRates.C
      },
      antiFraudEnabled: true,
      maxHourlyReferralsPerIp: 5
    };
  },

  saveAdminConfig(config: ReferralAdminConfig): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('ivestbot_referral_config_updated'));
  },

  // ─── TIERS DEFINITION ─────────────────────────────────────────────
  getRewardTiers(): RewardTierInfo[] {
    const config = this.getAdminConfig();
    return [
      {
        tier: 1,
        name: 'Bronze Ambassador',
        minReferrals: 0,
        maxReferrals: 10,
        rewardPerReferralUSDT: config.tierRates.tier1Reward,
        tierBonusUSDT: config.tierRates.tier1Bonus,
        badgeColor: '#CD7F32',
        benefits: [
          `${config.tierRates.tier1Reward} USDT per qualified referral`,
          `${config.tierRates.tier1Bonus} USDT Milestone Unlock Bonus`,
          `${config.commissionRates.A}% Direct Level A Commission`
        ]
      },
      {
        tier: 2,
        name: 'Silver Partner',
        minReferrals: 11,
        maxReferrals: 25,
        rewardPerReferralUSDT: config.tierRates.tier2Reward,
        tierBonusUSDT: config.tierRates.tier2Bonus,
        badgeColor: '#C0C0C0',
        benefits: [
          `${config.tierRates.tier2Reward} USDT per qualified referral`,
          `${config.tierRates.tier2Bonus} USDT Silver Milestone Cash`,
          `+${config.commissionRates.B}% Level B Network Commission`
        ]
      },
      {
        tier: 3,
        name: 'Gold Leader',
        minReferrals: 26,
        maxReferrals: 50,
        rewardPerReferralUSDT: config.tierRates.tier3Reward,
        tierBonusUSDT: config.tierRates.tier3Bonus,
        badgeColor: '#FFD700',
        benefits: [
          `${config.tierRates.tier3Reward} USDT per qualified referral`,
          `${config.tierRates.tier3Bonus} USDT Gold Milestone Cash`,
          `+${config.commissionRates.C}% Level C Network Commission`
        ]
      },
      {
        tier: 4,
        name: 'Diamond VIP',
        minReferrals: 51,
        maxReferrals: 999999,
        rewardPerReferralUSDT: config.tierRates.tier4Reward,
        tierBonusUSDT: config.tierRates.tier4Bonus,
        badgeColor: '#00E5FF',
        benefits: [
          `${config.tierRates.tier4Reward} USDT per qualified referral`,
          `${config.tierRates.tier4Bonus} USDT Diamond Super Bonus`,
          'VIP Expedited USDT Payouts & Dedicated Manager'
        ]
      }
    ];
  },

  calculateUserTier(completedReferralsCount: number): {
    tier: ReferralTierLevel;
    tierInfo: RewardTierInfo;
    nextTierRemaining: number;
  } {
    const tiers = this.getRewardTiers();
    if (completedReferralsCount >= 51) {
      return { tier: 4, tierInfo: tiers[3], nextTierRemaining: 0 };
    }
    if (completedReferralsCount >= 26) {
      return { tier: 3, tierInfo: tiers[2], nextTierRemaining: 51 - completedReferralsCount };
    }
    if (completedReferralsCount >= 11) {
      return { tier: 2, tierInfo: tiers[1], nextTierRemaining: 26 - completedReferralsCount };
    }
    return { tier: 1, tierInfo: tiers[0], nextTierRemaining: 11 - completedReferralsCount };
  },

  // ─── REWARD BALANCE MANAGEMENT ────────────────────────────────────
  getUserRewardBalance(userId: string): number {
    try {
      const val = localStorage.getItem(`${STORAGE_KEYS.REWARD_BALANCE_PREFIX}${userId}`);
      if (val !== null) return parseFloat(val) || 0;
    } catch {
      // fallback
    }
    return 0;
  },

  setUserRewardBalance(userId: string, balance: number): void {
    localStorage.setItem(`${STORAGE_KEYS.REWARD_BALANCE_PREFIX}${userId}`, Math.max(0, balance).toFixed(2));
  },

  // ─── MAIN REFERRAL SUMMARY & RECORDS ──────────────────────────────
  getReferralSummary(referralCode: string = 'IVEST100'): ReferralSummary {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:5173';
    const allUsers = authService.getAllUsers();
    const allTransactions = walletService.getTransactions();
    
    const cleanRef = (referralCode || '').trim().toLowerCase();
    const currentSessionUser = authService.getCurrentUser();

    // Find target user who owns this referral code
    const currentUser = allUsers.find(
      u => (u.referralCode && u.referralCode.trim().toLowerCase() === cleanRef) ||
           (u.id && u.id.trim().toLowerCase() === cleanRef) ||
           (u.username && u.username.trim().toLowerCase() === cleanRef)
    ) || (currentSessionUser && (currentSessionUser.referralCode?.toLowerCase() === cleanRef || currentSessionUser.id === referralCode) ? currentSessionUser : allUsers[0]);

    const userRefCode = currentUser ? currentUser.referralCode : referralCode;
    const userId = currentUser?.id || 'demo_user';

    // Who referred this user?
    let sponsorInfo: { username: string; name: string; code: string; joinedAt?: string } | undefined;
    if (currentUser?.referredBy) {
      const sponsorClean = currentUser.referredBy.trim().toLowerCase();
      const sponsor = allUsers.find(
        u => (u.referralCode && u.referralCode.toLowerCase() === sponsorClean) ||
             (u.id && u.id.toLowerCase() === sponsorClean) ||
             (u.username && u.username.toLowerCase() === sponsorClean)
      );
      if (sponsor) {
        sponsorInfo = {
          username: sponsor.username,
          name: sponsor.name || sponsor.username,
          code: sponsor.referralCode || 'IVEST100',
          joinedAt: sponsor.createdAt
        };
      } else {
        sponsorInfo = {
          username: currentUser.referredBy,
          name: currentUser.referredBy,
          code: currentUser.referredBy
        };
      }
    }

    const checkMemberStatus = (u: any, wallet: any): 'ACTIVE' | 'INACTIVE' => {
      const hasApprovedDeposit = allTransactions.some(
        t => (t.userId === u.id || (t.userName && t.userName.toLowerCase() === u.username.toLowerCase())) &&
             t.type === 'DEPOSIT' && (t.status === 'APPROVED' || t.status === 'COMPLETED')
      );
      if (u.status === 'ACTIVE' || wallet.availableBalance > 0 || wallet.totalBalance > 0 || hasApprovedDeposit) {
        return 'ACTIVE';
      }
      return 'INACTIVE';
    };

    const getMemberDeposit = (u: any): number => {
      const userDeps = allTransactions.filter(
        t => (t.userId === u.id || (t.userName && t.userName.toLowerCase() === u.username.toLowerCase())) &&
             t.type === 'DEPOSIT' && (t.status === 'APPROVED' || t.status === 'COMPLETED')
      );
      return userDeps.reduce((sum, d) => sum + d.amount, 0);
    };

    // User identifier keys for Tier A matching
    const currentUserKeys = new Set<string>();
    if (currentUser?.referralCode) currentUserKeys.add(currentUser.referralCode.trim().toLowerCase());
    if (currentUser?.username) currentUserKeys.add(currentUser.username.trim().toLowerCase());
    if (currentUser?.id) currentUserKeys.add(currentUser.id.trim().toLowerCase());

    // Level A (Direct Referrals)
    const tierAUsers = allUsers.filter(u => {
      if (!u || u.id === currentUser?.id) return false;
      const ref = (u.referredBy || '').trim().toLowerCase();
      return ref !== '' && currentUserKeys.has(ref);
    });

    const tierAMembers: ReferralMember[] = tierAUsers.map(u => {
      const w = walletService.getWalletForUser(u.id);
      const dep = getMemberDeposit(u);
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        level: 'A',
        status: checkMemberStatus(u, w),
        walletBalance: w.totalBalance,
        joinedAt: u.createdAt,
        referredBy: u.referredBy,
        hasDeposited: dep > 0,
        depositAmount: dep,
        rewardEarnedUSDT: dep > 0 ? 5 + Number((dep * 0.01).toFixed(2)) : 0
      };
    });

    // Level B (Indirect 2nd Tier)
    const tierAKeys = new Set<string>();
    const tierAIds = new Set<string>();
    tierAUsers.forEach(u => {
      if (u.id) tierAIds.add(u.id.toLowerCase());
      if (u.referralCode) tierAKeys.add(u.referralCode.trim().toLowerCase());
      if (u.username) tierAKeys.add(u.username.trim().toLowerCase());
      if (u.id) tierAKeys.add(u.id.trim().toLowerCase());
    });

    const tierBUsers = allUsers.filter(u => {
      if (!u || u.id === currentUser?.id || tierAIds.has(u.id.toLowerCase())) return false;
      const ref = (u.referredBy || '').trim().toLowerCase();
      return ref !== '' && tierAKeys.has(ref);
    });

    const tierBMembers: ReferralMember[] = tierBUsers.map(u => {
      const w = walletService.getWalletForUser(u.id);
      const dep = getMemberDeposit(u);
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        level: 'B',
        status: checkMemberStatus(u, w),
        walletBalance: w.totalBalance,
        joinedAt: u.createdAt,
        referredBy: u.referredBy,
        hasDeposited: dep > 0,
        depositAmount: dep,
        rewardEarnedUSDT: dep > 0 ? Number((dep * 0.005).toFixed(2)) : 0
      };
    });

    // Level C (Indirect 3rd Tier)
    const tierBKeys = new Set<string>();
    const tierBIds = new Set<string>();
    tierBUsers.forEach(u => {
      if (u.id) tierBIds.add(u.id.toLowerCase());
      if (u.referralCode) tierBKeys.add(u.referralCode.trim().toLowerCase());
      if (u.username) tierBKeys.add(u.username.trim().toLowerCase());
      if (u.id) tierBKeys.add(u.id.trim().toLowerCase());
    });

    const tierCUsers = allUsers.filter(u => {
      if (!u || u.id === currentUser?.id || tierAIds.has(u.id.toLowerCase()) || tierBIds.has(u.id.toLowerCase())) return false;
      const ref = (u.referredBy || '').trim().toLowerCase();
      return ref !== '' && tierBKeys.has(ref);
    });

    const tierCMembers: ReferralMember[] = tierCUsers.map(u => {
      const w = walletService.getWalletForUser(u.id);
      const dep = getMemberDeposit(u);
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        level: 'C',
        status: checkMemberStatus(u, w),
        walletBalance: w.totalBalance,
        joinedAt: u.createdAt,
        referredBy: u.referredBy,
        hasDeposited: dep > 0,
        depositAmount: dep,
        rewardEarnedUSDT: dep > 0 ? Number((dep * 0.005).toFixed(2)) : 0
      };
    });

    // Earnings History
    const earningsHistory: ReferralEarningRecord[] = allTransactions
      .filter(t => {
        const isForCurrentUser = currentUser?.id
          ? (t.userId === currentUser.id || (t.userName && t.userName.toLowerCase() === currentUser.username.toLowerCase()))
          : true;
        return isForCurrentUser && (t.type === 'REFERRAL_BONUS' || t.type === 'WELCOME_BONUS');
      })
      .map(t => {
        let tier: 'A' | 'B' | 'C' | 'DEPOSIT_BONUS' | 'TIER_BONUS' = 'A';
        if (t.type === 'WELCOME_BONUS') {
          tier = 'DEPOSIT_BONUS';
        } else if (t.description?.includes('Tier-B') || t.description?.includes('Tier B')) {
          tier = 'B';
        } else if (t.description?.includes('Tier-C') || t.description?.includes('Tier C')) {
          tier = 'C';
        } else if (t.description?.includes('Milestone') || t.description?.includes('Tier Unlock')) {
          tier = 'TIER_BONUS';
        }
        return {
          id: t.id,
          fromMemberUsername: t.userName || 'Downline Member',
          tier,
          amount: t.amount,
          createdAt: t.createdAt,
          description: t.description
        };
      });

    const aCount = tierAMembers.length;
    const bCount = tierBMembers.length;
    const cCount = tierCMembers.length;
    const total = aCount + bCount + cCount;
    const active = tierAMembers.concat(tierBMembers, tierCMembers).filter(m => m.status === 'ACTIVE').length;
    const inactive = Math.max(0, total - active);

    const totalEarn = earningsHistory.reduce((sum, e) => sum + e.amount, 0);
    const tierAEarn = earningsHistory.filter(e => e.tier === 'A' || e.tier === 'DEPOSIT_BONUS').reduce((sum, e) => sum + e.amount, 0);
    const tierBEarn = earningsHistory.filter(e => e.tier === 'B').reduce((sum, e) => sum + e.amount, 0);
    const tierCEarn = earningsHistory.filter(e => e.tier === 'C').reduce((sum, e) => sum + e.amount, 0);

    // Referral Records for Table View
    const referralRecords: ReferralRecord[] = [
      ...tierAMembers.map(m => ({
        id: `rec_${m.id}`,
        referrerId: userId,
        refereeId: m.id,
        refereeName: m.name,
        refereeUsername: m.username,
        referralCode: userRefCode,
        tierLevel: 'A' as const,
        status: (m.status === 'ACTIVE' ? 'COMPLETED' : 'PENDING') as 'PENDING' | 'COMPLETED' | 'CLAIMED',
        rewardAmountUSDT: m.rewardEarnedUSDT || 5,
        hasDeposited: !!m.hasDeposited,
        depositAmountUSDT: m.depositAmount,
        hasReserved: m.status === 'ACTIVE',
        createdAt: m.joinedAt,
        completedAt: m.status === 'ACTIVE' ? m.joinedAt : undefined
      })),
      ...tierBMembers.map(m => ({
        id: `rec_${m.id}`,
        referrerId: userId,
        refereeId: m.id,
        refereeName: m.name,
        refereeUsername: m.username,
        referralCode: userRefCode,
        tierLevel: 'B' as const,
        status: (m.status === 'ACTIVE' ? 'COMPLETED' : 'PENDING') as 'PENDING' | 'COMPLETED' | 'CLAIMED',
        rewardAmountUSDT: m.rewardEarnedUSDT || 0,
        hasDeposited: !!m.hasDeposited,
        depositAmountUSDT: m.depositAmount,
        hasReserved: m.status === 'ACTIVE',
        createdAt: m.joinedAt,
        completedAt: m.status === 'ACTIVE' ? m.joinedAt : undefined
      })),
      ...tierCMembers.map(m => ({
        id: `rec_${m.id}`,
        referrerId: userId,
        refereeId: m.id,
        refereeName: m.name,
        refereeUsername: m.username,
        referralCode: userRefCode,
        tierLevel: 'C' as const,
        status: (m.status === 'ACTIVE' ? 'COMPLETED' : 'PENDING') as 'PENDING' | 'COMPLETED' | 'CLAIMED',
        rewardAmountUSDT: m.rewardEarnedUSDT || 0,
        hasDeposited: !!m.hasDeposited,
        depositAmountUSDT: m.depositAmount,
        hasReserved: m.status === 'ACTIVE',
        createdAt: m.joinedAt,
        completedAt: m.status === 'ACTIVE' ? m.joinedAt : undefined
      }))
    ];

    // Current tier calculation
    const { tier: curTier, tierInfo: curTierInfo, nextTierRemaining } = this.calculateUserTier(active);

    // Initial reward balance sync
    let rewardBalance = this.getUserRewardBalance(userId);
    if (rewardBalance === 0 && totalEarn > 0) {
      // Initialize with unwithdrawn earned amount
      const withdrawals = this.getWithdrawals(userId);
      const withdrawnSum = withdrawals
        .filter(w => w.status !== 'REJECTED')
        .reduce((s, w) => s + w.amountUSDT, 0);
      rewardBalance = Math.max(0, Number((totalEarn - withdrawnSum).toFixed(2)));
      this.setUserRewardBalance(userId, rewardBalance);
    }

    const convRate = total > 0 ? Number(((active / total) * 100).toFixed(1)) : 0;

    return {
      referralCode: userRefCode,
      referralLink: `${origin}/?ref=${userRefCode}`,
      aMembersCount: aCount,
      bMembersCount: bCount,
      cMembersCount: cCount,
      totalMembersCount: total,
      activeMembersCount: active,
      inactiveMembersCount: inactive,
      todayEarnings: Number((totalEarn * 0.25).toFixed(2)),
      totalEarnings: Number(totalEarn.toFixed(2)),
      pendingBonus: Number((inactive * 5).toFixed(2)),
      rewardBalanceUSDT: rewardBalance,
      currentTier: curTier,
      currentTierName: curTierInfo.name,
      nextTierRemaining,
      conversionRate: convRate,
      tierAMembers,
      tierBMembers,
      tierCMembers,
      tierAEarnings: Number(tierAEarn.toFixed(2)),
      tierBEarnings: Number(tierBEarn.toFixed(2)),
      tierCEarnings: Number(tierCEarn.toFixed(2)),
      earningsHistory,
      referralRecords,
      referredBy: sponsorInfo
    };
  },

  // ─── WITHDRAWAL & CLAIM SYSTEM (USDT TO CRYPTO WALLET) ───────────
  getWithdrawals(userId?: string): ReferralWithdrawalRequest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      const list: ReferralWithdrawalRequest[] = stored ? JSON.parse(stored) : [];
      if (userId) {
        return list.filter(w => w.userId === userId);
      }
      return list;
    } catch {
      return [];
    }
  },

  saveWithdrawals(list: ReferralWithdrawalRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('ivestbot_referral_withdrawals_updated'));
  },

  async requestWithdrawal(params: {
    userId: string;
    userName: string;
    userEmail?: string;
    amountUSDT: number;
    walletAddress: string;
    network: 'TRC20' | 'BEP20' | 'ERC20';
  }): Promise<ReferralWithdrawalRequest> {
    const config = this.getAdminConfig();
    const currentBalance = this.getUserRewardBalance(params.userId);

    // 1. Validation Checks
    if (params.amountUSDT < config.minWithdrawalUSDT) {
      throw new Error(`Minimum withdrawal amount is ${config.minWithdrawalUSDT} USDT.`);
    }

    if (params.amountUSDT > currentBalance) {
      throw new Error(`Insufficient referral reward balance. Available: ${currentBalance.toFixed(2)} USDT.`);
    }

    if (!params.walletAddress || params.walletAddress.trim().length < 15) {
      throw new Error('Please enter a valid destination USDT wallet address.');
    }

    // 2. Deduct from reward balance
    const newBal = currentBalance - params.amountUSDT;
    this.setUserRewardBalance(params.userId, newBal);

    // 3. Create withdrawal request
    const request: ReferralWithdrawalRequest = {
      id: `rw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      amountUSDT: params.amountUSDT,
      walletAddress: params.walletAddress.trim(),
      network: params.network,
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };

    const all = this.getWithdrawals();
    all.unshift(request);
    this.saveWithdrawals(all);

    // 4. Record pending transaction in wallet ledger
    walletService.addTransaction({
      userId: params.userId,
      userName: params.userName,
      type: 'WITHDRAWAL',
      amount: params.amountUSDT,
      currency: 'USDT',
      status: 'PENDING',
      referenceId: `REF-WTH-${Date.now()}`,
      txHash: `REF-WTH-${Date.now()}`,
      description: `Referral Reward Withdrawal to ${params.network}: ${params.walletAddress.substring(0, 8)}...`
    });

    return request;
  },

  async claimRewardToMainWallet(userId: string, amountUSDT: number): Promise<void> {
    const currentBalance = this.getUserRewardBalance(userId);
    if (amountUSDT <= 0 || amountUSDT > currentBalance) {
      throw new Error(`Invalid transfer amount. Available: ${currentBalance.toFixed(2)} USDT.`);
    }

    // Deduct from referral reward balance
    this.setUserRewardBalance(userId, currentBalance - amountUSDT);

    // Credit to main wallet balance
    const wallet = walletService.getWalletForUser(userId);
    walletService.saveWalletForUser(userId, {
      ...wallet,
      totalBalance: wallet.totalBalance + amountUSDT,
      availableBalance: wallet.availableBalance + amountUSDT
    });

    // Record transaction
    const user = authService.getCurrentUser();
    walletService.addTransaction({
      userId,
      userName: user?.username || 'User',
      type: 'REFERRAL_BONUS',
      amount: amountUSDT,
      currency: 'USDT',
      status: 'COMPLETED',
      referenceId: `REF-CLAIM-${Date.now()}`,
      description: `Instant Transfer from Referral Reward Balance to Main Available Wallet`
    });
  },

  approveWithdrawal(requestId: string, txHash?: string, remarks?: string): void {
    const all = this.getWithdrawals();
    const target = all.find(w => w.id === requestId);
    if (!target) throw new Error('Withdrawal request not found.');

    target.status = 'APPROVED';
    target.processedAt = new Date().toISOString();
    target.txHash = txHash || `0x${Math.random().toString(16).substring(2, 10)}${Date.now()}`;
    target.adminRemarks = remarks || 'Approved & USDT transferred via Crypto Gateway';

    this.saveWithdrawals(all);

    // Dispatch custom notification event
    window.dispatchEvent(new CustomEvent('ivestbot_notification', {
      detail: {
        title: 'Referral Withdrawal Approved!',
        message: `Your withdrawal of ${target.amountUSDT} USDT to ${target.walletAddress.substring(0, 8)}... has been processed!`,
        severity: 'success'
      }
    }));
  },

  rejectWithdrawal(requestId: string, remarks?: string): void {
    const all = this.getWithdrawals();
    const target = all.find(w => w.id === requestId);
    if (!target) throw new Error('Withdrawal request not found.');

    target.status = 'REJECTED';
    target.processedAt = new Date().toISOString();
    target.adminRemarks = remarks || 'Rejected by Admin. Funds returned to reward balance.';

    // Refund reward balance
    const current = this.getUserRewardBalance(target.userId);
    this.setUserRewardBalance(target.userId, current + target.amountUSDT);

    this.saveWithdrawals(all);
  },

  // ─── ANTI-FRAUD & SECURITY ENGINE ─────────────────────────────────
  getFraudLogs(): FraudLogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FRAUD_LOGS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveFraudLogs(logs: FraudLogEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.FRAUD_LOGS, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('ivestbot_fraud_logs_updated'));
  },

  logFraud(entry: Omit<FraudLogEntry, 'id' | 'timestamp' | 'resolved'>): void {
    const logs = this.getFraudLogs();
    const newLog: FraudLogEntry = {
      ...entry,
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    logs.unshift(newLog);
    this.saveFraudLogs(logs);

    // Save to Supabase if available
    try {
      supabase.from('fraud_logs').insert([{
        user_id: entry.userId,
        event_type: entry.fraudType,
        risk_score: entry.severity === 'CRITICAL' ? 100 : entry.severity === 'HIGH' ? 80 : 50,
        details: entry.details,
        ip_address: entry.ipAddress
      }]).then();
    } catch {
      // offline silent
    }
  },

  resolveFraud(id: string): void {
    const logs = this.getFraudLogs();
    const target = logs.find(l => l.id === id);
    if (target) {
      target.resolved = true;
      this.saveFraudLogs(logs);
    }
  },

  validateReferralRegistration(referrerCode: string, referee: { email: string; username: string }): {
    isValid: boolean;
    reason?: string;
  } {
    const allUsers = authService.getAllUsers();
    const cleanRef = (referrerCode || '').trim().toLowerCase();
    
    // 1. Find referrer
    const referrer = allUsers.find(
      u => (u.referralCode && u.referralCode.toLowerCase() === cleanRef) ||
           (u.username && u.username.toLowerCase() === cleanRef) ||
           (u.id && u.id.toLowerCase() === cleanRef)
    );

    if (!referrer) {
      return { isValid: false, reason: 'Invalid or expired referral code.' };
    }

    // 2. Self-Referral Prevention
    if (
      referrer.email.toLowerCase() === referee.email.toLowerCase() ||
      referrer.username.toLowerCase() === referee.username.toLowerCase()
    ) {
      this.logFraud({
        userId: referrer.id,
        userName: referrer.username,
        fraudType: 'SELF_REFERRAL',
        severity: 'CRITICAL',
        actionTaken: 'BLOCKED',
        details: `Self-referral attempt detected using email: ${referee.email}`,
        ipAddress: '127.0.0.1'
      });
      return { isValid: false, reason: 'Self-referral is strictly forbidden.' };
    }

    return { isValid: true };
  },

  // ─── LEADERBOARD ──────────────────────────────────────────────────
  getLeaderboard(): ReferralLeaderboardUser[] {
    const allUsers = authService.getAllUsers();
    const allTransactions = walletService.getTransactions();

    const userStats = allUsers.map(user => {
      const uKeys = new Set<string>();
      if (user.referralCode) uKeys.add(user.referralCode.toLowerCase());
      if (user.username) uKeys.add(user.username.toLowerCase());
      if (user.id) uKeys.add(user.id.toLowerCase());

      const directReferrals = allUsers.filter(u => {
        if (!u || u.id === user.id) return false;
        const ref = (u.referredBy || '').trim().toLowerCase();
        return ref !== '' && uKeys.has(ref);
      });

      const activeCount = directReferrals.filter(referee => {
        return allTransactions.some(
          t => (t.userId === referee.id || (t.userName && t.userName.toLowerCase() === referee.username.toLowerCase())) &&
               t.type === 'DEPOSIT' && (t.status === 'APPROVED' || t.status === 'COMPLETED')
        );
      }).length;

      const userBonuses = allTransactions.filter(
        t => (t.userId === user.id || (t.userName && t.userName.toLowerCase() === user.username.toLowerCase())) &&
             (t.type === 'REFERRAL_BONUS' || t.type === 'WELCOME_BONUS')
      );

      const totalEarned = userBonuses.reduce((sum, t) => sum + t.amount, 0);
      const { tier, tierInfo } = this.calculateUserTier(activeCount);

      return {
        userId: user.id,
        name: user.name || user.username,
        username: user.username,
        totalReferrals: directReferrals.length,
        activeReferrals: activeCount,
        totalEarnedUSDT: Number(totalEarned.toFixed(2)),
        tier,
        tierName: tierInfo.name
      };
    });

    // Seed mock top ambassadors if list is small to make UI look vibrant & competitive
    const defaultLeaderboard: ReferralLeaderboardUser[] = [
      { rank: 1, userId: 'u_lead_1', name: 'CryptoWhale_88', username: 'CryptoWhale_88', totalReferrals: 142, activeReferrals: 118, totalEarnedUSDT: 3450.00, tier: 4, tierName: 'Diamond VIP' },
      { rank: 2, userId: 'u_lead_2', name: 'SatoshiTrader', username: 'SatoshiTrader', totalReferrals: 98, activeReferrals: 76, totalEarnedUSDT: 2180.50, tier: 4, tierName: 'Diamond VIP' },
      { rank: 3, userId: 'u_lead_3', name: 'AlphaNode', username: 'AlphaNode', totalReferrals: 64, activeReferrals: 52, totalEarnedUSDT: 1420.00, tier: 4, tierName: 'Diamond VIP' },
      { rank: 4, userId: 'u_lead_4', name: 'BlockMaster_Pro', username: 'BlockMaster_Pro', totalReferrals: 41, activeReferrals: 35, totalEarnedUSDT: 890.00, tier: 3, tierName: 'Gold Leader' },
      { rank: 5, userId: 'u_lead_5', name: 'Elena_Invest', username: 'Elena_Invest', totalReferrals: 29, activeReferrals: 24, totalEarnedUSDT: 560.00, tier: 3, tierName: 'Gold Leader' },
      { rank: 6, userId: 'u_lead_6', name: 'CyberVolt', username: 'CyberVolt', totalReferrals: 19, activeReferrals: 15, totalEarnedUSDT: 320.00, tier: 2, tierName: 'Silver Partner' }
    ];

    // Merge and sort
    const combined = [...userStats.filter(u => u.totalReferrals > 0), ...defaultLeaderboard];
    combined.sort((a, b) => b.totalEarnedUSDT - a.totalEarnedUSDT || b.activeReferrals - a.activeReferrals);

    return combined.slice(0, 10).map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  },

  getReferralRates() {
    return WALLET_CONFIG.referralRates;
  },

  calculateDepositBonus(depositAmount: number) {
    if (depositAmount < WALLET_CONFIG.depositBonusRatio.minDeposit) {
      return { sponsorBonus: 0, newUserBonus: 0 };
    }
    const units = Math.floor(Math.min(depositAmount, WALLET_CONFIG.depositBonusRatio.maxDeposit) / WALLET_CONFIG.depositBonusRatio.unitDeposit);
    return {
      sponsorBonus: units * WALLET_CONFIG.depositBonusRatio.sponsorBonusPerUnit,
      newUserBonus: units * WALLET_CONFIG.depositBonusRatio.newUserBonusPerUnit
    };
  }
};
