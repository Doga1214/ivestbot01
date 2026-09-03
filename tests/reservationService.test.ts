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

    // 3. Stop mining after 43200s (12h) -> half rate = 2.8571 / 2 = 1.4285%
    const prepared = reservationService.stopMiningAndPrepareReservation(43200);
    assert.strictEqual(reservationService.getReservationState().isMining, false);
    assert.strictEqual(prepared.amount, 500);
    assert.strictEqual(prepared.effectiveRate, 1.4285);
    assert.strictEqual(prepared.profit, 7.1425);

    // 4. Initiate settlement
    const record = reservationService.initiateSettlementExecution(prepared);
    assert.strictEqual(record.status, 'PROCESSING');
    assert.strictEqual(record.profit, 7.1425);

    // 5. Finalize settlement
    const finalizeRes = reservationService.finalizeSettlement(record);
    assert.strictEqual(finalizeRes.completedRecord.status, 'COMPLETED');
    assert.strictEqual(finalizeRes.updatedWallet.availableBalance, 507.1425);
    assert.strictEqual(finalizeRes.updatedWallet.totalBalance, 507.1425);

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
}
