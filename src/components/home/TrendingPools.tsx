import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  VerifiedIcon,
  TrendingUpIcon
} from '../common/Icons';

export const TrendingPools: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openRegisterModal } = useApp();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate('/reservation');
    } else {
      openRegisterModal();
    }
  };

  const topRankedPools = [
    { rank: 1, name: 'Genesis Alpha', dailyROI: '+2.857%', volume: '142.5K USDT', color: '#FFD700' },
    { rank: 2, name: 'Apex Matrix', dailyROI: '+2.857%', volume: '98.2K USDT', color: '#C0C0C0' },
    { rank: 3, name: 'Cyber Node', dailyROI: '+2.857%', volume: '64.1K USDT', color: '#CD7F32' },
    { rank: 4, name: 'Titan Pool', dailyROI: '+2.857%', volume: '45.8K USDT', color: '#38bdf8' },
    { rank: 5, name: 'Mystic Pulse', dailyROI: '+2.857%', volume: '29.3K USDT', color: '#a78bfa' }
  ];

  const horizontalCards = [
    {
      id: 'n1',
      name: 'Genesis Legend',
      badge: 'Level 1',
      dailyROI: '2.857%',
      floor: '50 USDT',
      bg: 'linear-gradient(135deg, #0284c7, #0369a1)'
    },
    {
      id: 'n2',
      name: 'Titan Spark',
      badge: 'Level 2',
      dailyROI: '2.857%',
      floor: '200 USDT',
      bg: 'linear-gradient(135deg, #059669, #047857)'
    },
    {
      id: 'n3',
      name: 'Aurora Realm',
      badge: 'Level 3',
      dailyROI: '2.857%',
      floor: '500 USDT',
      bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)'
    },
    {
      id: 'n4',
      name: 'Mystic Beast',
      badge: 'Level 4',
      dailyROI: '2.857%',
      floor: '1000 USDT',
      bg: 'linear-gradient(135deg, #b45309, #92400e)'
    }
  ];

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#a78bfa', fontWeight: 800, letterSpacing: '0.1em' }}>
              MARKET LEADER
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Trending collections
            </Typography>
          </Box>
          <Button
            onClick={() => navigate('/reservation')}
            sx={{ color: '#a78bfa', fontWeight: 800, textTransform: 'none' }}
          >
            Explore all →
          </Button>
        </Box>

        {/* ─── TOP FEATURED + 24H RANKING ROW ─────────────────── */}
        <Grid container spacing={3} sx={{ mb: 3.5 }}>
          {/* Left Large Featured Node Card */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3 },
                bgcolor: '#111522',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Artwork Banner */}
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 180, sm: 220 },
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #6b21a8 0%, #3b0764 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  mb: 2.5
                }}
              >
                {/* Cyber Ape SVG Illustration */}
                <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="42" fill="rgba(0,0,0,0.3)" />
                  <circle cx="50" cy="46" r="30" fill="#A855F7" />
                  <circle cx="36" cy="42" r="7" fill="#000" />
                  <circle cx="64" cy="42" r="7" fill="#000" />
                  <circle cx="38" cy="40" r="2.5" fill="#fff" />
                  <circle cx="66" cy="40" r="2.5" fill="#fff" />
                  <ellipse cx="50" cy="58" rx="15" ry="10" fill="#7E22CE" />
                  <path d="M40 60 Q50 66 60 60" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="20" y="22" width="60" height="10" rx="4" fill="#1E293B" />
                  <path d="M18 30 L82 30 L72 16 L28 16 Z" fill="#64748B" />
                </svg>

                <Chip
                  label="FEATURED POOL"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#FFD700',
                    fontWeight: 900,
                    fontSize: '0.7rem'
                  }}
                />
              </Box>

              {/* Title & Description */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff' }}>
                    Aurora Realm Genesis
                  </Typography>
                  <VerifiedIcon sx={{ color: '#38bdf8', fontSize: 22 }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  24-hour algorithmic cycle doubling reservation backed by automated crypto arbitrage.
                </Typography>
              </Box>

              {/* Stats & Action */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: 'rgba(0,0,0,0.4)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 2
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.72rem' }}>Min Deposit</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#ffffff', fontSize: { xs: '0.9rem', sm: '1rem' } }}>50 USDT</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.72rem' }}>Daily Return</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#34d399', fontSize: { xs: '0.9rem', sm: '1rem' } }}>+2.857%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.72rem' }}>Duration</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#a78bfa', fontSize: { xs: '0.9rem', sm: '1rem' } }}>24 Hours</Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth={false}
                  onClick={handleAction}
                  sx={{
                    fontWeight: 800,
                    bgcolor: '#8b5cf6',
                    '&:hover': { bgcolor: '#7c3aed' },
                    px: 3,
                    py: 1,
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Reserve Now
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Top 24h Ranking Leaderboard */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3 },
                bgcolor: '#111522',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon style={{ color: '#34d399' }} /> Top Performers 24h
              </Typography>

              <TableContainer component={Box}>
                <Table size="small">
                  <TableBody>
                    {topRankedPools.map(p => (
                      <TableRow key={p.rank} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.5 } }}>
                        <TableCell sx={{ color: p.color, fontWeight: 900, width: 24 }}>
                          #{p.rank}
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                            {p.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                            Vol: {p.volume}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={p.dailyROI}
                            size="small"
                            sx={{
                              fontWeight: 900,
                              bgcolor: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              fontSize: '0.78rem'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* ─── BOTTOM 4 HORIZONTAL NODES ROW ─────────────────── */}
        <Grid container spacing={2.5}>
          {horizontalCards.map(node => (
            <Grid key={node.id} size={{ xs: 6, sm: 6, md: 3 }}>
              <Paper
                onClick={handleAction}
                sx={{
                  p: 2,
                  bgcolor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3.5,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    boxShadow: '0 12px 28px rgba(139, 92, 246, 0.2)'
                  }
                }}
              >
                {/* Artwork Box */}
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: 120, sm: 140 },
                    borderRadius: 2.5,
                    background: node.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    mb: 1.5
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="35" fill="rgba(0,0,0,0.25)" />
                    <circle cx="50" cy="46" r="24" fill="#fff" fillOpacity="0.8" />
                    <circle cx="40" cy="42" r="5" fill="#000" />
                    <circle cx="60" cy="42" r="5" fill="#000" />
                    <ellipse cx="50" cy="54" rx="10" ry="7" fill="#CBD5E1" />
                    <path d="M44 56 Q50 60 56 56" stroke="#000" strokeWidth="2" />
                  </svg>

                  <Chip
                    label={node.badge}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 20
                    }}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}>
                  {node.name}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Min: <strong>{node.floor}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>
                    +{node.dailyROI}
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
