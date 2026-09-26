import { assert, TestRunner } from './testHelper.ts';
import { luckySpinService, DEFAULT_SPIN_SLICES } from '../src/services/luckySpinService.ts';
import { walletService } from '../src/services/walletService.ts';

export async function runLuckySpinServiceTests(runner: TestRunner) {
  runner.suite('Services - LuckySpinService');

  await runner.test('computeSliceProbabilities: should calculate valid probabilities summing to ~100%', () => {
    const slices = luckySpinService.computeSliceProbabilities(DEFAULT_SPIN_SLICES);
    assert.strictEqual(slices.length, 8);
    
    const sum = slices.reduce((acc, s) => acc + (s.probabilityPercent || 0), 0);
    assert.ok(Math.abs(sum - 100) < 0.5, `Sum should be approximately 100%, got ${sum}%`);
  });

  await runner.test('getUserSpinState: returns correct default spins and level perks', () => {
    const testUserId = `user_spin_test_${Date.now()}`;
    const stateL1 = luckySpinService.getUserSpinState(testUserId, 1);
    assert.strictEqual(stateL1.availableSpins, 1);
    assert.strictEqual(stateL1.canClaimDailySpin, true);

    const allowanceL1 = luckySpinService.getDailyAllowanceForLevel(1);
    const allowanceL2 = luckySpinService.getDailyAllowanceForLevel(2);
    const allowanceL3 = luckySpinService.getDailyAllowanceForLevel(3);
    const allowanceL4 = luckySpinService.getDailyAllowanceForLevel(4);

    assert.strictEqual(allowanceL1, 1);
    assert.strictEqual(allowanceL2, 2);
    assert.strictEqual(allowanceL3, 3);
    assert.strictEqual(allowanceL4, 5);
  });

  await runner.test('claimDailySpin: enforces 24-hour cooldown after claim', () => {
    const testUserId = `user_cooldown_test_${Date.now()}`;
    
    // First claim
    const stateAfterClaim = luckySpinService.claimDailySpin(testUserId, 1);
    assert.strictEqual(stateAfterClaim.canClaimDailySpin, false);
    assert.ok(stateAfterClaim.nextDailySpinAt !== null);

    // Second claim immediately should not grant additional free spins
    const stateSecondAttempt = luckySpinService.claimDailySpin(testUserId, 1);
    assert.strictEqual(stateSecondAttempt.canClaimDailySpin, false);
    assert.strictEqual(stateSecondAttempt.availableSpins, stateAfterClaim.availableSpins);
  });

  await runner.test('grantBonusSpins: adds spins correctly for referral or admin air-drops', () => {
    const testUserId = `user_grant_test_${Date.now()}`;
    const initial = luckySpinService.getUserSpinState(testUserId);
    const initialSpins = initial.availableSpins;

    const updated = luckySpinService.grantBonusSpins(testUserId, 3, 'REFERRAL');
    assert.strictEqual(updated.availableSpins, initialSpins + 3);
    assert.strictEqual(updated.referralSpins, 3);
  });

  await runner.test('selectWinningSlice: accurately follows weighted probability over simulated sample', () => {
    const slices = luckySpinService.getSlices();
    const counts: Record<number, number> = {};
    slices.forEach(s => { counts[s.sliceIndex] = 0; });

    const totalSimulations = 3000;
    for (let i = 0; i < totalSimulations; i++) {
      const won = luckySpinService.selectWinningSlice(slices);
      counts[won.sliceIndex] = (counts[won.sliceIndex] || 0) + 1;
    }

    // High probability slice (e.g. 0.50 USDT with weight 350) should have significantly more hits than Jackpot (weight 3)
    const highWeightSliceHits = counts[0] || 0;
    const jackpotHits = counts[7] || 0;

    assert.ok(
      highWeightSliceHits > jackpotHits * 5,
      `High weight slice (${highWeightSliceHits}) should hit far more than jackpot (${jackpotHits})`
    );
  });

  await runner.test('executeSpin: consumes spin, rewards prize, credits wallet on USDT, and logs history', async () => {
    const testUserId = `user_exec_test_${Date.now()}`;
    
    // Seed user with 2 spins
    luckySpinService.grantBonusSpins(testUserId, 2, 'TEST_GRANT');
    
    const beforeState = luckySpinService.getUserSpinState(testUserId);
    assert.ok(beforeState.availableSpins >= 2);

    const initialWallet = walletService.getWalletForUser(testUserId);
    const initialBalance = initialWallet.availableBalance;

    const result = await luckySpinService.executeSpin(testUserId, 1);
    
    assert.ok(result.id.startsWith('spin_'));
    assert.strictEqual(result.userId, testUserId);
    assert.ok(result.sliceIndex >= 0 && result.sliceIndex <= 7);
    assert.ok(result.prizeText.length > 0);

    // Verify user spins decremented
    const afterState = luckySpinService.getUserSpinState(testUserId);
    assert.strictEqual(afterState.lifetimeSpinsCount, 1);

    // If prize was USDT, verify balance increased
    if (result.prizeType === 'USDT' && result.prizeValue > 0) {
      const updatedWallet = walletService.getWalletForUser(testUserId);
      assert.ok(updatedWallet.availableBalance >= initialBalance + result.prizeValue - 0.01);
    }

    // Verify history record exists
    const history = luckySpinService.getUserSpinHistory(testUserId);
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].id, result.id);
  });
}
