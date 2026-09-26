export type SpinPrizeType = 'USDT' | 'APR_BOOST' | 'EXTRA_SPIN' | 'COMMISSION_BOOST' | 'TRY_AGAIN' | 'LOSS';

export interface SpinSlice {
  id: string;
  sliceIndex: number;
  label: string;
  sublabel?: string;
  prizeType: SpinPrizeType;
  prizeValue: number; // multiplier or base USDT value, e.g. 2 for 2x, 0 for loss, 50 for 50x Jackpot
  multiplier?: number;
  weight: number;     // Relative weight for weighted RNG
  probabilityPercent?: number; // Computed probability
  colorBg: string;    // Slice background hex/gradient
  colorText: string;  // Text color
  accentColor: string;// Border/glow accent
  iconName: string;   // Lucide icon identifier
  isJackpot?: boolean;
}

export interface UserSpinState {
  userId: string;
  availableSpins: number;
  dailySpinsRemaining: number;
  lastDailySpinAt: string | null;
  nextDailySpinAt: string | null;
  canClaimDailySpin: boolean;
  referralSpins: number;
  purchasedSpins: number;
  lifetimeSpinsCount: number;
  totalWonUsdt: number;
  totalBetUsdt?: number;
  activeAprBoostPercent: number; // Active temporary yield boost
  aprBoostExpiresAt: string | null;
}

export interface SpinResult {
  id: string;
  userId: string;
  sliceIndex: number;
  slice: SpinSlice;
  prizeType: SpinPrizeType;
  prizeValue: number;
  prizeText: string;
  betAmount: number;
  wonAmount: number;
  isWin: boolean;
  newBalance?: number;
  spinsRemaining: number;
  createdAt: string;
  transactionId?: string;
}

export interface RecentWinnerFeedItem {
  id: string;
  username: string;
  prizeLabel: string;
  prizeType: SpinPrizeType;
  prizeValue: number;
  timeAgo: string;
  isJackpot?: boolean;
}

export interface SpinAdminConfig {
  dailyFreeSpinsPerLevel: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
  referralRewardSpinsPerDeposit: number;
  isWheelActive: boolean;
  minBetUsdt: number; // Min activation/stake amount (1 USDT)
  maxBetUsdt: number; // Max activation/stake amount (100 USDT)
  maxDailyPrizesUsdtCap: number;
  todayPrizesDistributedUsdt: number;
  jackpotNotificationThreshold: number;
}

