import type {
  SpinSlice,
  UserSpinState,
  SpinResult,
  RecentWinnerFeedItem,
  SpinAdminConfig,
  WhitelistedSpinUser
} from '../types/spin';
import { walletService } from './walletService';
import { authService } from './authService';

const STORAGE_KEYS = {
  SLICES: 'ivestbot_spin_slices_v2',
  USER_SPINS: 'ivestbot_user_spins_v2',
  SPIN_HISTORY: 'ivestbot_spin_history_v2',
  ADMIN_CONFIG: 'ivestbot_spin_admin_config_v2'
};

export const DEFAULT_SPIN_SLICES: SpinSlice[] = [
  {
    id: 'slice-0',
    sliceIndex: 0,
    label: '1.5x Win',
    sublabel: 'Cash Prize',
    prizeType: 'USDT',
    prizeValue: 1.5,
    weight: 260,
    colorBg: '#1E293B',
    colorText: '#F8FAFC',
    accentColor: '#38BDF8',
    iconName: 'Coins',
    isJackpot: false
  },
  {
    id: 'slice-1',
    sliceIndex: 1,
    label: '2x Loss',
    sublabel: 'No Win (Loss)',
    prizeType: 'LOSS',
    prizeValue: 0,
    weight: 300,
    colorBg: '#2D1517',
    colorText: '#F87171',
    accentColor: '#EF4444',
    iconName: 'TrendingDown',
    isJackpot: false
  },
  {
    id: 'slice-2',
    sliceIndex: 2,
    label: '2.0x Win',
    sublabel: 'Double Prize',
    prizeType: 'USDT',
    prizeValue: 2.0,
    weight: 200,
    colorBg: '#1E293B',
    colorText: '#F8FAFC',
    accentColor: '#22C55E',
    iconName: 'DollarSign',
    isJackpot: false
  },
  {
    id: 'slice-3',
    sliceIndex: 3,
    label: '+0.5% APR',
    sublabel: '24h Yield Boost',
    prizeType: 'APR_BOOST',
    prizeValue: 0.50,
    weight: 150,
    colorBg: '#0F172A',
    colorText: '#38BDF8',
    accentColor: '#0EA5E9',
    iconName: 'Zap',
    isJackpot: false
  },
  {
    id: 'slice-4',
    sliceIndex: 4,
    label: '0 USDT',
    sublabel: 'Try Again (Loss)',
    prizeType: 'TRY_AGAIN',
    prizeValue: 0,
    weight: 250,
    colorBg: '#2D1517',
    colorText: '#F87171',
    accentColor: '#EF4444',
    iconName: 'XCircle',
    isJackpot: false
  },
  {
    id: 'slice-5',
    sliceIndex: 5,
    label: '5.0x Win',
    sublabel: 'Super Prize',
    prizeType: 'USDT',
    prizeValue: 5.0,
    weight: 70,
    colorBg: '#1E293B',
    colorText: '#F8FAFC',
    accentColor: '#A855F7',
    iconName: 'Sparkles',
    isJackpot: false
  },
  {
    id: 'slice-6',
    sliceIndex: 6,
    label: '10x Win',
    sublabel: 'High Roller',
    prizeType: 'USDT',
    prizeValue: 10.0,
    weight: 25,
    colorBg: '#0F172A',
    colorText: '#EC4899',
    accentColor: '#F97316',
    iconName: 'Trophy',
    isJackpot: false
  },
  {
    id: 'slice-7',
    sliceIndex: 7,
    label: '⭐ 50x Mega Win',
    sublabel: 'Mega Jackpot!',
    prizeType: 'USDT',
    prizeValue: 50.0,
    weight: 4,
    colorBg: '#451A03',
    colorText: '#FEF08A',
    accentColor: '#EAB308',
    iconName: 'Crown',
    isJackpot: true
  }
];

export const DEFAULT_ADMIN_CONFIG: SpinAdminConfig = {
  dailyFreeSpinsPerLevel: {
    level1: 1,
    level2: 2,
    level3: 3,
    level4: 5
  },
  referralRewardSpinsPerDeposit: 1,
  isWheelActive: true,
  minBetUsdt: 1,
  maxBetUsdt: 100,
  maxDailyPrizesUsdtCap: 5000,
  todayPrizesDistributedUsdt: 0,
  jackpotNotificationThreshold: 25,
  // House Profit & Target User Win/Loss Control
  forceLossForRegularUsers: true, // Default: Everyone loses except targeted users
  forcedLossStrategy: 'RANDOM_LOSS',
  forcedLossSliceIndex: 1,
  // High Stake Auto-Loss (50+ USDT Stake = 100% Loss Guaranteed)
  autoLossOnHighStake: true,
  highStakeLossThreshold: 50,
  whitelistedProfitUsers: []
};


class LuckySpinService {
  private slices: SpinSlice[] = [];
  private adminConfig: SpinAdminConfig = DEFAULT_ADMIN_CONFIG;

  constructor() {
    this.loadState();
  }

  private getStorage(): Storage | null {
    if (typeof localStorage !== 'undefined') return localStorage;
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    return null;
  }

  private loadState(): void {
    const storage = this.getStorage();
    if (!storage) {
      this.slices = this.computeSliceProbabilities(DEFAULT_SPIN_SLICES);
      this.adminConfig = DEFAULT_ADMIN_CONFIG;
      return;
    }

    try {
      const savedSlices = storage.getItem(STORAGE_KEYS.SLICES);
      if (savedSlices) {
        let parsedSlices: SpinSlice[] = JSON.parse(savedSlices);
        // Auto-migrate legacy 'Better Luck!' label to '2x Loss'
        parsedSlices = parsedSlices.map((s) =>
          s.label === 'Better Luck!'
            ? { ...s, label: '2x Loss', colorBg: '#2D1517', colorText: '#F87171', accentColor: '#EF4444' }
            : s
        );
        this.slices = this.computeSliceProbabilities(parsedSlices);
        this.saveSlices(this.slices);
      } else {
        this.slices = this.computeSliceProbabilities(DEFAULT_SPIN_SLICES);
        this.saveSlices(this.slices);
      }

      const savedConfig = storage.getItem(STORAGE_KEYS.ADMIN_CONFIG);
      if (savedConfig) {
        this.adminConfig = { ...DEFAULT_ADMIN_CONFIG, ...JSON.parse(savedConfig) };
      } else {
        this.adminConfig = DEFAULT_ADMIN_CONFIG;
        this.saveAdminConfig(this.adminConfig);
      }
    } catch {
      this.slices = this.computeSliceProbabilities(DEFAULT_SPIN_SLICES);
      this.adminConfig = DEFAULT_ADMIN_CONFIG;
    }
  }


  public computeSliceProbabilities(slices: SpinSlice[]): SpinSlice[] {
    const totalWeight = slices.reduce((sum, s) => sum + Math.max(0, s.weight), 0);
    return slices.map(slice => ({
      ...slice,
      probabilityPercent: totalWeight > 0 ? Number(((slice.weight / totalWeight) * 100).toFixed(2)) : 0
    }));
  }

  public getSlices(): SpinSlice[] {
    if (!this.slices || this.slices.length === 0) {
      this.slices = this.computeSliceProbabilities(DEFAULT_SPIN_SLICES);
    }
    return this.slices;
  }

  public saveSlices(slices: SpinSlice[]): void {
    this.slices = this.computeSliceProbabilities(slices);
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(STORAGE_KEYS.SLICES, JSON.stringify(this.slices));
      } catch (err) {
        console.warn('Failed to save spin slices to storage', err);
      }
    }
  }

  public getAdminConfig(): SpinAdminConfig {
    return this.adminConfig;
  }

  public saveAdminConfig(config: SpinAdminConfig): void {
    this.adminConfig = config;
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(config));
      } catch (err) {
        console.warn('Failed to save spin admin config to storage', err);
      }
    }
  }

  public getUserSpinState(userId: string, userLevel: number = 1): UserSpinState {
    const now = new Date();
    const defaultDailySpins = this.getDailyAllowanceForLevel(userLevel);

    let state: UserSpinState = {
      userId,
      availableSpins: defaultDailySpins,
      dailySpinsRemaining: defaultDailySpins,
      lastDailySpinAt: null,
      nextDailySpinAt: null,
      canClaimDailySpin: true,
      referralSpins: 0,
      purchasedSpins: 0,
      lifetimeSpinsCount: 0,
      totalWonUsdt: 0,
      activeAprBoostPercent: 0,
      aprBoostExpiresAt: null
    };

    const storage = this.getStorage();
    if (storage) {
      try {
        const raw = storage.getItem(`${STORAGE_KEYS.USER_SPINS}_${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          state = { ...state, ...parsed };
        }
      } catch {
        // use default state
      }
    }

    // Check Daily Spin Cooldown (24 hours window)
    if (state.lastDailySpinAt) {
      const lastDate = new Date(state.lastDailySpinAt);
      const diffMs = now.getTime() - lastDate.getTime();
      const cooldownMs = 24 * 60 * 60 * 1000;

      if (diffMs >= cooldownMs) {
        // 24 hours have passed -> refresh daily spins
        state.canClaimDailySpin = true;
        state.dailySpinsRemaining = defaultDailySpins;
        state.nextDailySpinAt = null;
      } else {
        state.canClaimDailySpin = false;
        state.nextDailySpinAt = new Date(lastDate.getTime() + cooldownMs).toISOString();
      }
    } else {
      state.canClaimDailySpin = true;
      state.dailySpinsRemaining = defaultDailySpins;
    }

    // Check APR Boost Expiration
    if (state.aprBoostExpiresAt) {
      if (new Date(state.aprBoostExpiresAt).getTime() <= now.getTime()) {
        state.activeAprBoostPercent = 0;
        state.aprBoostExpiresAt = null;
      }
    }

    return state;
  }

  public saveUserSpinState(state: UserSpinState): void {
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(`${STORAGE_KEYS.USER_SPINS}_${state.userId}`, JSON.stringify(state));
      } catch (err) {
        console.warn('Failed to save user spin state', err);
      }
    }
  }

  public getDailyAllowanceForLevel(level: number): number {
    const config = this.adminConfig.dailyFreeSpinsPerLevel;
    switch (level) {
      case 2: return config.level2 || 2;
      case 3: return config.level3 || 3;
      case 4: return config.level4 || 5;
      case 1:
      default:
        return config.level1 || 1;
    }
  }

  /**
   * Claim daily free spin if 24-hour cooldown has elapsed
   */
  public claimDailySpin(userId: string, userLevel: number = 1): UserSpinState {
    const state = this.getUserSpinState(userId, userLevel);
    if (!state.canClaimDailySpin) {
      return state;
    }

    const allowance = this.getDailyAllowanceForLevel(userLevel);
    state.availableSpins += allowance;
    state.dailySpinsRemaining = allowance;
    state.lastDailySpinAt = new Date().toISOString();
    state.canClaimDailySpin = false;
    state.nextDailySpinAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    this.saveUserSpinState(state);
    return state;
  }

  /**
   * Grant bonus spins (e.g. from referral deposits, VIP promotions, or admin air-drops)
   */
  public grantBonusSpins(userId: string, count: number, reason: string = 'BONUS'): UserSpinState {
    const state = this.getUserSpinState(userId);
    state.availableSpins += count;
    if (reason === 'REFERRAL') {
      state.referralSpins += count;
    } else {
      state.purchasedSpins += count;
    }
    this.saveUserSpinState(state);
    return state;
  }

  /**
   * Outcome determination algorithm:
   * 1. Check if user is on the Whitelist for targeted profit / guaranteed wins.
   * 2. If user is NOT whitelisted and `forceLossForRegularUsers` is ON (House Profit Mode):
   *    -> Force wheel to land strictly on a LOSS or TRY_AGAIN slice!
   * 3. Otherwise, use fair weighted RNG.
   */
  /**
   * Outcome determination algorithm:
   * 1. Check if stake >= highStakeLossThreshold (default 50 USDT): Force 100% loss (high roller loss protection for house).
   * 2. Check if user is on the Whitelist for targeted profit / guaranteed wins.
   * 3. If user is NOT whitelisted and `forceLossForRegularUsers` is ON (House Profit Mode):
   *    -> Force wheel to land strictly on a LOSS or TRY_AGAIN slice!
   * 4. Otherwise, use fair weighted RNG.
   */
  public selectWinningSlice(slices: SpinSlice[], userId?: string, stake?: number): SpinSlice {
    if (!slices || slices.length === 0) return DEFAULT_SPIN_SLICES[0];

    // High Stake Auto-Loss Check (>= 50 USDT stakes guaranteed loss)
    const isHighStake = typeof stake === 'number' && stake >= (this.adminConfig.highStakeLossThreshold ?? 50);
    const autoLossActive = this.adminConfig.autoLossOnHighStake !== false;

    // Check Whitelist for Targeted Profit User
    let whitelistRule: WhitelistedSpinUser | undefined;
    if (userId && this.adminConfig.whitelistedProfitUsers && this.adminConfig.whitelistedProfitUsers.length > 0) {
      const allUsers = authService.getAllUsers();
      const userProfile = allUsers.find(
        (u) =>
          u.id === userId ||
          u.email?.toLowerCase() === userId.toLowerCase() ||
          u.username?.toLowerCase() === userId.toLowerCase()
      );

      const normalizedIds = [
        userId.toLowerCase().trim(),
        userProfile?.id?.toLowerCase()?.trim(),
        userProfile?.email?.toLowerCase()?.trim(),
        userProfile?.username?.toLowerCase()?.trim()
      ].filter(Boolean) as string[];

      whitelistRule = this.adminConfig.whitelistedProfitUsers.find(
        (w) =>
          w.isActive &&
          (normalizedIds.includes(w.userId?.toLowerCase()?.trim() || '') ||
            (w.email && normalizedIds.includes(w.email?.toLowerCase()?.trim() || '')) ||
            (w.username && normalizedIds.includes(w.username?.toLowerCase()?.trim() || '')))
      );
    }

    // 1. High Stake Force-Loss: If stake >= 50 USDT and user does not have explicit high-stake VIP override
    if (isHighStake && autoLossActive && (!whitelistRule || !whitelistRule.overrideHighStakeLoss)) {
      const lossSlices = slices.filter(
        (s) => s.prizeType === 'LOSS' || s.prizeType === 'TRY_AGAIN' || s.prizeValue <= 0
      );
      if (lossSlices.length > 0) {
        // Pick among loss slices (e.g. Better Luck or 0 USDT)
        const randIdx = Math.floor(Math.random() * lossSlices.length);
        return lossSlices[randIdx];
      }
    }

    // 2. Whitelisted user win logic (ADMIN SELECTED PROFIT USER)
    if (whitelistRule) {
      // If specific custom slice index is set
      if (whitelistRule.outcomeMode === 'CUSTOM_SLICE' && typeof whitelistRule.fixedSliceIndex === 'number') {
        const customSlice = slices.find((s) => s.sliceIndex === whitelistRule?.fixedSliceIndex);
        if (customSlice) return customSlice;
      }

      // If Mega Jackpot mode
      if (whitelistRule.outcomeMode === 'JACKPOT') {
        const jackpotSlice =
          slices.find((s) => s.isJackpot) ||
          [...slices].sort((a, b) => b.prizeValue - a.prizeValue)[0];
        if (jackpotSlice) return jackpotSlice;
      }

      // If High Win Rate (e.g. 90% or custom)
      if (whitelistRule.outcomeMode === 'HIGH_WIN_RATE') {
        const rate = whitelistRule.customWinRatePercent ?? 85;
        const roll = Math.random() * 100;
        if (roll > rate) {
          // rare loss
          const lossSlices = slices.filter(
            (s) => s.prizeType === 'LOSS' || s.prizeType === 'TRY_AGAIN' || s.prizeValue <= 0
          );
          if (lossSlices.length > 0) return lossSlices[Math.floor(Math.random() * lossSlices.length)];
        }
      }

      // Default for whitelisted user: Pick a WINNING slice (USDT cash multiplier or bonus)
      const winningSlices = slices.filter(
        (s) => s.prizeType !== 'LOSS' && s.prizeType !== 'TRY_AGAIN' && s.prizeValue > 0
      );
      if (winningSlices.length > 0) {
        const totalWinWeight = winningSlices.reduce((sum, s) => sum + Math.max(1, s.weight), 0);
        let rand = Math.random() * totalWinWeight;
        for (const ws of winningSlices) {
          if (rand < ws.weight) return ws;
          rand -= ws.weight;
        }
        return winningSlices[0];
      }
    }

    // 3. Regular users when "forceLossForRegularUsers" is active (Default / House Profit Mode)
    if (this.adminConfig.forceLossForRegularUsers) {
      const lossSlices = slices.filter(
        (s) => s.prizeType === 'LOSS' || s.prizeType === 'TRY_AGAIN' || s.prizeValue <= 0
      );

      if (lossSlices.length > 0) {
        // If admin specifically designated a slice index for losses
        if (
          this.adminConfig.forcedLossStrategy === 'SPECIFIC_SLICE' &&
          typeof this.adminConfig.forcedLossSliceIndex === 'number'
        ) {
          const specific = slices.find((s) => s.sliceIndex === this.adminConfig.forcedLossSliceIndex);
          if (specific) return specific;
        }

        // Otherwise pick randomly among loss slices (e.g. slice 1 'Better Luck!' or slice 4 '0 USDT')
        const randIdx = Math.floor(Math.random() * lossSlices.length);
        return lossSlices[randIdx];
      }
    }

    // 4. Fair weighted RNG fallback
    const totalWeight = slices.reduce((sum, s) => sum + Math.max(0, s.weight), 0);
    if (totalWeight <= 0) {
      return slices[0];
    }

    let random = Math.random() * totalWeight;
    for (const slice of slices) {
      if (random < slice.weight) {
        return slice;
      }
      random -= slice.weight;
    }
    return slices[slices.length - 1];
  }


  /**
   * Whitelist Management APIs
   */
  public addWhitelistedProfitUser(
    user: Omit<WhitelistedSpinUser, 'id' | 'createdAt'>
  ): WhitelistedSpinUser {
    const newItem: WhitelistedSpinUser = {
      ...user,
      id: `wl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const currentList = this.adminConfig.whitelistedProfitUsers || [];
    this.adminConfig.whitelistedProfitUsers = [
      newItem,
      ...currentList.filter((item) => item.userId.toLowerCase() !== user.userId.toLowerCase())
    ];
    this.saveAdminConfig(this.adminConfig);
    return newItem;
  }

  public updateWhitelistedProfitUser(id: string, updates: Partial<WhitelistedSpinUser>): void {
    const currentList = this.adminConfig.whitelistedProfitUsers || [];
    this.adminConfig.whitelistedProfitUsers = currentList.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.saveAdminConfig(this.adminConfig);
  }

  public removeWhitelistedProfitUser(id: string): void {
    const currentList = this.adminConfig.whitelistedProfitUsers || [];
    this.adminConfig.whitelistedProfitUsers = currentList.filter((item) => item.id !== id);
    this.saveAdminConfig(this.adminConfig);
  }

  public setGlobalForceLoss(forceLoss: boolean): void {
    this.adminConfig.forceLossForRegularUsers = forceLoss;
    this.saveAdminConfig(this.adminConfig);
  }

  /**
   * Execute Spin: server-authoritative outcome calculation, balance deduction, wallet credit, and ledger recording.
   * Direct USDT Stake Model: No free ticket limit, users can spin unlimited times by staking USDT.
   */
  public async executeSpin(userId: string, userLevel: number = 1, betAmount: number = 1): Promise<SpinResult> {
    if (!this.adminConfig.isWheelActive) {
      throw new Error('Lucky Spin Wheel is currently undergoing maintenance. Please try again later.');
    }

    const minBet = this.adminConfig.minBetUsdt || 1;
    const maxBet = this.adminConfig.maxBetUsdt || 100;
    const stake = Math.min(Math.max(Number(betAmount) || minBet, minBet), maxBet);

    let state = this.getUserSpinState(userId, userLevel);

    // Check user available balance for the required activation stake
    const currentWallet = walletService.getWalletForUser(userId);
    const availableBal = currentWallet.availableBalance || 0;
    if (availableBal < stake) {
      throw new Error(
        `Insufficient wallet balance! You need at least $${stake.toFixed(2)} USDT available (1 - 100 USDT) to spin the wheel.`
      );
    }

    // 1. Record spin count and stake in user state
    state.lifetimeSpinsCount = (state.lifetimeSpinsCount || 0) + 1;
    state.totalBetUsdt = (state.totalBetUsdt || 0) + stake;


    // 2. Deduct activation stake (1 - 100 USDT) from wallet
    const afterBetAvailable = Number(Math.max(0, availableBal - stake).toFixed(4));
    const afterBetTotal = Number(Math.max(0, (currentWallet.totalBalance || availableBal) - stake).toFixed(4));
    const debitedWallet = {
      ...currentWallet,
      availableBalance: afterBetAvailable,
      totalBalance: afterBetTotal,
      updatedAt: new Date().toISOString()
    };
    walletService.saveWalletForUser(userId, debitedWallet);

    walletService.addTransaction({
      userId,
      type: 'ADMIN_DEBIT',
      amount: stake,
      currency: 'USDT',
      status: 'COMPLETED',
      description: `🎡 Lucky Spin Stake Activation (-$${stake.toFixed(2)} USDT)`,
      referenceId: `spin_stake_${Date.now()}`
    });

    // 3. Select winning slice via authoritative targeted/house logic RNG
    const slices = this.getSlices();
    const winningSlice = this.selectWinningSlice(slices, userId, stake);


    let transactionId: string | undefined;
    let newBalance: number = afterBetAvailable;
    let wonAmount = 0;
    let isWin = false;

    // 4. Process Outcome (Wins vs Loss)
    const isLoss = winningSlice.prizeType === 'LOSS' || winningSlice.prizeType === 'TRY_AGAIN';

    if (isLoss) {
      isWin = false;
      wonAmount = 0;
    } else if (winningSlice.prizeType === 'USDT' && winningSlice.prizeValue > 0) {
      isWin = true;
      wonAmount = Number((winningSlice.prizeValue * stake).toFixed(4));
      state.totalWonUsdt += wonAmount;
      this.adminConfig.todayPrizesDistributedUsdt += wonAmount;
      this.saveAdminConfig(this.adminConfig);

      // Credit winnings back to wallet
      try {
        const finalAvailable = Number((afterBetAvailable + wonAmount).toFixed(4));
        const finalTotal = Number((afterBetTotal + wonAmount).toFixed(4));
        const creditedWallet = {
          ...debitedWallet,
          availableBalance: finalAvailable,
          totalBalance: finalTotal,
          updatedAt: new Date().toISOString()
        };
        walletService.saveWalletForUser(userId, creditedWallet);

        const tx = walletService.addTransaction({
          userId,
          type: 'SPIN_REWARD',
          amount: wonAmount,
          currency: 'USDT',
          status: 'COMPLETED',
          description: `🎡 Lucky Spin Won: ${winningSlice.label} (+$${wonAmount.toFixed(2)} USDT)`,
          referenceId: `spin_win_${Date.now()}`
        });
        transactionId = tx.id;
        newBalance = finalAvailable;
      } catch (err) {
        console.error('Failed to credit spin prize to wallet ledger:', err);
      }
    } else if (winningSlice.prizeType === 'EXTRA_SPIN') {
      isWin = true;
      state.availableSpins += Math.max(1, Math.round(winningSlice.prizeValue));
    } else if (winningSlice.prizeType === 'APR_BOOST') {
      isWin = true;
      state.activeAprBoostPercent = winningSlice.prizeValue;
      state.aprBoostExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    this.saveUserSpinState(state);

    // 5. Record in spin history
    const result: SpinResult = {
      id: `spin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      sliceIndex: winningSlice.sliceIndex,
      slice: winningSlice,
      prizeType: winningSlice.prizeType,
      prizeValue: winningSlice.prizeValue,
      prizeText: winningSlice.prizeType === 'USDT'
        ? `${winningSlice.label} ($${wonAmount.toFixed(2)} USDT)`
        : winningSlice.label,
      betAmount: stake,
      wonAmount,
      isWin,
      newBalance,
      spinsRemaining: state.availableSpins,
      createdAt: new Date().toISOString(),
      transactionId
    };

    this.logSpinHistory(result);

    return result;
  }

  private logSpinHistory(result: SpinResult): void {
    const storage = this.getStorage();
    if (!storage) return;
    try {
      const historyKey = `${STORAGE_KEYS.SPIN_HISTORY}_${result.userId}`;
      const existing = JSON.parse(storage.getItem(historyKey) || '[]');
      existing.unshift(result);
      if (existing.length > 50) existing.pop(); // keep last 50
      storage.setItem(historyKey, JSON.stringify(existing));
    } catch {
      // ignore
    }
  }

  public getUserSpinHistory(userId: string): SpinResult[] {
    const storage = this.getStorage();
    if (!storage) return [];
    try {
      const historyKey = `${STORAGE_KEYS.SPIN_HISTORY}_${userId}`;
      return JSON.parse(storage.getItem(historyKey) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Get dynamic recent winners for the live ticker feed
   */
  public getRecentWinners(): RecentWinnerFeedItem[] {
    const mockPrizes = [
      { user: '0x49**9a', prize: '50x Mega Jackpot ($500.00 USDT)', type: 'USDT' as const, value: 500, isJackpot: true, minAgo: 2 },
      { user: 'alex_tr***', prize: '10x Win ($100.00 USDT)', type: 'USDT' as const, value: 100, isJackpot: false, minAgo: 6 },
      { user: 'ivest_88**', prize: '5.0x Win ($50.00 USDT)', type: 'USDT' as const, value: 50, isJackpot: false, minAgo: 12 },
      { user: 'cryptoking**', prize: '+0.5% APR Boost', type: 'APR_BOOST' as const, value: 0.5, isJackpot: false, minAgo: 19 },
      { user: 'sarah_w***', prize: '2.0x Win ($20.00 USDT)', type: 'USDT' as const, value: 20, isJackpot: false, minAgo: 25 },
      { user: '0x99**3c', prize: '1.5x Win ($15.00 USDT)', type: 'USDT' as const, value: 15, isJackpot: false, minAgo: 33 },
      { user: 'david_k***', prize: '10x Win ($250.00 USDT)', type: 'USDT' as const, value: 250, isJackpot: false, minAgo: 45 }
    ];

    return mockPrizes.map((p, idx) => ({
      id: `win_${idx}`,
      username: p.user,
      prizeLabel: p.prize,
      prizeType: p.type,
      prizeValue: p.value,
      timeAgo: `${p.minAgo}m ago`,
      isJackpot: p.isJackpot
    }));
  }
}

export const luckySpinService = new LuckySpinService();
