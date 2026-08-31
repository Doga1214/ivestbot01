import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import {
  EventAvailableIcon,
  AccountBalanceWalletIcon,
  GroupsIcon,
  MilitaryTechIcon
} from '../common/Icons';

export const PlatformFeatures: React.FC = () => {
  const features = [
    {
      icon: <EventAvailableIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />,
      title: 'Daily Reservation (35-Day 2X)',
      desc: 'One smart reservation per 24-hour cycle. Generates 2.8571% daily yield, doubling your principle in exactly 35 days (100% net return).'
    },
    {
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#3b82f6' }} />,
      title: 'Instant Wallet & Ledger',
      desc: 'Accounts start at 0.00 USDT. Instant credit on deposit, immediate deduction on withdrawal, with immutable ledger tracking.'
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 32, color: '#10b981' }} />,
      title: 'Referral Program',
      desc: 'Build your network. Receive 1.0% on A direct members, 0.5% on B and C members, plus 50–1000 USDT deposit milestone bonuses.'
    },
    {
      icon: <MilitaryTechIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
      title: 'User Levels (1–4)',
      desc: 'Level up from Level 1 to VIP Partner as your wallet balance and active member community expand.'
    }
  ];

  return (
    <Box sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
          Four Pillars of Ivestbot
        </Typography>
        <Typography variant="body1" sx={{ color: '#9CA3AF', maxWidth: 600, mx: 'auto' }}>
          Explore our streamlined financial modules designed for growth, security, and transparent tracking.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {features.map((f, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(139, 92, 246, 0.15)',
                  borderColor: 'rgba(139, 92, 246, 0.3)'
                }
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                <Box sx={{ mb: 1 }}>{f.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.6 }}>
                  {f.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
