import { assert, TestRunner } from './testHelper.ts';
import { walletService, type WalletState, type WalletRestrictions } from '../src/services/walletService.ts';

export async function runWalletServiceTests(runner: TestRunner) {
  runner.suite('Services - WalletService');

  await runner.test('getWallet & saveWallet & getWalletForUser: maintains user-isolated wallets', () => {
    localStorage.clear();

    const user1Id = 'user-111';
    const user2Id = 'user-222';

    walletService.saveWalletForUser(user1Id, {
      totalBalance: 300,
      availableBalance: 250,
      pendingBalance: 50,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true }
    });

    walletService.saveWalletForUser(user2Id, {
      totalBalance: 1000,
      availableBalance: 1000,
      pendingBalance: 0,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: { canDeposit: true, canWithdraw: false, canReserve: true, canTrade: true }
    });

    const w1 = walletService.getWalletForUser(user1Id);
    assert.strictEqual(w1.totalBalance, 300);
    assert.strictEqual(w1.availableBalance, 250);
    assert.strictEqual(w1.pendingBalance, 50);

    const w2 = walletService.getWalletForUser(user2Id);
    assert.strictEqual(w2.totalBalance, 1000);
    assert.strictEqual(w2.restrictions.canWithdraw, false);
  });

  await runner.test('addTransaction & getTransactions: records ledger properly', () => {
    localStorage.clear();

    const tx = walletService.addTransaction({
      userId: 'user-111',
      userName: 'Alice',
      type: 'WELCOME_BONUS',
      amount: 10.0,
      currency: 'USDT',
      status: 'COMPLETED',
      description: 'Welcome Bonus Reward',
      referenceId: 'BONUS-101'
    });

    assert.ok(tx.id);
    assert.strictEqual(tx.amount, 10.0);
    assert.strictEqual(tx.status, 'COMPLETED');

    const txs = walletService.getTransactions();
    assert.strictEqual(txs.length, 1);
    assert.strictEqual(txs[0].id, tx.id);
  });

  await runner.test('adminCredit & adminDebit: adjusts wallet balance and logs admin transaction', () => {
    localStorage.clear();
    const userId = 'user-credit-debit';

    walletService.saveWalletForUser(userId, {
      totalBalance: 100,
      availableBalance: 100,
      pendingBalance: 0,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true }
    });

    // Credit 50
    const creditRes = walletService.adminCredit(50, 'Promotional bonus', { id: userId, name: 'Alice' });
    assert.strictEqual(creditRes.updatedWallet.totalBalance, 150);
    assert.strictEqual(creditRes.updatedWallet.availableBalance, 150);
    assert.strictEqual(creditRes.tx.type, 'ADMIN_CREDIT');

    // Debit 30
    const debitRes = walletService.adminDebit(30, 'Manual penalty', { id: userId, name: 'Alice' });
    assert.strictEqual(debitRes.updatedWallet.totalBalance, 120);
    assert.strictEqual(debitRes.updatedWallet.availableBalance, 120);
    assert.strictEqual(debitRes.tx.type, 'ADMIN_DEBIT');
  });

  await runner.test('updateWalletRestrictions: updates permissions and restriction reason', () => {
    localStorage.clear();

    const restrictions: WalletRestrictions = {
      canDeposit: false,
      canWithdraw: false,
      canReserve: false,
      canTrade: true
    };

    const updated = walletService.updateWalletRestrictions('RESTRICTED', restrictions, 'Compliance Verification Required');
    assert.strictEqual(updated.status, 'RESTRICTED');
    assert.strictEqual(updated.restrictions.canDeposit, false);
    assert.strictEqual(updated.restrictions.canWithdraw, false);
    assert.strictEqual(updated.restrictionReason, 'Compliance Verification Required');
  });

  await runner.test('KYC flow: submitKyc -> adminVerifyKyc updates verification status', async () => {
    localStorage.clear();

    const initial = walletService.getKycStatus();
    assert.strictEqual(initial.status, 'NOT_SUBMITTED');

    const submitted = await walletService.submitKyc({
      fullName: 'John Doe',
      documentType: 'NATIONAL_ID',
      documentNumber: 'ID-98765432'
    });
    assert.strictEqual(submitted.status, 'PENDING');
    assert.strictEqual(submitted.fullName, 'John Doe');

    const verified = walletService.adminVerifyKyc('VERIFIED', 'All documents match ID', 'user-A');
    assert.strictEqual(verified.status, 'VERIFIED');
    assert.strictEqual(verified.adminNotes, 'All documents match ID');

    // User B (brand new user) must NOT be auto-verified
    const newUserKyc = walletService.getKycStatus('user-B');
    assert.strictEqual(newUserKyc.status, 'NOT_SUBMITTED');
  });

  await runner.test('WalletSnapshot & Restore: creates checkpoints and executes rollback safely', () => {
    localStorage.clear();
    const userId = 'user-snapshot-test';

    walletService.saveWalletForUser(userId, {
      totalBalance: 500,
      availableBalance: 500,
      pendingBalance: 0,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true }
    });

    const snp = walletService.recordSnapshot({
      userId,
      userName: 'Bob',
      before: { available: 500, total: 500, pending: 0 },
      after: { available: 600, total: 600, pending: 0 },
      actionType: 'BONUS_CREDIT',
      reason: 'VIP Promotion Deposit',
      actor: 'ADMIN'
    });

    assert.ok(snp.id);
    assert.ok(snp.integrityHash.startsWith('AI-SHIELD-'));
    assert.strictEqual(snp.afterBalance.available, 600);

    const snapshots = walletService.getSnapshots(userId);
    assert.strictEqual(snapshots.length, 1);
    assert.strictEqual(snapshots[0].id, snp.id);

    // Rollback test
    const rollback = walletService.restoreSnapshot(snp.id, 'Rolling back to 600 checkpoint');
    assert.strictEqual(rollback.restoredWallet.availableBalance, 600);
    assert.strictEqual(rollback.restoredWallet.totalBalance, 600);
  });

  await runner.test('AI Yield Forecaster & Balance Integrity: returns accurate multi-horizon predictions', () => {
    const forecast = walletService.calculateAiYieldForecast(1000);
    assert.strictEqual(forecast.dailyRatePercent, 2.58);
    assert.strictEqual(forecast.projected24hProfit, 25.8);
    assert.ok(forecast.projected7dProfit > 180);
    assert.ok(forecast.projected30dProfit > 1000);
    assert.strictEqual(forecast.shieldStatus, 'ARMED');

    const scan = walletService.verifyBalanceIntegrity('user-clean');
    assert.strictEqual(scan.isClean, true);
    assert.strictEqual(scan.healthScore, 100);
  });
}
