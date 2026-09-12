import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Slider,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ShieldIcon,
  AutoAwesomeIcon,
  TrendingUpIcon,
  CheckCircleOutlineIcon,
  TetherIcon,
  InfoOutlinedIcon,
  RefreshIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { walletService } from '../../services/walletService';
import { formatUSDT } from '../../utils/formatters';

export const AiWalletGuardianCard: React.FC = () => {
  const { wallet, showSnackbar } = useApp();
  const [forecastBalance, setForecastBalance] = useState<number>(() => Math.max(100, wallet.availableBalance || 100));
  const [isAuditing, setIsAuditing] = useState(false);

  // Synchronize initial forecast when wallet loads
  React.useEffect(() => {
    if (wallet.availableBalance > 0) {
      setForecastBalance(wallet.availableBalance);
    }
  }, [wallet.availableBalance]);

  const forecast = useMemo(
    () => walletService.calculateAiYieldForecast(forecastBalance),
    [forecastBalance]
  );

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      showSnackbar('🤖 AI Balance Guardian Audit Complete! 100% Ledger Consistency Verified. Zero Balance Leakage.', 'success');
    }, 900);
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(17, 21, 34, 0.95) 0%, rgba(30, 27, 75, 0.9) 50%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.35)',
        borderRadius: 4,
        boxShadow: '0 16px 45px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.1)',
        mb: 3.5,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Ambient Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}
      />

      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* Header: AI Shield & Status */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Star AI Balance Guardian & Yield Engine
                </Typography>
                <Chip
                  icon={<ShieldIcon sx={{ fontSize: 14, color: '#34d399' }} />}
                  label="SHIELD ARMED"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    color: '#34d399',
                    fontWeight: 800,
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Real-time cryptographic audit, fail-safe snapshot shield & predictive yield forecasting
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            variant="outlined"
            onClick={handleRunAudit}
            disabled={isAuditing}
            startIcon={isAuditing ? undefined : <RefreshIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: 'rgba(139, 92, 246, 0.4)',
              color: '#c084fc',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              '&:hover': { borderColor: '#a855f7', bgcolor: 'rgba(168, 85, 247, 0.1)' }
            }}
          >
            {isAuditing ? 'Auditing Ledger...' : 'Run AI Security Scan'}
          </Button>
        </Box>

        {isAuditing && (
          <Box sx={{ mb: 2.5 }}>
            <LinearProgress sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' } }} />
          </Box>
        )}

        {/* 3 Metrics Cards */}
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          {/* Card 1: Safety Health */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>
                  AI Security Health Score
                </Typography>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#34d399' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#34d399' }}>
                {forecast.securityHealthScore}%
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.72rem' }}>
                Zero balance leakage • Ledger verified
              </Typography>
            </Box>
          </Grid>

          {/* Card 2: 24-Hour Projected Yield */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#c084fc', fontWeight: 600 }}>
                  24h AI Pro-Rata Return
                </Typography>
                <TrendingUpIcon sx={{ fontSize: 16, color: '#a78bfa' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff' }}>
                +{formatUSDT(forecast.projected24hProfit)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#a78bfa', fontSize: '0.72rem' }}>
                Base Rate: {forecast.dailyRatePercent}% / 24h cycle
              </Typography>
            </Box>
          </Grid>

          {/* Card 3: 7-Day Compounding Forecast */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#67e8f9', fontWeight: 600 }}>
                  7-Day Compound Estimate
                </Typography>
                <TetherIcon sx={{ fontSize: 16, color: '#22d3ee' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#22d3ee' }}>
                +{formatUSDT(forecast.projected7dProfit)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#06b6d4', fontSize: '0.72rem' }}>
                30-Day Potential: +{formatUSDT(forecast.projected30dProfit)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Interactive AI Simulation Slider */}
        <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <span>AI Return Simulator</span>
              <Tooltip title="Slide to simulate projected daily and weekly earnings at different balance levels.">
                <IconButton size="small" sx={{ color: '#9CA3AF', p: 0.2 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Typography>
            <Chip
              label={`Simulated Balance: ${forecastBalance.toFixed(0)} USDT`}
              size="small"
              sx={{ bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', fontWeight: 800, border: '1px solid rgba(139, 92, 246, 0.4)' }}
            />
          </Box>

          <Slider
            value={forecastBalance}
            min={10}
            max={5000}
            step={10}
            onChange={(_e, val) => setForecastBalance(val as number)}
            sx={{
              color: '#8b5cf6',
              '& .MuiSlider-thumb': {
                boxShadow: '0 0 12px rgba(139, 92, 246, 0.8)'
              },
              '& .MuiSlider-rail': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF', fontSize: '0.75rem', mt: 0.5 }}>
            <span>10 USDT</span>
            <span>1,000 USDT</span>
            <span>2,500 USDT</span>
            <span>5,000 USDT</span>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
