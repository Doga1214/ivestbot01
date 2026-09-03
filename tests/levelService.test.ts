import { assert, TestRunner } from './testHelper.ts';
import { levelService, LEVEL_DEFINITIONS } from '../src/services/levelService.ts';

export async function runLevelServiceTests(runner: TestRunner) {
  runner.suite('Services - LevelService');

  await runner.test('getLevelRequirements: should return valid requirements for Level 1, 2, 3, 4', () => {
    const l1 = levelService.getLevelRequirements(1);
    assert.strictEqual(l1.level, 1);
    assert.strictEqual(l1.minWalletUSDT, 100);
    assert.strictEqual(l1.requiredAMembers, 0);

    const l2 = levelService.getLevelRequirements(2);
    assert.strictEqual(l2.level, 2);
    assert.strictEqual(l2.minWalletUSDT, 400);
    assert.strictEqual(l2.requiredAMembers, 3);
    assert.strictEqual(l2.requiredBCMembers, 4);

    const l3 = levelService.getLevelRequirements(3);
    assert.strictEqual(l3.level, 3);
    assert.strictEqual(l3.minWalletUSDT, 1500);
    assert.strictEqual(l3.requiredAMembers, 8);
    assert.strictEqual(l3.requiredLevel2Members, 5);
    assert.strictEqual(l3.requiredBCMembers, 32);

    const l4 = levelService.getLevelRequirements(4);
    assert.strictEqual(l4.level, 4);
    assert.strictEqual(l4.minWalletUSDT, 2500);
    assert.strictEqual(l4.requiredAMembers, 20);
    assert.strictEqual(l4.requiredLevel2Members, 10);
    assert.strictEqual(l4.requiredLevel3Members, 3);
    assert.strictEqual(l4.requiredBCMembers, 60);

    // Fallback for invalid level
    const fallback = levelService.getLevelRequirements(999);
    assert.strictEqual(fallback.level, 1);
  });

  await runner.test('getAllLevelRequirements: should return all 4 VIP tiers', () => {
    const all = levelService.getAllLevelRequirements();
    assert.strictEqual(all.length, 4);
    assert.strictEqual(all[0].level, 1);
    assert.strictEqual(all[3].level, 4);
  });

  await runner.test('calculateUserLevel: should correctly calculate VIP level based on balance and network structure', () => {
    // Level 1 baseline
    assert.strictEqual(
      levelService.calculateUserLevel({ walletBalance: 150, aMembers: 0, bMembers: 0, cMembers: 0 }),
      1
    );

    // Level 2 qualification: >= 400 USDT, 3 A-members, 4 BC-members
    assert.strictEqual(
      levelService.calculateUserLevel({ walletBalance: 500, aMembers: 3, bMembers: 2, cMembers: 2 }),
      2
    );

    // Level 2 disqualified if not enough members even with high balance
    assert.strictEqual(
      levelService.calculateUserLevel({ walletBalance: 5000, aMembers: 2, bMembers: 0, cMembers: 0 }),
      1
    );

    // Level 3 qualification: >= 1500 USDT, 8 A-members, 5 L2-members, 32 BC-members
    assert.strictEqual(
      levelService.calculateUserLevel({
        walletBalance: 1600,
        aMembers: 8,
        bMembers: 20,
        cMembers: 12,
        level2Members: 5
      }),
      3
    );

    // Level 4 qualification: >= 2500 USDT, 20 A-members, 10 L2, 3 L3, 60 BC
    assert.strictEqual(
      levelService.calculateUserLevel({
        walletBalance: 3000,
        aMembers: 20,
        bMembers: 40,
        cMembers: 20,
        level2Members: 10,
        level3Members: 3
      }),
      4
    );
  });

  await runner.test('getLevelProgress: should calculate progress towards next tier', () => {
    // Current level 1 progressing to level 2
    const progressL1 = levelService.getLevelProgress(1, {
      walletBalance: 200,
      aMembers: 1,
      bMembers: 1,
      cMembers: 1
    });
    assert.strictEqual(progressL1.nextLevel, 2);
    assert.ok(progressL1.progressPercent > 0 && progressL1.progressPercent < 100);
    assert.strictEqual(progressL1.requirementsText.length, 3);

    // Max Level 4
    const progressL4 = levelService.getLevelProgress(4, {
      walletBalance: 5000,
      aMembers: 25,
      bMembers: 50,
      cMembers: 50
    });
    assert.strictEqual(progressL4.nextLevel, null);
    assert.strictEqual(progressL4.progressPercent, 100);
  });
}
