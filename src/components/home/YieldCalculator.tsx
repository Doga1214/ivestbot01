import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Slider,
  Button,
  Chip
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  CalculateIcon,
  ElectricBoltIcon,
  RocketLaunchIcon,
  VerifiedIcon
} from '../common/Icons';

export const YieldCalculator: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openRegisterModal } = useApp();
  const [amount, setAmount] = useState<number>(500);

  const presets = [50, 100, 200, 500, 1000, 2500, 5000];

  const dailyProfit = Number((amount * 0.01).toFixed(2));
  const weeklyProfit = Number((dailyProfit * 7).toFixed(2));
  const monthlyProfit = Number((dailyProfit * 30).toFixed(2));
  const cycle45Profit = Number((dailyProfit * 45).toFixed(2));
  const totalAfter45Days = Number((amount + cycle45Profit).toFixed(2));

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/reservation');
    } else {
      openRegisterModal();
    }
  };

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, position: 'relative' }}>
      <Container maxWidth="lg">
        <Paper
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: '#111522',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(145deg, rgba(17, 21, 34, 0.95) 0%, rgba(20, 15, 38, 0.95) 100%)'
          }}
        >
          {/* Top Pill */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: 'rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a78bfa'
                }}
              >
                <CalculateIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="overline" sx={{ color: '#a78bfa', fontWeight: 800, letterSpacing: '0.1em' }}>
                INTERACTIVE ROI ESTIMATOR
              </Typography>
            </Box>

            <Chip
              icon={<VerifiedIcon sx={{ fontSize: 14, color: '#34d399 !important' }} />}
              label="Standard 1.000% Daily Rate"
              size="small"
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontWeight: 800,
                fontSize: '0.72rem'
              }}
            />
          </Box>

          <Grid container spacing={{ xs: 3, md: 5 }} sx={{ alignItems: 'center' }}>
            {/* Left Inputs */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffffff', mb: 1, letterSpacing: '-0.02em' }}>
                Calculate your algorithmic yield
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
                Simulate potential returns based on automated 24-hour liquidity doubling cycles.
              </Typography>

              {/* Amount Display */}
              <Box
                sx={{
                  p: 2.5,
                  mb: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 700 }}>
                  Staked / Reservation Balance:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#38bdf8' }}>
                  {amount.toLocaleString()} USDT
                </Typography>
              </Box>

              {/* Slider */}
              <Box sx={{ px: 1, mb: 2.5 }}>
                <Slider
                  value={amount}
                  min={50}
                  max={5000}
                  step={50}
                  onChange={(_e, val) => setAmount(val as number)}
                  sx={{
                    color: '#8b5cf6',
                    height: 8,
                    '& .MuiSlider-thumb': {
                      width: 22,
                      height: 22,
                      backgroundColor: '#fff',
                      border: '3px solid #8b5cf6',
                      boxShadow: '0 0 15px rgba(139, 92, 246, 0.8)'
                    },
                    '& .MuiSlider-rail': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                />
              </Box>

              {/* Preset Buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {presets.map(p => (
                  <Button
                    key={p}
                    size="small"
                    variant={amount === p ? 'contained' : 'outlined'}
                    onClick={() => setAmount(p)}
                    sx={{
                      minWidth: 60,
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: amount === p ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
                      color: amount === p ? '#fff' : '#9CA3AF',
                      bgcolor: amount === p ? '#8b5cf6' : 'transparent',
                      '&:hover': {
                        borderColor: '#8b5cf6',
                        bgcolor: amount === p ? '#7c3aed' : 'rgba(139, 92, 246, 0.1)'
                      }
                    }}
                  >
                    ${p}
                  </Button>
                ))}
              </Box>
            </Grid>

            {/* Right Return Breakdown Cards */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3 }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, display: 'block' }}>
                      DAILY RETURN (24H)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399', my: 0.5 }}>
                      +{dailyProfit} USDT
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      1.00% daily yield
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3 }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, display: 'block' }}>
                      WEEKLY RETURN (7D)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#38bdf8', my: 0.5 }}>
                      +{weeklyProfit} USDT
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      7.00% cumulative
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3 }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, display: 'block' }}>
                      MONTHLY RETURN (30D)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#c084fc', my: 0.5 }}>
                      +{monthlyProfit} USDT
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      30.0% cumulative
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255, 215, 0, 0.08)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ElectricBoltIcon sx={{ color: '#FFD700', fontSize: 14 }} />
                      <Typography variant="caption" sx={{ color: '#FFD700', fontWeight: 800 }}>
                        45-DAY MILESTONE
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFD700', my: 0.5 }}>
                      +{cycle45Profit} USDT
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#eab308', fontWeight: 700 }}>
                      Total: ${totalAfter45Days} USDT
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Action Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleStart}
                endIcon={<RocketLaunchIcon />}
                sx={{
                  mt: 2.5,
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: '1rem',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)'
                  }
                }}
              >
                Stake {amount.toLocaleString()} USDT Now →
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};
