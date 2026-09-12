import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { TrendingUpIcon, TrendingDownIcon, ElectricBoltIcon } from '../common/Icons';

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  iconColor: string;
}

const INITIAL_CRYPTO_DATA: CryptoPrice[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: 68420.50, change24h: 3.42, iconColor: '#F7931A' },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: 3540.20, change24h: 2.85, iconColor: '#627EEA' },
  { symbol: 'SOL/USDT', name: 'Solana', price: 178.60, change24h: 6.14, iconColor: '#14F195' },
  { symbol: 'BNB/USDT', name: 'BNB Chain', price: 592.30, change24h: 1.72, iconColor: '#F3BA2F' },
  { symbol: 'TRX/USDT', name: 'Tron TRC20', price: 0.1625, change24h: 4.10, iconColor: '#FF0013' },
  { symbol: 'TON/USDT', name: 'Toncoin', price: 5.84, change24h: -0.95, iconColor: '#0088CC' }
];

export const CryptoLiveTicker: React.FC = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>(INITIAL_CRYPTO_DATA);

  // Subtle real-time price fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev =>
        prev.map(item => {
          const deltaPercent = (Math.random() - 0.48) * 0.15;
          const newPrice = Number((item.price * (1 + deltaPercent / 100)).toFixed(item.price < 1 ? 4 : 2));
          const newChange = Number((item.change24h + (Math.random() - 0.5) * 0.05).toFixed(2));
          return {
            ...item,
            price: newPrice,
            change24h: newChange
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        py: 1.5,
        bgcolor: '#0B0E17',
        borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 2, md: 4 },
          overflowX: 'auto',
          px: { xs: 2, md: 4 },
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          justifyContent: { xs: 'flex-start', md: 'center' }
        }}
      >
        <Chip
          icon={<ElectricBoltIcon sx={{ fontSize: 14, color: '#FFD700 !important' }} />}
          label="LIVE FEED"
          size="small"
          sx={{
            bgcolor: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            color: '#FFD700',
            fontWeight: 900,
            fontSize: '0.68rem',
            height: 22,
            letterSpacing: '0.05em'
          }}
        />

        {prices.map((crypto) => {
          const isPos = crypto.change24h >= 0;
          return (
            <Box
              key={crypto.symbol}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.5,
                px: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(139, 92, 246, 0.08)',
                  borderColor: 'rgba(139, 92, 246, 0.3)'
                }
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.82rem' }}>
                {crypto.symbol}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 900,
                  color: isPos ? '#34d399' : '#f87171',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}
              >
                ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: crypto.price < 1 ? 4 : 2 })}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                {isPos ? (
                  <TrendingUpIcon sx={{ fontSize: 14, color: '#34d399' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 14, color: '#f87171' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: isPos ? '#34d399' : '#f87171',
                    fontSize: '0.72rem'
                  }}
                >
                  {isPos ? '+' : ''}{crypto.change24h}%
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
