import React, { useState } from 'react';
import { Box, Typography, Button, Container, Chip } from '@mui/material';
import { Sparkles, Trophy, Gift, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LuckySpinModal } from '../spin/LuckySpinModal';

export const LuckySpinBanner: React.FC = () => {
  const { user, openLoginModal } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpen = () => {
    if (!user?.id) {
      openLoginModal();
      return;
    }
    setIsOpen(true);
  };

  return (
    <Box sx={{ py: 6, px: 2, background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0%, transparent 70%)' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(245, 158, 11, 0.15)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Corner Glow */}
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Left: Text Details */}
          <Box sx={{ maxWidth: { xs: '100%', md: '600px' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Chip
                icon={<Sparkles size={14} color="#0F172A" />}
                label="LUCKY WHEEL DRAW"
                size="small"
                sx={{
                  bgcolor: '#F59E0B',
                  color: '#0F172A',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  letterSpacing: '0.5px'
                }}
              />
              <Chip
                label="Instant USDT Multi-Spins"
                size="small"
                variant="outlined"
                sx={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38BDF8', fontSize: '0.72rem', fontWeight: 600 }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: '#F8FAFC',
                fontSize: { xs: '1.6rem', md: '2.1rem' },
                lineHeight: 1.2,
                mb: 1.5
              }}
            >
              Spin the <span style={{ color: '#FBBF24' }}>Lucky Wheel</span> & Win Up To 50x Cash Prizes
            </Typography>

            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.6, mb: 3 }}>
              Stake USDT (1 - 100 USDT) and spin multiple times without limits! Win instant <strong style={{ color: '#22C55E' }}>USDT cash multipliers</strong>,
              24-hour <strong style={{ color: '#38BDF8' }}>APR yield boosters</strong>, or the coveted{' '}
              <strong style={{ color: '#F59E0B' }}>50x Mega Jackpot</strong>!
            </Typography>

            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#0F172A',
                fontWeight: 900,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: '14px',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
                textTransform: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #FBBF24 0%, #B45309 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Gift size={20} />
              Spin Lucky Wheel (USDT)
              <ArrowRight size={18} />
            </Button>

          </Box>

          {/* Right: Wheel Miniature Graphic */}
          <Box
            onClick={handleOpen}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              p: 3,
              borderRadius: '20px',
              bgcolor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              textAlign: 'center',
              minWidth: { xs: '100%', sm: '240px' },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.03)',
                borderColor: '#F59E0B',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.25)'
              }
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'rgba(245, 158, 11, 0.15)',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Trophy size={36} color="#FBBF24" />
            </Box>
            <Typography sx={{ fontWeight: 800, color: '#FEF08A', fontSize: '1.1rem' }}>
              Mega Jackpot
            </Typography>
            <Typography sx={{ fontWeight: 900, color: '#22C55E', fontSize: '1.4rem' }}>
              100.00 USDT
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5 }}>
              Tap to spin & win
            </Typography>
          </Box>
        </Box>
      </Container>

      {user?.id && (
        <LuckySpinModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          userId={user.id}
        />
      )}
    </Box>
  );
};
