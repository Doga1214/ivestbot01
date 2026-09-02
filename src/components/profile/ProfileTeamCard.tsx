import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
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
  const [affiliateModalOpen, setAffiliateModalOpen] = useState<boolean>(false);

  // 100% Real data from referralSummary
  const regMembers = referralSummary?.totalMembersCount || 0;
  const validMembers = referralSummary?.activeMembersCount || 0;
  const validA = referralSummary?.aMembersCount || 0;
  const validBC = (referralSummary?.bMembersCount || 0) + (referralSummary?.cMembersCount || 0);

  const allDownlines = referralSummary?.referralRecords || [];

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
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#e2e8f0', fontSize: '1.05rem', mb: 2.5 }}>
            My Team
          </Typography>

          {/* 4-Column Metric Counters (100% Real Data) */}
          <Grid container spacing={1} sx={{ mb: 3.5, textAlign: 'center' }}>
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
                Valid<br />Members
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
                {validA}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Valid A<br />enthusiast
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
                {validBC}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Valid B+C<br />enthusiast
              </Typography>
            </Grid>
          </Grid>

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
                  My team
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
                  Team orders
                </Typography>
              </Box>
            </Grid>

            {/* 4. Affiliate */}
            <Grid size={{ xs: 3 }}>
              <Box
                onClick={() => setAffiliateModalOpen(true)}
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
                  Affiliate
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
              Team Downline Directory
            </Typography>
          </Box>
          <IconButton onClick={() => setTeamModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
            <Paper sx={{ p: 1.5, flex: 1, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Direct Tier A</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#8b5cf6' }}>{validA}</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, flex: 1, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Indirect Tier B+C</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#38bdf8' }}>{validBC}</Typography>
            </Paper>
            <Paper sx={{ p: 1.5, flex: 1, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Total Volume</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>
                ${(referralSummary?.tierAEarnings || 0).toFixed(2)}
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
                  setAffiliateModalOpen(true);
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
                    <TableCell>User</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Turnover</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allDownlines.map(row => (
                    <TableRow key={row.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.05)' } }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                        @{row.refereeUsername || 'Member'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Tier ${row.tierLevel}`}
                          size="small"
                          sx={{
                            bgcolor: row.tierLevel === 'A' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: row.tierLevel === 'A' ? '#a78bfa' : '#38bdf8',
                            fontWeight: 800,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            bgcolor: (row.status === 'COMPLETED' || row.status === 'CLAIMED') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: (row.status === 'COMPLETED' || row.status === 'CLAIMED') ? '#34d399' : '#9CA3AF',
                            fontWeight: 800,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#34d399', fontWeight: 800 }}>
                        ${(row.depositAmountUSDT ?? 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
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
              Team Commission Structure
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa', mb: 0.5 }}>
                Level A Direct Referrals
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Earn <strong>10% Instant Commission</strong> on all 24-hour doubling reservations placed by direct invitees.
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8', mb: 0.5 }}>
                Level B Secondary Team
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Earn <strong>5% Commission</strong> from users invited by your Level A team members.
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399', mb: 0.5 }}>
                Level C Extended Network
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Earn <strong>2% Commission</strong> across all 3rd generation reservations.
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
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
            Live algorithmic cycle doubling orders placed by your downline network.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 3, textAlign: 'center', py: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mb: 0.5 }}>
              ${(referralSummary?.totalEarnings || 0).toFixed(2)} USDT
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 2 }}>
              Total Cumulative Team Commission Earned
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setOrdersModalOpen(false);
                navigate('/referral');
              }}
              sx={{
                borderColor: 'rgba(139, 92, 246, 0.4)',
                color: '#a78bfa',
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              Open Full Referral Hub
            </Button>
          </Paper>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 4: AFFILIATE / INVITE MODAL ────────────────────── */}
      <Dialog
        open={affiliateModalOpen}
        onClose={() => setAffiliateModalOpen(false)}
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
              Affiliate Invitation
            </Typography>
          </Box>
          <IconButton onClick={() => setAffiliateModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2.5 }}>
            Share your exclusive referral link and code to earn direct USDT commissions instantly when friends join.
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
              setAffiliateModalOpen(false);
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
