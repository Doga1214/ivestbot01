import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  MonetizationOnIcon,
  PendingActionsIcon,
  GroupsIcon,
  BlockIcon
} from '../common/Icons';
import type { PlatformStats } from '../../services/adminService';
import { formatUSDT } from '../../utils/formatters';

interface AdminOverviewProps {
  stats: PlatformStats;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Pending Deposits',
      value: formatUSDT(stats.totalPendingDepositsSum),
      subtext: `${stats.totalPendingDepositsCount} deposits waiting verification`,
      icon: <PendingActionsIcon sx={{ fontSize: 26, color: '#f59e0b' }} />,
      glowColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    {
      title: 'Total Circulation (USDT)',
      value: formatUSDT(stats.totalPlatformCirculation),
      subtext: 'Combined user wallet balances',
      icon: <MonetizationOnIcon sx={{ fontSize: 26, color: '#34d399' }} />,
      glowColor: 'rgba(52, 211, 153, 0.15)',
      borderColor: 'rgba(52, 211, 153, 0.3)'
    },
    {
      title: 'Registered Users',
      value: `${stats.totalUsers}`,
      subtext: `${stats.activeUsers} active accounts`,
      icon: <GroupsIcon sx={{ fontSize: 26, color: '#60a5fa' }} />,
      glowColor: 'rgba(96, 165, 250, 0.15)',
      borderColor: 'rgba(96, 165, 250, 0.3)'
    },
    {
      title: 'Restricted / Inactive Wallets',
      value: `${stats.restrictedWalletsCount}`,
      subtext: 'Frozen or restricted wallets',
      icon: <BlockIcon sx={{ fontSize: 26, color: '#f87171' }} />,
      glowColor: 'rgba(248, 113, 113, 0.15)',
      borderColor: 'rgba(248, 113, 113, 0.3)'
    }
  ];

  return (
    <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
      {cards.map((card, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: '100%',
              backgroundColor: '#111522',
              border: `1px solid ${card.borderColor}`,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 4px 20px ${card.glowColor}`
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: card.glowColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {card.icon}
                </Box>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
                {card.value}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
                {card.subtext}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
