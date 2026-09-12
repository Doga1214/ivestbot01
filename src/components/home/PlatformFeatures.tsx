import React from 'react';
import { Box, Container, Typography, Paper, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  RocketLaunchIcon,
  MonetizationOnIcon,
  ElectricBoltIcon,
  ShieldOutlinedIcon,
  LockResetIcon,
  TrendingUpIcon
} from '../common/Icons';

export const PlatformFeatures: React.FC = () => {
  const features = [
    {
      icon: <RocketLaunchIcon sx={{ fontSize: 28, color: '#a78bfa' }} />,
      badge: '45-Day Protocol',
      title: 'Algorithmic Doubling Cycles',
      desc: 'Exclusive 24-hour algorithmic liquidity doubling cycles designed to double your principal amount in 45 days at 2.2222% daily compound yield.',
      color: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.12)'
    },
    {
      icon: <MonetizationOnIcon sx={{ fontSize: 28, color: '#FFD700' }} />,
      badge: 'Daily Rewards',
      title: '2.22% Automated Daily Yield',
      desc: 'Continuous real-time profit settlement calculated per 24-hour reservation cycle with automated 20-second order confirmation.',
      color: '#FFD700',
      bgGlow: 'rgba(255, 215, 0, 0.1)'
    },
    {
      icon: <ElectricBoltIcon sx={{ fontSize: 28, color: '#38bdf8' }} />,
      badge: 'Zero Waiting',
      title: 'Instant Multi-Chain Payouts',
      desc: 'Direct, frictionless withdrawals to TRC20, BEP20, and ERC20 wallet addresses with 0% hidden deposit and platform protocol fees.',
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.12)'
    },
    {
      icon: <ShieldOutlinedIcon sx={{ fontSize: 28, color: '#34d399' }} />,
      badge: 'Institutional Grade',
      title: 'Multi-Sig Vault Security',
      desc: 'Smart contract liquidity isolation, cold storage reserves, encrypted passkey authentication, and live anti-fraud telemetry.',
      color: '#34d399',
      bgGlow: 'rgba(52, 211, 153, 0.12)'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 28, color: '#f43f5e' }} />,
      badge: 'Tiered VIP',
      title: 'Multi-Tier Referral Growth',
      desc: 'Earn up to 0.1% daily lifetime team overrides across 3 tiers (A, B, C) plus instant cash sponsor bonuses up to 20 USDT per deposit.',
      color: '#f43f5e',
      bgGlow: 'rgba(244, 63, 94, 0.12)'
    },
    {
      icon: <LockResetIcon sx={{ fontSize: 28, color: '#60a5fa' }} />,
      badge: '100% Verifiable',
      title: 'Transparent Ledger Audit',
      desc: 'Every reservation, yield payout, and withdrawal is cryptographically tracked with on-chain hash transparency and ledger proof.',
      color: '#60a5fa',
      bgGlow: 'rgba(96, 165, 250, 0.12)'
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'rgba(8, 10, 18, 0.75)', position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="WHY CHOOSE IVESTBOT"
            size="small"
            sx={{
              bgcolor: 'rgba(139, 92, 246, 0.12)',
              color: '#a78bfa',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              mb: 1.5
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            Built for Next-Gen Crypto Yield
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF', maxWidth: 640, mx: 'auto', mt: 1 }}>
            Institutional architecture designed for individual Web3 investors with automated high-yield reservation pools.
          </Typography>
        </Box>

        {/* 6 Feature Cards Grid */}
        <Grid container spacing={3}>
          {features.map((f, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                sx={{
                  p: 3.5,
                  bgcolor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: f.color,
                    transform: 'translateY(-6px)',
                    boxShadow: `0 16px 36px ${f.bgGlow}`,
                    '& .feature-icon-box': {
                      transform: 'scale(1.1) rotate(4deg)'
                    }
                  }
                }}
              >
                {/* Top Badge & Icon */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                  <Box
                    className="feature-icon-box"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: f.bgGlow,
                      border: `1px solid ${f.color}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Chip
                    label={f.badge}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                      color: f.color,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 1, fontSize: '1.1rem' }}>
                  {f.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.65, fontSize: '0.9rem', flexGrow: 1 }}>
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
