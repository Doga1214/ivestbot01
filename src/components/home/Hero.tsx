import React from 'react';
import { Box, Typography, Button, Grid, Paper, Stack } from '@mui/material';
import {
  TrendingUpIcon,
  ElectricBoltIcon
} from '../common/Icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const Hero: React.FC = () => {
  const { isAuthenticated, openRegisterModal, openLoginModal, openAnnouncement } = useApp();
  const navigate = useNavigate();

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, textAlign: { xs: 'center', md: 'left' } }}>
      <Grid container spacing={4} sx={{ alignItems: 'center' }}>
        {/* Left Headline & CTAs */}
        <Grid size={{ xs: 12, md: 6.5 }}>
          <Box
            onClick={openAnnouncement}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.8,
              borderRadius: 5,
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              mb: 3,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.2)'
              }
            }}
          >
            <ElectricBoltIcon sx={{ color: '#a78bfa', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: '#c4b5fd', fontWeight: 700, letterSpacing: '0.05em' }}>
              DEPOSIT BONUS EVENT: 50–1000 USDT MILESTONES 📢
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2.4rem', sm: '3.1rem', md: '3.6rem' },
              fontWeight: 900,
              lineHeight: 1.15,
              mb: 2.5
            }}
          >
            Autonomous AI Wealth Engine with{' '}
            <Typography
              component="span"
              variant="inherit"
              sx={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              IVESTBOT
            </Typography>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#9CA3AF',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.6,
              mb: 4,
              maxWidth: 580
            }}
          >
            Next-generation 24-hour algorithmic yield reservations, secure zero-lock wallet ledger, and multi-tier A (1.0%), B (0.5%), C (0.5%) referral community network.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
          >
            {isAuthenticated ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/reservation')}
                  sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
                >
                  Go to Reservation
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/wallet')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff'
                  }}
                >
                  Manage Wallet
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => openRegisterModal()}
                  sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
                >
                  Create Free Account
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={openLoginModal}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff'
                  }}
                >
                  Member Login
                </Button>
              </>
            )}
          </Stack>
        </Grid>

        {/* Right Digital AI 3D Graphic Showcase */}
        <Grid size={{ xs: 12, md: 5.5 }}>
          <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Ambient Background Glow */}
            <Box
              sx={{
                position: 'absolute',
                width: '90%',
                height: '90%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 60%, transparent 80%)',
                filter: 'blur(40px)',
                zIndex: 0
              }}
            />

            {/* AI Image Card */}
            <Paper
              sx={{
                position: 'relative',
                zIndex: 1,
                borderRadius: 4,
                overflow: 'hidden',
                background: '#111522',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.25)',
                width: '100%',
                maxWidth: 480
              }}
            >
              {/* Image Element */}
              <Box
                component="img"
                src="/assets/digital_ai_bot.jpg"
                alt="IVESTBOT Digital AI Engine"
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.03)'
                  }
                }}
              />

              {/* Floating Live Badges */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(8, 10, 18, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(139, 92, 246, 0.4)'
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981'
                  }}
                />
                <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 800 }}>
                  AI YIELD ENGINE ACTIVE
                </Typography>
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 1.8,
                  py: 0.8,
                  borderRadius: 3,
                  backgroundColor: 'rgba(8, 10, 18, 0.88)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(59, 130, 246, 0.4)'
                }}
              >
                <TrendingUpIcon sx={{ color: '#34d399', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>
                  2.86% Daily (2X Double in 35 Days)
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
