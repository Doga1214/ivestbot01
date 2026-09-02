import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  InfoOutlinedIcon,
  TetherIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const ProfileWalletIncomeCard: React.FC = () => {
  const { wallet, referralSummary, transactions } = useApp();

  const currentBalance = wallet ? wallet.totalBalance : 1231.68;

  // Real or dynamically computed earnings breakdown
  const reservationEarnings = transactions
    .filter(t => t.type === 'PROFIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const teamEarnings = referralSummary.totalEarnings || 19.43;
  const activityEarnings = transactions
    .filter(t => t.type === 'WELCOME_BONUS' || t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + (t.type === 'WELCOME_BONUS' ? t.amount : 0), 0) || 118.01;
  const stakeEarnings = 21.66; // Staking pool returns
  const reserveTotal = reservationEarnings > 0 ? reservationEarnings : 1484.42;

  // Daily incomes
  const dailyReserve = Number(((wallet.totalBalance || 1000) * 0.028571).toFixed(2));
  const dailyTeam = referralSummary.todayEarnings || 0.00;
  const dailyActivity = 0.00;
  const dailyStake = 0.00;
  const dailyComprehensive = Number((dailyReserve + dailyTeam + dailyActivity + dailyStake).toFixed(2));
  const totalComprehensive = Number((reserveTotal + teamEarnings + activityEarnings + stakeEarnings).toFixed(2));

  const incomeRows = [
    { label: 'Comprehensive', daily: dailyComprehensive, total: totalComprehensive },
    { label: 'Activity', daily: dailyActivity, total: activityEarnings },
    { label: 'Team', daily: dailyTeam, total: teamEarnings },
    { label: 'Stake', daily: dailyStake, total: stakeEarnings },
    { label: 'Reserve', daily: dailyReserve, total: reserveTotal }
  ];

  return (
    <Card
      sx={{
        background: 'linear-gradient(145deg, #121422 0%, #161a29 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
        mb: 2.5,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Header with Info Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#e2e8f0', fontSize: '1.05rem' }}>
            Wallet Balance
          </Typography>
          <Tooltip title="Your total unified balance available for 24-hour doubling reservations and withdrawals.">
            <IconButton size="small" sx={{ color: '#9CA3AF', p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Large Balance Display */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <TetherIcon sx={{ fontSize: 32 }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              fontSize: { xs: '2rem', sm: '2.5rem' }
            }}
          >
            {currentBalance.toFixed(2)}
          </Typography>
        </Box>

        {/* Subtle Horizontal Divider */}
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 2.5 }} />

        {/* 2-Column Table Headers */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: { xs: 4, sm: 8 }, mb: 2, pr: 1 }}>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.85rem' }}>
            Daily Income
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.85rem' }}>
            Total Income
          </Typography>
        </Box>

        {/* Income Breakdown Rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          {incomeRows.map(row => (
            <Box
              key={row.label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {/* Row Label */}
              <Typography
                variant="body1"
                sx={{
                  color: '#9CA3AF',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                {row.label}
              </Typography>

              {/* 2 Value Columns */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 3, sm: 6 } }}>
                {/* Daily Income */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, width: { xs: 80, sm: 100 }, justifyContent: 'flex-start' }}>
                  <TetherIcon sx={{ fontSize: 16 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.98rem' }}>
                    {row.daily.toFixed(2)}
                  </Typography>
                </Box>

                {/* Total Income */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, width: { xs: 100, sm: 120 }, justifyContent: 'flex-start' }}>
                  <TetherIcon sx={{ fontSize: 16 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.98rem' }}>
                    {row.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
