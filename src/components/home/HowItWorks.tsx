import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Create Account',
      desc: 'Register in seconds using a unique username and optional sponsor referral code.'
    },
    {
      step: '02',
      title: 'Fund Wallet',
      desc: 'Deposit USDT to your verified deposit address to unlock Level 1 eligibility.'
    },
    {
      step: '03',
      title: 'Complete Reservation',
      desc: 'One-click daily reservation with 20-second processing and daily rate calculation.'
    },
    {
      step: '04',
      title: 'Track Wallet Activity',
      desc: 'Monitor real-time ledger records, referral bonuses, and transparent withdrawals.'
    }
  ];

  return (
    <Box sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
          How It Works
        </Typography>
        <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
          Simple 4-step workflow to get started on Ivestbot
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {steps.map((item, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                backgroundColor: '#111522',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 4,
                position: 'relative'
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: 'rgba(139, 92, 246, 0.25)',
                  mb: 1.5
                }}
              >
                {item.step}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.6 }}>
                {item.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
