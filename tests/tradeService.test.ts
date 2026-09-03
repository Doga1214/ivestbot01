import { assert, TestRunner } from './testHelper.ts';
import { tradeService } from '../src/services/tradeService.ts';

export async function runTradeServiceTests(runner: TestRunner) {
  runner.suite('Services - TradeService');

  await runner.test('getMarkets: should return market pairs with valid price and volume', () => {
    const markets = tradeService.getMarkets();
    assert.ok(Array.isArray(markets), 'Markets should be an array');
    assert.ok(markets.length >= 3, 'Should have at least 3 default market pairs');

    const btc = markets.find(m => m.symbol === 'BTC/USDT');
    assert.ok(btc, 'BTC/USDT should exist');
    assert.ok(btc!.price > 0, 'Price should be greater than 0');
    assert.ok(typeof btc!.change24h === 'number', '24h change should be number');
  });

  await runner.test('getTradeHistory: should return list of demo trades', () => {
    const history = tradeService.getTradeHistory();
    assert.ok(Array.isArray(history));
    assert.ok(history.length > 0);
    assert.strictEqual(history[0].status, 'EXECUTED_DEMO');
  });

  await runner.test('executeDemoTrade: should correctly compute total USDT and save trade', async () => {
    const initialCount = tradeService.getTradeHistory().length;

    const trade = await tradeService.executeDemoTrade({
      pair: 'BTC/USDT',
      side: 'BUY',
      amount: 0.1,
      price: 90000.0
    });

    assert.strictEqual(trade.pair, 'BTC/USDT');
    assert.strictEqual(trade.side, 'BUY');
    assert.strictEqual(trade.amount, 0.1);
    assert.strictEqual(trade.price, 90000.0);
    assert.strictEqual(trade.totalUSDT, 9000.0);
    assert.strictEqual(trade.status, 'EXECUTED_DEMO');
    assert.ok(trade.id.startsWith('trd-'));

    const updatedHistory = tradeService.getTradeHistory();
    assert.strictEqual(updatedHistory.length, initialCount + 1);
    assert.strictEqual(updatedHistory[0].id, trade.id);
  });
}
