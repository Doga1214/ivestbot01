export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'CLAIMED' | 'REJECTED';

export type ReferralTierLevel = 1 | 2 | 3 | 4;

export type RewardType = 
  | 'FIXED_BONUS' 
  | 'PERCENTAGE_COMMISSION' 
  | 'TIER_MILESTONE' 
  | 'WELCOME_BONUS' 
  | 'DOWNLINE_A' 
  | 'DOWNLINE_B' 
  | 'DOWNLINE_C';

export interface RewardTierInfo {
  tier: ReferralTierLevel;
  name: string;
  minReferrals: number;
  maxReferrals: number;
  rewardPerReferralUSDT: number;
  tierBonusUSDT: number;
  badgeColor: string;
  benefits: string[];
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  refereeUsername: string;
  refereeEmail?: string;
  referralCode: string;
  tierLevel: 'A' | 'B' | 'C';
  status: ReferralStatus;
  rewardAmountUSDT: number;
  hasDeposited: boolean;
  depositAmountUSDT?: number;
  hasReserved: boolean;
  createdAt: string;
  completedAt?: string;
  claimedAt?: string;
  ipAddress?: string;
}

export interface ReferralWithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  amountUSDT: number;
  walletAddress: string;
  network: 'TRC20' | 'BEP20' | 'ERC20';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  processedAt?: string;
  adminRemarks?: string;
  txHash?: string;
}

export interface FraudLogEntry {
  id: string;
  userId: string;
  userName: string;
  suspectedRefereeId?: string;
  fraudType: 'SELF_REFERRAL' | 'DUPLICATE_ACCOUNT' | 'PROXY_VPN' | 'RAPID_BURST' | 'MULTIPLE_IP';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionTaken: 'BLOCKED' | 'FLAGGED' | 'SUSPENDED' | 'MONITORED';
  details: string;
  ipAddress: string;
  timestamp: string;
  resolved: boolean;
}

export interface ReferralLeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  username: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnedUSDT: number;
  tier: ReferralTierLevel;
  tierName: string;
}

export interface ReferralSystemStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  claimedReferrals: number;
  rewardBalanceUSDT: number; // Available to withdraw / claim
  totalEarnedUSDT: number;
  todayEarnedUSDT: number;
  currentTier: ReferralTierLevel;
  currentTierName: string;
  nextTierRemaining: number;
  conversionRate: number;
  referredBy?: {
    username: string;
    name: string;
    code: string;
    joinedAt?: string;
  };
}

export interface ReferralAdminConfig {
  minWithdrawalUSDT: number;
  minAccountAgeDays: number;
  requireKycForWithdrawal: boolean;
  baseRewardUSDT: number;
  tierRates: {
    tier1Reward: number;
    tier1Bonus: number;
    tier2Reward: number;
    tier2Bonus: number;
    tier3Reward: number;
    tier3Bonus: number;
    tier4Reward: number;
    tier4Bonus: number;
  };
  commissionRates: {
    A: number; // e.g. 0.5%
    B: number; // e.g. 0.25%
    C: number; // e.g. 0.225%
  };
  antiFraudEnabled: boolean;
  maxHourlyReferralsPerIp: number;
}
