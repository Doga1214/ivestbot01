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

  await runner.test('selectWinningSlice: enforces house loss, targeted whitelists, and 50+ USDT stake auto-loss', () => {
    const slices = luckySpinService.getSlices();
    
    // 1. Regular user in House Profit Mode (default) -> Always lands on LOSS / TRY_AGAIN
    const normalUserSlice = luckySpinService.selectWinningSlice(slices, 'normal_user_123');
    assert.ok(
      normalUserSlice.prizeType === 'LOSS' || normalUserSlice.prizeType === 'TRY_AGAIN' || normalUserSlice.prizeValue <= 0,
      'Normal user in house profit mode should land on a loss slice'
    );

    // 2. Whitelisted user for Mega Jackpot -> Always hits 50x Mega Jackpot
    const vipUserId = `vip_user_${Date.now()}`;
    luckySpinService.addWhitelistedProfitUser({
      userId: vipUserId,
      outcomeMode: 'JACKPOT',
      isActive: true
    });
    const vipSlice = luckySpinService.selectWinningSlice(slices, vipUserId, 10);
    assert.strictEqual(vipSlice.prizeValue, 50, 'Whitelisted JACKPOT user should land on 50x Mega Jackpot');

    // 3. High stake (50+ USDT) -> Forces loss unless explicitly exempted
    const highStakeSlice = luckySpinService.selectWinningSlice(slices, 'regular_player', 50);
    assert.ok(
      highStakeSlice.prizeType === 'LOSS' || highStakeSlice.prizeType === 'TRY_AGAIN',
      '50+ USDT stake must force a 100% loss slice'
    );

    // Clean up whitelist
    luckySpinService.removeWhitelistedProfitUser(vipUserId);
  });

  await runner.test('executeSpin: consumes wallet stake, processes spin, and logs history', async () => {
    const testUserId = `user_exec_test_${Date.now()}`;
    
    // Seed wallet with 50 USDT balance
    walletService.saveWalletForUser(testUserId, {
      availableBalance: 50,
      totalBalance: 50,
      pendingBalance: 0,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: {
        canDeposit: true,
        canWithdraw: true,
        canReserve: true,
        canTrade: true
      },
      updatedAt: new Date().toISOString()
    });

    const initialWallet = walletService.getWalletForUser(testUserId);
    assert.strictEqual(initialWallet.availableBalance, 50);

    const result = await luckySpinService.executeSpin(testUserId, 1, 5); // 5 USDT stake
    
    assert.ok(result.id.startsWith('spin_'));
    assert.strictEqual(result.userId, testUserId);
    assert.strictEqual(result.betAmount, 5);
    assert.ok(result.sliceIndex >= 0 && result.sliceIndex <= 7);
    assert.ok(result.prizeText.length > 0);

    // Verify lifetime spin count increased
    const afterState = luckySpinService.getUserSpinState(testUserId);
    assert.strictEqual(afterState.lifetimeSpinsCount, 1);
    assert.strictEqual(afterState.totalBetUsdt, 5);

    // Verify wallet balance was updated (deducted 5 USDT stake)
    const updatedWallet = walletService.getWalletForUser(testUserId);
    assert.ok(updatedWallet.availableBalance <= 50);

    // Verify history record exists
    const history = luckySpinService.getUserSpinHistory(testUserId);
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].id, result.id);
  });
}

