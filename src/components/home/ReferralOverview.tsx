import React from 'react';
import { Box, Container, Typography, Paper, Stack, Divider, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import {
  PeopleAltOutlinedIcon,
  MonetizationOnOutlinedIcon,
  ShareOutlinedIcon,
  MilitaryTechIcon,
  ArrowForwardIcon,
  AutoAwesomeIcon,
  CheckCircleIcon
} from '../common/Icons';

export const ReferralOverview: React.FC = () => {
  const navigate = useNavigate();

  const depositBonusSlabs = [
    { deposit: '50 USDT', bonus: '3 USDT', rate: '6.0%' },
    { deposit: '100 USDT', bonus: '8 USDT', rate: '8.0%' },
    { deposit: '200 USDT', bonus: '16 USDT', rate: '8.0%' },
    { deposit: '300 USDT', bonus: '24 USDT', rate: '8.0%' },
    { deposit: '400 USDT', bonus: '32 USDT', rate: '8.0%' },
    { deposit: '500+ USDT', bonus: '40 USDT', rate: 'Max 40 USDT' }
  ];

  return (
    <Box sx={{ py: 8, position: 'relative' }}>
      <Container maxWidth="lg">
        <Paper
          sx={{
            p: { xs: 3, sm: 4.5 },
            borderRadius: 5,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 50%, rgba(17, 21, 34, 0.95) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                <Chip
                  label="COMMUNITY & AFFILIATES"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(139, 92, 246, 0.15)',
                    color: '#a78bfa',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                />
                <Chip
                  icon={<AutoAwesomeIcon style={{ color: '#34d399', fontSize: '1rem' }} />}
                  label="Instant Link Owner Bonus"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(52, 211, 153, 0.12)',
                    color: '#34d399',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    border: '1px solid rgba(52, 211, 153, 0.3)'
                  }}
                />
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.8rem', sm: '2.3rem' },
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  mb: 1.5
                }}
              >
                Direct Referral Bonus & Multi-Tier Commissions
              </Typography>
              <Typography variant="body1" sx={{ color: '#9CA3AF', lineHeight: 1.65, mb: 3 }}>
                Share your invite link and earn instant deposit bonuses up to <strong>40 USDT</strong> directly to your balance, plus lifetime daily yield commissions across your 3-tier team.
              </Typography>

              {/* Direct Link Bonus Highlight Box */}
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ color: '#a78bfa', fontSize: '1.2rem' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                    Referral Bonus Guarantee
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#c4b5fd', display: 'block', lineHeight: 1.5 }}>
                  Bonus exclusively credited to the account whose referral link was used when a new referee joins and deposits 50+ USDT.
                </Typography>
              </Box>

              <Stack spacing={1.8} sx={{ mb: 3.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, p: 1.2, borderRadius: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.15)' }}>
                    <ShareOutlinedIcon sx={{ color: '#a78bfa', fontSize: '1.2rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      Tier A (Direct) — <span style={{ color: '#a78bfa' }}>0.1% Daily</span> + Direct Slabs
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Instant deposit bonus + daily reservation commission</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, p: 1.2, borderRadius: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.15)' }}>
                    <PeopleAltOutlinedIcon sx={{ color: '#60a5fa', fontSize: '1.2rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      Tier B (Secondary) — <span style={{ color: '#60a5fa' }}>0.05% Lifetime Daily</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Earn on reservations from members invited by your direct team</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, p: 1.2, borderRadius: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: 'rgba(52, 211, 153, 0.15)' }}>
                    <MonetizationOnOutlinedIcon sx={{ color: '#34d399', fontSize: '1.2rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      Tier C (Tertiary) — <span style={{ color: '#34d399' }}>0.025% Lifetime Daily</span>
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

            {/* Direct Referral Deposit Bonus Slabs Table Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 4,
                  backgroundColor: '#111522',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, justifyContent: 'center' }}>
                  <MilitaryTechIcon sx={{ color: '#34d399' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#ffffff' }}>
                    Direct Referral Deposit Bonus Slabs
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', textAlign: 'center', mb: 2 }}>
                  Credited to the <strong>Referral Link Owner</strong> on referee deposit
                </Typography>

                <TableContainer sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#9CA3AF', fontWeight: 800, fontSize: '0.75rem', py: 1 }}>Referee Deposit</TableCell>
                        <TableCell align="right" sx={{ color: '#34d399', fontWeight: 800, fontSize: '0.75rem', py: 1 }}>Sponsor Bonus</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {depositBonusSlabs.map((row, idx) => (
                        <TableRow
                          key={idx}
                          sx={{
                            '&:nth-of-type(odd)': { bgcolor: 'rgba(255,255,255,0.015)' },
                            '& td': { borderColor: 'rgba(255,255,255,0.05)', py: 1.1 }
                          }}
                        >
                          <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                            {row.deposit}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`+${row.bonus}`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(52, 211, 153, 0.15)',
                                color: '#34d399',
                                fontWeight: 900,
                                fontSize: '0.75rem',
                                border: '1px solid rgba(52, 211, 153, 0.3)'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 800 }}>Tier A Commission</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#fff' }}>0.10% / 24H</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 800 }}>Tier B Commission</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#fff' }}>0.05% / 24H</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>Tier C Commission</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#fff' }}>0.025% / 24H</Typography>
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

