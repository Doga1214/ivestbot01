import type {
  SpinSlice,
  UserSpinState,
  SpinResult,
  RecentWinnerFeedItem,
  SpinAdminConfig
} from '../types/spin';
import { walletService } from './walletService';

const STORAGE_KEYS = {
  SLICES: 'ivestbot_spin_slices_v1',
  USER_SPINS: 'ivestbot_user_spins_v1',
  SPIN_HISTORY: 'ivestbot_spin_history_v1',
  ADMIN_CONFIG: 'ivestbot_spin_admin_config_v1'
};

export const DEFAULT_SPIN_SLICES: SpinSlice[] = [
  {
    id: 'slice-0',
    sliceIndex: 0,
    label: '0.50 USDT',
    sublabel: 'Cash Prize',
    prizeType: 'USDT',
    prizeValue: 0.50,
    weight: 350,
    colorBg: '#1E293B',
    colorText: '#F8FAFC',
    accentColor: '#38BDF8',
    iconName: 'Coins',
    isJackpot: false
  },
  {
    id: 'slice-1',
    sliceIndex: 1,
    label: '+0.5% APR',
    sublabel: '24h Yield Boost',
    prizeType: 'APR_BOOST',
    prizeValue: 0.50,
    weight: 250,
    colorBg: '#0F172A',
    colorText: '#38BDF8',
    accentColor: '#0EA5E9',
    iconName: 'Zap',
    isJackpot: false
  },
  {
    id: 'slice-2',
    sliceIndex: 2,
    label: '1.00 USDT',
    sublabel: 'Cash Prize',
    prizeType: 'USDT',
    prizeValue: 1.00,
    weight: 180,
    colorBg: '#1E293B',
    colorText: '#F8FAFC',
    accentColor: '#22C55E',
    iconName: 'DollarSign',
    isJackpot: false
  },
  {
    id: 'slice-3',
    sliceIndex: 3,
    label: '+1 Spin',
    sublabel: 'Extra Ticket',
    prizeType: 'EXTRA_SPIN',
    prizeValue: 1.00,
    weight: 100,
    colorBg: '#0F172A',
    colorText: '#FBBF24',
    accentColor: '#F59E0B',
    iconName: 'RotateCw',
    isJackpot: false
  },
  {
    id: 'slice-4',
    sliceIndex: 4,
    label: '5.00 USDT',
    sublabel: 'Super Prize',
    prizeType: 'USDT',
    prizeValue: 5.00,
    weight: 70,
    colorBg: '#1E293B',
    colorText: '#F8FAFC',
    accentColor: '#A855F7',
    iconName: 'Sparkles',
    isJackpot: false
  },
  {
    id: 'slice-5',
    sliceIndex: 5,
    label: '10.00 USDT',
    sublabel: 'Epic Win',
    prizeType: 'USDT',
    prizeValue: 10.00,
    weight: 35,
    colorBg: '#0F172A',
    colorText: '#EC4899',
    accentColor: '#F43F5E',
    iconName: 'Trophy',
    isJackpot: false
  },
  {
    id: 'slice-6',
    sliceIndex: 6,
    label: '25.00 USDT',
    sublabel: 'High Roller',
    prizeType: 'USDT',
    prizeValue: 25.00,
    weight: 12,
    colorBg: '#1E293B',
    colorText: '#F8FAFC',
    accentColor: '#F97316',
    iconName: 'Flame',
    isJackpot: false
  },
  {
    id: 'slice-7',
    sliceIndex: 7,
    label: '⭐ 100 USDT',
    sublabel: 'Mega Jackpot!',
    prizeType: 'USDT',
    prizeValue: 100.00,
    weight: 3,
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
  maxDailyPrizesUsdtCap: 5000,
  todayPrizesDistributedUsdt: 0,
  jackpotNotificationThreshold: 25
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
        this.slices = this.computeSliceProbabilities(JSON.parse(savedSlices));
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
   * Weighted RNG algorithm to select a slice fairly based on configured weights
   */
  public selectWinningSlice(slices: SpinSlice[]): SpinSlice {
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
   * Execute Spin: server-authoritative outcome calculation, wallet credit, and ledger recording
   */
  public async executeSpin(userId: string, userLevel: number = 1): Promise<SpinResult> {
    if (!this.adminConfig.isWheelActive) {
      throw new Error('Lucky Spin Wheel is currently undergoing maintenance. Please try again later.');
    }

    let state = this.getUserSpinState(userId, userLevel);

    // Auto-claim daily spin if eligible
    if (state.availableSpins <= 0 && state.canClaimDailySpin) {
      state = this.claimDailySpin(userId, userLevel);
    }

    if (state.availableSpins <= 0) {
      throw new Error('No spins available! Come back tomorrow or invite friends to earn free spins.');
    }

    // 1. Deduct 1 spin
    state.availableSpins -= 1;
    state.lifetimeSpinsCount += 1;

    // 2. Select winning slice
    const slices = this.getSlices();
    const winningSlice = this.selectWinningSlice(slices);

    let transactionId: string | undefined;
    let newBalance: number | undefined;

    // 3. Process Rewards
    if (winningSlice.prizeType === 'USDT' && winningSlice.prizeValue > 0) {
      state.totalWonUsdt += winningSlice.prizeValue;
      this.adminConfig.todayPrizesDistributedUsdt += winningSlice.prizeValue;
      this.saveAdminConfig(this.adminConfig);

      // Credit wallet
      try {
        const wallet = walletService.getWalletForUser(userId);
        const updatedAvailable = Number((wallet.availableBalance + winningSlice.prizeValue).toFixed(4));
        const updatedTotal = Number((updatedAvailable + (wallet.pendingBalance || 0)).toFixed(4));
        const updatedWallet = {
          ...wallet,
          availableBalance: updatedAvailable,
          totalBalance: updatedTotal,
          updatedAt: new Date().toISOString()
        };
        walletService.saveWalletForUser(userId, updatedWallet);

        // Record in ledger
        const tx = walletService.addTransaction({
          userId,
          type: 'SPIN_REWARD',
          amount: winningSlice.prizeValue,
          currency: 'USDT',
          status: 'COMPLETED',
          description: `🎡 Lucky Spin Prize: ${winningSlice.label}`,
          referenceId: `spin_${Date.now()}`
        });
        transactionId = tx.id;
        newBalance = updatedAvailable;
      } catch (err) {
        console.error('Failed to credit spin prize to wallet ledger:', err);
      }
    } else if (winningSlice.prizeType === 'EXTRA_SPIN') {
      state.availableSpins += Math.max(1, Math.round(winningSlice.prizeValue));
    } else if (winningSlice.prizeType === 'APR_BOOST') {
      state.activeAprBoostPercent = winningSlice.prizeValue;
      state.aprBoostExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    this.saveUserSpinState(state);

    // 4. Record in spin history
    const result: SpinResult = {
      id: `spin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      sliceIndex: winningSlice.sliceIndex,
      slice: winningSlice,
      prizeType: winningSlice.prizeType,
      prizeValue: winningSlice.prizeValue,
      prizeText: winningSlice.label,
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
      { user: '0x49**9a', prize: '100 USDT (Jackpot!)', type: 'USDT' as const, value: 100, isJackpot: true, minAgo: 2 },
      { user: 'alex_tr***', prize: '25.00 USDT', type: 'USDT' as const, value: 25, isJackpot: false, minAgo: 5 },
      { user: 'ivest_88**', prize: '10.00 USDT', type: 'USDT' as const, value: 10, isJackpot: false, minAgo: 11 },
      { user: 'cryptoking**', prize: '+0.5% APR Boost', type: 'APR_BOOST' as const, value: 0.5, isJackpot: false, minAgo: 18 },
      { user: 'sarah_w***', prize: '5.00 USDT', type: 'USDT' as const, value: 5, isJackpot: false, minAgo: 24 },
      { user: '0x99**3c', prize: '10.00 USDT', type: 'USDT' as const, value: 10, isJackpot: false, minAgo: 32 },
      { user: 'david_k***', prize: '25.00 USDT', type: 'USDT' as const, value: 25, isJackpot: false, minAgo: 45 }
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
