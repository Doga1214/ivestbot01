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
  Zap,
  CheckCircle2,
  Lock,
  DollarSign,
  Wallet,
  RotateCcw,
  XCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { luckySpinService } from '../../services/luckySpinService';
import { walletService } from '../../services/walletService';
import type { SpinSlice, UserSpinState, SpinResult, RecentWinnerFeedItem } from '../../types/spin';
import { WheelCanvas, type WheelCanvasRef } from '../spin/WheelCanvas';
import { ConfettiEffect } from '../spin/ConfettiEffect';

export const HomeLuckySpin: React.FC = () => {
  const { user, openLoginModal } = useApp();
  const [slices, setSlices] = useState<SpinSlice[]>([]);
  const [spinState, setSpinState] = useState<UserSpinState | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [currentWin, setCurrentWin] = useState<SpinResult | null>(null);
  const [showWinDialog, setShowWinDialog] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
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
      const wallet = walletService.getWalletForUser(user.id);
      setWalletBalance(wallet.availableBalance || 0);
    } else {
      setSpinState(null);
      setHistoryList([]);
      setWalletBalance(0);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

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

    const stake = Math.min(Math.max(Number(betAmount) || 1, 1), 100);
    if (walletBalance < stake) {
      setSpinError(`Insufficient balance! You need at least $${stake.toFixed(2)} USDT in available balance to activate and spin.`);
      return;
    }

    try {
      const result = await luckySpinService.executeSpin(user.id, (user as any).level || 1, stake);
      setIsSpinning(true);
      if (typeof result.newBalance === 'number') {
        setWalletBalance(result.newBalance);
      }

      wheelRef.current?.spinToSlice(result.sliceIndex, () => {
        setIsSpinning(false);
        setCurrentWin(result);
        setShowWinDialog(true);
        if (result.isWin) {
          setShowConfetti(true);
        } else {
          setShowConfetti(false);
        }
        loadData();
        if (refreshWallet) {
          refreshWallet(user.id);
        }
      });
    } catch (err: unknown) {
      setIsSpinning(false);
      if (err instanceof Error) {
        setSpinError(err.message);
      } else {
        setSpinError(err ? String(err) : 'Spin failed. Please try again.');
      }
    }
  };

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
                  isHighRollerMode={betAmount >= 50}
                  onSpinStart={() => setIsSpinning(true)}
                />
              </Box>

              {/* Stake Activation Selector (1 to 100 USDT) */}
              <Box
                sx={{
                  width: '100%',
                  mt: 2,
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#FEF08A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.5px' }}
                  >
                    <DollarSign size={15} color="#FBBF24" /> SPIN ACTIVATION STAKE (1 - 100 USDT)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Wallet size={13} color="#38BDF8" /> Balance: <strong style={{ color: '#FFFFFF' }}>${walletBalance.toFixed(2)}</strong>
                  </Typography>
                </Box>

                {/* Quick Bet Chips */}
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  {[1, 5, 10, 25, 50, 100].map((amt) => {
                    const isSelected = betAmount === amt;
                    return (
                      <Button
                        key={amt}
                        size="small"
                        disabled={isSpinning}
                        onClick={() => setBetAmount(amt)}
                        sx={{
                          flex: '1 1 calc(16.6% - 6px)',
                          minWidth: '44px',
                          py: 0.6,
                          borderRadius: '8px',
                          bgcolor: isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                          border: isSelected ? '1.5px solid #F59E0B' : '1px solid #334155',
                          color: isSelected ? '#FEF08A' : '#CBD5E1',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.8rem',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: 'rgba(245, 158, 11, 0.35)'
                          }
                        }}
                      >
                        ${amt}
                      </Button>
                    );
                  })}
                </Box>

                {/* Custom Stake Input & Max Payout Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ position: 'relative', flex: 1 }}>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      step={1}
                      disabled={isSpinning}
                      value={betAmount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setBetAmount(Math.min(100, Math.max(1, val)));
                        } else {
                          setBetAmount(1);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 24px',
                        borderRadius: '8px',
                        backgroundColor: '#0F172A',
                        border: '1px solid #475569',
                        color: '#F8FAFC',
                        fontSize: '13px',
                        fontWeight: 700
                      }}
                    />
                    <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '13px' }}>
                      $
                    </span>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    Max Win: <strong style={{ color: '#FBBF24' }}>${(betAmount * 50).toFixed(0)} USDT</strong> (50x)
                  </Typography>
                </Box>
              </Box>

              {/* User Live Balance & Unlimited Spin Info */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: '16px',
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(51, 65, 85, 0.6)'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    Available Balance
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#FEF08A', lineHeight: 1.1 }}>
                    ${walletBalance.toFixed(2)}{' '}
                    <span style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 500 }}>USDT</span>
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    Spin Mode
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: '#38BDF8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      justifyContent: 'flex-end'
                    }}
                  >
                    ⚡ Unlimited Multi-Spins
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
                    <Lock size={18} /> Login To Spin & Win USDT
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isSpinning || walletBalance < betAmount}
                    onClick={handleSpinClick}
                    sx={{
                      py: 1.8,
                      borderRadius: '16px',
                      background: isSpinning
                        ? 'linear-gradient(135deg, #64748B 0%, #475569 100%)'
                        : walletBalance < betAmount
                        ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                        : 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
                      color: isSpinning || walletBalance < betAmount ? '#CBD5E1' : '#0F172A',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      letterSpacing: '0.5px',
                      boxShadow: isSpinning || walletBalance < betAmount ? 'none' : '0 10px 30px rgba(245, 158, 11, 0.5)',
                      textTransform: 'none',
                      gap: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FBBF24 0%, #B45309 100%)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <RotateCw size={20} className={isSpinning ? 'spin-anim' : ''} />
                    {isSpinning
                      ? 'SPINNING THE WHEEL...'
                      : walletBalance < betAmount
                      ? `INSUFFICIENT BALANCE ($${betAmount} USDT NEEDED)`
                      : `SPIN & WIN (-$${betAmount} USDT)`}
                  </Button>
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
                    Up To 50x Jackpot (${(betAmount * 50).toFixed(0)} USDT)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
                    Instant cash credited to available wallet ledger
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
                          label={slice.prizeType === 'LOSS' || slice.prizeType === 'TRY_AGAIN' ? 'Loss' : slice.prizeType}
                          size="small"
                          sx={{
                            bgcolor: slice.prizeType === 'LOSS' || slice.prizeType === 'TRY_AGAIN'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: slice.prizeType === 'LOSS' || slice.prizeType === 'TRY_AGAIN'
                              ? '#F87171'
                              : '#94A3B8',
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
                          {item.isWin ? (
                            <CheckCircle2 size={16} color="#22C55E" />
                          ) : (
                            <XCircle size={16} color="#EF4444" />
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: item.isWin ? '#F8FAFC' : '#94A3B8' }}>
                              {item.prizeText}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              Stake: ${item.betAmount || 1} USDT • {new Date(item.createdAt).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color: item.isWin
                              ? (item.prizeType === 'USDT' ? '#22C55E' : '#EAB308')
                              : '#EF4444'
                          }}
                        >
                          {item.isWin
                            ? (item.wonAmount > 0 ? `+$${item.wonAmount.toFixed(2)}` : 'Claimed')
                            : 'No Win (Loss)'}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Outcome Dialog: Win OR Loss */}
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
                border: !currentWin.isWin
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid rgba(245, 158, 11, 0.4)',
                boxShadow: !currentWin.isWin
                  ? '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.2)'
                  : '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 158, 11, 0.25)',
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: !currentWin.isWin
                    ? 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)'
                    : currentWin.slice.isJackpot
                    ? 'linear-gradient(135deg, #FDE047 0%, #D97706 100%)'
                    : 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                  boxShadow: !currentWin.isWin
                    ? '0 0 35px rgba(239, 68, 68, 0.5)'
                    : '0 0 35px rgba(245, 158, 11, 0.6)'
                }}
              >
                {!currentWin.isWin ? (
                  <RotateCcw size={40} color="#FFFFFF" />
                ) : currentWin.slice.isJackpot ? (
                  <Trophy size={40} color="#0F172A" />
                ) : (
                  <CheckCircle2 size={40} color="#FFFFFF" />
                )}
              </Box>

              <Typography
                variant="subtitle2"
                sx={{
                  color: !currentWin.isWin ? '#F87171' : '#FBBF24',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {!currentWin.isWin
                  ? 'SPIN RESULT: LOSS'
                  : currentWin.slice.isJackpot
                  ? '🌟 MEGA JACKPOT UNLOCKED! 🌟'
                  : '🎉 CONGRATULATIONS! 🎉'}
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: !currentWin.isWin ? '#EF4444' : '#FFFFFF',
                  my: 1.5
                }}
              >
                {!currentWin.isWin ? currentWin.slice.label || '5.0x Loss' : currentWin.prizeText}
              </Typography>


              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3.5, lineHeight: 1.6 }}>
                {!currentWin.isWin ? (
                  <span>
                    You staked <strong>${currentWin.betAmount} USDT</strong>. The wheel landed on a loss slice. Try again to win up to 50x Mega Jackpot!
                  </span>
                ) : currentWin.prizeType === 'USDT' ? (
                  <span>
                    Your winnings of <strong>+${currentWin.wonAmount.toFixed(2)} USDT</strong> have been credited directly to your live wallet balance!
                  </span>
                ) : currentWin.prizeType === 'APR_BOOST' ? (
                  'Your +0.5% APR boost is active on all pool reservations for the next 24 hours!'
                ) : (
                  'Extra spin ticket added to your balance! Spin again!'
                )}
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
                  background: !currentWin.isWin
                    ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                    : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: !currentWin.isWin ? '#FFFFFF' : '#0F172A',
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: !currentWin.isWin
                    ? '0 8px 25px rgba(0, 0, 0, 0.4)'
                    : '0 8px 25px rgba(245, 158, 11, 0.4)',
                  '&:hover': {
                    background: !currentWin.isWin
                      ? 'linear-gradient(135deg, #64748B 0%, #475569 100%)'
                      : 'linear-gradient(135deg, #FBBF24 0%, #B45309 100%)'
                  }
                }}
              >
                {!currentWin.isWin ? 'TRY AGAIN' : 'AWESOME, COLLECT PRIZE'}
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};
