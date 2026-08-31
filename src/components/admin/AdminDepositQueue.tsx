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
  Tooltip,
  IconButton
} from '@mui/material';
import {
  CheckIcon,
  CancelIcon,
  ContentCopyIcon,
  PendingActionsIcon
} from '../common/Icons';
import type { WalletTransaction } from '../../services/walletService';
import { formatUSDT, formatDateTime } from '../../utils/formatters';
import { WALLET_CONFIG } from '../../config/walletConfig';

interface AdminDepositQueueProps {
  deposits: WalletTransaction[];
  onApprove: (txId: string, remarks?: string) => void;
  onReject: (txId: string, remarks?: string) => void;
  showSnackbar: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminDepositQueue: React.FC<AdminDepositQueueProps> = ({
  deposits,
  onApprove,
  onReject,
  showSnackbar
}) => {
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');

  const handleOpenAction = (tx: WalletTransaction, type: 'APPROVE' | 'REJECT') => {
    setSelectedTx(tx);
    setActionType(type);
    setAdminRemarks(type === 'APPROVE' ? 'Deposit verified on blockchain. Credited.' : 'Invalid transaction hash / receipt not matched.');
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`Copied ${label} to clipboard!`, 'success');
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
              Deposit Verification Queue
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Verify blockchain TxID / Receipts submitted by users and credit available balances.
            </Typography>
          </Box>
          <Chip
            label={`${deposits.length} PENDING`}
            color={deposits.length > 0 ? 'warning' : 'default'}
            sx={{ fontWeight: 800 }}
          />
        </Box>

        {deposits.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.1)'
            }}
          >
            <PendingActionsIcon sx={{ fontSize: 48, color: '#4B5563', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#9CA3AF' }}>
              No Pending Deposit Requests
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              When users submit USDT deposits, they will appear here for Admin verification.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.08)' } }}>
                  <TableCell>Reference ID / Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Bonus Preview</TableCell>
                  <TableCell>TxID / Hash</TableCell>
                  <TableCell>Deposit Address</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deposits.map((tx) => {
                  const units = Math.floor(Math.min(tx.amount, WALLET_CONFIG.depositBonusRatio.maxDeposit) / WALLET_CONFIG.depositBonusRatio.unitDeposit);
                  const bonus = units * WALLET_CONFIG.depositBonusRatio.newUserBonusPerUnit;

                  return (
                    <TableRow
                      key={tx.id}
                      hover
                      sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', py: 1.8 } }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa' }}>
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
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#34d399' }}>
                          {formatUSDT(tx.amount)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {bonus > 0 ? (
                          <Chip
                            label={`+${bonus} USDT Bonus`}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: '#6B7280' }}>
                            None (&lt;50 USDT)
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              maxWidth: 140,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: '#60a5fa'
                            }}
                          >
                            {tx.txHash || 'N/A'}
                          </Typography>
                          {tx.txHash && (
                            <Tooltip title="Copy TxID">
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(tx.txHash!, 'TxID')}
                                sx={{ color: '#9CA3AF', p: 0.3 }}
                              >
                                <ContentCopyIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            maxWidth: 120,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            color: '#9CA3AF'
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
                            sx={{ fontWeight: 800, textTransform: 'none', px: 1.5 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => handleOpenAction(tx, 'REJECT')}
                            sx={{ fontWeight: 700, textTransform: 'none', px: 1.5 }}
                          >
                            Reject
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

      {/* Confirmation Modal */}
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
          {actionType === 'APPROVE' ? 'Approve & Credit Deposit' : 'Reject Deposit Request'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
            {actionType === 'APPROVE'
              ? `Are you sure you want to verify this deposit of ${selectedTx?.amount} USDT? This will credit the user's available balance instantly.`
              : `Are you sure you want to reject deposit ${selectedTx?.referenceId}? Funds will not be credited.`}
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
            {actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
