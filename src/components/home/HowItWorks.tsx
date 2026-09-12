import React from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  HowToRegOutlinedIcon,
  MonetizationOnIcon,
  AutoAwesomeIcon,
  ArrowForwardIcon
} from '../common/Icons';

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openRegisterModal } = useApp();

  const steps = [
    {
      num: '01',
      title: 'Create Your Account',
      desc: 'Instant 1-click registration. Your non-custodial multi-chain USDT balance is automatically provisioned with 0% activation fee.',
      icon: <HowToRegOutlinedIcon sx={{ fontSize: 28, color: '#38bdf8' }} />,
      accentColor: '#38bdf8',
      tag: 'Step 1 • 30 Seconds'
    },
    {
      num: '02',
      title: 'Deposit & Choose Pool',
      desc: 'Fund your balance with USDT (TRC20/BEP20) and lock your funds into 24-hour doubling cycle pools from $50 up to $1,000.',
      icon: <MonetizationOnIcon sx={{ fontSize: 28, color: '#FFD700' }} />,
      accentColor: '#FFD700',
      tag: 'Step 2 • 24H Cycles'
    },
    {
      num: '03',
      title: 'Earn & Instant Payout',
      desc: 'Receive automated 1.00% daily profit directly into your wallet. Compound your principal and withdraw anytime.',
      icon: <AutoAwesomeIcon sx={{ fontSize: 28, color: '#34d399' }} />,
      accentColor: '#34d399',
      tag: 'Step 3 • 1.00% Daily'
    }
  ];

  const handleCta = () => {
    if (isAuthenticated) {
      navigate('/reservation');
    } else {
      openRegisterModal();
    }
  };

  return (
    <Box sx={{ py: 8, position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#38bdf8', fontWeight: 800, letterSpacing: '0.12em' }}>
            EFFORTLESS ONBOARDING
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
              color: '#ffffff',
              letterSpacing: '-0.02em',
              mt: 0.5
            }}
          >
            Start Earning in 3 Simple Steps
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF', maxWidth: 600, mx: 'auto', mt: 1 }}>
            No complicated technical knowledge or hardware required. Everything is automated.
          </Typography>
        </Box>

        {/* 3 Step Cards */}
        <Grid container spacing={3.5} sx={{ mb: 5 }}>
          {steps.map((s, idx) => (
            <Grid key={idx} size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: { xs: 3, sm: 4 },
                  bgcolor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 4,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.35s ease',
                  '&:hover': {
                    borderColor: s.accentColor,
                    transform: 'translateY(-6px)',
                    boxShadow: `0 16px 36px ${s.accentColor}22`
                  }
                }}
              >
                {/* Step Number Watermark */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 20,
                    fontWeight: 900,
                    fontSize: '3rem',
                    color: 'rgba(255, 255, 255, 0.03)',
                    userSelect: 'none',
                    fontFamily: 'monospace'
                  }}
                >
                  {s.num}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: `${s.accentColor}18`,
                      border: `1px solid ${s.accentColor}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {s.icon}
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: s.accentColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {s.tag}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      {s.title}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.7, fontSize: '0.92rem', flexGrow: 1 }}>
                  {s.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Action Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCta}
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                transform: 'scale(1.02)'
              }
            }}
          >
            {isAuthenticated ? 'Go to Reservation Pools' : 'Get Started with Free Account'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
