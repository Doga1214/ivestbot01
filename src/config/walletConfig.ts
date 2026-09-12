export const WALLET_CONFIG = {
  depositAddress1: 'THSahZbPSUspYRKmEQgrKb3NXutckSBXsZ',
  depositAddress1Network: 'TRC20 (USDT)',
  depositAddress2: '0x1c16D0cf66e717dF73706a9d4bf923b1cafCaee7',
  depositAddress2Network: 'ERC20 / BEP20 (USDT)',
  currency: 'USDT',
  doublingDays: 100, // Principle doubles in 100 days at 1.000% per day (100% net profit)
  defaultDailyRate: 1.0, // 1.000% per 24-hour reservation cycle
  referralRates: {
    A: 0.1, // 0.1% commission for direct A members
    B: 0.05, // 0.05% commission for secondary B members
    C: 0.025  // 0.025% commission for tertiary C members
  },
  depositBonusRatio: {
    unitDeposit: 10, // per 10 USDT deposited
    sponsorBonusPerUnit: 0.2, // Proportional sponsor referral reward
    newUserBonusPerUnit: 0, // 0 USDT (No welcome bonus - only referral rewards)
    minDeposit: 10, // Lowered minimum reservation/deposit floor
    maxDeposit: 50000
  },
  processingDurationSeconds: 20, // 20-second processing period
  reservationLockHours: 24, // 24-hour cycle (1 reservation per 24 hours)

  // Multi-network withdrawal options and limits
  minWithdrawalUSDT: 10,
  maxWithdrawalUSDT: 50000,
  withdrawalNetworks: [
    {
      id: 'TRC20',
      name: 'Tron (TRC20)',
      fee: 1.0,
      minWithdrawal: 10,
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
      minWithdrawal: 10,
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
      minWithdrawal: 20,
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
      minWithdrawal: 10,
      currency: 'USDT',
      badgeColor: '#8B5CF6',
      explorerTxUrl: 'https://polygonscan.com/tx/',
      addressPattern: '^0x[a-fA-F0-9]{40}$',
      hint: 'Address must start with "0x" (42 characters)'
    }
  ],

  // Multi-Tier Referral System Configuration (All values in USDT)
  referralSystem: {
    minWithdrawalUSDT: 50,
    minAccountAgeDays: 0,
    requireKycForWithdrawal: false,
    baseRewardUSDT: 1, // 1 USDT per qualified referral
    tiers: [
      {
        tier: 1 as const,
        name: 'Bronze Ambassador',
        minReferrals: 0,
        maxReferrals: 10,
        rewardPerReferralUSDT: 1,
        tierBonusUSDT: 5,
        badgeColor: '#CD7F32',
        benefits: ['1 USDT per active referral', '5 USDT Tier 1 Unlock Bonus', '0.1% Direct Level A Commission']
      },
      {
        tier: 2 as const,
        name: 'Silver Partner',
        minReferrals: 11,
        maxReferrals: 25,
        rewardPerReferralUSDT: 1.5,
        tierBonusUSDT: 10,
        badgeColor: '#C0C0C0',
        benefits: ['1.5 USDT per active referral', '10 USDT Tier 2 Milestone Bonus', '+0.05% Level B Indirect Commission']
      },
      {
        tier: 3 as const,
        name: 'Gold Leader',
        minReferrals: 26,
        maxReferrals: 50,
        rewardPerReferralUSDT: 2,
        tierBonusUSDT: 20,
        badgeColor: '#FFD700',
        benefits: ['2 USDT per active referral', '20 USDT Tier 3 Milestone Bonus', '+0.025% Level C Indirect Commission']
      },
      {
        tier: 4 as const,
        name: 'Diamond VIP',
        minReferrals: 51,
        maxReferrals: 999999,
        rewardPerReferralUSDT: 3,
        tierBonusUSDT: 50,
        badgeColor: '#00E5FF',
        benefits: ['3 USDT per active referral', '50 USDT Diamond Cash Reward', 'VIP Priority Payouts & Private Account Manager']
      }
    ]
  }
};

