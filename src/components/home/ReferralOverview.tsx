import React from 'react';
import { Box, Container, Typography, Paper, Stack, Divider, Chip, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import {
  PeopleAltOutlinedIcon,
  MonetizationOnOutlinedIcon,
  ShareOutlinedIcon,
  MilitaryTechIcon,
  ArrowForwardIcon
} from '../common/Icons';

export const ReferralOverview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 8, position: 'relative' }}>
      <Container maxWidth="lg">
        <Paper
          sx={{
            p: { xs: 3.5, sm: 5 },
            borderRadius: 5,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 50%, rgba(17, 21, 34, 0.95) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Grid container spacing={5} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="COMMUNITY & AFFILIATES"
                size="small"
                sx={{
                  bgcolor: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  mb: 1.5
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.8rem', sm: '2.4rem' },
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  mb: 2
                }}
              >
                3-Tier Multi-Level Referral Commissions
              </Typography>
              <Typography variant="body1" sx={{ color: '#9CA3AF', lineHeight: 1.7, mb: 3.5 }}>
                Build your crypto team. Earn lifetime daily commissions on all downline 24-hour reservation cycles with instant automated profit distribution.
              </Typography>

              <Stack spacing={2.2} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.15)' }}>
                    <ShareOutlinedIcon sx={{ color: '#a78bfa' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      Tier A (Direct Referrals) — <span style={{ color: '#a78bfa' }}>0.1% Lifetime Daily</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Earn on every reservation executed by direct friends</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.15)' }}>
                    <PeopleAltOutlinedIcon sx={{ color: '#60a5fa' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      Tier B (Secondary Referrals) — <span style={{ color: '#60a5fa' }}>0.05% Lifetime Daily</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Earn on reservations from members invited by your A-tier</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(52, 211, 153, 0.15)' }}>
                    <MonetizationOnOutlinedIcon sx={{ color: '#34d399' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      Tier C (Tertiary Referrals) — <span style={{ color: '#34d399' }}>0.025% Lifetime Daily</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Network leverage across your 3rd level downline</Typography>
                  </Box>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                onClick={() => navigate('/referrals')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: 3,
                  borderColor: 'rgba(139, 92, 246, 0.5)',
                  color: '#a78bfa',
                  fontWeight: 800,
                  px: 3,
                  py: 1.2,
                  '&:hover': {
                    borderColor: '#a78bfa',
                    bgcolor: 'rgba(139, 92, 246, 0.1)'
                  }
                }}
              >
                View Referral Dashboard
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 4,
                  backgroundColor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'center' }}>
                  <MilitaryTechIcon sx={{ color: '#a78bfa' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#ffffff' }}>
                    Lifetime Daily Commission Rates
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', textAlign: 'center', mb: 2.5 }}>
                  Automatically calculated and credited upon each 24-hour cycle completion
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa' }}>Tier A (Direct)</Typography>
                      <Chip label="0.10% / 24H" size="small" sx={{ bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontWeight: 900 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      Example: 1,000 USDT downline reservation = <strong>+1.00 USDT daily</strong> profit
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa' }}>Tier B (Secondary)</Typography>
                      <Chip label="0.05% / 24H" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 900 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      Example: 1,000 USDT downline reservation = <strong>+0.50 USDT daily</strong> profit
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399' }}>Tier C (Tertiary)</Typography>
                      <Chip label="0.025% / 24H" size="small" sx={{ bgcolor: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 900 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      Example: 1,000 USDT downline reservation = <strong>+0.25 USDT daily</strong> profit
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 800 }}>Tier A</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff' }}>0.1%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 800 }}>Tier B</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff' }}>0.05%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>Tier C</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff' }}>0.025%</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};
