import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  RocketLaunchIcon,
  ShieldOutlinedIcon,
  ElectricBoltIcon,
  VerifiedIcon
} from '../common/Icons';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openRegisterModal } = useApp();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/reservation');
    } else {
      openRegisterModal();
    }
  };

  // 4 Hero Showcase Asset Cards matching the screenshot
  const heroCards = [
    {
      id: 'h1',
      name: 'Titan Alpha',
      badge: 'Level 1',
      dailyRate: '2.857%',
      floorUSDT: 50,
      avatarColor: 'linear-gradient(135deg, #f59e0b, #d97706)',
      svgType: 'ape_gold'
    },
    {
      id: 'h2',
      name: 'Cyber Pulse',
      badge: 'Level 2',
      dailyRate: '2.857%',
      floorUSDT: 200,
      avatarColor: 'linear-gradient(135deg, #10b981, #059669)',
      svgType: 'ape_green'
    },
    {
      id: 'h3',
      name: 'Aurora Realm',
      badge: 'Level 3',
      dailyRate: '2.857%',
      floorUSDT: 500,
      avatarColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      svgType: 'ape_purple'
    },
    {
      id: 'h4',
      name: 'Genesis Node',
      badge: 'Level 4',
      dailyRate: '2.857%',
      floorUSDT: 1000,
      avatarColor: 'linear-gradient(135deg, #38bdf8, #0284c7)',
      svgType: 'ape_blue'
    }
  ];

  return (
    <Box
      sx={{
        pt: { xs: 5, md: 8 },
        pb: { xs: 6, md: 9 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139, 92, 246, 0.25), rgba(8, 10, 18, 0) 70%)'
      }}
    >
      <Container maxWidth="lg">
        {/* Top Tag Pill */}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <Chip
            icon={<ElectricBoltIcon style={{ color: '#FFD700', fontSize: 16 }} />}
            label="Next-Generation Automated Crypto Yield Protocol"
            sx={{
              bgcolor: 'rgba(255, 215, 0, 0.08)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              color: '#FFD700',
              fontWeight: 800,
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              py: 0.5,
              px: 1,
              borderRadius: 3
            }}
          />
        </Box>

        {/* Main Headline */}
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '1.85rem', sm: '2.9rem', md: '4.2rem' },
            letterSpacing: '-0.03em',
            lineHeight: { xs: 1.2, md: 1.1 },
            color: '#ffffff',
            maxWidth: 900,
            mx: 'auto',
            mb: 2.5,
            px: { xs: 0.5, sm: 0 }
          }}
        >
          Collect, stake & earn from{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(255, 215, 0, 0.3)'
            }}
          >
            digital legends
          </span>
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: '#9CA3AF',
            fontSize: { xs: '0.88rem', sm: '1.05rem', md: '1.15rem' },
            maxWidth: 720,
            mx: 'auto',
            lineHeight: 1.6,
            mb: { xs: 3, md: 4 },
            px: { xs: 1, sm: 0 }
          }}
        >
          The all-in-one Web3 crypto yield platform to double initial capital in 35 days.
          Automated 24h reservations, continuous 2.857% daily returns, and multi-tier passive commissions.
        </Typography>

        {/* Dual CTA Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 3, md: 4 },
            px: { xs: 2, sm: 0 }
          }}
        >
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleStart}
            endIcon={<RocketLaunchIcon />}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              px: { xs: 3, sm: 4.5 },
              py: { xs: 1.4, sm: 1.6 },
              borderRadius: 3,
              fontWeight: 800,
              fontSize: { xs: '0.95rem', sm: '1rem' },
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              boxShadow: '0 8px 30px rgba(139, 92, 246, 0.45)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                boxShadow: '0 12px 35px rgba(139, 92, 246, 0.6)'
              }
            }}
          >
            Start Reserving →
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/reservation')}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              px: { xs: 3, sm: 4 },
              py: { xs: 1.4, sm: 1.6 },
              borderRadius: 3,
              fontWeight: 800,
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              textTransform: 'none',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: '#a78bfa',
                bgcolor: 'rgba(139, 92, 246, 0.1)'
              }
            }}
          >
            View Live Pools
          </Button>
        </Box>

        {/* Sub-Badges */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 1.5, sm: 4 }, flexWrap: 'wrap', mb: { xs: 4, md: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#9CA3AF' }}>
            <ShieldOutlinedIcon sx={{ color: '#10b981', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.85rem' } }}>
              100% On-Chain Proof
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#9CA3AF' }}>
            <ElectricBoltIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.85rem' } }}>
              Instant USDT TRC20 Payouts
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#9CA3AF' }}>
            <VerifiedIcon sx={{ color: '#a78bfa', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.85rem' } }}>
              Double Principle in 35 Days
            </Typography>
          </Box>
        </Box>

        {/* ─── 4 FLOATING HERO SHOWCASE ASSET CARDS ───────────── */}
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ justifyContent: 'center' }}>
          {heroCards.map(card => (
            <Grid key={card.id} size={{ xs: 6, sm: 6, md: 3 }}>
              <Paper
                onClick={handleStart}
                sx={{
                  p: 2,
                  bgcolor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3.5,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                    boxShadow: '0 16px 35px rgba(139, 92, 246, 0.25)'
                  }
                }}
              >
                {/* Artwork Area */}
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: 130, sm: 160 },
                    borderRadius: 2.5,
                    background: card.avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    mb: 1.5
                  }}
                >
                  {/* Cyber Ape / Asset SVG Illustration */}
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="40" fill="rgba(0,0,0,0.25)" />
                    <circle cx="50" cy="46" r="28" fill="#D97706" />
                    <circle cx="38" cy="42" r="7" fill="#000" />
                    <circle cx="62" cy="42" r="7" fill="#000" />
                    <circle cx="40" cy="40" r="2.5" fill="#fff" />
                    <circle cx="64" cy="40" r="2.5" fill="#fff" />
                    <ellipse cx="50" cy="56" rx="14" ry="9" fill="#B45309" />
                    <path d="M42 58 Q50 64 58 58" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="25" y="24" width="50" height="8" rx="4" fill="#1E293B" />
                    <path d="M22 30 L78 30 L68 18 L32 18 Z" fill="#475569" />
                  </svg>

                  {/* Level Pill */}
                  <Chip
                    label={card.badge}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 22
                    }}
                  />
                </Box>

                {/* Card Meta */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', mb: 0.5 }}>
                  {card.name}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.7rem' }}>
                      Daily Return
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399', fontSize: '0.88rem' }}>
                      +{card.dailyRate}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${card.floorUSDT} USDT`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      height: 22
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
