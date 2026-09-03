import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  HowToRegOutlinedIcon,
  MonetizationOnIcon,
  AutoAwesomeIcon
} from '../common/Icons';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create your account',
      desc: 'Instant 1-click registration. Your multi-chain USDT wallet is automatically provisioned with zero setup fees.',
      icon: <HowToRegOutlinedIcon sx={{ fontSize: 24, color: '#38bdf8' }} />
    },
    {
      num: '02',
      title: 'Deposit & Reserve',
      desc: 'Choose your desired tier pool from 50 USDT to 1,000 USDT and lock in the 24-hour doubling cycle.',
      icon: <MonetizationOnIcon sx={{ fontSize: 24, color: '#FFD700' }} />
    },
    {
      num: '03',
      title: 'Earn & Withdraw',
      desc: 'Receive 2.857% daily profit directly into your balance. Withdraw to your personal TRC20/BEP20 crypto address anytime.',
      icon: <AutoAwesomeIcon sx={{ fontSize: 24, color: '#10b981' }} />
    }
  ];

  return (
    <Box sx={{ py: 7 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="overline" sx={{ color: '#a78bfa', fontWeight: 800, letterSpacing: '0.1em' }}>
            SIMPLE ONBOARDING
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', mt: 0.5 }}>
            Three steps to your first reward
          </Typography>
        </Box>

        {/* 3 Step Cards */}
        <Grid container spacing={3}>
          {steps.map((s, idx) => (
            <Grid key={idx} size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3.5,
                  bgcolor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 4,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Step Number Watermark */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 20,
                    fontWeight: 900,
                    fontSize: '2.5rem',
                    color: 'rgba(255, 255, 255, 0.04)',
                    userSelect: 'none'
                  }}
                >
                  {s.num}
                </Typography>

                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5
                  }}
                >
                  {s.icon}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 1 }}>
                  {s.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.6 }}>
                  {s.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
