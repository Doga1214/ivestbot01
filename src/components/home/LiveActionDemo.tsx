import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Chip, Button, LinearProgress, Stack } from '@mui/material';
import {
  ElectricBoltIcon,
  PlayArrowIcon,
  CheckCircleOutlineIcon,
  AutoAwesomeIcon,
  RefreshIcon
} from '../common/Icons';

export const LiveActionDemo: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);

  const poolAmount = 500;
  const targetProfit = poolAmount * 0.022222; // $11.11

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            setStep(3);
            setProfit(targetProfit);
            return 100;
          }
          const next = prev + 2;
          if (next < 30) setStep(0);
          else if (next < 70) setStep(1);
          else if (next < 99) setStep(2);
          else setStep(3);
          setProfit((next / 100) * targetProfit);
          return next;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRunning, targetProfit]);

  const handleStartSimulation = () => {
    setProgress(0);
    setProfit(0);
    setStep(0);
    setIsRunning(true);
  };

  const stepsInfo = [
    { label: 'Selecting Node Liquidity', desc: 'Locking 500 USDT into 24H algorithmic pool...' },
    { label: 'Smart Contract Matching', desc: 'Arbitrage routing across multi-chain liquidity vaults...' },
    { label: '20s Instant Settlement', desc: 'Verifying cryptographic proof & calculating 2.22% yield...' },
    { label: 'Settlement Completed', desc: 'Yield credited: +$11.11 USDT directly to balance!' }
  ];

  return (
    <Box sx={{ py: 8, position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Chip
            icon={<ElectricBoltIcon style={{ color: '#38bdf8' }} />}
            label="INTERACTIVE SIMULATOR"
            size="small"
            sx={{
              bgcolor: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              mb: 1.5
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            Live Yield Engine Simulation
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF', maxWidth: 640, mx: 'auto', mt: 1 }}>
            Experience how our 24-hour algorithmic cycle matches liquidity and distributes daily profit.
          </Typography>
        </Box>

        {/* Interactive Console Screen */}
        <Paper
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: '#0B0E17',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 5,
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(139, 92, 246, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Glowing Header Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#eab308' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22c55e' }} />
              <Typography sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: '#9CA3AF' }}>
                ivestbot://protocol-engine-v3.0.4
              </Typography>
            </Box>

            <Chip
              label={isRunning ? '● SIMULATION RUNNING' : progress === 100 ? '✓ CYCLE COMPLETED' : 'IDLE - READY'}
              size="small"
              sx={{
                bgcolor: isRunning ? 'rgba(234, 179, 8, 0.15)' : progress === 100 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isRunning ? '#eab308' : progress === 100 ? '#22c55e' : '#9CA3AF',
                fontWeight: 800,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
          </Box>

          {/* Center Interactive Core */}
          <Box sx={{ textAlign: 'center', my: { xs: 2, sm: 4 } }}>
            {!isRunning && progress === 0 && (
              <Box>
                <Box
                  onClick={handleStartSimulation}
                  sx={{
                    width: { xs: 72, sm: 90 },
                    height: { xs: 72, sm: 90 },
                    borderRadius: '50%',
                    bgcolor: 'rgba(139, 92, 246, 0.2)',
                    border: '2px solid #8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 0 50px rgba(139, 92, 246, 0.6)',
                    mx: 'auto',
                    mb: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 0 70px rgba(139, 92, 246, 0.9)',
                      bgcolor: 'rgba(139, 92, 246, 0.4)'
                    }
                  }}
                >
                  <PlayArrowIcon sx={{ fontSize: { xs: 36, sm: 48 }, ml: 0.5 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', mb: 1 }}>
                  Click to Test Run 500 USDT Cycle
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', maxWidth: 460, mx: 'auto' }}>
                  Simulates full smart contract lifecycle with real-time profit computation in 5 seconds.
                </Typography>
              </Box>
            )}

            {(isRunning || progress > 0) && (
              <Box sx={{ maxWidth: 650, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 800, textTransform: 'uppercase' }}>
                    {stepsInfo[step]?.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 800, fontFamily: 'monospace' }}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    mb: 3,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: 'linear-gradient(90deg, #8b5cf6 0%, #38bdf8 50%, #34d399 100%)'
                    }
                  }}
                />

                <Paper
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(17, 21, 34, 0.8)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    mb: 3
                  }}
                >
                  <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Simulated Stake</Typography>
                      <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 800 }}>$500.00</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Current Return</Typography>
                      <Typography variant="h6" sx={{ color: '#34d399', fontWeight: 800, fontFamily: 'monospace' }}>
                        +${profit.toFixed(2)} USDT
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Est. 45-Day Total</Typography>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 800 }}>
                        $1,000.00 (2x)
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Typography variant="body2" sx={{ color: '#a78bfa', fontFamily: 'monospace', mb: 3 }}>
                  &gt; {stepsInfo[step]?.desc}
                </Typography>

                {!isRunning && progress === 100 && (
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleStartSimulation}
                    sx={{
                      borderRadius: 3,
                      borderColor: 'rgba(139, 92, 246, 0.5)',
                      color: '#a78bfa',
                      fontWeight: 800,
                      '&:hover': {
                        borderColor: '#a78bfa',
                        bgcolor: 'rgba(139, 92, 246, 0.1)'
                      }
                    }}
                  >
                    Replay Simulation
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
