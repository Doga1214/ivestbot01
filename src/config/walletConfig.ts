export const WALLET_CONFIG = {
  depositAddress1: 'THSahZbPSUspYRKmEQgrKb3NXutckSBXsZ',
  depositAddress1Network: 'TRC20 (USDT)',
  depositAddress2: '0x1c16D0cf66e717dF73706a9d4bf923b1cafCaee7',
  depositAddress2Network: 'ERC20 / BEP20 (USDT)',
  currency: 'USDT',
  doublingDays: 35, // Principle amount doubles in 35 days (100% profit / 35 = 2.8571% per day)
  defaultDailyRate: 2.8571, // 2.8571% per 24-hour reservation cycle (100% in 35 days)
  referralRates: {
    A: 0.5, // 0.5% commission for direct A members
    B: 0.25, // 0.25% commission for secondary B members
    C: 0.225  // 0.225% commission for tertiary C members
  },
  depositBonusRatio: {
    unitDeposit: 50, // per 50 USDT deposited
    sponsorBonusPerUnit: 5, // 5 USDT sponsor referral reward per 50 USDT
    newUserBonusPerUnit: 0, // 0 USDT (No welcome bonus - only referral rewards)
    minDeposit: 50,
    maxDeposit: 1000
  },
  processingDurationSeconds: 20, // 20-second processing period
  reservationLockHours: 24, // 24-hour cycle (1 reservation per 24 hours)

  // Multi-network withdrawal options and limits
  minWithdrawalUSDT: 100,
  maxWithdrawalUSDT: 50000,
  withdrawalNetworks: [
    {
      id: 'TRC20',
      name: 'Tron (TRC20)',
      fee: 1.0,
      minWithdrawal: 100,
      currency: 'USDT',
      badgeColor: '#EF4444',
      explorerTxUrl: 'https://tronscan.org/#/transaction/',
      addressPattern: '^T[1-9A-HJ-NP-za-km-z]{33}$',
      hint: 'Address must start with "T" (34 characters)'
    },
    {
      id: 'BEP20',
      name: 'BNB Smart Chain (BEP20)',
      fee: 0.8,
      minWithdrawal: 100,
      currency: 'USDT',
      badgeColor: '#F59E0B',
      explorerTxUrl: 'https://bscscan.com/tx/',
      addressPattern: '^0x[a-fA-F0-9]{40}$',
      hint: 'Address must start with "0x" (42 characters)'
    },
    {
      id: 'ERC20',
      name: 'Ethereum (ERC20)',
      fee: 4.5,
      minWithdrawal: 100,
      currency: 'USDT',
      badgeColor: '#6366F1',
      explorerTxUrl: 'https://etherscan.io/tx/',
      addressPattern: '^0x[a-fA-F0-9]{40}$',
      hint: 'Address must start with "0x" (42 characters)'
    },
    {
      id: 'POLYGON',
      name: 'Polygon (POS)',
      fee: 0.5,
      minWithdrawal: 100,
      currency: 'USDT',
      badgeColor: '#8B5CF6',
      explorerTxUrl: 'https://polygonscan.com/tx/',
      addressPattern: '^0x[a-fA-F0-9]{40}$',
      hint: 'Address must start with "0x" (42 characters)'
    }
  ],

  // Multi-Tier Referral System Configuration (All values in USDT)
  referralSystem: {
    minWithdrawalUSDT: 100,
    minAccountAgeDays: 0,
    requireKycForWithdrawal: false,
    baseRewardUSDT: 5, // 5 USDT per qualified referral
    tiers: [
      {
        tier: 1 as const,
        name: 'Bronze Ambassador',
        minReferrals: 0,
        maxReferrals: 10,
        rewardPerReferralUSDT: 5,
        tierBonusUSDT: 25,
        badgeColor: '#CD7F32',
        benefits: ['5 USDT per active referral', '25 USDT Tier 1 Unlock Bonus', '0.5% Direct Level A Commission']
      },
      {
        tier: 2 as const,
        name: 'Silver Partner',
        minReferrals: 11,
        maxReferrals: 25,
        rewardPerReferralUSDT: 7.5,
        tierBonusUSDT: 50,
        badgeColor: '#C0C0C0',
        benefits: ['7.5 USDT per active referral', '50 USDT Tier 2 Milestone Bonus', '+0.25% Level B Indirect Commission']
      },
      {
        tier: 3 as const,
        name: 'Gold Leader',
        minReferrals: 26,
        maxReferrals: 50,
        rewardPerReferralUSDT: 10,
        tierBonusUSDT: 100,
        badgeColor: '#FFD700',
        benefits: ['10 USDT per active referral', '100 USDT Tier 3 Milestone Bonus', '+0.225% Level C Indirect Commission']
      },
      {
        tier: 4 as const,
        name: 'Diamond VIP',
        minReferrals: 51,
        maxReferrals: 999999,
        rewardPerReferralUSDT: 15,
        tierBonusUSDT: 250,
        badgeColor: '#00E5FF',
        benefits: ['15 USDT per active referral', '250 USDT Diamond Cash Reward', 'VIP Priority Payouts & Private Account Manager']
      }
    ]
  }
};

