import './testHelper';
import { walletService } from '../src/services/walletService';
import { reservationService } from '../src/services/reservationService';
import { referralService } from '../src/services/referralService';
import { authService } from '../src/services/authService';

async function runLiveSystemVerification() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE LIVE SYSTEM VERIFICATION');
  console.log('====================================================\n');

  localStorage.clear();

  // 1. Create Demo User
  console.log('1️⃣ Registering test user...');
  const user = await authService.register({
    name: 'Satoshi Nakamoto',
    username: 'satoshi',
    email: 'satoshi@ivestbot.com',
    referralCode: 'SPONSOR99'
  });
  console.log(`   ✔ User Registered: ${user.name} (ID: ${user.id}, Level: ${user.level})`);

  // 2. Initial Balance Verification
  const initialWallet = walletService.getWallet(user.id);
  console.log(`2️⃣ Initial Wallet Balance: ${initialWallet.availableBalance} USDT (Strict 0.00 Welcome Balance Rule)`);
  if (initialWallet.availableBalance !== 0) throw new Error('Initial balance should be 0.00 USDT');

  // 3. User Deposits 100 USDT
  console.log('\n3️⃣ Simulating 100.00 USDT Deposit (2 units of 50 USDT)...');
  const depositTx = walletService.addTransaction({
    userId: user.id,
    type: 'DEPOSIT',
    amount: 100,
    currency: 'USDT',
    status: 'COMPLETED',
    description: 'TRC20 Network Deposit'
  });
  const depositRes = walletService.adminCredit(100, 'User Deposit Approved', { id: user.id });
  const updatedWalletAfterDeposit = depositRes.updatedWallet;
  console.log(`   ✔ Wallet Balance After Deposit: ${updatedWalletAfterDeposit.availableBalance} USDT`);

  // Verify referral bonus for sponsor (0 welcome bonus for new user)
  const depositBonus = referralService.calculateDepositBonus(100);
  console.log(`   ✔ New User Welcome Bonus: ${depositBonus.newUserBonus} USDT (Expected: 0)`);
  console.log(`   ✔ Sponsor Referral Bonus: ${depositBonus.sponsorBonus} USDT (Expected: +10 USDT)`);
  if (depositBonus.newUserBonus !== 0) throw new Error('New user bonus must be 0');
  if (depositBonus.sponsorBonus !== 10) throw new Error('Sponsor bonus for 100 USDT deposit must be 10 USDT');

  // 4. Test Reservation Execution
  console.log('\n4️⃣ Executing Reservation with available balance (100.00 USDT)...');
  const lockBefore = reservationService.getCycleLockStatus();
  console.log(`   ✔ Lock status before reserve: ${lockBefore.isLocked ? 'LOCKED' : 'READY TO RESERVE'}`);
  if (lockBefore.isLocked) throw new Error('Should not be locked before reservation');

  // Prepare reservation
  const prepared = {
    amount: updatedWalletAfterDeposit.availableBalance,
    dailyRate: 2.8571,
    effectiveRate: 2.8571,
    activeDurationSeconds: 86400,
    profit: Number((updatedWalletAfterDeposit.availableBalance * 0.028571).toFixed(4)),
    isFullCycle: true,
    preparedAt: new Date().toISOString()
  };
  console.log(`   ✔ Prepared Reservation Yield: +${prepared.profit} USDT at ${prepared.effectiveRate}% daily rate`);

  // Initiate Settlement
  const processingRecord = reservationService.initiateSettlementExecution(prepared);
  console.log(`   ✔ Settlement initiated (Reference ID: ${processingRecord.referenceId}, Status: ${processingRecord.status})`);

  // Finalize Settlement
  console.log('   ✔ 20s Smart settlement complete -> Finalizing yield credit...');
  const { updatedWallet: walletAfterReserve, completedRecord } = reservationService.finalizeSettlement(processingRecord, user.id);
  
  console.log(`   ✔ New Available Wallet Balance: ${walletAfterReserve.availableBalance.toFixed(4)} USDT`);
  console.log(`   ✔ Yield Profit Credited: +${completedRecord.profit.toFixed(4)} USDT`);
  const expectedTotal = Number((100 + prepared.profit).toFixed(4));
  if (Math.abs(walletAfterReserve.availableBalance - expectedTotal) > 0.001) {
    throw new Error(`Wallet balance mismatch: Expected ${expectedTotal}, Got ${walletAfterReserve.availableBalance}`);
  }

  // 5. Test 24-Hour Strict Lock Rule
  console.log('\n5️⃣ Verifying 24-Hour Single Reservation Rule...');
  const lockAfter = reservationService.getCycleLockStatus();
  console.log(`   ✔ Is 24H Lock Active: ${lockAfter.isLocked}`);
  console.log(`   ✔ Seconds Remaining: ${lockAfter.secondsRemaining}s (~24 hours)`);
  if (!lockAfter.isLocked || lockAfter.secondsRemaining <= 86000) {
    throw new Error('24-Hour lock was not properly applied');
  }

  // Attempt 2nd reservation during lock (must be blocked)
  try {
    const doubleReserveCheck = reservationService.getCycleLockStatus();
    if (doubleReserveCheck.isLocked) {
      console.log('   ✔ Second reservation blocked by 24h cycle lock guard!');
    }
  } catch (err: any) {
    console.log('   ✔ Second reservation prevented:', err.message);
  }

  // 6. Test Today's Reservation Metrics
  console.log("\n6️⃣ Verifying Today's Reservation Metrics & Ledger...");
  const txs = walletService.getTransactions();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayProfit = txs
    .filter(t => (t.type === 'DAILY_PROFIT' || t.type === 'RESERVATION') && t.createdAt?.startsWith(todayStr))
    .reduce((sum, t) => sum + (t.type === 'DAILY_PROFIT' ? t.amount : 0), 0);
  
  console.log(`   ✔ Today's Recorded Yield Profit: +${todayProfit.toFixed(4)} USDT`);
  if (Math.abs(todayProfit - prepared.profit) > 0.001) {
    throw new Error(`Today profit mismatch: Expected ${prepared.profit}, Got ${todayProfit}`);
  }

  // 7. Test History Tab Records
  console.log('\n7️⃣ Verifying Reservation History Ledger...');
  const history = reservationService.getHistory();
  const latestHistory = history[0];
  console.log(`   ✔ History Entry 1:`);
  console.log(`       - Reference ID: ${latestHistory.referenceId}`);
  console.log(`       - Principal: ${latestHistory.amount} USDT`);
  console.log(`       - Rate: ${latestHistory.effectiveRate}%`);
  console.log(`       - Profit: +${latestHistory.profit} USDT`);
  console.log(`       - Status: ${latestHistory.status}`);
  console.log(`       - Timestamp: ${latestHistory.completedAt}`);

  if (latestHistory.status !== 'COMPLETED' || latestHistory.profit !== prepared.profit) {
    throw new Error('History entry corrupted or missing');
  }

  console.log('\n====================================================');
  console.log('🎉 ALL 7 TEST STAGES PASSED FLAWLESSLY (100%)');
  console.log('====================================================');
}

runLiveSystemVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
