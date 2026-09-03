import { assert, TestRunner } from './testHelper.ts';
import {
  formatUSDT,
  formatNumber,
  formatDate,
  formatDateTime,
  formatTimeRemaining
} from '../src/utils/formatters.ts';

export async function runFormattersTests(runner: TestRunner) {
  runner.suite('Utils - Formatters');

  await runner.test('formatUSDT: should format numbers correctly with 2 decimal places and USDT suffix', () => {
    assert.strictEqual(formatUSDT(100), '100.00 USDT');
    assert.strictEqual(formatUSDT(1234.5), '1,234.50 USDT');
    assert.strictEqual(formatUSDT(0), '0.00 USDT');
    assert.strictEqual(formatUSDT('250.75'), '250.75 USDT');
  });

  await runner.test('formatUSDT: should handle undefined, null, and NaN safely', () => {
    assert.strictEqual(formatUSDT(undefined), '0.00 USDT');
    assert.strictEqual(formatUSDT(null), '0.00 USDT');
    assert.strictEqual(formatUSDT(NaN), '0.00 USDT');
    assert.strictEqual(formatUSDT('invalid_string'), '0.00 USDT');
  });

  await runner.test('formatNumber: should format numbers with commas and 2 decimal places', () => {
    assert.strictEqual(formatNumber(1000), '1,000.00');
    assert.strictEqual(formatNumber(1234567.89), '1,234,567.89');
    assert.strictEqual(formatNumber('45.6'), '45.60');
    assert.strictEqual(formatNumber(null), '0.00');
    assert.strictEqual(formatNumber(undefined), '0.00');
    assert.strictEqual(formatNumber(NaN), '0.00');
  });

  await runner.test('formatDate & formatDateTime: should parse valid dates and timestamps', () => {
    const isoString = '2026-09-03T10:30:00Z';
    const formatted = formatDate(isoString);
    assert.ok(formatted.includes('2026'), 'Should contain year 2026');
    assert.ok(formatted.includes('Sep') || formatted.includes('September') || formatted.includes('9'), 'Should contain month');
    
    // formatDateTime alias check
    assert.strictEqual(formatDateTime(isoString), formatted);
  });

  await runner.test('formatTimeRemaining: should format seconds into HH:MM:SS', () => {
    assert.strictEqual(formatTimeRemaining(3665), '01:01:05');
    assert.strictEqual(formatTimeRemaining(86400), '24:00:00');
    assert.strictEqual(formatTimeRemaining(59), '00:00:59');
    assert.strictEqual(formatTimeRemaining(0), '00:00:00');
    assert.strictEqual(formatTimeRemaining(-10), '00:00:00');
  });
}
