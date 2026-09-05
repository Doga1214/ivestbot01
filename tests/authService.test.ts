import { assert, TestRunner } from './testHelper.ts';
import { authService, isValidUuid, type UserProfile } from '../src/services/authService.ts';

export async function runAuthServiceTests(runner: TestRunner) {
  runner.suite('Services - AuthService');

  await runner.test('isValidUuid: should properly validate UUID formats', () => {
    assert.strictEqual(isValidUuid('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), true);
    assert.strictEqual(isValidUuid('123e4567-e89b-12d3-a456-426614174000'), true);
    assert.strictEqual(isValidUuid('usr-123456'), false);
    assert.strictEqual(isValidUuid('invalid-uuid-string'), false);
    assert.strictEqual(isValidUuid(null), false);
    assert.strictEqual(isValidUuid(undefined), false);
    assert.strictEqual(isValidUuid(''), false);
  });

  await runner.test('getAllUsers & saveAllUsers: should store and retrieve users list', () => {
    localStorage.clear();

    const sampleUsers: UserProfile[] = [
      {
        id: '11111111-1111-4111-a111-111111111111',
        name: 'Alice Smith',
        username: 'alice',
        email: 'alice@test.com',
        referralCode: 'IVESTAAA',
        level: 1,
        status: 'ACTIVE',
        kycStatus: 'VERIFIED',
        createdAt: new Date().toISOString()
      },
      {
        id: '22222222-2222-4222-a222-222222222222',
        name: 'Bob Jones',
        username: 'bob',
        email: 'bob@test.com',
        referralCode: 'IVESTBBB',
        level: 2,
        status: 'ACTIVE',
        kycStatus: 'NOT_SUBMITTED',
        createdAt: new Date().toISOString()
      }
    ];

    authService.saveAllUsers(sampleUsers);
    const retrieved = authService.getAllUsers();
    assert.strictEqual(retrieved.length, 2);
    assert.strictEqual(retrieved[0].username, 'alice');
    assert.strictEqual(retrieved[1].username, 'bob');
  });

  await runner.test('upsertUser & getCurrentUser & logout: should manage session correctly', () => {
    const user: UserProfile = {
      id: '33333333-3333-4333-a333-333333333333',
      name: 'Charlie Test',
      username: 'charlie',
      email: 'charlie@test.com',
      referralCode: 'IVESTCCC',
      level: 1,
      status: 'ACTIVE',
      kycStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };

    authService.upsertUser(user);
    localStorage.setItem('ivestbot_auth_user', JSON.stringify(user));

    const current = authService.getCurrentUser();
    assert.ok(current);
    assert.strictEqual(current?.id, user.id);
    assert.strictEqual(current?.username, 'charlie');

    // Update profile
    const updated = authService.updateUserProfile({ name: 'Charlie Updated' });
    assert.strictEqual(updated?.name, 'Charlie Updated');
    assert.strictEqual(authService.getCurrentUser()?.name, 'Charlie Updated');

    // Logout
    authService.logout();
    assert.strictEqual(authService.getCurrentUser(), null);
  });

  await runner.test('deleteUser: should remove user from list, delete local storage artifacts, and record in deleted set', async () => {
    const userToDelete: UserProfile = {
      id: '44444444-4444-4444-a444-444444444444',
      name: 'Delete Me',
      username: 'deleteme',
      email: 'delete@test.com',
      referralCode: 'IVESTDEL',
      level: 1,
      status: 'ACTIVE',
      kycStatus: 'NOT_SUBMITTED',
      createdAt: new Date().toISOString()
    };

    authService.upsertUser(userToDelete);
    localStorage.setItem(`ivestbot_wallet_${userToDelete.id}`, JSON.stringify({ totalBalance: 50 }));

    const res = await authService.deleteUser(userToDelete.id);
    assert.strictEqual(res, true);

    const users = authService.getAllUsers();
    assert.strictEqual(users.some(u => u.id === userToDelete.id), false);

    const deletedIds = authService.getDeletedUserIds();
    assert.ok(deletedIds.has(userToDelete.id));
    assert.strictEqual(localStorage.getItem(`ivestbot_wallet_${userToDelete.id}`), null);
  });

  await runner.test('Withdrawal PIN lifecycle: set PIN, verify PIN, incorrect attempt countdown, lockout, and change PIN', async () => {
    const testUserId = '55555555-5555-5555-a555-555555555555';

    // 1. Initial state: hasPin = false
    assert.strictEqual(authService.hasWithdrawalPin(testUserId), false);

    // 2. Set valid 6-digit PIN '123456'
    const setSuccess = await authService.setWithdrawalPin(testUserId, '123456');
    assert.strictEqual(setSuccess, true);
    assert.strictEqual(authService.hasWithdrawalPin(testUserId), true);

    // 3. Verify correct PIN
    const correctRes = await authService.verifyWithdrawalPin(testUserId, '123456');
    assert.strictEqual(correctRes.success, true);

    // 4. Verify incorrect PIN (1st attempt)
    const fail1 = await authService.verifyWithdrawalPin(testUserId, '999999');
    assert.strictEqual(fail1.success, false);
    assert.strictEqual(fail1.attemptsLeft, 2);
    assert.strictEqual(fail1.isLocked, false);

    // 5. Verify incorrect PIN (2nd attempt)
    const fail2 = await authService.verifyWithdrawalPin(testUserId, '888888');
    assert.strictEqual(fail2.success, false);
    assert.strictEqual(fail2.attemptsLeft, 1);
    assert.strictEqual(fail2.isLocked, false);

    // 6. Verify incorrect PIN (3rd attempt -> lockout triggered)
    const fail3 = await authService.verifyWithdrawalPin(testUserId, '777777');
    assert.strictEqual(fail3.success, false);
    assert.strictEqual(fail3.attemptsLeft, 0);
    assert.strictEqual(fail3.isLocked, true);

    // 7. Further attempt while locked is blocked
    const lockCheck = await authService.verifyWithdrawalPin(testUserId, '123456');
    assert.strictEqual(lockCheck.success, false);
    assert.strictEqual(lockCheck.isLocked, true);

    // 8. Change PIN with new valid PIN (after unlocking)
    localStorage.removeItem(`ivestbot_pin_${testUserId}`);
    await authService.setWithdrawalPin(testUserId, '112233');
    const changeRes = await authService.changeWithdrawalPin(testUserId, '112233', '654321');
    assert.strictEqual(changeRes.success, true);

    // Verify new PIN works
    const newVerify = await authService.verifyWithdrawalPin(testUserId, '654321');
    assert.strictEqual(newVerify.success, true);
  });
}
