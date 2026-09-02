import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  AutoAwesomeIcon,
  TrendingUpIcon,
  EmojiEventsIcon,
  AccessTimeIcon,
  HistoryIcon,
  HexagonIcon
} from '../components/common/Icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { reservationService } from '../services/reservationService';
import { formatDateTime } from '../utils/formatters';

export const Reservation: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    wallet,
    transactions,
    reservationState,
    executeReservation,
    isProcessing,
    processingSecondsLeft,
    showSnackbar
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reserve' | 'todays' | 'history'>('reserve');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [zeroBalanceDialogOpen, setZeroBalanceDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [lastProfitAmount, setLastProfitAmount] = useState<number>(0);

  // 24-Hour Cooldown Countdown Timer
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

  // Calculations & Metrics
  const userLevel = user?.level || 1;
  const reservableBalance = Math.max(0, wallet.availableBalance);
  
  // Daily rate: Level 1 is 1.1% - 1.4%, Level 2 is 1.5% - 1.8%, Level 3 is 2.0% - 2.4%, Level 4 is 2.5% - 3.0%
  const rateRange = useMemo(() => {
    switch (userLevel) {
      case 2: return { min: 1.5, max: 1.8, label: '1.5-1.8%' };
      case 3: return { min: 2.0, max: 2.4, label: '2.0-2.4%' };
      case 4: return { min: 2.5, max: 3.0, label: '2.5-3.0%' };
      default: return { min: 1.1, max: 1.4, label: '1.1-1.4%' };
    }
  }, [userLevel]);

  // Reservation range based on level
  const rangeLimits = useMemo(() => {
    switch (userLevel) {
      case 2: return { min: 500, max: 2000, label: '500 ~ 2000' };
      case 3: return { min: 2000, max: 5000, label: '2000 ~ 5000' };
      case 4: return { min: 5000, max: 20000, label: '5000 ~ 20000' };
      default: return { min: 50, max: 500, label: '50 ~ 500' };
    }
  }, [userLevel]);

  // Expected income calculations
  const expectedMinIncome = (reservableBalance * rateRange.min) / 100;
  const expectedMaxIncome = (reservableBalance * rateRange.max) / 100;

  // Earnings aggregation from ledger
  const todayEarnings = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return transactions
      .filter(t => (t.type === 'DAILY_PROFIT' || t.type === 'RESERVATION') && t.createdAt?.startsWith(todayStr))
      .reduce((sum, t) => sum + (t.type === 'DAILY_PROFIT' ? t.amount : 0), 0);
  }, [transactions]);

  const cumulativeIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'DAILY_PROFIT' || t.type === 'WELCOME_BONUS' || t.type === 'REFERRAL_BONUS')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const teamBenefits = useMemo(() => {
    return transactions
      .filter(t => t.type === 'REFERRAL_BONUS')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const handleReserveClick = async () => {
    if (isLocked) {
      showSnackbar(`Reservation cycle is active. Next reserve in ${formatLockTime(secondsRemaining)}.`, 'warning');
      return;
    }

    if (reservableBalance <= 0) {
      setZeroBalanceDialogOpen(true);
      return;
    }

    // Execute reservation
    try {
      const calculatedProfit = Number((reservableBalance * (rateRange.min + (rateRange.max - rateRange.min) * Math.random()) / 100).toFixed(4));
      setLastProfitAmount(calculatedProfit);
      await executeReservation({
        amount: reservableBalance,
        dailyRate: rateRange.min,
        effectiveRate: Number(((calculatedProfit / (reservableBalance || 1)) * 100).toFixed(2)),
        activeDurationSeconds: 86400,
        profit: calculatedProfit,
        isFullCycle: true,
        preparedAt: new Date().toISOString()
      });
      setSuccessDialogOpen(true);
    } catch {
      // handled
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', pb: 10, px: { xs: 1.5, sm: 2 } }}>
      {/* 1. Header & App Branding */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00e5ff 0%, #00a3ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0, 229, 255, 0.3)'
          }}
        >
          <HexagonIcon sx={{ fontSize: 22, color: '#031120' }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #ffffff 0%, #a5f3fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          IvestBot
        </Typography>
      </Box>

      {/* Main Title & Subtitle */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          fontSize: { xs: '1.85rem', sm: '2.2rem' },
          letterSpacing: '-0.03em',
          color: '#ffffff',
          mb: 0.5
        }}
      >
        Reserve AutoBot
      </Typography>
      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, fontSize: '0.9rem' }}>
        Reserve once a day to earn passive USDT income.
      </Typography>

      {/* Badges: Level & Daily Rate */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 3 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.7,
            px: 1.8,
            py: 0.6,
            borderRadius: '999px',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: '#c4b5fd',
            fontSize: '0.85rem',
            fontWeight: 800
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 16, color: '#a78bfa' }} />
          Level {userLevel}
        </Box>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.7,
            px: 1.8,
            py: 0.6,
            borderRadius: '999px',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            color: '#67e8f9',
            fontSize: '0.85rem',
            fontWeight: 800
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 16, color: '#22d3ee' }} />
          Daily {rateRange.label}
        </Box>
      </Box>

      {/* 2. Top 6 Metric Cards (2 Columns x 3 Rows via Grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
          mb: 3
        }}
      >
        {/* Card 1: Today's Earnings */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            background: 'linear-gradient(145deg, #12172a 0%, #0c101d 100%)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06b6d4' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.78rem' }}>
              Today's Earnings
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#06b6d4', marginRight: 4, fontWeight: 700 }}>₮</span>
            {todayEarnings.toFixed(2)}
          </Typography>
        </Box>

        {/* Card 2: Cumulative Income */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            background: 'linear-gradient(145deg, #12172a 0%, #0c101d 100%)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.78rem' }}>
              Cumulative Income
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#10b981', marginRight: 4, fontWeight: 700 }}>₮</span>
            {cumulativeIncome.toFixed(2)}
          </Typography>
        </Box>

        {/* Card 3: Team Benefits */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            background: 'linear-gradient(145deg, #12172a 0%, #0c101d 100%)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.78rem' }}>
              Team Benefits
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#8b5cf6', marginRight: 4, fontWeight: 700 }}>₮</span>
            {teamBenefits.toFixed(2)}
          </Typography>
        </Box>

        {/* Card 4: Wallet Balance */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            background: 'linear-gradient(145deg, #12172a 0%, #0c101d 100%)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.78rem' }}>
              Wallet Balance
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#3b82f6', marginRight: 4, fontWeight: 700 }}>₮</span>
            {wallet.availableBalance.toFixed(2)}
          </Typography>
        </Box>

        {/* Card 5: Reservable Balance */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            background: 'linear-gradient(145deg, #12172a 0%, #0c101d 100%)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.78rem' }}>
              Reservable Balance
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#f59e0b', marginRight: 4, fontWeight: 700 }}>₮</span>
            {reservableBalance.toFixed(2)}
          </Typography>
        </Box>

        {/* Card 6: Reservation Range */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            background: 'linear-gradient(145deg, #12172a 0%, #0c101d 100%)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.22) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ec4899' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.78rem' }}>
              Reservation Range
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#ec4899', marginRight: 4, fontWeight: 700 }}>₮</span>
            {rangeLimits.label}
          </Typography>
        </Box>
      </Box>

      {/* 3. Segmented 3-Tab Switcher */}
      <Box
        sx={{
          p: 0.6,
          mb: 2.5,
          borderRadius: '999px',
          bgcolor: '#0d111d',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1
        }}
      >
        <Button
          fullWidth
          onClick={() => setActiveTab('reserve')}
          sx={{
            py: 1.1,
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.9rem',
            textTransform: 'none',
            transition: 'all 0.25s ease',
            color: activeTab === 'reserve' ? '#041624' : '#94A3B8',
            background:
              activeTab === 'reserve'
                ? 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)'
                : 'transparent',
            boxShadow:
              activeTab === 'reserve'
                ? '0 4px 18px rgba(0, 242, 254, 0.35)'
                : 'none'
          }}
          startIcon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
        >
          Reserve
        </Button>

        <Button
          fullWidth
          onClick={() => setActiveTab('todays')}
          sx={{
            py: 1.1,
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.9rem',
            textTransform: 'none',
            transition: 'all 0.25s ease',
            color: activeTab === 'todays' ? '#041624' : '#94A3B8',
            background:
              activeTab === 'todays'
                ? 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)'
                : 'transparent',
            boxShadow:
              activeTab === 'todays'
                ? '0 4px 18px rgba(0, 242, 254, 0.35)'
                : 'none'
          }}
          startIcon={<AccessTimeIcon sx={{ fontSize: 18 }} />}
        >
          Today's
        </Button>

        <Button
          fullWidth
          onClick={() => setActiveTab('history')}
          sx={{
            py: 1.1,
            borderRadius: '999px',
            fontWeight: 800,
            fontSize: '0.9rem',
            textTransform: 'none',
            transition: 'all 0.25s ease',
            color: activeTab === 'history' ? '#041624' : '#94A3B8',
            background:
              activeTab === 'history'
                ? 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)'
                : 'transparent',
            boxShadow:
              activeTab === 'history'
                ? '0 4px 18px rgba(0, 242, 254, 0.35)'
                : 'none'
          }}
          startIcon={<HistoryIcon sx={{ fontSize: 18 }} />}
        >
          History
        </Button>
      </Box>

      {/* 4. Tab Panels */}

      {/* TAB 0: MAIN RESERVE ACTION CARD */}
      {activeTab === 'reserve' && (
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 4,
            background: 'linear-gradient(160deg, #111628 0%, #0a0d18 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* 2x2 Parameter Matrix via Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2.5,
              mb: 3.5
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                RESERVATION RANGE
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                <span style={{ color: '#06b6d4', marginRight: 3 }}>₮</span>
                {rangeLimits.label}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                RESERVABLE BALANCE
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                <span style={{ color: '#06b6d4', marginRight: 3 }}>₮</span>
                {reservableBalance.toFixed(2)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                EXPECTED INCOME
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
                <span style={{ color: '#06b6d4', marginRight: 3 }}>₮</span>
                {expectedMinIncome.toFixed(2)} ~ {expectedMaxIncome.toFixed(2)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                DAILY RATE
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981', letterSpacing: '-0.01em' }}>
                {rateRange.label}
              </Typography>
            </Box>
          </Box>

          {/* Processing Status Bar */}
          {isProcessing && (
            <Box sx={{ mb: 2.5, p: 2, borderRadius: 2.5, bgcolor: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#67e8f9' }}>
                  ⚡ Executing Smart Settlement...
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#22d3ee' }}>
                  {processingSecondsLeft}s
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((20 - processingSecondsLeft) / 20) * 100}
                sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00e5ff' } }}
              />
            </Box>
          )}

          {/* Lock Countdown Alert */}
          {isLocked && !isProcessing && (
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fbbf24' }}>
                  ⏳ 24-Hour Cycle Active
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Next AutoBot reservation unlocked in:
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#f59e0b' }}>
                {formatLockTime(secondsRemaining)}
              </Typography>
            </Box>
          )}

          {/* Main CTA Gradient Action Button */}
          <Button
            fullWidth
            size="large"
            disabled={isProcessing}
            onClick={handleReserveClick}
            sx={{
              py: 1.8,
              borderRadius: '999px',
              fontWeight: 900,
              fontSize: '1.05rem',
              letterSpacing: '-0.01em',
              textTransform: 'none',
              color: isLocked ? '#94A3B8' : '#031422',
              background: isLocked
                ? 'rgba(255, 255, 255, 0.08)'
                : 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
              boxShadow: isLocked
                ? 'none'
                : '0 8px 28px rgba(0, 242, 254, 0.45)',
              '&:hover': {
                background: isLocked
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'linear-gradient(90deg, #00d2fe 0%, #3b9dfe 100%)',
                boxShadow: isLocked
                  ? 'none'
                  : '0 10px 32px rgba(0, 242, 254, 0.6)'
              }
            }}
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 22 }} />}
          >
            {isProcessing
              ? `Executing Settlement (${processingSecondsLeft}s)...`
              : isLocked
              ? `Locked (${formatLockTime(secondsRemaining)})`
              : 'Reserve AutoBot Now'}
          </Button>
        </Box>
      )}

      {/* TAB 1: TODAY'S ACTIVE STATUS */}
      {activeTab === 'todays' && (
        <Box
          sx={{
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(160deg, #111628 0%, #0a0d18 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
            Today's Yield & Cycle Status
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Review today's 24-hour yield execution, active locks, and smart profit settlements.
          </Typography>

          <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#0d111e', border: '1px solid rgba(255, 255, 255, 0.06)', mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>Cycle Status</Typography>
              <Chip
                label={isLocked ? 'ACTIVE & LOCKED' : 'READY TO RESERVE'}
                color={isLocked ? 'warning' : 'success'}
                size="small"
                sx={{ fontWeight: 800 }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>Today's Yield Credited</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981' }}>
                +{todayEarnings.toFixed(2)} USDT
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>Next Available Cycle</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                {isLocked ? formatLockTime(secondsRemaining) : 'Immediate'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* TAB 2: HISTORY LEDGER */}
      {activeTab === 'history' && (
        <Box
          sx={{
            p: 2.5,
            borderRadius: 4,
            background: 'linear-gradient(160deg, #111628 0%, #0a0d18 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: '#ffffff' }}>
            Reservation & Mining History
          </Typography>

          {transactions.filter(t => t.type === 'DAILY_PROFIT' || t.type === 'RESERVATION').length === 0 ? (
            <Typography variant="body2" sx={{ color: '#94A3B8', py: 4, textAlign: 'center' }}>
              No reservation history yet. Click "Reserve" to execute your first yield cycle!
            </Typography>
          ) : (
            <>
              {/* Mobile View (<600px) */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {transactions
                    .filter(t => t.type === 'DAILY_PROFIT' || t.type === 'RESERVATION')
                    .slice(0, 15)
                    .map(tx => (
                      <Box
                        key={tx.id}
                        sx={{
                          p: 1.8,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip
                            label={tx.type === 'DAILY_PROFIT' ? 'DAILY YIELD' : 'RESERVATION'}
                            size="small"
                            color={tx.type === 'DAILY_PROFIT' ? 'success' : 'primary'}
                            sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                          />
                          <Typography sx={{ color: '#10b981', fontWeight: 900, fontSize: '0.95rem' }}>
                            +{tx.amount.toFixed(2)} USDT
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                            {formatDateTime(tx.createdAt)}
                          </Typography>
                          <Chip label="COMPLETED" size="small" variant="outlined" color="success" sx={{ fontSize: '0.62rem', fontWeight: 800, height: 20 }} />
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Box>

              {/* Desktop View (>=600px) */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700 }}>Type</TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700 }}>Profit</TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions
                        .filter(t => t.type === 'DAILY_PROFIT' || t.type === 'RESERVATION')
                        .slice(0, 15)
                        .map(tx => (
                          <TableRow key={tx.id}>
                            <TableCell sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                              {formatDateTime(tx.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={tx.type === 'DAILY_PROFIT' ? 'DAILY YIELD' : 'RESERVATION'}
                                size="small"
                                color={tx.type === 'DAILY_PROFIT' ? 'success' : 'primary'}
                                sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                              +{tx.amount.toFixed(2)} USDT
                            </TableCell>
                            <TableCell>
                              <Chip label="COMPLETED" size="small" variant="outlined" color="success" sx={{ fontSize: '0.65rem', fontWeight: 800 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </Box>
      )}

      {/* Dialog: Zero Balance Warning */}
      <Dialog
        open={zeroBalanceDialogOpen}
        onClose={() => setZeroBalanceDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111628',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3.5
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#ffffff' }}>
          Available Balance is 0 USDT
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
            You need available USDT in your wallet balance to participate in daily AutoBot reservations.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setZeroBalanceDialogOpen(false)} sx={{ color: '#94A3B8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setZeroBalanceDialogOpen(false);
              navigate('/wallet');
            }}
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
              color: '#031422'
            }}
          >
            Deposit USDT
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Successful Reservation Execution */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111628',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              borderRadius: 3.5
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#22d3ee', textAlign: 'center', pt: 3 }}>
          🎉 AutoBot Reservation Executed!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981', mb: 1 }}>
            +{lastProfitAmount.toFixed(4)} USDT
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Your 24-hour yield has been successfully calculated, credited to your wallet balance, and logged in the immutable ledger.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => setSuccessDialogOpen(false)}
            sx={{
              fontWeight: 800,
              px: 4,
              py: 1,
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
              color: '#031422'
            }}
          >
            Awesome!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
