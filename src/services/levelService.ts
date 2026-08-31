export interface LevelRequirements {
  level: number;
  title: string;
  minWalletUSDT: number;
  requiredAMembers: number;
  requiredBCMembers?: number;
  requiredLevel2Members?: number;
  requiredLevel3Members?: number;
}

export const LEVEL_DEFINITIONS: Record<number, LevelRequirements> = {
  1: {
    level: 1,
    title: 'Level 1 Trader',
    minWalletUSDT: 100,
    requiredAMembers: 0,
    requiredBCMembers: 0
  },
  2: {
    level: 2,
    title: 'Level 2 Leader',
    minWalletUSDT: 400,
    requiredAMembers: 3,
    requiredBCMembers: 4
  },
  3: {
    level: 3,
    title: 'Level 3 Master',
    minWalletUSDT: 1500,
    requiredAMembers: 8,
    requiredLevel2Members: 5,
    requiredBCMembers: 32
  },
  4: {
    level: 4,
    title: 'Level 4 Partner',
    minWalletUSDT: 2500,
    requiredAMembers: 20,
    requiredLevel2Members: 10,
    requiredLevel3Members: 3,
    requiredBCMembers: 60
  }
};

export const levelService = {
  getLevelRequirements(level: number): LevelRequirements {
    return LEVEL_DEFINITIONS[level] || LEVEL_DEFINITIONS[1];
  },

  getAllLevelRequirements(): LevelRequirements[] {
    return Object.values(LEVEL_DEFINITIONS);
  },

  calculateUserLevel(stats: {
    walletBalance: number;
    aMembers: number;
    bMembers: number;
    cMembers: number;
    level2Members?: number;
    level3Members?: number;
  }): number {
    const bcTotal = stats.bMembers + stats.cMembers;
    const l2 = stats.level2Members || 0;
    const l3 = stats.level3Members || 0;

    // Check Level 4
    if (
      stats.walletBalance >= 2500 &&
      stats.aMembers >= 20 &&
      l2 >= 10 &&
      l3 >= 3 &&
      bcTotal >= 60
    ) {
      return 4;
    }

    // Check Level 3
    if (
      stats.walletBalance >= 1500 &&
      stats.aMembers >= 8 &&
      l2 >= 5 &&
      bcTotal >= 32
    ) {
      return 3;
    }

    // Check Level 2
    if (
      stats.walletBalance >= 400 &&
      stats.aMembers >= 3 &&
      bcTotal >= 4
    ) {
      return 2;
    }

    // Default Level 1
    if (stats.walletBalance >= 100) {
      return 1;
    }

    return 1;
  },

  getLevelProgress(currentLevel: number, stats: {
    walletBalance: number;
    aMembers: number;
    bMembers: number;
    cMembers: number;
  }): { nextLevel: number | null; progressPercent: number; requirementsText: string[] } {
    if (currentLevel >= 4) {
      return {
        nextLevel: null,
        progressPercent: 100,
        requirementsText: ['Maximum VIP Level 4 achieved.']
      };
    }

    const nextLvl = currentLevel + 1;
    const target = LEVEL_DEFINITIONS[nextLvl];
    const bcTotal = stats.bMembers + stats.cMembers;

    const walletProgress = Math.min(1, stats.walletBalance / target.minWalletUSDT);
    const aProgress = target.requiredAMembers > 0 ? Math.min(1, stats.aMembers / target.requiredAMembers) : 1;
    const bcProgress = (target.requiredBCMembers || 0) > 0 ? Math.min(1, bcTotal / (target.requiredBCMembers || 1)) : 1;

    const progressPercent = Math.round(((walletProgress + aProgress + bcProgress) / 3) * 100);

    const requirementsText = [
      `Wallet Balance: ${stats.walletBalance.toFixed(2)} / ${target.minWalletUSDT} USDT`,
      `Direct (A) Members: ${stats.aMembers} / ${target.requiredAMembers}`,
      `Team (B+C) Members: ${bcTotal} / ${target.requiredBCMembers || 0}`
    ];

    return {
      nextLevel: nextLvl,
      progressPercent,
      requirementsText
    };
  }
};
