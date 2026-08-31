import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  LinearProgress,
  Chip,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircleIcon,
  StarIcon,
  AutoAwesomeIcon,
  PlayArrowIcon,
  StopIcon,
  AccountBalanceWalletIcon,
  LockClockIcon
} from '../common/Icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { WALLET_CONFIG } from '../../config/walletConfig';
import { formatUSDT } from '../../utils/formatters';
import { reservationService } from '../../services/reservationService';

export const StarAiMiningCard: React.FC = () => {
  const navigate = useNavigate();
  const {
    wallet,
    reservationState,
    startMining,
    stopMining,
    isProcessing,
    showSnackbar
  } = useApp();

  const isMining = reservationState.isMining;
  const miningStartedAt = reservationState.miningStartedAt;
  const miningAmount = reservationState.miningAmount || wallet.availableBalance;
  const preparedReservation = reservationState.preparedReservation;

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [zeroBalanceDialogOpen, setZeroBalanceDialogOpen] = useState(false);

  // Strict 24-Hour Cooldown Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      const lock = reservationService.getCycleLockStatus();
      setSecondsRemaining(lock.secondsRemaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [reservationState]);

  // Live Mining Duration Timer
  useEffect(() => {
    if (!isMining || !miningStartedAt) {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const diffSecs = Math.floor((Date.now() - miningStartedAt) / 1000);
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isMining, miningStartedAt]);

  const isLocked = secondsRemaining > 0 && !isProcessing;
  const yieldStats = reservationService.calculateProRataYield(miningAmount, elapsedSeconds);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const remainingMiningCountdown = Math.max(0, 86400 - elapsedSeconds);

  const handleStart = () => {
    if (isLocked) {
      showSnackbar(`Cycle is active. Next cycle in ${formatTime(secondsRemaining)}.`, 'warning');
      return;
    }
    if (wallet.availableBalance <= 0) {
      setZeroBalanceDialogOpen(true);
      return;
    }
    startMining();
  };

  const handleStop = () => {
    if (!isMining) return;
    stopMining(elapsedSeconds);
  };

  return (
    <>
      {/* Zero Balance Deposit Modal */}
      <Dialog
        open={zeroBalanceDialogOpen}
        onClose={() => setZeroBalanceDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: 'linear-gradient(145deg, #111522 0%, #171b2e 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: 3.5,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AccountBalanceWalletIcon sx={{ color: '#a78bfa' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Deposit Required to Mine
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#d1d5db', mb: 2, lineHeight: 1.6 }}>
            Your available balance is currently <strong>0.00 USDT</strong>. To activate the 24H Star AI Mining Bot and earn daily yields (+ milestone bonuses), please make a deposit.
          </Typography>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
            <Typography variant="caption" sx={{ color: '#c4b5fd', fontWeight: 700, display: 'block' }}>
              🎁 Milestone Bonus Active:
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Deposits from 50 USDT to 1,000 USDT receive instant milestone welcome credits!
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="text" onClick={() => setZeroBalanceDialogOpen(false)} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setZeroBalanceDialogOpen(false);
              navigate('/wallet');
            }}
            sx={{ fontWeight: 800, px: 3 }}
          >
            Go to Deposit
          </Button>
        </DialogActions>
      </Dialog>

      <Card
        sx={{
          background: 'linear-gradient(145deg, #111522 0%, #171B2A 100%)',
          border: isMining
            ? '1px solid rgba(16, 185, 129, 0.5)'
            : isLocked
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(139, 92, 246, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: isMining
              ? 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }}
        />

        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          {/* Title Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  background: isMining
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: isMining ? '0 0 25px rgba(16, 185, 129, 0.6)' : '0 4px 15px rgba(139, 92, 246, 0.4)'
                }}
              >
                <AutoAwesomeIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.01em',
                    background: isMining
                      ? 'linear-gradient(135deg, #ffffff 0%, #34d399 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  USDT MINING IVESTBOT AI
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  24-hour single-cycle neural mining engine with pro-rata time calculation
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={isLocked ? <LockClockIcon sx={{ fontSize: 16 }} /> : <StarIcon sx={{ fontSize: 16 }} />}
              label={
                isProcessing
                  ? '20s Smart Settlement...'
                  : isLocked
                  ? `24H Cycle Active (Next in ${formatTime(secondsRemaining)})`
                  : isMining
                  ? 'STAR AI MINING ACTIVE (98.4 TH/s)'
                  : preparedReservation
                  ? 'MINING STOPPED • READY TO RESERVE'
                  : 'READY TO START (1X / 24H)'
              }
              color={
                isProcessing
                  ? 'warning'
                  : isLocked
                  ? 'default'
                  : isMining
                  ? 'primary'
                  : preparedReservation
                  ? 'secondary'
                  : 'success'
              }
              sx={{ fontWeight: 800, px: 1 }}
            />
          </Box>

          {/* STAR AI WORKING CORE ANIMATION & DASHBOARD */}
          <Grid container spacing={3} sx={{ alignItems: 'center', mb: 3 }}>
            {/* Left: Star AI Animated Core Visual */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(145deg, #0d111d 0%, #151a2d 100%)',
                  border: isMining
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : isLocked
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: 3.5,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isMining ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none'
                }}
              >
                {/* Star AI Core Node */}
                <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
                  {/* Outer Rotating Energy Ring */}
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      border: '2px dashed',
                      borderColor: isMining ? '#34d399' : isLocked ? '#6B7280' : '#8b5cf6',
                      animation: isMining ? 'spin 6s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      },
                      position: 'absolute'
                    }}
                  />

                  {/* Pulsing Star Center */}
                  <Box
                    sx={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      background: isMining
                        ? 'radial-gradient(circle, #10b981 0%, #047857 100%)'
                        : isLocked
                        ? 'radial-gradient(circle, #374151 0%, #1f2937 100%)'
                        : 'radial-gradient(circle, #8b5cf6 0%, #4c1d95 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: isMining
                        ? '0 0 30px rgba(16, 185, 129, 0.8), inset 0 0 15px #fff'
                        : isLocked
                        ? 'none'
                        : '0 0 20px rgba(139, 92, 246, 0.5)',
                      animation: isMining ? 'pulse 2s ease-in-out infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                        '50%': { transform: 'scale(1.08)', opacity: 0.85 }
                      }
                    }}
                  >
                    <StarIcon sx={{ fontSize: 36, color: isLocked ? '#9CA3AF' : '#fef08a' }} />
                  </Box>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isMining ? '#34d399' : isLocked ? '#9CA3AF' : '#ffffff', mt: 1 }}>
                  {isMining
                    ? 'STAR AI MINING ENGINE RUNNING'
                    : isLocked
                    ? `24H CYCLE ACTIVE (${formatTime(secondsRemaining)})`
                    : preparedReservation
                    ? 'MINING HARVEST CALCULATED'
                    : 'STAR AI READY TO MINE'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                  {isMining
                    ? 'Hashrate: 98.4 TH/s • Algorithmic Node'
                    : isLocked
                    ? 'Strictly 1 cycle per 24 hours lock active'
                    : 'Connect balance & click Start Mining'}
                </Typography>
              </Paper>
            </Grid>

            {/* Right: Live Ticking Stats & Countdown */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                sx={{
                  p: 2.5,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 3.5
                }}
              >
                <Grid container spacing={2}>
                  {/* Stat 1: Mining Balance */}
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          Mining Balance (USDT)
                        </Typography>
                        {wallet.availableBalance <= 0 && !isMining && (
                          <Button
                            size="small"
                            onClick={() => navigate('/wallet')}
                            sx={{ p: 0, minWidth: 'auto', fontSize: '0.68rem', fontWeight: 800, color: '#34d399' }}
                          >
                            + Deposit
                          </Button>
                        )}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>
                        {formatUSDT(isMining ? miningAmount : wallet.availableBalance)}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Stat 2: Live Mined Yield (Ticking Real-Time) */}
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <Typography variant="caption" sx={{ color: '#34d399', display: 'block', fontWeight: 600 }}>
                        {isMining ? 'Live Mined Profit (Ticking)' : 'Prepared Mined Profit'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>
                        +{isMining
                          ? yieldStats.profit.toFixed(4)
                          : preparedReservation
                          ? preparedReservation.profit.toFixed(4)
                          : '0.0000'} USDT
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Stat 3: 24H Countdown Remaining */}
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                        {isLocked ? '🔒 Next Cycle Available In' : '⏳ 24H Cycle Countdown'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: isLocked ? '#f87171' : isMining ? '#fbbf24' : '#9CA3AF', fontFamily: 'monospace' }}>
                        {isLocked ? formatTime(secondsRemaining) : isMining ? formatTime(remainingMiningCountdown) : '24:00:00'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Stat 4: Active Elapsed Duration */}
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                        Active Elapsed Duration
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: isMining ? '#a78bfa' : '#9CA3AF', fontFamily: 'monospace' }}>
                        {isMining
                          ? formatTime(elapsedSeconds)
                          : preparedReservation
                          ? formatTime(preparedReservation.activeDurationSeconds)
                          : '00:00:00'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Progress Bar */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      Cycle Progress: {isMining ? yieldStats.progressPercent : preparedReservation ? ((preparedReservation.activeDurationSeconds / 86400) * 100).toFixed(1) : 0}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700 }}>
                      Earned Rate: {isMining
                        ? yieldStats.effectiveRate.toFixed(4)
                        : preparedReservation
                        ? preparedReservation.effectiveRate.toFixed(4)
                        : '0.0000'}% / {WALLET_CONFIG.defaultDailyRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={isMining ? yieldStats.progressPercent : preparedReservation ? (preparedReservation.activeDurationSeconds / 86400) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #10b981 100%)',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Pro-Rata Duration Calculation Rule */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#a78bfa', display: 'block', mb: 0.5 }}>
              📐 24-Hour Cycle & Pro-Rata Yield Rules:
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', lineHeight: 1.5 }}>
              1. Each user can start <strong>only 1 mining cycle per 24 hours</strong>. <br />
              2. When you click Stop Mining, the yield is calculated pro-rata based on active duration (e.g. 12h = 1.29%, 6h = 0.645%). <br />
              3. You must click <strong>Execute Reservation</strong> in the section below to finalize and credit your yield into the wallet ledger!
            </Typography>
          </Paper>

          <Divider sx={{ my: 2.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

          {/* START MINING & STOP MINING BUTTONS */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: isMining ? '#10b981' : isLocked ? '#f87171' : '#6B7280', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                {isLocked
                  ? `Cycle is active. Next 24-hour cycle unlocks in ${formatTime(secondsRemaining)}.`
                  : isMining
                  ? 'Star AI is mining USDT. Click Stop Mining when ready to calculate yield.'
                  : preparedReservation
                  ? 'Yield calculated! Proceed to Reservation Terminal below to execute.'
                  : 'Click Start Mining to begin 24H AI cycle (1 time per 24 hours).'}
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PlayArrowIcon />}
                disabled={isMining || isProcessing || isLocked}
                onClick={handleStart}
                sx={{
                  px: 3.5,
                  py: 1.4,
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  boxShadow: isMining || isLocked ? 'none' : '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}
              >
                {isLocked ? `LOCKED (${formatTime(secondsRemaining)})` : 'START 24H MINING'}
              </Button>

              <Button
                variant="contained"
                color={yieldStats.is24hComplete ? 'success' : 'secondary'}
                size="large"
                startIcon={<StopIcon />}
                disabled={!isMining || isProcessing}
                onClick={handleStop}
                sx={{
                  px: 3.5,
                  py: 1.4,
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  boxShadow: isMining ? '0 4px 20px rgba(244, 63, 94, 0.4)' : 'none'
                }}
              >
                {yieldStats.is24hComplete
                  ? 'STOP & FINISH 24H MINING'
                  : 'STOP / DEACTIVATE MINING'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
