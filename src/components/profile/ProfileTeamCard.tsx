import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  GroupsIcon,
  EmojiEventsIcon,
  AssignmentIcon,
  ShareOutlinedIcon,
  CloseIcon,
  ContentCopyIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const ProfileTeamCard: React.FC = () => {
  const { referralSummary, showSnackbar } = useApp();
  const navigate = useNavigate();

  // Dialog states for interactive quick actions
  const [teamModalOpen, setTeamModalOpen] = useState<boolean>(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState<boolean>(false);
  const [referralModalOpen, setReferralModalOpen] = useState<boolean>(false);

  // 100% Real data from referralSummary
  const regMembers = referralSummary?.totalMembersCount || 0;
  const validMembers = referralSummary?.activeMembersCount || 0;
  const validA = referralSummary?.aMembersCount || 0;
  const validBC = (referralSummary?.bMembersCount || 0) + (referralSummary?.cMembersCount || 0);

  const allDownlines = referralSummary?.referralRecords || [];

  // Calculate real-time team turnover volume and daily commission per member
  const totalTurnover = allDownlines.reduce((sum, rec) => sum + (rec.depositAmountUSDT || 0), 0);
  
  // Real daily commission calculation per member
  const getMemberCommissionRate = (tier: string) => {
    if (tier === 'A') return 0.001; // 0.1%
    if (tier === 'B') return 0.0005; // 0.05%
    if (tier === 'C') return 0.00025; // 0.025%
    return 0.001;
  };

  const getMemberCommissionRateText = (tier: string) => {
    if (tier === 'A') return '0.10%';
    if (tier === 'B') return '0.05%';
    if (tier === 'C') return '0.025%';
    return '0.10%';
  };

  const calculateDailyCommission = (amount: number, tier: string) => {
    const rate = getMemberCommissionRate(tier);
    return Number((amount * rate).toFixed(4));
  };

  const totalEstDailyCommission = allDownlines.reduce((sum, rec) => {
    return sum + calculateDailyCommission(rec.depositAmountUSDT || 0, rec.tierLevel);
  }, 0);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`${label} copied to clipboard!`, 'success');
  };

  return (
    <>
      <Card
        sx={{
          background: 'linear-gradient(145deg, #121422 0%, #161a29 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
          mb: 2.5,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#e2e8f0', fontSize: '1.05rem' }}>
              My Team
            </Typography>
            <Chip
              label={`Daily Est: +$${totalEstDailyCommission.toFixed(2)}/Day`}
              size="small"
              sx={{ bgcolor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontWeight: 800, fontSize: '0.72rem' }}
            />
          </Box>

          {/* 4-Column Metric Counters (100% Real Data) */}
          <Grid container spacing={1} sx={{ mb: 2.5, textAlign: 'center' }}>
            <Grid size={{ xs: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#ffffff',
                  fontSize: { xs: '1.4rem', sm: '1.75rem' },
                  letterSpacing: '-0.02em',
                  mb: 0.5
                }}
              >
                {regMembers}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Registered<br />Members
              </Typography>
            </Grid>

            <Grid size={{ xs: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#ffffff',
                  fontSize: { xs: '1.4rem', sm: '1.75rem' },
                  letterSpacing: '-0.02em',
                  mb: 0.5
                }}
              >
                {validMembers}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Active<br />Members
              </Typography>
            </Grid>

            <Grid size={{ xs: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#a78bfa',
                  fontSize: { xs: '1.4rem', sm: '1.75rem' },
                  letterSpacing: '-0.02em',
                  mb: 0.5
                }}
              >
                {validA}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Tier A<br />(0.10%)
              </Typography>
            </Grid>

            <Grid size={{ xs: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#60a5fa',
                  fontSize: { xs: '1.4rem', sm: '1.75rem' },
                  letterSpacing: '-0.02em',
                  mb: 0.5
                }}
              >
                {validBC}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Tier B+C<br />(0.05/0.025%)
              </Typography>
            </Grid>
          </Grid>

          {/* Real Team Turnover & Daily Commission Bar */}
          <Paper
            sx={{
              p: 1.8,
              mb: 3,
              borderRadius: 2.5,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.72rem' }}>
                Team Turnover Volume (Daily Synced)
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#ffffff' }}>
                ${totalTurnover.toFixed(2)} USDT
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.72rem' }}>
                Total Commission Earned
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#34d399' }}>
                +${(referralSummary?.totalEarnings || 0).toFixed(2)} USDT
              </Typography>
            </Box>
          </Paper>

          {/* 4 Interactive Purple Action Buttons */}
          <Grid container spacing={1.5}>
            {/* 1. My Team */}
            <Grid size={{ xs: 3 }}>
              <Box
                onClick={() => setTeamModalOpen(true)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 2.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  <GroupsIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem', textAlign: 'center' }}>
                  My Team
                </Typography>
              </Box>
            </Grid>

            {/* 2. Team Details */}
            <Grid size={{ xs: 3 }}>
              <Box
                onClick={() => setDetailsModalOpen(true)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 2.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <EmojiEventsIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem', textAlign: 'center' }}>
                  Team Details
                </Typography>
              </Box>
            </Grid>

            {/* 3. Team Orders */}
            <Grid size={{ xs: 3 }}>
              <Box
                onClick={() => setOrdersModalOpen(true)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 2.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <AssignmentIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem', textAlign: 'center' }}>
                  Team Orders
                </Typography>
              </Box>
            </Grid>

            {/* 4. Referral / Invite */}
            <Grid size={{ xs: 3 }}>
              <Box
                onClick={() => setReferralModalOpen(true)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 2.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(139, 92, 246, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(192, 38, 211, 0.3)'
                  }}
                >
                  <ShareOutlinedIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem', textAlign: 'center' }}>
                  Referral
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─── MODAL 1: MY TEAM MEMBERS MODAL ───────────────────────── */}
      <Dialog
        open={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              backgroundImage: 'none',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 3.5,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <GroupsIcon sx={{ color: '#8b5cf6' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Team Downline & Commission Directory
            </Typography>
          </Box>
          <IconButton onClick={() => setTeamModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 1.5, flex: 1, minWidth: 120, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700 }}>Direct Tier A (0.10%)</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>{validA} Members</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, flex: 1, minWidth: 120, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700 }}>Indirect Tier B+C</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>{validBC} Members</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, flex: 1, minWidth: 120, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700 }}>Total Team Turnover</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>
                ${totalTurnover.toFixed(2)} USDT
              </Typography>
            </Paper>
            <Paper sx={{ p: 1.5, flex: 1, minWidth: 120, bgcolor: 'rgba(52, 211, 153, 0.1)', borderRadius: 2, border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700 }}>Est. Daily Commission</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>
                +${totalEstDailyCommission.toFixed(2)}/Day
              </Typography>
            </Paper>
          </Box>

          {allDownlines.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: '#9CA3AF', mb: 2 }}>
                You have not invited any team members yet. Share your referral code to grow your team!
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setTeamModalOpen(false);
                  setReferralModalOpen(true);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 2.5
                }}
              >
                Invite Friends Now
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700, borderColor: 'rgba(255,255,255,0.08)' } }}>
                    <TableCell>Member User</TableCell>
                    <TableCell>Tier Level</TableCell>
                    <TableCell>Turnover Volume</TableCell>
                    <TableCell>Commission Rate</TableCell>
                    <TableCell align="right">Daily Commission</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allDownlines.map(row => {
                    const memberVol = row.depositAmountUSDT || 0;
                    const dailyComm = calculateDailyCommission(memberVol, row.tierLevel);
                    const rateText = getMemberCommissionRateText(row.tierLevel);

                    return (
                      <TableRow key={row.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.05)' } }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              @{row.refereeUsername || 'Member'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                              {row.refereeName || 'Registered Member'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`Tier ${row.tierLevel}`}
                            size="small"
                            sx={{
                              bgcolor: row.tierLevel === 'A' ? 'rgba(139, 92, 246, 0.2)' : row.tierLevel === 'B' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                              color: row.tierLevel === 'A' ? '#a78bfa' : row.tierLevel === 'B' ? '#38bdf8' : '#34d399',
                              fontWeight: 900,
                              fontSize: '0.72rem'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 800 }}>
                          ${memberVol.toFixed(2)} USDT
                        </TableCell>
                        <TableCell sx={{ color: '#a78bfa', fontWeight: 700 }}>
                          {rateText} / 24H
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#34d399', fontWeight: 900 }}>
                          +${dailyComm.toFixed(4)} USDT/Day
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: TEAM DETAILS & COMMISSIONS MODAL ───────────── */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              backgroundImage: 'none',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 3.5,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <EmojiEventsIcon sx={{ color: '#FFD700' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Team Commission Rates & Breakdown
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                  Level A (Direct Referrals)
                </Typography>
                <Chip label="0.10% / 24H" size="small" sx={{ bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontWeight: 900 }} />
              </Box>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Earn <strong>0.1% Lifetime Daily Commission</strong> on all 24-hour doubling reservations placed by your direct friends ({validA} active members).
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                  Level B (Secondary Downline)
                </Typography>
                <Chip label="0.05% / 24H" size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 900 }} />
              </Box>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Earn <strong>0.05% Lifetime Daily Commission</strong> on reservations placed by members invited by your Level A team.
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399' }}>
                  Level C (Tertiary Downline)
                </Typography>
                <Chip label="0.025% / 24H" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 900 }} />
              </Box>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Earn <strong>0.025% Lifetime Daily Commission</strong> across all 3rd generation reservations.
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 3: TEAM ORDERS MODAL ───────────────────────────── */}
      <Dialog
        open={ordersModalOpen}
        onClose={() => setOrdersModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              backgroundImage: 'none',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 3.5,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <AssignmentIcon sx={{ color: '#38bdf8' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Team Order Turnover
            </Typography>
          </Box>
          <IconButton onClick={() => setOrdersModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2.5 }}>
            Live turnover statistics aggregated across all downline reservation cycles.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2.5, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Total Team Volume</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mt: 0.5 }}>
                  ${totalTurnover.toFixed(2)} USDT
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(52, 211, 153, 0.08)', borderRadius: 2.5, textAlign: 'center', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                <Typography variant="caption" sx={{ color: '#34d399' }}>Daily Commission Flow</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#34d399', mt: 0.5 }}>
                  +${totalEstDailyCommission.toFixed(2)}/Day
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setOrdersModalOpen(false);
              navigate('/referral');
            }}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2.5,
              py: 1.3
            }}
          >
            Open Full Referral Command Center
          </Button>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 4: REFERRAL / INVITE MODAL ────────────────────── */}
      <Dialog
        open={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              backgroundImage: 'none',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 3.5,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <ShareOutlinedIcon sx={{ color: '#c026d3' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Referral Invitation
            </Typography>
          </Box>
          <IconButton onClick={() => setReferralModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2.5 }}>
            Share your exclusive referral link and code to earn real lifetime daily commissions across 3 tiers (0.1%, 0.05%, 0.025%).
          </Typography>

          <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              Your Referral Code:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#a78bfa', letterSpacing: '0.1em' }}>
                {referralSummary?.referralCode || 'IVEST100'}
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(referralSummary?.referralCode || 'IVEST100', 'Referral Code')}
                sx={{
                  bgcolor: '#7c3aed',
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 700
                }}
              >
                Copy Code
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2.5, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              Invitation URL:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {referralSummary?.referralLink || `${window.location.origin}/?ref=${referralSummary?.referralCode || 'IVEST100'}`}
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(referralSummary?.referralLink || `${window.location.origin}/?ref=${referralSummary?.referralCode || 'IVEST100'}`, 'Referral Link')}
                sx={{
                  bgcolor: '#7c3aed',
                  textTransform: 'none',
                  borderRadius: 2,
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                Copy Link
              </Button>
            </Box>
          </Paper>

          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setReferralModalOpen(false);
              navigate('/referral');
            }}
            sx={{
              py: 1.3,
              borderRadius: 3,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              textTransform: 'none'
            }}
          >
            Visit Complete Referral Page
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
