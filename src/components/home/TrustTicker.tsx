import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ShieldOutlinedIcon,
  ElectricBoltIcon,
  MonetizationOnIcon,
  GroupsIcon,
  AccessTimeIcon,
  VerifiedIcon
} from '../common/Icons';

export const TrustTicker: React.FC = () => {
  const items = [
    { label: 'Audited Smart Contracts', icon: <ShieldOutlinedIcon sx={{ fontSize: 16, color: '#10b981' }} /> },
    { label: 'Instant USDT Deposits & Payouts', icon: <ElectricBoltIcon sx={{ fontSize: 16, color: '#38bdf8' }} /> },
    { label: '2.857% Daily Continuous Yield', icon: <MonetizationOnIcon sx={{ fontSize: 16, color: '#FFD700' }} /> },
    { label: '35-Day Principle Doubling Cycle', icon: <VerifiedIcon sx={{ fontSize: 16, color: '#a78bfa' }} /> },
    { label: '3-Tier Multi-Level Affiliate Rewards', icon: <GroupsIcon sx={{ fontSize: 16, color: '#34d399' }} /> },
    { label: '24/7 Automated Algorithmic Engine', icon: <AccessTimeIcon sx={{ fontSize: 16, color: '#f472b6' }} /> }
  ];

  return (
    <Box
      sx={{
        py: 2,
        bgcolor: 'rgba(8, 10, 18, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2, sm: 3, md: 5 },
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          px: { xs: 1.5, sm: 3 }
        }}
      >
        {items.map((item, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, py: 0.5 }}>
            {item.icon}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#9CA3AF',
                fontSize: { xs: '0.78rem', sm: '0.85rem' },
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
