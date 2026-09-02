import React from 'react';
import { Box, Container, Typography, Paper, Chip } from '@mui/material';
import {
  ElectricBoltIcon,
  PlayArrowIcon,
  VerifiedIcon
} from '../common/Icons';

export const LiveActionDemo: React.FC = () => {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="overline" sx={{ color: '#a78bfa', fontWeight: 800, letterSpacing: '0.1em' }}>
            INTERACTIVE PREVIEW
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', mt: 0.5 }}>
            See Ivestbot in action
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', maxWidth: 600, mx: 'auto', mt: 1 }}>
            24-hour algorithmic cycle doubling simulation with automated 20-second order fulfillment.
          </Typography>
        </Box>

        {/* Video / Simulation Screen Container */}
        <Paper
          sx={{
            p: { xs: 2, sm: 4 },
            bgcolor: '#111522',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 5,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: { xs: 260, sm: 380 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, #0B0E17 80%)'
          }}
        >
          {/* Glowing Play Circle */}
          <Box
            sx={{
              width: { xs: 64, sm: 84 },
              height: { xs: 64, sm: 84 },
              borderRadius: '50%',
              bgcolor: 'rgba(139, 92, 246, 0.25)',
              border: '2px solid #8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
              mb: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.08)',
                boxShadow: '0 0 60px rgba(139, 92, 246, 0.9)'
              }
            }}
          >
            <PlayArrowIcon sx={{ fontSize: { xs: 32, sm: 44 }, ml: 0.5 }} />
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}>
            Automated Yield Arbitrage Engine Simulation
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            Click to observe live 24h reservation doubling cycle
          </Typography>

          {/* Sub Ticker Pill */}
          <Box sx={{ position: 'absolute', bottom: 16 }}>
            <Chip
              icon={<ElectricBoltIcon style={{ color: '#38bdf8', fontSize: 14 }} />}
              label="Real-time 20-second order processing protocol"
              size="small"
              sx={{
                bgcolor: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#9CA3AF',
                fontSize: '0.75rem'
              }}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
