import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider
} from '@mui/material';
import { AddCircleOutlineIcon, RemoveCircleOutlineIcon } from '../common/Icons';
import type { AdminUserListItem } from '../../services/adminService';
import { formatUSDT } from '../../utils/formatters';

interface AdminWalletAdjustModalProps {
  userItem: AdminUserListItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: string, type: 'CREDIT' | 'DEBIT', amount: number, reason: string) => void;
}

export const AdminWalletAdjustModal: React.FC<AdminWalletAdjustModalProps> = ({
  userItem,
  open,
  onClose,
  onConfirm
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amount, setAmount] = useState('50');
  const [reason, setReason] = useState('Manual Admin Balance Adjustment');

  if (!userItem) return null;

  const numAmount = parseFloat(amount) || 0;
  const currentAvailable = userItem.wallet.availableBalance;
  const simulatedNewAvailable =
    adjustmentType === 'CREDIT'
      ? Number((currentAvailable + numAmount).toFixed(4))
      : Math.max(0, Number((currentAvailable - numAmount).toFixed(4)));

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;
    onConfirm(userItem.profile.id, adjustmentType, numAmount, reason.trim() || 'Admin manual balance adjustment');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#111522',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)'
          }
        }
      }}
    >
      <form onSubmit={handleApply}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          WP Swings Wallet Adjustment — {userItem.profile.name}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2.5 }}>
            Directly credit or debit funds to this user's wallet with ledger audit remarks.
          </Typography>

          {/* User Current Balance Snapshot */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Current Available Balance:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#34d399' }}>
                {formatUSDT(currentAvailable)}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Resulting New Balance:
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: adjustmentType === 'CREDIT' ? '#34d399' : '#f87171'
                }}
              >
                {formatUSDT(simulatedNewAvailable)}
              </Typography>
            </Box>
          </Paper>

          {/* Action Type Radio */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, mb: 1, display: 'block' }}>
              Action Type:
            </Typography>
            <RadioGroup
              row
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as 'CREDIT' | 'DEBIT')}
            >
              <FormControlLabel
                value="CREDIT"
                control={<Radio color="success" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AddCircleOutlineIcon sx={{ color: '#34d399', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#34d399' }}>
                      Credit (Add Funds)
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="DEBIT"
                control={<Radio color="error" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <RemoveCircleOutlineIcon sx={{ color: '#f87171', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#f87171' }}>
                      Debit (Deduct Funds)
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Box>

          <TextField
            fullWidth
            label="Adjustment Amount (USDT)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            sx={{ mb: 2.5 }}
            slotProps={{ htmlInput: { min: '0.01', step: '0.01' } }}
          />

          <TextField
            fullWidth
            label="Audit Reason / Transaction Note"
            placeholder="e.g. Compensation Bonus, Manual Correction, Event Reward"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            multiline
            rows={2}
            helperText="This reason will appear in the user's ledger history."
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={adjustmentType === 'CREDIT' ? 'success' : 'error'}
            sx={{ fontWeight: 800, px: 3 }}
          >
            {adjustmentType === 'CREDIT' ? `Credit +${numAmount} USDT` : `Debit -${numAmount} USDT`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
