import React from 'react';
import { Box, Typography, Button, Container, Paper, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  RocketLaunchIcon,
  ShieldOutlinedIcon,
  ElectricBoltIcon,
  VerifiedIcon,
  MonetizationOnIcon
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

  const heroCards = [
    {
      id: 'h1',
      name: 'Titan Alpha Node',
      badge: 'Level 1 VIP',
      badgeColor: '#f59e0b',
      dailyRate: '2.22%',
      floorUSDT: 10,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      accentColor: '#f59e0b',
      activeUsers: 1420,
      fillPercent: 92
    },
    {
      id: 'h2',
      name: 'Cyber Pulse Matrix',
      badge: 'Level 2 VIP',
      badgeColor: '#10b981',
      dailyRate: '2.22%',
      floorUSDT: 50,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      accentColor: '#10b981',
      activeUsers: 840,
      fillPercent: 86
    },
    {
      id: 'h3',
      name: 'Aurora Quantum Node',
      badge: 'Level 3 VIP',
      badgeColor: '#a78bfa',
      dailyRate: '2.22%',
      floorUSDT: 100,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      accentColor: '#8b5cf6',
      activeUsers: 512,
      fillPercent: 78
    },
    {
      id: 'h4',
      name: 'Genesis Apex Vault',
      badge: 'Level 4 Diamond',
      badgeColor: '#38bdf8',
      dailyRate: '2.22%',
      floorUSDT: 250,
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
      accentColor: '#38bdf8',
      activeUsers: 328,
      fillPercent: 95
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
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(139, 92, 246, 0.28), rgba(8, 10, 18, 0) 75%)'
      }}
    >
      {/* Background ambient orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          bgcolor: 'rgba(139, 92, 246, 0.08)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          bgcolor: 'rgba(56, 189, 248, 0.08)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Top Tag Pill */}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <Chip
            icon={<ElectricBoltIcon style={{ color: '#FFD700', fontSize: 16 }} />}
            label="Star AI 2.0 • Next-Gen Algorithmic Yield Protocol"
            sx={{
              bgcolor: 'rgba(255, 215, 0, 0.08)',
              border: '1px solid rgba(255, 215, 0, 0.35)',
              color: '#FFD700',
              fontWeight: 800,
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              py: 0.6,
              px: 1,
              borderRadius: 3,
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)'
            }}
          />
        </Box>

        {/* Main Headline */}
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '2rem', sm: '3.2rem', md: '4.5rem' },
            letterSpacing: '-0.03em',
            lineHeight: { xs: 1.18, md: 1.1 },
            color: '#ffffff',
            maxWidth: 950,
            mx: 'auto',
            mb: 2.5,
            px: { xs: 0.5, sm: 0 }
          }}
        >
          Collect, Stake & Earn from{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(255, 215, 0, 0.35)'
            }}
          >
            Digital Legends
          </span>
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: '#9CA3AF',
            fontSize: { xs: '0.92rem', sm: '1.1rem', md: '1.2rem' },
            maxWidth: 740,
            mx: 'auto',
            lineHeight: 1.6,
            mb: { xs: 3.5, md: 4.5 },
            px: { xs: 1, sm: 0 }
          }}
        >
          The premier Web3 automated crypto yield platform. Automated 24h AI reservation cycles, continuous 2.22% daily returns, and 3-tier multi-level passive affiliate commissions.
        </Typography>

        {/* Dual CTA Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2.5 },
            mb: { xs: 3.5, md: 4.5 },
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
              px: { xs: 3.5, sm: 5 },
              py: { xs: 1.5, sm: 1.7 },
              borderRadius: 3,
              fontWeight: 900,
              fontSize: { xs: '1rem', sm: '1.05rem' },
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)',
              textTransform: 'none',
              letterSpacing: '0.01em',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                boxShadow: '0 12px 40px rgba(139, 92, 246, 0.7)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.25s ease'
            }}
          >
            Start Reserving Now →
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/reservation')}
            startIcon={<MonetizationOnIcon sx={{ color: '#38bdf8' }} />}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              px: { xs: 3, sm: 4.5 },
              py: { xs: 1.5, sm: 1.7 },
              borderRadius: 3,
              fontWeight: 800,
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.18)',
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              textTransform: 'none',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: '#a78bfa',
                bgcolor: 'rgba(139, 92, 246, 0.12)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.25s ease'
            }}
          >
            Explore Live Pools
          </Button>
        </Box>

        {/* Sub-Badges */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 2, sm: 4 },
            flexWrap: 'wrap',
            mb: { xs: 4.5, md: 6.5 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#9CA3AF' }}>
            <ShieldOutlinedIcon sx={{ color: '#10b981', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: { xs: '0.8rem', sm: '0.88rem' }, color: '#D1D5DB' }}>
              100% On-Chain Proof
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#9CA3AF' }}>
            <ElectricBoltIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: { xs: '0.8rem', sm: '0.88rem' }, color: '#D1D5DB' }}>
              Instant USDT TRC20 Payouts
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#9CA3AF' }}>
            <VerifiedIcon sx={{ color: '#a78bfa', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: { xs: '0.8rem', sm: '0.88rem' }, color: '#D1D5DB' }}>
              24H Automated Yield Cycles
            </Typography>
          </Box>
        </Box>

        {/* ─── 4 FLOATING HERO SHOWCASE ASSET CARDS ───────────── */}
        <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ justifyContent: 'center' }}>
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
                    transform: 'translateY(-8px)',
                    borderColor: card.accentColor,
                    boxShadow: `0 16px 40px ${card.accentColor}33`
                  }
                }}
              >
                {/* Artwork Area */}
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: 135, sm: 165 },
                    borderRadius: 2.5,
                    background: card.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    mb: 1.8
                  }}
                >
                  {/* Cyber Ape / Asset SVG Illustration */}
                  <svg width="105" height="105" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="42" fill="rgba(0,0,0,0.3)" />
                    <circle cx="50" cy="46" r="28" fill="rgba(255,255,255,0.9)" />
                    <circle cx="38" cy="42" r="7" fill="#0B0E17" />
                    <circle cx="62" cy="42" r="7" fill="#0B0E17" />
                    <circle cx="40" cy="40" r="2.5" fill="#38bdf8" />
                    <circle cx="64" cy="40" r="2.5" fill="#38bdf8" />
                    <ellipse cx="50" cy="56" rx="14" ry="9" fill="rgba(0,0,0,0.15)" />
                    <path d="M42 58 Q50 64 58 58" stroke="#0B0E17" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="25" y="22" width="50" height="9" rx="4.5" fill="#1E293B" />
                    <path d="M22 28 L78 28 L68 16 L32 16 Z" fill="#64748B" />
                  </svg>

                  {/* Level Pill */}
                  <Chip
                    label={card.badge}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.75)',
                      backdropFilter: 'blur(8px)',
                      color: card.badgeColor,
                      border: `1px solid ${card.badgeColor}66`,
                      fontWeight: 900,
                      fontSize: '0.68rem',
                      height: 22
                    }}
                  />

                  {/* Mini Staking Pulse Dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      borderRadius: 1.5,
                      px: 1,
                      py: 0.3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.6
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#10b981',
                        boxShadow: '0 0 8px #10b981'
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>
                      {card.fillPercent}% Active
                    </Typography>
                  </Box>
                </Box>

                {/* Card Meta */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', mb: 0.6 }}>
                  {card.name}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.68rem' }}>
                      Daily Return
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399', fontSize: '0.92rem' }}>
                      +{card.dailyRate}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${card.floorUSDT} USDT`}
                    size="small"
                    sx={{
                      bgcolor: `${card.accentColor}22`,
                      color: card.accentColor,
                      border: `1px solid ${card.accentColor}55`,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      height: 24
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
