import { TestRunner } from './testHelper.ts';
import { runFormattersTests } from './formatters.test.ts';
import { runLevelServiceTests } from './levelService.test.ts';
import { runTradeServiceTests } from './tradeService.test.ts';
import { runAuthServiceTests } from './authService.test.ts';
import { runReservationServiceTests } from './reservationService.test.ts';
import { runReferralServiceTests } from './referralService.test.ts';
import { runWalletServiceTests } from './walletService.test.ts';
import { runAdminServiceTests } from './adminService.test.ts';

async function main() {
  console.log('\n========================================');
  console.log('🚀 RUNNING IVESTBOT FULL FUNCTION TEST SUITE');
  console.log('========================================\n');

  const runner = new TestRunner();

  // Run all test suites
  await runFormattersTests(runner);
  await runLevelServiceTests(runner);
  await runTradeServiceTests(runner);
  await runAuthServiceTests(runner);
  await runReservationServiceTests(runner);
  await runReferralServiceTests(runner);
  await runWalletServiceTests(runner);
  await runAdminServiceTests(runner);

  const { failed } = runner.printSummary();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
