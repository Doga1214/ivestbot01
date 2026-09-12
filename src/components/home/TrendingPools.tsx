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
  TableRow,
  LinearProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  TrendingUpIcon,
  RocketLaunchIcon,
  ElectricBoltIcon
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
    { rank: 1, name: 'Genesis Alpha Vault', dailyROI: '+2.22%', volume: '142.5K USDT', capacity: 94, color: '#FFD700' },
    { rank: 2, name: 'Apex Quantum Matrix', dailyROI: '+2.22%', volume: '98.2K USDT', capacity: 88, color: '#E2E8F0' },
    { rank: 3, name: 'Cyber Node Arbitrage', dailyROI: '+2.22%', volume: '64.1K USDT', capacity: 79, color: '#F59E0B' },
    { rank: 4, name: 'Titan Core Liquidity', dailyROI: '+2.22%', volume: '45.8K USDT', capacity: 82, color: '#38bdf8' },
    { rank: 5, name: 'Mystic Pulse Yield', dailyROI: '+2.22%', volume: '29.3K USDT', capacity: 91, color: '#a78bfa' }
  ];

  const poolCards = [
    {
      id: 'n1',
      name: 'Titan Alpha Node',
      badge: 'Level 1 Pool',
      dailyROI: '2.22%',
      floor: '50 USDT',
      capacity: 94,
      volume: '$142.5K',
      accentColor: '#f59e0b',
      bg: 'linear-gradient(135deg, #0284c7, #0369a1)'
    },
    {
      id: 'n2',
      name: 'Cyber Pulse Matrix',
      badge: 'Level 2 Pool',
      dailyROI: '2.22%',
      floor: '200 USDT',
      capacity: 88,
      volume: '$98.2K',
      accentColor: '#10b981',
      bg: 'linear-gradient(135deg, #059669, #047857)'
    },
    {
      id: 'n3',
      name: 'Aurora Quantum Realm',
      badge: 'Level 3 Pool',
      dailyROI: '2.22%',
      floor: '500 USDT',
      capacity: 81,
      volume: '$64.1K',
      accentColor: '#8b5cf6',
      bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)'
    },
    {
      id: 'n4',
      name: 'Genesis Apex Vault',
      badge: 'Level 4 Pool',
      dailyROI: '2.22%',
      floor: '1000 USDT',
      capacity: 96,
      volume: '$210.4K',
      accentColor: '#38bdf8',
      bg: 'linear-gradient(135deg, #b45309, #92400e)'
    }
  ];

  return (
    <Box sx={{ py: { xs: 5, md: 7 } }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#a78bfa', fontWeight: 800, letterSpacing: '0.1em' }}>
              REAL-TIME YIELD PROTOCOLS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontSize: { xs: '1.65rem', sm: '2.4rem' } }}>
              Trending Liquidity Pools
            </Typography>
          </Box>
          <Button
            onClick={() => navigate('/reservation')}
            endIcon={<TrendingUpIcon />}
            sx={{
              color: '#a78bfa',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.92rem',
              '&:hover': { color: '#c4b5fd' }
            }}
          >
            Explore all pools →
          </Button>
        </Box>

        {/* ─── TOP FEATURED + 24H RANKING ROW ─────────────────── */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Left Large Featured Node Card */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                bgcolor: '#111522',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: 4,
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top Banner */}
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 170, sm: 210 },
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: { xs: 2.5, sm: 3 },
                  position: 'relative',
                  overflow: 'hidden',
                  mb: 2.5
                }}
              >
                <Box sx={{ zIndex: 2 }}>
                  <Chip
                    icon={<ElectricBoltIcon sx={{ color: '#FFD700 !important', fontSize: 14 }} />}
                    label="HOTTEST POOL • 96% FILLED"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 215, 0, 0.12)',
                      border: '1px solid rgba(255, 215, 0, 0.4)',
                      color: '#FFD700',
                      fontWeight: 900,
                      fontSize: '0.68rem',
                      mb: 1
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mb: 0.5 }}>
                    Genesis Apex Vault
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Automated 24h AI double-staking cycle
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
                    flexShrink: 0
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>
                    +2.22%
                  </Typography>
                </Box>
              </Box>

              {/* Pool Details */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                    Minimum Entry Floor
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#38bdf8' }}>
                    50.00 USDT
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                    24h Settlement Rate
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>
                    2.2222% / Cycle
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                    Total Locked
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFD700' }}>
                    $210,400 USDT
                  </Typography>
                </Box>
              </Box>

              {/* Capacity Bar */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700 }}>
                    Vault Capacity
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>
                    96% Subscribed
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={96}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #8b5cf6, #34d399)',
                      borderRadius: 4
                    }
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAction}
                endIcon={<RocketLaunchIcon />}
                sx={{
                  py: 1.4,
                  fontWeight: 900,
                  fontSize: '0.98rem',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)'
                  }
                }}
              >
                Join Genesis Vault Pool →
              </Button>
            </Paper>
          </Grid>

          {/* Right 24H Top Staking Leaderboard */}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
                  24H Pool Leaderboard
                </Typography>
                <Chip
                  label="LIVE APY"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(52, 211, 153, 0.1)',
                    color: '#34d399',
                    fontWeight: 800,
                    fontSize: '0.68rem'
                  }}
                />
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {topRankedPools.map((p) => (
                      <TableRow
                        key={p.rank}
                        hover
                        onClick={handleAction}
                        sx={{
                          cursor: 'pointer',
                          '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', py: 1.4 }
                        }}
                      >
                        <TableCell sx={{ width: 32, pl: 0.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 900,
                              color: p.color,
                              fontSize: '0.9rem'
                            }}
                          >
                            #{p.rank}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
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
                              bgcolor: 'rgba(52, 211, 153, 0.12)',
                              color: '#34d399',
                              fontWeight: 900,
                              fontSize: '0.75rem',
                              height: 24
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

        {/* ─── 4 HORIZONTAL POOL CARDS ──────────────────────── */}
        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          {poolCards.map((c) => (
            <Grid key={c.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                onClick={handleAction}
                sx={{
                  p: 2.5,
                  bgcolor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3.5,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: c.accentColor,
                    boxShadow: `0 12px 30px ${c.accentColor}25`
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip
                    label={c.badge}
                    size="small"
                    sx={{
                      bgcolor: `${c.accentColor}18`,
                      color: c.accentColor,
                      fontWeight: 800,
                      fontSize: '0.7rem'
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399' }}>
                    +{c.dailyROI}
                  </Typography>
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', mb: 1 }}>
                  {c.name}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Floor Entry
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>
                    {c.floor}
                  </Typography>
                </Box>

                {/* Mini capacity bar */}
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.68rem' }}>
                      Pool Fill
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.68rem', fontWeight: 700 }}>
                      {c.capacity}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={c.capacity}
                    sx={{
                      height: 5,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: c.accentColor,
                        borderRadius: 2.5
                      }
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: '0.78rem',
                    '&:hover': {
                      borderColor: c.accentColor,
                      bgcolor: `${c.accentColor}15`,
                      color: '#fff'
                    }
                  }}
                >
                  Reserve Pool →
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
