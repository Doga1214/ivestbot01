import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  GroupsIcon,
  EventAvailableIcon,
  MonetizationOnIcon,
  ElectricBoltIcon
} from '../common/Icons';

export const PlatformStatsBar: React.FC = () => {
  const stats = [
    {
      value: '14,850+',
      label: 'Active Traders',
      color: '#38bdf8',
      icon: <GroupsIcon sx={{ fontSize: 22, color: '#38bdf8' }} />,
      glow: 'rgba(56, 189, 248, 0.15)'
    },
    {
      value: '8,420+',
      label: 'Daily 24h Cycles',
      color: '#34d399',
      icon: <EventAvailableIcon sx={{ fontSize: 22, color: '#34d399' }} />,
      glow: 'rgba(52, 211, 153, 0.15)'
    },
    {
      value: '$3.45M+',
      label: 'Total Volume Locked',
      color: '#FFD700',
      icon: <MonetizationOnIcon sx={{ fontSize: 22, color: '#FFD700' }} />,
      glow: 'rgba(255, 215, 0, 0.15)'
    },
    {
      value: '2.2222%',
      label: 'Algorithmic Daily APY',
      color: '#a78bfa',
      icon: <ElectricBoltIcon sx={{ fontSize: 22, color: '#a78bfa' }} />,
      glow: 'rgba(167, 139, 250, 0.15)'
    }
  ];

  return (
    <Box sx={{ py: { xs: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          {stats.map((s, idx) => (
            <Grid key={idx} size={{ xs: 6, md: 3 }}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  bgcolor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3.5,
                  boxShadow: `0 10px 30px ${s.glow}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2.5,
                    bgcolor: s.glow,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      color: s.color,
                      letterSpacing: '-0.02em',
                      fontSize: { xs: '1.25rem', sm: '1.55rem' },
                      lineHeight: 1.1
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#9CA3AF',
                      fontWeight: 700,
                      fontSize: { xs: '0.72rem', sm: '0.8rem' },
                      display: 'block',
                      mt: 0.3
                    }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
