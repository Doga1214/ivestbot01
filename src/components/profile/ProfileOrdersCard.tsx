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
  AccountBoxIcon,
  DescriptionIcon,
  CreditCardIcon,
  AccountBalanceWalletIcon,
  CloseIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface ProfileOrdersCardProps {
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
}

export const ProfileOrdersCard: React.FC<ProfileOrdersCardProps> = ({
  onOpenDeposit,
  onOpenWithdraw
}) => {
  const { reservationHistory, isProcessing, user } = useApp();
  const navigate = useNavigate();

  const [nftsModalOpen, setNftsModalOpen] = useState<boolean>(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);

  // Real Orders data
  const totalOrders = reservationHistory.length;
  const boughtOrders = reservationHistory.filter(r => r.status === 'COMPLETED' || r.status === 'PROCESSING').length;
  const soldOrders = reservationHistory.filter(r => r.status === 'COMPLETED').length;
  const processingOrders = (isProcessing ? 1 : 0) + reservationHistory.filter(r => r.status === 'PROCESSING').length;

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
            My Orders
          </Typography>

          {/* 4-Column Metric Counters */}
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
                {totalOrders}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Orders
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
                {boughtOrders}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Bought
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
                {soldOrders}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Sold
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
                {processingOrders}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                Processing
              </Typography>
            </Grid>
          </Grid>

          {/* 4 Interactive Action Buttons */}
          <Grid container spacing={1.5}>
            {/* 1. NFTS */}
            <Grid size={{ xs: 3 }}>
              <Box
                onClick={() => setNftsModalOpen(true)}
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
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <AccountBoxIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem', textAlign: 'center' }}>
                  NFTS
                </Typography>
              </Box>
            </Grid>

            {/* 2. Details */}
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
                  <DescriptionIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem', textAlign: 'center' }}>
                  Details
                </Typography>
              </Box>
            </Grid>

            {/* 3. Deposit */}
            <Grid size={{ xs: 3 }}>
              <Box
                onClick={onOpenDeposit || (() => navigate('/wallet'))}
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
                    bgcolor: 'rgba(56, 189, 248, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                  }}
                >
                  <CreditCardIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem', textAlign: 'center' }}>
                  Deposit
                </Typography>
              </Box>
            </Grid>

            {/* 4. Withdraw */}
            <Grid size={{ xs: 3 }}>
              <Box
                onClick={onOpenWithdraw || (() => navigate('/wallet'))}
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
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.78rem', textAlign: 'center' }}>
                  Withdraw
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ─── MODAL 1: MY RESERVED NFTS / ASSETS ────────────────────── */}
      <Dialog
        open={nftsModalOpen}
        onClose={() => setNftsModalOpen(false)}
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
            <AccountBoxIcon sx={{ color: '#8b5cf6' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              My Reserved NFT Assets
            </Typography>
          </Box>
          <IconButton onClick={() => setNftsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: 3,
              mb: 2.5
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#ffffff' }}>
                Algorithmic Doubler Bot #{user?.id ? user.id.slice(0, 4) : '8821'}
              </Typography>
              <Chip
                label="Level 1 Active"
                size="small"
                sx={{ bgcolor: '#8b5cf6', color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1.5 }}>
              Yield rate: <strong>2.857% daily return</strong> (Full principal doubling cycle in 35 days).
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setNftsModalOpen(false);
                navigate('/reservation');
              }}
              sx={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: 2.5
              }}
            >
              Go to Doubling Reservation
            </Button>
          </Paper>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: ORDER DETAILS / TRANSACTION HISTORY ─────────── */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
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
            <DescriptionIcon sx={{ color: '#a855f7' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Order History & Details
            </Typography>
          </Box>
          <IconButton onClick={() => setDetailsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {reservationHistory.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: '#9CA3AF', mb: 2 }}>
                No reservation orders placed yet.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setDetailsModalOpen(false);
                  navigate('/reservation');
                }}
                sx={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 2.5
                }}
              >
                Place First Reservation
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700, borderColor: 'rgba(255,255,255,0.08)' } }}>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Profit</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservationHistory.map(row => (
                    <TableRow key={row.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.05)' } }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                        {row.referenceId || row.id}
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>${row.amount.toFixed(2)} USDT</TableCell>
                      <TableCell sx={{ color: '#38bdf8' }}>{row.effectiveRate.toFixed(2)}%</TableCell>
                      <TableCell sx={{ color: '#34d399', fontWeight: 800 }}>+${row.profit.toFixed(4)}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            bgcolor: row.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: row.status === 'COMPLETED' ? '#34d399' : '#fbbf24',
                            fontWeight: 800,
                            fontSize: '0.7rem'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
