import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Chip,
  Grid,
  Paper,
  Tabs,
  Tab,
  Stack,
  Alert
} from '@mui/material';
import {
  Sparkles,
  Trophy,
  Gift,
  RotateCw,
  Clock,
  Zap,
  TrendingUp,
  History,
  HelpCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { luckySpinService } from '../../services/luckySpinService';
import type { SpinSlice, UserSpinState, SpinResult, RecentWinnerFeedItem } from '../../types/spin';
import { WheelCanvas, type WheelCanvasRef } from '../spin/WheelCanvas';
import { ConfettiEffect } from '../spin/ConfettiEffect';

export const HomeLuckySpin: React.FC = () => {
  const { user, openLoginModal, refreshUserData } = useApp();
  const [slices, setSlices] = useState<SpinSlice[]>([]);
  const [spinState, setSpinState] = useState<UserSpinState | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [currentWin, setCurrentWin] = useState<SpinResult | null>(null);
  const [showWinDialog, setShowWinDialog] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [countdownStr, setCountdownStr] = useState<string>('');
  const [recentWinners, setRecentWinners] = useState<RecentWinnerFeedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'prizes' | 'winners' | 'history'>('prizes');
  const [historyList, setHistoryList] = useState<SpinResult[]>([]);

  const wheelRef = useRef<WheelCanvasRef | null>(null);

  const loadData = () => {
    const loadedSlices = luckySpinService.getSlices();
    setSlices(loadedSlices);
    setRecentWinners(luckySpinService.getRecentWinners());

    if (user?.id) {
      const state = luckySpinService.getUserSpinState(user.id);
      setSpinState(state);
      setHistoryList(luckySpinService.getUserSpinHistory(user.id));
    } else {
      setSpinState(null);
      setHistoryList([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Next Free Spin Countdown Timer
  useEffect(() => {
    if (!spinState?.nextDailySpinAt) {
      setCountdownStr('');
      return;
    }

    const interval = setInterval(() => {
      const diff = new Date(spinState.nextDailySpinAt!).getTime() - Date.now();
      if (diff <= 0) {
        setCountdownStr('Ready!');
        loadData();
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownStr(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [spinState?.nextDailySpinAt]);

  const handleClaimDaily = () => {
    if (!user?.id) {
      openLoginModal();
      return;
    }
    const updated = luckySpinService.claimDailySpin(user.id);
    setSpinState(updated);
  };

  const handleSpinClick = async () => {
    if (!user?.id) {
      openLoginModal();
      return;
    }

    if (isSpinning) return;
    setSpinError(null);

    // If user needs to claim free daily spin first
    if ((!spinState || spinState.availableSpins <= 0) && spinState?.canClaimDailySpin) {
      handleClaimDaily();
    }

    try {
      const result = await luckySpinService.executeSpin(user.id);
      setIsSpinning(true);

      wheelRef.current?.spinToSlice(result.sliceIndex, () => {
        setIsSpinning(false);
        setCurrentWin(result);
        setShowWinDialog(true);
        setShowConfetti(true);
        loadData();
        if (refreshUserData) {
          refreshUserData();
        }
      });
    } catch (err: unknown) {
      setIsSpinning(false);
      if (err instanceof Error) {
        setSpinError(err.message);
      } else {
        setSpinError(err.message || 'Spin failed. Please try again.');
      }
    }
  };

  const hasSpins = (spinState?.availableSpins || 0) > 0;
  const canClaim = spinState?.canClaimDailySpin || false;

  return (
    <Box
      id="lucky-spin-section"
      sx={{
        py: { xs: 6, md: 9 },
        px: 2,
        position: 'relative',
        background: 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.1) 0%, rgba(8, 10, 18, 0.95) 75%)',
        overflow: 'hidden'
      }}
    >
      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Chip
            icon={<Sparkles size={14} color="#0F172A" />}
            label="100% FREE DAILY SPIN & CASH REWARDS"
            sx={{
              bgcolor: '#F59E0B',
              color: '#0F172A',
              fontWeight: 900,
              fontSize: '0.75rem',
              letterSpacing: '1px',
              mb: 1.5,
              px: 1
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
              color: '#FFFFFF',
              letterSpacing: '-0.5px',
              mb: 1.5
            }}
          >
            Spin The <span style={{ color: '#FBBF24' }}>Lucky Wheel</span> & Win Cash
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#94A3B8',
              maxWidth: '680px',
              mx: 'auto',
              fontSize: { xs: '0.92rem', md: '1.05rem' },
              lineHeight: 1.6
            }}
          >
            Every user gets 1 free spin every 24 hours. Win instant{' '}
            <strong style={{ color: '#22C55E' }}>USDT cash credits</strong>, 24-hour{' '}
            <strong style={{ color: '#38BDF8' }}>APR yield boosters</strong>, or the grand{' '}
            <strong style={{ color: '#F59E0B' }}>100 USDT Mega Jackpot</strong>!
          </Typography>
        </Box>

        {/* Live Winners Ticker Bar */}
        <Paper
          sx={{
            mb: 4,
            py: 1,
            px: 2.5,
            borderRadius: '16px',
            bgcolor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Trophy size={16} color="#FBBF24" />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#FEF08A', fontSize: '0.85rem' }}>
              LIVE WINNERS:
            </Typography>
            <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '0.85rem' }}>
              {recentWinners.length > 0 ? (
                <>
                  🎉 <span style={{ color: '#38BDF8', fontWeight: 700 }}>{recentWinners[0].username}</span> won{' '}
                  <span style={{ color: '#22C55E', fontWeight: 800 }}>{recentWinners[0].prizeLabel}</span> (
                  {recentWinners[0].timeAgo})
                </>
              ) : (
                'Spin now to win instant USDT balance!'
              )}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label="Provably Fair"
              size="small"
              sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Chip
              label="Instant Credit"
              size="small"
              sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>
        </Paper>

        {/* Main Interactive Wheel Area */}
        <Grid container spacing={4} alignItems="center">
          {/* Left Column: Direct Embedded Canvas Wheel */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: '28px',
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* Yield boost tag if active */}
              {spinState && spinState.activeAprBoostPercent > 0 && (
                <Box
                  sx={{
                    width: '100%',
                    mb: 2,
                    p: 1.2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Zap size={16} color="#38BDF8" />
                    <Typography variant="body2" sx={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.82rem' }}>
                      Active Yield Boost: +{spinState.activeAprBoostPercent}% APR
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Active 24h
                  </Typography>
                </Box>
              )}

              {/* Error Message */}
              {spinError && (
                <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '12px' }}>
                  {spinError}
                </Alert>
              )}

              {/* Wheel Canvas */}
              <Box sx={{ my: 1 }}>
                <WheelCanvas
                  ref={wheelRef}
                  slices={slices}
                  size={320}
                  onSpinStart={() => setIsSpinning(true)}
                />
              </Box>

              {/* Available Tickets Counter & Next Spin Timer */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  mt: 2,
                  p: 1.8,
                  borderRadius: '16px',
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(51, 65, 85, 0.6)'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    Available Tickets
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#FEF08A', lineHeight: 1.1 }}>
                    {user ? spinState?.availableSpins || 0 : 1}{' '}
                    <span style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 500 }}>Spins</span>
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    Next Free Spin
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: countdownStr ? '#38BDF8' : '#22C55E',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      justifyContent: 'flex-end'
                    }}
                  >
                    {countdownStr ? (
                      <>
                        <Clock size={14} /> {countdownStr}
                      </>
                    ) : (
                      'Available Now!'
                    )}
                  </Typography>
                </Box>
              </Box>

              {/* Direct Play / Spin Button */}
              <Box sx={{ width: '100%', mt: 2 }}>
                {!user ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={openLoginModal}
                    sx={{
                      py: 1.8,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      color: '#0F172A',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)',
                      textTransform: 'none',
                      gap: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FBBF24 0%, #B45309 100%)'
                      }
                    }}
                  >
                    <Lock size={18} /> Login To Spin Free & Win Cash
                  </Button>
                ) : hasSpins ? (
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isSpinning}
                    onClick={handleSpinClick}
                    sx={{
                      py: 1.8,
                      borderRadius: '16px',
                      background: isSpinning
                        ? 'linear-gradient(135deg, #64748B 0%, #475569 100%)'
                        : 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
                      color: isSpinning ? '#CBD5E1' : '#0F172A',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      letterSpacing: '0.5px',
                      boxShadow: isSpinning ? 'none' : '0 10px 30px rgba(245, 158, 11, 0.5)',
                      textTransform: 'none',
                      gap: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FBBF24 0%, #B45309 100%)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <RotateCw size={20} className={isSpinning ? 'spin-anim' : ''} />
                    {isSpinning ? 'SPINNING THE WHEEL...' : 'SPIN THE WHEEL NOW'}
                  </Button>
                ) : canClaim ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleClaimDaily}
                    sx={{
                      py: 1.8,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                      textTransform: 'none',
                      gap: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #34D399 0%, #047857 100%)'
                      }
                    }}
                  >
                    <Gift size={20} /> CLAIM TODAY&apos;S FREE SPIN
                  </Button>
                ) : (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: 'rgba(30, 41, 59, 0.6)',
                      border: '1px dashed #475569',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                      Next free spin unlocks in <strong style={{ color: '#38BDF8' }}>{countdownStr || '24h'}</strong>.
                      Invite friends to get instant bonus spins!
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Prize Highlights, Odds & Rewards Table */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: '28px',
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Grand Jackpot Highlight Card */}
              <Box
                sx={{
                  p: 2.5,
                  mb: 3,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Chip
                    label="GRAND PRIZE"
                    size="small"
                    sx={{
                      bgcolor: '#F59E0B',
                      color: '#0F172A',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      mb: 0.8
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#FEF08A' }}>
                    100.00 USDT
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
                    Instant cash credited to available wallet
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'rgba(245, 158, 11, 0.2)',
                    border: '2px solid #F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <Trophy size={30} color="#FBBF24" />
                </Box>
              </Box>

              {/* Tabs: Prize List / Recent Winners / History */}
              <Tabs
                value={activeTab}
                onChange={(_e, val) => setActiveTab(val)}
                sx={{
                  borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
                  mb: 2,
                  '& .MuiTab-root': {
                    color: '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    minHeight: 40,
                    '&.Mui-selected': { color: '#FBBF24' }
                  }
                }}
              >
                <Tab label="Prize Pool" value="prizes" />
                <Tab label="Recent Winners" value="winners" />
                {user && <Tab label={`My History (${historyList.length})`} value="history" />}
              </Tabs>

              {/* Tab 1: Slices & Odds */}
              {activeTab === 'prizes' && (
                <Stack spacing={1.2} sx={{ maxHeight: '300px', overflowY: 'auto', pr: 0.5 }}>
                  {slices.map((slice) => (
                    <Box
                      key={slice.id}
                      sx={{
                        p: 1.3,
                        px: 2,
                        borderRadius: '14px',
                        bgcolor: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: slice.accentColor,
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: slice.accentColor,
                            boxShadow: `0 0 8px ${slice.accentColor}`
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                          {slice.label}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={slice.prizeType}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: '#94A3B8',
                            fontSize: '0.65rem',
                            height: 20
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#FEF08A', fontWeight: 700 }}>
                          {slice.probabilityPercent}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Tab 2: Recent Winners Feed */}
              {activeTab === 'winners' && (
                <Stack spacing={1.2} sx={{ maxHeight: '300px', overflowY: 'auto', pr: 0.5 }}>
                  {recentWinners.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#64748B', py: 4, textAlign: 'center' }}>
                      No winners yet today. Be the first!
                    </Typography>
                  ) : (
                    recentWinners.map((winner, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.3,
                          px: 2,
                          borderRadius: '14px',
                          bgcolor: 'rgba(15, 23, 42, 0.7)',
                          border: '1px solid rgba(51, 65, 85, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Gift size={16} color="#FBBF24" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
                              {winner.username}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {winner.timeAgo}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#22C55E' }}>
                          {winner.prizeLabel}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>
              )}

              {/* Tab 3: My History */}
              {activeTab === 'history' && (
                <Stack spacing={1.2} sx={{ maxHeight: '300px', overflowY: 'auto', pr: 0.5 }}>
                  {historyList.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#64748B', py: 4, textAlign: 'center' }}>
                      You haven&apos;t spun yet. Spin the wheel to win!
                    </Typography>
                  ) : (
                    historyList.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1.3,
                          px: 2,
                          borderRadius: '14px',
                          bgcolor: 'rgba(15, 23, 42, 0.7)',
                          border: '1px solid rgba(51, 65, 85, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <CheckCircle2 size={16} color="#22C55E" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
                              {item.prizeText}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color: item.prizeType === 'USDT' ? '#22C55E' : '#EAB308'
                          }}
                        >
                          {item.prizeType === 'USDT' ? `+$${item.prizeValue.toFixed(2)}` : 'Claimed'}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Victory Popup Dialog */}
        {showWinDialog && currentWin && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: 'rgba(3, 7, 18, 0.88)',
              backdropFilter: 'blur(10px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2
            }}
          >
            <Paper
              sx={{
                p: { xs: 3, sm: 4.5 },
                maxWidth: '440px',
                width: '100%',
                borderRadius: '28px',
                bgcolor: '#0F172A',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 158, 11, 0.25)',
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: currentWin.slice.isJackpot
                    ? 'linear-gradient(135deg, #FDE047 0%, #D97706 100%)'
                    : 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                  boxShadow: '0 0 35px rgba(245, 158, 11, 0.6)'
                }}
              >
                {currentWin.slice.isJackpot ? (
                  <Trophy size={40} color="#0F172A" />
                ) : (
                  <CheckCircle2 size={40} color="#FFFFFF" />
                )}
              </Box>

              <Typography
                variant="subtitle2"
                sx={{ color: '#FBBF24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                {currentWin.slice.isJackpot ? '🌟 MEGA JACKPOT UNLOCKED! 🌟' : '🎉 CONGRATULATIONS! 🎉'}
              </Typography>

              <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', my: 1.5 }}>
                {currentWin.prizeText}
              </Typography>

              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3.5, lineHeight: 1.6 }}>
                {currentWin.prizeType === 'USDT'
                  ? 'Your winnings have been credited directly to your live wallet balance.'
                  : currentWin.prizeType === 'APR_BOOST'
                  ? 'Your +0.5% APR boost is active on all pool reservations for the next 24 hours!'
                  : 'Extra spin ticket added to your balance! Spin again!'}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setShowWinDialog(false);
                  setShowConfetti(false);
                }}
                sx={{
                  py: 1.6,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#0F172A',
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FBBF24 0%, #B45309 100%)'
                  }
                }}
              >
                AWESOME, COLLECT PRIZE
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};
