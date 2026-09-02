import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  RocketLaunchIcon,
  ShieldOutlinedIcon,
  ElectricBoltIcon,
  MonetizationOnIcon
} from '../common/Icons';

export const BottomCtaBanner: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openRegisterModal } = useApp();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/reservation');
    } else {
      openRegisterModal();
    }
  };

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Paper
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 5,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.25)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Tag */}
          <Typography variant="overline" sx={{ color: '#FFD700', fontWeight: 800, letterSpacing: '0.1em' }}>
            ⚡ JOIN 10,000+ SMART INVESTORS
          </Typography>

          {/* Headline */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' },
              color: '#ffffff',
              letterSpacing: '-0.02em',
              mt: 1,
              mb: 2
            }}
          >
            Start collecting{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              digital legends
            </span>{' '}
            today
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#9CA3AF',
              maxWidth: 640,
              mx: 'auto',
              lineHeight: 1.6,
              mb: 4,
              fontSize: { xs: '0.95rem', sm: '1.05rem' }
            }}
          >
            Create your free account, select your preferred crypto yield reservation pool, and start receiving 2.857% automated daily returns.
          </Typography>

          {/* Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
              endIcon={<RocketLaunchIcon />}
              sx={{
                px: { xs: 3.5, sm: 4.5 },
                py: 1.6,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                boxShadow: '0 8px 30px rgba(139, 92, 246, 0.45)',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                }
              }}
            >
              Start Reserving →
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/referrals')}
              sx={{
                px: { xs: 3, sm: 4 },
                py: 1.6,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: '1rem',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#a78bfa',
                  bgcolor: 'rgba(139, 92, 246, 0.1)'
                }
              }}
            >
              Affiliate Program
            </Button>
          </Box>

          {/* Trust Footnotes */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, sm: 4 }, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#9CA3AF' }}>
              <ShieldOutlinedIcon sx={{ color: '#10b981', fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Bank-Grade Security</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#9CA3AF' }}>
              <ElectricBoltIcon sx={{ color: '#38bdf8', fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Instant TRC20 Payouts</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#9CA3AF' }}>
              <MonetizationOnIcon sx={{ color: '#FFD700', fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>0% Deposit Fees</Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
