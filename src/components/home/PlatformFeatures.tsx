import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  RocketLaunchIcon,
  MonetizationOnIcon,
  ElectricBoltIcon,
  ShieldOutlinedIcon
} from '../common/Icons';

export const PlatformFeatures: React.FC = () => {
  const features = [
    {
      icon: <RocketLaunchIcon sx={{ fontSize: 24, color: '#a78bfa' }} />,
      title: 'Curated Reservations',
      desc: 'Exclusive 24-hour algorithmic liquidity doubling cycles with principal doubling in exactly 35 days.'
    },
    {
      icon: <MonetizationOnIcon sx={{ fontSize: 24, color: '#a78bfa' }} />,
      title: 'Daily Yield Rewards',
      desc: 'Continuous real-time profit distribution calculated at 2.8571% per 24-hour reservation cycle.'
    },
    {
      icon: <ElectricBoltIcon sx={{ fontSize: 24, color: '#a78bfa' }} />,
      title: 'Instant USDT Payouts',
      desc: 'Direct, low-fee multi-chain withdrawals to TRC20, BEP20, and ERC20 wallet addresses.'
    },
    {
      icon: <ShieldOutlinedIcon sx={{ fontSize: 24, color: '#a78bfa' }} />,
      title: 'Focused on Security',
      desc: 'Multi-sig vault custody, cold storage asset isolation, and real-time anti-fraud telemetry.'
    }
  ];

  return (
    <Box sx={{ py: 7, bgcolor: 'rgba(8, 10, 18, 0.6)' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="overline" sx={{ color: '#a78bfa', fontWeight: 800, letterSpacing: '0.1em' }}>
            WHY CHOOSE IVESTBOT
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', mt: 0.5 }}>
            Everything you need to thrive in Web3
          </Typography>
        </Box>

        {/* 4 Feature Cards */}
        <Grid container spacing={3}>
          {features.map((f, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 4,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(139, 92, 246, 0.15)'
                  }
                }}
              >
                {/* Icon Box */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: 'rgba(139, 92, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  {f.icon}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 1, fontSize: '1.05rem' }}>
                  {f.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.6, fontSize: '0.88rem' }}>
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
