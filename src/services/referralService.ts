import { WALLET_CONFIG } from '../config/walletConfig';
import { authService } from './authService';
import { walletService } from './walletService';

export interface ReferralMember {
  id: string;
  name: string;
  username: string;
  level: 'A' | 'B' | 'C' | number;
  status: 'ACTIVE' | 'INACTIVE';
  walletBalance: number;
  joinedAt: string;
  referredBy?: string;
}

export interface ReferralEarningRecord {
  id: string;
  fromMemberUsername: string;
  tier: 'A' | 'B' | 'C' | 'DEPOSIT_BONUS';
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
  tierAMembers: ReferralMember[];
  tierBMembers: ReferralMember[];
  tierCMembers: ReferralMember[];
  tierAEarnings: number;
  tierBEarnings: number;
  tierCEarnings: number;
  earningsHistory: ReferralEarningRecord[];
}

export const referralService = {
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

    const checkMemberStatus = (u: any, wallet: any): 'ACTIVE' | 'INACTIVE' => {
      // An account is active if it has available/total balance > 0, status ACTIVE, or an approved deposit
      const hasApprovedDeposit = allTransactions.some(
        t => (t.userId === u.id || (t.userName && t.userName.toLowerCase() === u.username.toLowerCase())) &&
             t.type === 'DEPOSIT' && (t.status === 'APPROVED' || t.status === 'COMPLETED')
      );
      if (u.status === 'ACTIVE' || wallet.availableBalance > 0 || wallet.totalBalance > 0 || hasApprovedDeposit) {
        return 'ACTIVE';
      }
      return 'INACTIVE';
    };

    // User identifier keys for Tier A matching
    const currentUserKeys = new Set<string>();
    if (currentUser?.referralCode) currentUserKeys.add(currentUser.referralCode.trim().toLowerCase());
    if (currentUser?.username) currentUserKeys.add(currentUser.username.trim().toLowerCase());
    if (currentUser?.id) currentUserKeys.add(currentUser.id.trim().toLowerCase());

    // Level A (Direct Referrals of currentUser): Anyone whose referredBy matches currentUser
    const tierAUsers = allUsers.filter(u => {
      if (!u || u.id === currentUser?.id) return false;
      const ref = (u.referredBy || '').trim().toLowerCase();
      return ref !== '' && currentUserKeys.has(ref);
    });

    const tierAMembers: ReferralMember[] = tierAUsers.map(u => {
      const w = walletService.getWalletForUser(u.id);
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        level: u.level || 1,
        status: checkMemberStatus(u, w),
        walletBalance: w.totalBalance,
        joinedAt: u.createdAt,
        referredBy: u.referredBy
      };
    });

    // Level B (Indirect 2nd Tier): Anyone whose referredBy matches any Tier A member
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
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        level: u.level || 1,
        status: checkMemberStatus(u, w),
        walletBalance: w.totalBalance,
        joinedAt: u.createdAt,
        referredBy: u.referredBy
      };
    });

    // Level C (Indirect 3rd Tier): Anyone whose referredBy matches any Tier B member
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
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        level: u.level || 1,
        status: checkMemberStatus(u, w),
        walletBalance: w.totalBalance,
        joinedAt: u.createdAt,
        referredBy: u.referredBy
      };
    });

    // Calculate real commissions for current user
    const earningsHistory: ReferralEarningRecord[] = allTransactions
      .filter(t => {
        const isForCurrentUser = currentUser?.id
          ? (t.userId === currentUser.id || (t.userName && t.userName.toLowerCase() === currentUser.username.toLowerCase()))
          : true;
        return isForCurrentUser && (t.type === 'REFERRAL_BONUS' || t.type === 'WELCOME_BONUS');
      })
      .map(t => {
        let tier: 'A' | 'B' | 'C' | 'DEPOSIT_BONUS' = 'A';
        if (t.type === 'WELCOME_BONUS') {
          tier = 'DEPOSIT_BONUS';
        } else if (t.description?.includes('Tier-B') || t.description?.includes('Tier B')) {
          tier = 'B';
        } else if (t.description?.includes('Tier-C') || t.description?.includes('Tier C')) {
          tier = 'C';
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
      pendingBonus: 0,
      tierAMembers,
      tierBMembers,
      tierCMembers,
      tierAEarnings: Number(tierAEarn.toFixed(2)),
      tierBEarnings: Number(tierBEarn.toFixed(2)),
      tierCEarnings: Number(tierCEarn.toFixed(2)),
      earningsHistory
    };
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
