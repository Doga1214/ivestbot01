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
  EmojiEventsIcon,
  AccessTimeIcon,
  HistoryIcon,
  HexagonIcon,
  CheckCircleIcon
} from '../components/common/Icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { reservationService } from '../services/reservationService';
import { formatDateTime, formatUSDT } from '../utils/formatters';

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
  const [lastReservedAmount, setLastReservedAmount] = useState<number>(0);

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
  
  // Daily rate: 1.000% per 24H reservation
  const rateRange = useMemo(() => {
    return { min: 1.0, max: 1.0, label: '1.000% Daily ROI' };
  }, []);

  // Reservation range based on level (Starting from 10 USDT)
  const rangeLimits = useMemo(() => {
    switch (userLevel) {
      case 2: return { min: 50, max: 200, label: '50 ~ 200' };
      case 3: return { min: 200, max: 1000, label: '200 ~ 1000' };
      case 4: return { min: 1000, max: 50000, label: '1000 ~ 50000' };
      default: return { min: 10, max: 50, label: '10 ~ 50' };
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

  // Accurate reserved principal amount in current cycle
  const todayReservedAmount = useMemo(() => {
    if (reservationState.lastCompletedReservation && reservationState.lastCompletedReservation.amount > 0) {
      return reservationState.lastCompletedReservation.amount;
    }
    return reservableBalance;
  }, [reservationState.lastCompletedReservation, reservableBalance]);

  // Accurate profit credited today in current cycle
  const todayProfitCredited = useMemo(() => {
    if (reservationState.lastCompletedReservation && typeof reservationState.lastCompletedReservation.profit === 'number' && reservationState.lastCompletedReservation.profit > 0) {
      return reservationState.lastCompletedReservation.profit;
    }
    if (todayEarnings > 0) return todayEarnings;
    if (lastProfitAmount > 0) return lastProfitAmount;
    return (todayReservedAmount * rateRange.min) / 100;
  }, [reservationState.lastCompletedReservation, todayEarnings, lastProfitAmount, todayReservedAmount, rateRange.min]);

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

  // Unified history ledger records
  const displayHistory = useMemo(() => {
    const resMap = new Map<string, any>();

    const reservationList = reservationService.getHistory();
    reservationList.forEach(r => {
      const resAmt = r.amount > 0 ? r.amount : 100;
      const rate = r.effectiveRate || r.dailyRate || 1.0;
      const profit = r.profit > 0 ? r.profit : Number((resAmt * (rate / 100)).toFixed(4));
      resMap.set(r.referenceId || r.id, {
        id: r.id,
        referenceId: r.referenceId || `RES-${r.id.slice(-6).toUpperCase()}`,
        createdAt: r.completedAt || r.startedAt || new Date().toISOString(),
        reservedAmount: resAmt,
        rate,
        profit,
        totalSettled: Number((resAmt + profit).toFixed(4)),
        durationText: r.isFullCycle ? '24h Full Cycle' : `${Math.floor((r.activeDurationSeconds || 86400) / 3600)}h Active`,
        status: r.status || 'COMPLETED'
      });
    });

    transactions
      .filter(t => t.type === 'DAILY_PROFIT' || t.type === 'RESERVATION')
      .forEach(t => {
        const ref = t.referenceId || `RES-${t.id.slice(-6).toUpperCase()}`;
        if (!resMap.has(ref)) {
          let parsedReserved = 0;
          let parsedRate = 1.0;
          const match = t.description?.match(/on\s+([\d.]+)\s+USDT/i);
          if (match && match[1]) {
            parsedReserved = parseFloat(match[1]);
          }
          const rateMatch = t.description?.match(/\(?([\d.]+)%\s+on/i);
          if (rateMatch && rateMatch[1]) {
            parsedRate = parseFloat(rateMatch[1]);
          }
          if (!parsedReserved || parsedReserved <= 0) {
            parsedReserved = reservationState.lastCompletedReservation?.amount || (t.amount > 0 && parsedRate > 0 ? Number(((t.amount / (parsedRate / 100))).toFixed(2)) : reservableBalance || 100);
          }

          resMap.set(ref, {
            id: t.id,
            referenceId: ref,
            createdAt: t.createdAt,
            reservedAmount: parsedReserved,
            rate: parsedRate,
            profit: t.amount,
            totalSettled: Number((parsedReserved + t.amount).toFixed(4)),
            durationText: t.description || '24h AutoBot Yield Settlement',
            status: t.status === 'COMPLETED' || t.status === 'APPROVED' ? 'COMPLETED' : t.status
          });
        }
      });

    return Array.from(resMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions, reservationState, reservableBalance]);

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
      setLastReservedAmount(reservableBalance);
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

      {/* Badges: Level & Cycle Status */}
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
        {isLocked && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.7,
              px: 1.8,
              py: 0.6,
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '0.85rem',
              fontWeight: 800
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
            24H Cycle Active: {todayReservedAmount.toFixed(2)} USDT
          </Box>
        )}
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
        {/* Card 1: Today's Earnings (Daily Reserve Profit) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            background: 'linear-gradient(145deg, #12172a 0%, #0c101d 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
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
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#06b6d4' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem' }}>
              Today's Earnings
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', mb: 0.3 }}>
            <span style={{ color: '#06b6d4', marginRight: 4, fontWeight: 700 }}>₮</span>
            {isLocked
              ? `+${todayProfitCredited.toFixed(4)}`
              : (todayEarnings > 0 ? `+${todayEarnings.toFixed(4)}` : `${expectedMinIncome.toFixed(2)} ~ ${expectedMaxIncome.toFixed(2)}`)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block' }}>
            {isLocked
              ? `Earned on ${todayReservedAmount.toFixed(2)} USDT`
              : (todayEarnings > 0 ? 'Profit Earned Today' : 'Today Est. Reserve Profit')}
          </Typography>
        </Box>

        {/* Card 2: Team Benefits (Team Commission) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            background: 'linear-gradient(145deg, #12172a 0%, #0c101d 100%)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
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
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem' }}>
              Team Benefits
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', mb: 0.3 }}>
            <span style={{ color: '#8b5cf6', marginRight: 4, fontWeight: 700 }}>₮</span>
            {teamBenefits.toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block' }}>
            Team Referral Commissions
          </Typography>
        </Box>

        {/* Card 3: Reservation Amount & Balance */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3.5,
            background: 'linear-gradient(145deg, #12172a 0%, #0c101d 100%)',
            border: isLocked ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(16, 185, 129, 0.25)',
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
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700, fontSize: '0.78rem' }}>
              {isLocked ? 'Active Reserved Amount' : 'Reservation Balance'}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399', letterSpacing: '-0.02em', mb: 0.3 }}>
            <span style={{ color: '#10b981', marginRight: 4, fontWeight: 700 }}>₮</span>
            {isLocked ? todayReservedAmount.toFixed(2) : reservableBalance.toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block' }}>
            {isLocked ? 'Principal in 24H Cycle' : 'Main Balance Available to Reserve'}
          </Typography>
        </Box>

        {/* Card 4: Cumulative Income */}
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
              Cumulative Income
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', mb: 0.3 }}>
            <span style={{ color: '#3b82f6', marginRight: 4, fontWeight: 700 }}>₮</span>
            {cumulativeIncome.toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block' }}>
            Total Earned All-Time
          </Typography>
        </Box>

        {/* Card 5: Expected Daily Yield */}
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
              Daily Rate Yield
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#fbbf24', letterSpacing: '-0.02em', mb: 0.3 }}>
            {rateRange.label}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block' }}>
            Level {userLevel} Daily Profit
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
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', mb: 0.3 }}>
            <span style={{ color: '#ec4899', marginRight: 4, fontWeight: 700 }}>₮</span>
            {rangeLimits.label}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block' }}>
            Level {userLevel} Allowed Range
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
                <span style={{ color: '#ec4899', marginRight: 3 }}>₮</span>
                {rangeLimits.label}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                {isLocked ? 'RESERVED AMOUNT (ACTIVE)' : 'RESERVATION BALANCE (MAIN)'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399', letterSpacing: '-0.01em' }}>
                <span style={{ color: '#34d399', marginRight: 3 }}>₮</span>
                {isLocked ? todayReservedAmount.toFixed(2) : reservableBalance.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: isLocked ? '#a78bfa' : '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>
                {isLocked ? 'Active in 24H Cycle' : 'Available to Reserve'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                {isLocked ? "TODAY'S PROFIT CREDITED" : "TODAY'S ESTIMATED PROFIT"}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#06b6d4', letterSpacing: '-0.01em' }}>
                <span style={{ color: '#06b6d4', marginRight: 3 }}>₮</span>
                {isLocked ? `+${todayProfitCredited.toFixed(4)}` : `${expectedMinIncome.toFixed(2)} ~ ${expectedMaxIncome.toFixed(2)}`}
              </Typography>
              <Typography variant="caption" sx={{ color: isLocked ? '#10b981' : '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>
                {isLocked ? 'Credited to Main Balance' : 'Calculated at 1.000% Daily'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                DAILY RATE YIELD
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981', letterSpacing: '-0.01em' }}>
                {rateRange.label}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                Level {userLevel} Yield
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
                  ⏳ 24-Hour Cycle Active ({todayReservedAmount.toFixed(2)} USDT)
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  Daily Profit: <strong style={{ color: '#34d399' }}>+{todayProfitCredited.toFixed(4)} USDT</strong> • Next reserve in:
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
              ? `Locked (${formatLockTime(secondsRemaining)}) • Reserved: ${todayReservedAmount.toFixed(2)} USDT`
              : `Reserve AutoBot Now (${reservableBalance.toFixed(2)} USDT)`}
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
            Today's Reservation & Cycle Status
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Live status of your daily 24-hour reservation cycle, principal amount, credited wallet profits, and lock timers.
          </Typography>

          <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#0d111e', border: '1px solid rgba(255, 255, 255, 0.06)', mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>24-Hour Cycle Status</Typography>
              <Chip
                label={isLocked ? 'ACTIVE & LOCKED (1x/24h)' : 'READY TO RESERVE'}
                color={isLocked ? 'warning' : 'success'}
                size="small"
                sx={{ fontWeight: 800, fontSize: '0.72rem' }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.8 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>Today's Reserved Principal</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#00e5ff' }}>
                {todayReservedAmount.toFixed(2)} USDT
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.8 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>Today's Yield Credited</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#34d399' }}>
                +{todayProfitCredited.toFixed(4)} USDT
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.8 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>Total 24H Settlement Value</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#ffffff' }}>
                {(todayReservedAmount + todayProfitCredited).toFixed(4)} USDT
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.8 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>Daily Yield Rate Applied</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa' }}>
                {rateRange.label} (Level {userLevel})
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>Next Available Cycle</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: isLocked ? '#fbbf24' : '#34d399', fontFamily: 'monospace' }}>
                {isLocked ? formatLockTime(secondsRemaining) : 'Immediate (Ready)'}
              </Typography>
            </Box>
          </Box>

          {isLocked && (
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 700, display: 'block', mb: 0.5 }}>
                ⚡ Strict 24-Hour Single Reservation Rule:
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Each user can perform exactly 1 reservation cycle per 24 hours. Your wallet has received today's yield on your <strong>{todayReservedAmount.toFixed(2)} USDT</strong> reservation, and the next cycle will open automatically when the timer reaches 00:00:00.
              </Typography>
            </Box>
          )}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
              Reservation & Mining History
            </Typography>
            <Chip
              label={`${displayHistory.length} Records`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#9CA3AF', fontWeight: 700 }}
            />
          </Box>

          {displayHistory.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                No reservation history yet. Click "Reserve" to execute your first 24-hour yield cycle!
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => setActiveTab('reserve')}
                sx={{ fontWeight: 800, textTransform: 'none' }}
              >
                Go to Reserve Tab
              </Button>
            </Box>
          ) : (
            <>
              {/* Mobile View (<600px) */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {displayHistory.map(item => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#0d111e',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                          {item.referenceId}
                        </Typography>
                        <Chip label={item.status} size="small" variant="outlined" color="success" sx={{ fontSize: '0.65rem', fontWeight: 800, height: 20 }} />
                      </Box>

                      {/* Primary Amount Highlights */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5, p: 1.2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '0.7rem' }}>
                            Reserved Principal
                          </Typography>
                          <Typography sx={{ color: '#00e5ff', fontWeight: 900, fontSize: '1rem' }}>
                            {formatUSDT(item.reservedAmount)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '0.7rem' }}>
                            Profit Credited
                          </Typography>
                          <Typography sx={{ color: '#34d399', fontWeight: 900, fontSize: '1rem' }}>
                            +{item.profit.toFixed(4)} USDT
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem' }}>
                          {formatDateTime(item.createdAt)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.75rem' }}>
                          Rate: {item.rate.toFixed(3)}%
                        </Typography>
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
                      <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.06)', color: '#64748B', fontWeight: 800, py: 1.5 } }}>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Reference ID</TableCell>
                        <TableCell align="right">Reserved Principal</TableCell>
                        <TableCell align="center">Yield Rate</TableCell>
                        <TableCell align="right">Profit Credited</TableCell>
                        <TableCell align="right">Total Return</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayHistory.map(item => (
                        <TableRow key={item.id} hover sx={{ '& td': { borderColor: 'rgba(255,255,255,0.04)', py: 1.5 } }}>
                          <TableCell sx={{ color: '#94A3B8', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                            {formatDateTime(item.createdAt)}
                          </TableCell>
                          <TableCell sx={{ color: '#c4b5fd', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {item.referenceId}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#00e5ff', fontWeight: 900, fontSize: '0.9rem' }}>
                            {formatUSDT(item.reservedAmount)}
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.82rem' }}>
                            {item.rate.toFixed(3)}%
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#34d399', fontWeight: 900, fontSize: '0.9rem' }}>
                            +{item.profit.toFixed(4)} USDT
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 800, fontSize: '0.85rem' }}>
                            {item.totalSettled.toFixed(4)} USDT
                          </TableCell>
                          <TableCell align="center">
                            <Chip label="COMPLETED" size="small" variant="outlined" color="success" sx={{ fontSize: '0.68rem', fontWeight: 800 }} />
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
          {/* Reservation Breakdown Card */}
          <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>Reserved Principal Amount:</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#00e5ff' }}>
                {lastReservedAmount.toFixed(2)} USDT
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>Daily Yield Rate:</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa' }}>
                {rateRange.label}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 700 }}>Profit Credited:</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#10b981' }}>
                +{lastProfitAmount.toFixed(4)} USDT
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Your 24-hour yield on <strong>{lastReservedAmount.toFixed(2)} USDT</strong> has been credited to your available balance and recorded in your history ledger.
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
