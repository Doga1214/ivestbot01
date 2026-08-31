export const WALLET_CONFIG = {
  depositAddress1: 'THSahZbPSUspYRKmEQgrKb3NXutckSBXsZ',
  depositAddress1Network: 'TRC20 (USDT)',
  depositAddress2: '0x1c16D0cf66e717dF73706a9d4bf923b1cafCaee7',
  depositAddress2Network: 'ERC20 / BEP20 (USDT)',
  currency: 'USDT',
  doublingDays: 35, // Principle amount doubles in 35 days (100% profit / 35 = 2.8571% per day)
  defaultDailyRate: 2.8571, // 2.8571% per 24-hour reservation cycle (100% in 35 days)
  referralRates: {
    A: 1.0, // 1% commission for direct A members
    B: 0.5, // 0.5% commission for secondary B members
    C: 0.5  // 0.5% commission for tertiary C members
  },
  depositBonusRatio: {
    unitDeposit: 50, // per 50 USDT deposited
    sponsorBonusPerUnit: 5, // 5 USDT sponsor bonus per 50 USDT
    newUserBonusPerUnit: 1, // 1 USDT new user welcome bonus per 50 USDT
    minDeposit: 50,
    maxDeposit: 1000
  },
  processingDurationSeconds: 20, // 20-second processing period
  reservationLockHours: 24 // 24-hour cycle (1 reservation per 24 hours)
};
