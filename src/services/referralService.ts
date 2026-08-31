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
    
    // Find target user who owns this referral code
    const currentUser = allUsers.find(u => u.referralCode === referralCode) || allUsers[0];
    const userRefCode = currentUser ? currentUser.referralCode : referralCode;
    const userUsername = currentUser ? currentUser.username.toLowerCase() : '';

    // Level A (Direct): Anyone whose referredBy === userRefCode or referredBy === userUsername
    const tierAUsers = allUsers.filter(u => {
      if (u.id === currentUser?.id) return false;
      const ref = (u.referredBy || '').toLowerCase();
      return ref === userRefCode.toLowerCase() || (userUsername && ref === userUsername);
    });

    const tierAMembers: ReferralMember[] = tierAUsers.map(u => {
      const w = walletService.getWalletForUser(u.id);
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        level: u.level || 1,
        status: u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        walletBalance: w.totalBalance,
        joinedAt: u.createdAt,
        referredBy: u.referredBy
      };
    });

    // Level B (Indirect 2nd Tier): Referred by Tier A members
    const tierACodes = new Set(tierAUsers.map(u => u.referralCode.toLowerCase()));
    const tierAUsernames = new Set(tierAUsers.map(u => u.username.toLowerCase()));

    const tierBUsers = allUsers.filter(u => {
      if (u.id === currentUser?.id || tierACodes.has(u.referralCode.toLowerCase())) return false;
      const ref = (u.referredBy || '').toLowerCase();
      return tierACodes.has(ref) || tierAUsernames.has(ref);
    });

    const tierBMembers: ReferralMember[] = tierBUsers.map(u => {
      const w = walletService.getWalletForUser(u.id);
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        level: u.level || 1,
        status: u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        walletBalance: w.totalBalance,
        joinedAt: u.createdAt,
        referredBy: u.referredBy
      };
    });

    // Level C (Indirect 3rd Tier): Referred by Tier B members
    const tierBCodes = new Set(tierBUsers.map(u => u.referralCode.toLowerCase()));
    const tierBUsernames = new Set(tierBUsers.map(u => u.username.toLowerCase()));

    const tierCUsers = allUsers.filter(u => {
      if (u.id === currentUser?.id || tierACodes.has(u.referralCode.toLowerCase()) || tierBCodes.has(u.referralCode.toLowerCase())) return false;
      const ref = (u.referredBy || '').toLowerCase();
      return tierBCodes.has(ref) || tierBUsernames.has(ref);
    });

    const tierCMembers: ReferralMember[] = tierCUsers.map(u => {
      const w = walletService.getWalletForUser(u.id);
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        level: u.level || 1,
        status: u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        walletBalance: w.totalBalance,
        joinedAt: u.createdAt,
        referredBy: u.referredBy
      };
    });

    // Calculate real commissions from ledger
    const allTransactions = walletService.getTransactions();
    const earningsHistory: ReferralEarningRecord[] = allTransactions
      .filter(t => t.type === 'REFERRAL_BONUS' || t.type === 'WELCOME_BONUS')
      .map(t => ({
        id: t.id,
        fromMemberUsername: t.userName || 'Downline Member',
        tier: (t.type === 'WELCOME_BONUS' ? 'DEPOSIT_BONUS' : 'A') as 'A' | 'B' | 'C' | 'DEPOSIT_BONUS',
        amount: t.amount,
        createdAt: t.createdAt,
        description: t.description
      }));

    const aCount = tierAMembers.length;
    const bCount = tierBMembers.length;
    const cCount = tierCMembers.length;
    const total = aCount + bCount + cCount;
    const active = tierAMembers.concat(tierBMembers, tierCMembers).filter(m => m.status === 'ACTIVE').length;

    const totalEarn = earningsHistory.reduce((sum, e) => sum + e.amount, 0);

    return {
      referralCode: userRefCode,
      referralLink: `${origin}/?ref=${userRefCode}`,
      aMembersCount: aCount,
      bMembersCount: bCount,
      cMembersCount: cCount,
      totalMembersCount: total,
      activeMembersCount: active,
      todayEarnings: Number((totalEarn * 0.25).toFixed(2)),
      totalEarnings: Number(totalEarn.toFixed(2)),
      pendingBonus: 0,
      tierAMembers,
      tierBMembers,
      tierCMembers,
      tierAEarnings: Number((totalEarn * 0.7).toFixed(2)),
      tierBEarnings: Number((totalEarn * 0.2).toFixed(2)),
      tierCEarnings: Number((totalEarn * 0.1).toFixed(2)),
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
