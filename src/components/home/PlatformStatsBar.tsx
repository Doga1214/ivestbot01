import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';

export const PlatformStatsBar: React.FC = () => {
  const stats = [
    { value: '10K+', label: 'Active Traders', color: '#ffffff' },
    { value: '5K+', label: 'Daily Reservations', color: '#38bdf8' },
    { value: '$2M+', label: 'Total Volume Locked', color: '#34d399' },
    { value: '24/7', label: 'Automated Yield Engine', color: '#a78bfa' }
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            bgcolor: '#111522',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 4,
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)'
          }}
        >
          <Grid container spacing={3} sx={{ textAlign: 'center' }}>
            {stats.map((s, idx) => (
              <Grid key={idx} size={{ xs: 6, md: 3 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: s.color,
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.8rem', sm: '2.4rem' },
                    mb: 0.5
                  }}
                >
                  {s.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#9CA3AF',
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                  }}
                >
                  {s.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};
