import { assert, TestRunner } from './testHelper.ts';
import { referralService } from '../src/services/referralService.ts';
import { authService, type UserProfile } from '../src/services/authService.ts';
import { walletService } from '../src/services/walletService.ts';

export async function runReferralServiceTests(runner: TestRunner) {
  runner.suite('Services - ReferralService');

  await runner.test('calculateUserTier & getRewardTiers: should return correct tiers by referral count', () => {
    const tiers = referralService.getRewardTiers();
    assert.strictEqual(tiers.length, 4);

    const t1 = referralService.calculateUserTier(5);
    assert.strictEqual(t1.tier, 1);
    assert.strictEqual(t1.nextTierRemaining, 6); // 11 - 5

    const t2 = referralService.calculateUserTier(15);
    assert.strictEqual(t2.tier, 2);
    assert.strictEqual(t2.nextTierRemaining, 11); // 26 - 15

    const t3 = referralService.calculateUserTier(30);
    assert.strictEqual(t3.tier, 3);
    assert.strictEqual(t3.nextTierRemaining, 21); // 51 - 30

    const t4 = referralService.calculateUserTier(60);
    assert.strictEqual(t4.tier, 4);
    assert.strictEqual(t4.nextTierRemaining, 0);
  });

  await runner.test('getReferralRates: returns A: 0.5%, B: 0.25%, C: 0.225%', () => {
    const rates = referralService.getReferralRates();
    assert.strictEqual(rates.A, 0.5);
    assert.strictEqual(rates.B, 0.25);
    assert.strictEqual(rates.C, 0.225);
  });

  await runner.test('calculateDepositBonus: calculates 50 USDT unit bonus correctly (sponsor only, 0 welcome bonus)', () => {
    // Under minimum (< 50 USDT)
    const zero = referralService.calculateDepositBonus(40);
    assert.strictEqual(zero.sponsorBonus, 0);
    assert.strictEqual(zero.newUserBonus, 0);

    // 50 USDT -> 1 unit = 5 USDT sponsor, 0 USDT welcome bonus
    const b50 = referralService.calculateDepositBonus(50);
    assert.strictEqual(b50.sponsorBonus, 5);
    assert.strictEqual(b50.newUserBonus, 0);

    // 100 USDT -> 2 units = 10 USDT sponsor, 0 USDT welcome bonus
    const b100 = referralService.calculateDepositBonus(100);
    assert.strictEqual(b100.sponsorBonus, 10);
    assert.strictEqual(b100.newUserBonus, 0);

    // 500 USDT -> 10 units = 50 USDT sponsor, 0 USDT welcome bonus
    const b500 = referralService.calculateDepositBonus(500);
    assert.strictEqual(b500.sponsorBonus, 50);
    assert.strictEqual(b500.newUserBonus, 0);
  });

  await runner.test('validateReferralRegistration: prevents self-referral and unknown codes', () => {
    localStorage.clear();

    const referrer: UserProfile = {
      id: 'ref-111',
      name: 'Referrer User',
      username: 'refuser',
      email: 'refuser@test.com',
      referralCode: 'IVESTREF1',
      level: 1,
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      createdAt: new Date().toISOString()
    };
    authService.saveAllUsers([referrer]);

    // Self-referral by same email
    const selfRes = referralService.validateReferralRegistration('IVESTREF1', {
      email: 'refuser@test.com',
      username: 'othername'
    });
    assert.strictEqual(selfRes.isValid, false);
    assert.ok(selfRes.reason?.includes('Self-referral'));

    // Non-existent code
    const notFound = referralService.validateReferralRegistration('NONEXISTENT', {
      email: 'newbie@test.com',
      username: 'newbie'
    });
    assert.strictEqual(notFound.isValid, false);

    // Valid referral
    const valid = referralService.validateReferralRegistration('IVESTREF1', {
      email: 'newbie@test.com',
      username: 'newbie'
    });
    assert.strictEqual(valid.isValid, true);
  });

  await runner.test('getReferralSummary: builds 3-tier tree (A -> B -> C) correctly', () => {
    localStorage.clear();

    const rootUser: UserProfile = {
      id: 'usr-root',
      name: 'Root Leader',
      username: 'rootleader',
      email: 'root@test.com',
      referralCode: 'IVESTROOT',
      level: 2,
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      createdAt: new Date().toISOString()
    };

    const directUserA: UserProfile = {
      id: 'usr-a',
      name: 'Direct A',
      username: 'directa',
      email: 'a@test.com',
      referralCode: 'IVESTA',
      referredBy: 'IVESTROOT',
      level: 1,
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      createdAt: new Date().toISOString()
    };

    const indirectUserB: UserProfile = {
      id: 'usr-b',
      name: 'Indirect B',
      username: 'indirectb',
      email: 'b@test.com',
      referralCode: 'IVESTB',
      referredBy: 'IVESTA',
      level: 1,
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      createdAt: new Date().toISOString()
    };

    const indirectUserC: UserProfile = {
      id: 'usr-c',
      name: 'Indirect C',
      username: 'indirectc',
      email: 'c@test.com',
      referralCode: 'IVESTC',
      referredBy: 'IVESTB',
      level: 1,
      status: 'ACTIVE',
      kycStatus: 'NOT_SUBMITTED',
      createdAt: new Date().toISOString()
    };

    authService.saveAllUsers([rootUser, directUserA, indirectUserB, indirectUserC]);

    const summary = referralService.getReferralSummary('IVESTROOT');
    assert.strictEqual(summary.aMembersCount, 1);
    assert.strictEqual(summary.bMembersCount, 1);
    assert.strictEqual(summary.cMembersCount, 1);
    assert.strictEqual(summary.totalMembersCount, 3);
  });

  await runner.test('requestWithdrawal & approveWithdrawal & rejectWithdrawal lifecycle', async () => {
    localStorage.clear();

    const userId = 'usr-withdrawer';
    referralService.setUserRewardBalance(userId, 200.0);
    assert.strictEqual(referralService.getUserRewardBalance(userId), 200.0);

    // Request 100 USDT withdrawal
    const req = await referralService.requestWithdrawal({
      userId,
      userName: 'Withdrawer',
      amountUSDT: 100.0,
      walletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      network: 'TRC20'
    });

    assert.strictEqual(req.status, 'PENDING');
    assert.strictEqual(req.amountUSDT, 100.0);
    // Reward balance should be reduced to 100
    assert.strictEqual(referralService.getUserRewardBalance(userId), 100.0);

    // Reject withdrawal -> funds refunded
    referralService.rejectWithdrawal(req.id, 'Test rejection');
    const updatedWithdrawals = referralService.getWithdrawals(userId);
    assert.strictEqual(updatedWithdrawals[0].status, 'REJECTED');
    assert.strictEqual(referralService.getUserRewardBalance(userId), 200.0);
  });
}
