import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper
} from '@mui/material';
import {
  CheckIcon,
  CancelIcon,
  HourglassBottomIcon,
  ShieldOutlinedIcon,
  LockOutlinedIcon,
  VerifiedUserIcon,
  WarningAmberIcon,
  RefreshIcon
} from '../common/Icons';
import type { WalletTransaction } from '../../services/walletService';
import { authService } from '../../services/authService';
import { formatUSDT, formatDateTime } from '../../utils/formatters';

interface AdminWithdrawalQueueProps {
  withdrawals: WalletTransaction[];
  onApprove: (txId: string, remarks?: string) => void;
  onReject: (txId: string, remarks?: string) => void;
  onRefresh?: () => void;
  showSnackbar?: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminWithdrawalQueue: React.FC<AdminWithdrawalQueueProps> = ({
  withdrawals,
  onApprove,
  onReject,
  onRefresh,
  showSnackbar
}) => {
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const allUsers = authService.getAllUsers();

  const handleManualRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      if (showSnackbar) showSnackbar('Withdrawal queue refreshed!', 'info');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleOpenAction = (tx: WalletTransaction, type: 'APPROVE' | 'REJECT') => {
    setSelectedTx(tx);
    setActionType(type);
    setAdminRemarks(
      type === 'APPROVE'
        ? 'Withdrawal authorized and dispatched via blockchain batch.'
        : 'Withdrawal rejected: security review / suspicious activity.'
    );
  };

  const handleConfirmAction = async () => {
    if (!selectedTx || !actionType || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (actionType === 'APPROVE') {
        await onApprove(selectedTx.id, adminRemarks);
      } else {
        await onReject(selectedTx.id, adminRemarks);
      }
      setSelectedTx(null);
      setActionType(null);
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: '#111522',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Withdrawal Verification Queue
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Review pending user withdrawal requests, inspect risk flags, and approve payout or refund.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {onRefresh && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                startIcon={!isRefreshing && <RefreshIcon fontSize="small" />}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#9CA3AF',
                  '&:hover': { borderColor: '#a78bfa', color: '#a78bfa' }
                }}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            )}
            <Chip
              label={`${withdrawals.length} PENDING`}
              color={withdrawals.length > 0 ? 'warning' : 'default'}
              sx={{ fontWeight: 800 }}
            />
          </Box>
        </Box>

        {withdrawals.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.1)'
            }}
          >
            <HourglassBottomIcon sx={{ fontSize: 48, color: '#4B5563', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#9CA3AF' }}>
              No Pending Withdrawal Requests
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              All withdrawal requests have been processed.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.08)' } }}>
                  <TableCell>Ref ID / Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Security / Risk Assessment</TableCell>
                  <TableCell>Destination Address</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.map((tx) => {
                  const userProfile = allUsers.find(u => u.id === tx.userId);
                  const isKycVerified = userProfile?.kycStatus === 'VERIFIED';
                  const isHighValue = tx.amount >= 1000;
                  const hasPin = tx.userId ? authService.hasWithdrawalPin(tx.userId) : true;

                  return (
                    <TableRow
                      key={tx.id}
                      hover
                      sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', py: 1.8 } }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f87171' }}>
                          {tx.referenceId}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {formatDateTime(tx.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {tx.userName || userProfile?.name || 'User'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          {tx.userEmail || userProfile?.email || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#f87171' }}>
                          -{formatUSDT(tx.amount)}
                        </Typography>
                      </TableCell>

                      {/* Security / Risk Flags */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                          {hasPin && (
                            <Chip
                              icon={<LockOutlinedIcon sx={{ fontSize: 13 }} />}
                              label="PIN Verified"
                              size="small"
                              sx={{ bgcolor: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                            />
                          )}
                          {isKycVerified ? (
                            <Chip
                              icon={<VerifiedUserIcon sx={{ fontSize: 13 }} />}
                              label="KYC Verified"
                              color="success"
                              size="small"
                              sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                            />
                          ) : (
                            <Chip
                              icon={<WarningAmberIcon sx={{ fontSize: 13 }} />}
                              label="Unverified KYC"
                              color="warning"
                              size="small"
                              sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                            />
                          )}
                          {isHighValue && (
                            <Chip
                              label="High Value ($1k+)"
                              size="small"
                              sx={{ bgcolor: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            maxWidth: 160,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            color: '#e2e8f0'
                          }}
                        >
                          {tx.address || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => handleOpenAction(tx, 'APPROVE')}
                            sx={{ fontWeight: 800, textTransform: 'none' }}
                          >
                            Approve Payout
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => handleOpenAction(tx, 'REJECT')}
                            sx={{ fontWeight: 700, textTransform: 'none' }}
                          >
                            Reject & Refund
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      <Dialog
        open={Boolean(selectedTx && actionType)}
        onClose={() => { setSelectedTx(null); setActionType(null); }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {actionType === 'APPROVE' ? 'Approve & Release Withdrawal' : 'Reject & Refund Withdrawal'}
        </DialogTitle>
        <DialogContent>
          {selectedTx && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>User:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#ffffff' }}>{selectedTx.userName || 'User'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Amount:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#34d399' }}>{selectedTx.amount} USDT</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Recipient:</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#60a5fa', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedTx.address}
                </Typography>
              </Box>
            </Paper>
          )}

          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
            {actionType === 'APPROVE'
              ? `Confirm payout of ${selectedTx?.amount} USDT to ${selectedTx?.address}?`
              : `Reject withdrawal of ${selectedTx?.amount} USDT? The amount will be refunded immediately back to user's Available Balance.`}
          </Typography>

          <TextField
            fullWidth
            label="Admin Remarks / Audit Note"
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button disabled={isSubmitting} onClick={() => { setSelectedTx(null); setActionType(null); }} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === 'APPROVE' ? 'success' : 'error'}
            onClick={handleConfirmAction}
            disabled={isSubmitting}
            sx={{ fontWeight: 800 }}
          >
            {isSubmitting
              ? 'Processing...'
              : actionType === 'APPROVE'
              ? 'Approve Payout'
              : 'Reject & Refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
