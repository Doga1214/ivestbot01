import { assert, TestRunner } from './testHelper.ts';
import { adminService } from '../src/services/adminService.ts';
import { authService, type UserProfile } from '../src/services/authService.ts';
import { walletService } from '../src/services/walletService.ts';

export async function runAdminServiceTests(runner: TestRunner) {
  runner.suite('Services - AdminService');

  await runner.test('admin session & authentication state', () => {
    localStorage.clear();
    sessionStorage.clear();

    assert.strictEqual(adminService.isAdminAuthenticated(), false);

    // Simulate active admin session
    sessionStorage.setItem('ivestbot_admin_session', 'true');
    assert.strictEqual(adminService.isAdminAuthenticated(), true);

    // Logout
    adminService.adminLogout();
    assert.strictEqual(adminService.isAdminAuthenticated(), false);
  });

  await runner.test('getAdminUsersList: aggregates user profiles and wallet balances', async () => {
    localStorage.clear();

    const sampleUsers: UserProfile[] = [
      {
        id: 'adm-usr-1',
        name: 'User One',
        username: 'userone',
        email: 'one@test.com',
        referralCode: 'IVESTONE',
        level: 1,
        status: 'ACTIVE',
        kycStatus: 'VERIFIED',
        createdAt: new Date().toISOString()
      },
      {
        id: 'adm-usr-2',
        name: 'User Two',
        username: 'usertwo',
        email: 'two@test.com',
        referralCode: 'IVESTTWO',
        level: 2,
        status: 'INACTIVE',
        kycStatus: 'NOT_SUBMITTED',
        createdAt: new Date().toISOString()
      }
    ];
    authService.saveAllUsers(sampleUsers);

    walletService.saveWalletForUser('adm-usr-1', {
      totalBalance: 500,
      availableBalance: 400,
      pendingBalance: 100,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true }
    });

    const list = await adminService.getAdminUsersList();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 1, 'Should return admin users list');
    assert.ok(list[0].profile, 'Each user should have a profile');
    assert.ok(list[0].wallet, 'Each user should have a wallet');
    assert.strictEqual(typeof list[0].pendingDepositsCount, 'number');
  });

  await runner.test('creditUserWallet & debitUserWallet: admin direct adjustments', () => {
    localStorage.clear();

    const user: UserProfile = {
      id: 'adm-adj-user',
      name: 'Adjust Me',
      username: 'adjustme',
      email: 'adj@test.com',
      referralCode: 'IVESTADJ',
      level: 1,
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      createdAt: new Date().toISOString()
    };
    authService.saveAllUsers([user]);

    walletService.saveWalletForUser(user.id, {
      totalBalance: 100,
      availableBalance: 100,
      pendingBalance: 0,
      currency: 'USDT',
      status: 'ACTIVE',
      restrictions: { canDeposit: true, canWithdraw: true, canReserve: true, canTrade: true }
    });

    // Credit 250
    const credit = adminService.creditUserWallet(user.id, 250, 'Special Campaign Grant');
    assert.strictEqual(credit.updatedWallet.totalBalance, 350);
    assert.strictEqual(credit.updatedWallet.availableBalance, 350);

    // Debit 50
    const debit = adminService.debitUserWallet(user.id, 50, 'Chargeback Adjustment');
    assert.strictEqual(debit.updatedWallet.totalBalance, 300);
    assert.strictEqual(debit.updatedWallet.availableBalance, 300);
  });

  await runner.test('broadcastAnnouncement & getAnnouncements: manages announcements', () => {
    localStorage.clear();

    const initial = adminService.getAnnouncements();
    assert.ok(initial.length > 0);

    const created = adminService.broadcastAnnouncement(
      'System Upgrade Notice',
      'Scheduled maintenance will take place at 02:00 UTC.',
      'warning'
    );

    assert.strictEqual(created.title, 'System Upgrade Notice');
    assert.strictEqual(created.severity, 'warning');

    const updated = adminService.getAnnouncements();
    assert.strictEqual(updated[0].id, created.id);
    assert.strictEqual(updated[0].title, 'System Upgrade Notice');
  });

  await runner.test('impersonateUser: switches active session in localStorage', () => {
    localStorage.clear();

    const targetUser: UserProfile = {
      id: 'usr-target',
      name: 'Target Person',
      username: 'targetperson',
      email: 'target@test.com',
      referralCode: 'IVESTTGT',
      level: 3,
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      createdAt: new Date().toISOString()
    };
    authService.saveAllUsers([targetUser]);

    const res = adminService.impersonateUser(targetUser.id);
    assert.ok(res);
    assert.strictEqual(res?.username, 'targetperson');

    const current = authService.getCurrentUser();
    assert.strictEqual(current?.id, targetUser.id);
  });
}
