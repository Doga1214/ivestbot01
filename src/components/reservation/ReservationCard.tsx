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
  ElectricBoltIcon,
  TrendingUpIcon,
  LockClockIcon,
  HourglassBottomIcon,
  CheckCircleIcon,
  AccountBalanceWalletIcon,
  AutoAwesomeIcon
} from '../common/Icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { WALLET_CONFIG } from '../../config/walletConfig';
import { formatUSDT } from '../../utils/formatters';
import { reservationService } from '../../services/reservationService';

export const ReservationCard: React.FC = () => {
  const navigate = useNavigate();
  const {
    wallet,
    reservationState,
    executeReservation,
    isProcessing,
    processingSecondsLeft,
    showSnackbar
  } = useApp();

  const isMining = reservationState.isMining;
  const preparedReservation = reservationState.preparedReservation;
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

  const isLocked = secondsRemaining > 0 && !isProcessing;

  const formatLockTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleExecute = () => {
    if (isLocked) {
      showSnackbar(`Reservation cycle is active. Next cycle in ${formatLockTime(secondsRemaining)}.`, 'warning');
      return;
    }

    if (isMining) {
      showSnackbar('Star AI Mining is currently running above. Please click "Stop Mining" in the terminal above to calculate your yield first!', 'warning');
      return;
    }

    if (wallet.availableBalance <= 0 && !preparedReservation) {
      setZeroBalanceDialogOpen(true);
      return;
    }

    executeReservation(preparedReservation || undefined);
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
            Deposit Required to Reserve
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#d1d5db', mb: 2, lineHeight: 1.6 }}>
            Your available balance is currently <strong>0.00 USDT</strong>. To participate in the 24-Hour yield reservation and earn 2.58% daily returns, please deposit USDT into your wallet.
          </Typography>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
            <Typography variant="caption" sx={{ color: '#c4b5fd', fontWeight: 700, display: 'block' }}>
              🎁 Milestone Referral Rewards Active:
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Deposits from 50 USDT to 1,000 USDT award instant direct referral rewards to your sponsor's active balance!
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
          border: preparedReservation
            ? '1px solid rgba(139, 92, 246, 0.5)'
            : isLocked
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          mb: 4
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <ElectricBoltIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  24-Hour Yield Reservation Terminal
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  Finalize settlement • Strictly 1 reservation execution per 24-hour cycle
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={isLocked ? <LockClockIcon sx={{ fontSize: 16 }} /> : <TrendingUpIcon sx={{ fontSize: 16 }} />}
              label={
                isProcessing
                  ? 'Processing (20s)...'
                  : isLocked
                  ? `24H Cycle Active (${formatLockTime(secondsRemaining)})`
                  : isMining
                  ? 'Mining Active in Section Above'
                  : preparedReservation
                  ? 'Ready to Execute Reservation'
                  : 'Available to Reserve (1X / 24H)'
              }
              color={
                isProcessing
                  ? 'warning'
                  : isLocked
                  ? 'default'
                  : isMining
                  ? 'info'
                  : preparedReservation
                  ? 'success'
                  : 'primary'
              }
              sx={{ fontWeight: 700 }}
            />
          </Box>

          {/* Prepared Mining Reservation Confirmation View */}
          {preparedReservation && (
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.4)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesomeIcon sx={{ color: '#a78bfa' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
                  🎯 AI Mining Yield Calculated & Ready for Reservation
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#d1d5db', mb: 2, lineHeight: 1.6 }}>
                You have stopped your Star AI Mining node. Your yield has been calculated based on your active mining duration:
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.3)' }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Active Mining Duration</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                      {Math.floor(preparedReservation.activeDurationSeconds / 3600)}h {Math.floor((preparedReservation.activeDurationSeconds % 3600) / 60)}m
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.3)' }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Calculated Yield Rate</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#60a5fa' }}>
                      {preparedReservation.effectiveRate.toFixed(4)}% / {WALLET_CONFIG.defaultDailyRate}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.3)' }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Assigned Principal</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      {formatUSDT(preparedReservation.amount)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700 }}>Harvest Profit</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#34d399' }}>
                      +{preparedReservation.profit.toFixed(4)} USDT
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* 20s Processing Progress Bar */}
          {isProcessing && (
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HourglassBottomIcon sx={{ color: '#fbbf24' }} />
                  <Typography variant="subtitle2" sx={{ color: '#fef3c7', fontWeight: 700 }}>
                    Processing 20s Smart Settlement & Wallet Ledger Credit...
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#fbbf24', fontWeight: 900, fontFamily: 'monospace' }}>
                  00:{String(processingSecondsLeft).padStart(2, '0')}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((20 - processingSecondsLeft) / 20) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #f59e0b, #eab308)',
                    borderRadius: 4
                  }
                }}
              />
            </Box>
          )}

          <Grid container spacing={4}>
            {/* Left Action Column */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#a78bfa', fontWeight: 700, mb: 1 }}>
                  Strict 24-Hour Settlement Rule
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.85rem', lineHeight: 1.6, mb: 2 }}>
                  Once you click <strong>Execute Reservation</strong>, your yield is credited to your wallet balance and a <strong>strict 24-hour lock countdown</strong> begins. You cannot start another mining or reservation cycle until the 24-hour timer expires.
                </Typography>

                {isLocked ? (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LockClockIcon sx={{ color: '#f87171' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#f87171', fontWeight: 800 }}>
                        24-Hour Cycle Lock Active
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#d1d5db' }}>
                        Next cycle available in: <strong>{formatLockTime(secondsRemaining)}</strong>
                      </Typography>
                    </Box>
                  </Box>
                ) : isMining ? (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AutoAwesomeIcon sx={{ color: '#60a5fa' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#60a5fa', fontWeight: 800 }}>
                        Mining in Progress Above
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#d1d5db' }}>
                        Click "Stop Mining" in the terminal above to calculate your pro-rata yield.
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: '#34d399' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#34d399', fontWeight: 800 }}>
                        Ready for 24-Hour Settlement
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#d1d5db' }}>
                        Click the button below to execute your 24-hour reservation.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>

              {/* Execute Button */}
              <Button
                fullWidth
                variant="contained"
                color={preparedReservation ? 'success' : 'primary'}
                size="large"
                disabled={isLocked || isProcessing || isMining}
                onClick={handleExecute}
                sx={{
                  py: 1.6,
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  letterSpacing: '0.02em',
                  boxShadow: isLocked || isProcessing || isMining ? 'none' : '0 4px 25px rgba(139, 92, 246, 0.4)'
                }}
              >
                {isProcessing
                  ? 'EXECUTING SETTLEMENT (20s)...'
                  : isLocked
                  ? `24H CYCLE LOCKED (${formatLockTime(secondsRemaining)})`
                  : isMining
                  ? 'MINING ACTIVE (STOP ABOVE TO EXECUTE)'
                  : preparedReservation
                  ? `EXECUTE RESERVATION SETTLEMENT (+${preparedReservation.profit.toFixed(4)} USDT)`
                  : 'EXECUTE 24-HOUR RESERVATION'}
              </Button>
            </Grid>

            {/* Right Summary Column */}
            <Grid item xs={12} md={5}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#a78bfa' }}>
                  Yield Calculation Summary
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Available Balance:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                      {formatUSDT(wallet.availableBalance)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Max Daily Rate:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#60a5fa' }}>
                      {WALLET_CONFIG.defaultDailyRate}% / 24h
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      Cycle Duration:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                      24 Hours (Strict 1X Lock)
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      35-Day Double Target:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                      2X (100% in 35 Days)
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: '#34d399', fontWeight: 800 }}>
                      Daily Harvest Profit:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>
                      +{preparedReservation ? preparedReservation.profit.toFixed(4) : (wallet.availableBalance * (WALLET_CONFIG.defaultDailyRate / 100)).toFixed(4)} USDT
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  Yield credited directly to your wallet ledger upon execution.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};
