export interface MarketPair {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: string;
}

export interface DemoTradeRecord {
  id: string;
  pair: string;
  side: 'BUY' | 'SELL';
  amount: number;
  price: number;
  totalUSDT: number;
  status: 'EXECUTED_DEMO';
  createdAt: string;
}

const DEFAULT_MARKETS: MarketPair[] = [
  {
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    price: 94250.00,
    change24h: 3.42,
    high24h: 95800.00,
    low24h: 91400.00,
    volume: '$38.4B'
  },
  {
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    price: 3420.50,
    change24h: -1.15,
    high24h: 3520.00,
    low24h: 3380.00,
    volume: '$18.2B'
  },
  {
    symbol: 'SOL/USDT',
    name: 'Solana',
    price: 212.40,
    change24h: 6.85,
    high24h: 218.00,
    low24h: 198.50,
    volume: '$7.4B'
  }
];

const DEMO_TRADES_STORAGE_KEY = 'ivestbot_demo_trades';

export const tradeService = {
  getMarkets(): MarketPair[] {
    return DEFAULT_MARKETS;
  },

  getTradeHistory(): DemoTradeRecord[] {
    try {
      const stored = localStorage.getItem(DEMO_TRADES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [
      {
        id: 'trd-101',
        pair: 'BTC/USDT',
        side: 'BUY',
        amount: 0.05,
        price: 93800.00,
        totalUSDT: 4690.00,
        status: 'EXECUTED_DEMO',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  },

  executeDemoTrade(data: { pair: string; side: 'BUY' | 'SELL'; amount: number; price: number }): Promise<DemoTradeRecord> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const record: DemoTradeRecord = {
          id: `trd-${Date.now().toString().slice(-4)}`,
          pair: data.pair,
          side: data.side,
          amount: data.amount,
          price: data.price,
          totalUSDT: Number((data.amount * data.price).toFixed(2)),
          status: 'EXECUTED_DEMO',
          createdAt: new Date().toISOString()
        };

        const current = tradeService.getTradeHistory();
        const updated = [record, ...current];
        localStorage.setItem(DEMO_TRADES_STORAGE_KEY, JSON.stringify(updated));

        resolve(record);
      }, 400);
    });
  }
};
