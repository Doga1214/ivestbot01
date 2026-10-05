import { assert, TestRunner } from './testHelper.ts';
import { reservationService } from '../src/services/reservationService.ts';
import { walletService } from '../src/services/walletService.ts';

export async function runReservationServiceTests(runner: TestRunner) {
  runner.suite('Services - ReservationService');

  await runner.test('calculateProRataYield: should calculate linear proportional profit', () => {
    // 24 hours full cycle with 1000 USDT at 2.58%
    const full = reservationService.calculateProRataYield(1000, 86400, 2.58);
    assert.strictEqual(full.effectiveRate, 2.58);
    assert.strictEqual(full.profit, 25.8);
    assert.strictEqual(full.is24hComplete, true);
    assert.strictEqual(full.progressPercent, 100);

    // 12 hours half cycle with 1000 USDT at 2.58%
    const half = reservationService.calculateProRataYield(1000, 43200, 2.58);
    assert.strictEqual(half.effectiveRate, 1.29);
    assert.strictEqual(half.profit, 12.9);
    assert.strictEqual(half.is24hComplete, false);
    assert.strictEqual(half.progressPercent, 50);

    // 0 seconds
    const zero = reservationService.calculateProRataYield(1000, 0, 2.58);
    assert.strictEqual(zero.effectiveRate, 0);
    assert.strictEqual(zero.profit, 0);
  });

  await runner.test('startMining -> stopMining -> initiateSettlement -> finalizeSettlement lifecycle', () => {
    localStorage.clear();

    // 1. Setup wallet balance
    walletService.saveWallet({
      totalBalance: 500,
      availableBalance: 500,
      pendingBalance: 0,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true }
    });

    // 2. Start mining
    const startRes = reservationService.startMining(500);
    assert.strictEqual(startRes.success, true);
    assert.strictEqual(reservationService.getReservationState().isMining, true);

    // 3. Stop mining after 43200s (12h) -> half rate = 1.50% / 2 = 0.75%
    const prepared = reservationService.stopMiningAndPrepareReservation(43200);
    assert.strictEqual(reservationService.getReservationState().isMining, false);
    assert.strictEqual(prepared.amount, 500);
    assert.strictEqual(prepared.effectiveRate, 0.75);
    assert.strictEqual(prepared.profit, 3.75);

    // 4. Initiate settlement
    const record = reservationService.initiateSettlementExecution(prepared);
    assert.strictEqual(record.status, 'PROCESSING');
    assert.strictEqual(record.profit, 3.75);

    // 5. Finalize settlement
    const finalizeRes = reservationService.finalizeSettlement(record);
    assert.strictEqual(finalizeRes.completedRecord.status, 'COMPLETED');
    assert.strictEqual(finalizeRes.updatedWallet.availableBalance, 503.75);
    assert.strictEqual(finalizeRes.updatedWallet.totalBalance, 503.75);

    // 6. Verify 24-hr cycle lock is now active
    const lock = reservationService.getCycleLockStatus();
    assert.strictEqual(lock.isLocked, true);
    assert.ok(lock.secondsRemaining > 86000);

    // Cannot start new mining while locked
    const lockedStart = reservationService.startMining(500);
    assert.strictEqual(lockedStart.success, false);

    // 7. Reset cooldown (Admin tool)
    reservationService.resetCycleCooldown();
    const lockAfterReset = reservationService.getCycleLockStatus();
    assert.strictEqual(lockAfterReset.isLocked, false);
    assert.strictEqual(lockAfterReset.secondsRemaining, 0);
  });

  await runner.test('executeReservation directly: correctly credits profit to main balance without replacing it', () => {
    localStorage.clear();

    const initialBalance = 250;
    walletService.saveWallet({
      totalBalance: initialBalance,
      availableBalance: initialBalance,
      pendingBalance: 0,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true }
    });

    const calculatedProfit = 2.5; // 1% of 250
    const record = reservationService.initiateSettlementExecution({
      amount: initialBalance,
      dailyRate: 1.0,
      effectiveRate: 1.0,
      activeDurationSeconds: 86400,
      profit: calculatedProfit,
      isFullCycle: true,
      preparedAt: new Date().toISOString()
    });

    const { updatedWallet, completedRecord } = reservationService.finalizeSettlement(record);
    assert.strictEqual(completedRecord.status, 'COMPLETED');
    assert.strictEqual(completedRecord.amount, 250);
    assert.strictEqual(completedRecord.profit, 2.5);

    // Main balance MUST now be 252.5 (250 + 2.5) and NOT 250 or replaced by reservation amount
    assert.strictEqual(updatedWallet.availableBalance, 252.5);
    assert.strictEqual(updatedWallet.totalBalance, 252.5);

    const postState = reservationService.getReservationState();
    assert.strictEqual(postState.lastCompletedReservation?.amount, 250);
    assert.strictEqual(postState.lastCompletedReservation?.profit, 2.5);

    const postWallet = walletService.getWallet();
    assert.strictEqual(postWallet.availableBalance, 252.5);
    assert.strictEqual(postWallet.totalBalance, 252.5);
  });
}
