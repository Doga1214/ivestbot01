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
  TextField
} from '@mui/material';
import { CheckIcon, CancelIcon, HourglassBottomIcon } from '../common/Icons';
import type { WalletTransaction } from '../../services/walletService';
import { formatUSDT, formatDateTime } from '../../utils/formatters';

interface AdminWithdrawalQueueProps {
  withdrawals: WalletTransaction[];
  onApprove: (txId: string, remarks?: string) => void;
  onReject: (txId: string, remarks?: string) => void;
}

export const AdminWithdrawalQueue: React.FC<AdminWithdrawalQueueProps> = ({
  withdrawals,
  onApprove,
  onReject
}) => {
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');

  const handleOpenAction = (tx: WalletTransaction, type: 'APPROVE' | 'REJECT') => {
    setSelectedTx(tx);
    setActionType(type);
    setAdminRemarks(type === 'APPROVE' ? 'Withdrawal dispatched via blockchain batch.' : 'Withdrawal rejected: suspicious activity / security review.');
  };

  const handleConfirmAction = () => {
    if (!selectedTx || !actionType) return;
    if (actionType === 'APPROVE') {
      onApprove(selectedTx.id, adminRemarks);
    } else {
      onReject(selectedTx.id, adminRemarks);
    }
    setSelectedTx(null);
    setActionType(null);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Withdrawal Verification Queue
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Review pending user withdrawal requests and approve payout or reject & refund.
            </Typography>
          </Box>
          <Chip
            label={`${withdrawals.length} PENDING`}
            color={withdrawals.length > 0 ? 'warning' : 'default'}
            sx={{ fontWeight: 800 }}
          />
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
                  <TableCell>Destination Address</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.map((tx) => (
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
                        {tx.userName || 'Current Demo User'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {tx.userEmail || 'demo@ivestbot.com'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#f87171' }}>
                        -{formatUSDT(tx.amount)}
                      </Typography>
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
                ))}
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
          <Button onClick={() => { setSelectedTx(null); setActionType(null); }} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === 'APPROVE' ? 'success' : 'error'}
            onClick={handleConfirmAction}
            sx={{ fontWeight: 800 }}
          >
            {actionType === 'APPROVE' ? 'Approve Payout' : 'Reject & Refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
