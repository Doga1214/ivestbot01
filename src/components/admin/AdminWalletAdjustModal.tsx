import React, { useState, useEffect } from 'react';
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
  Divider,
  Chip,
  Tabs,
  Tab,
  Stack,
  Alert
} from '@mui/material';
import { AddCircleOutlineIcon, RemoveCircleOutlineIcon, AccountBalanceWalletIcon, AutoAwesomeIcon } from '../common/Icons';
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
  const [modeTab, setModeTab] = useState<0 | 1>(0); // 0 = Offset (+/-), 1 = Set Exact Balance
  const [adjustmentType, setAdjustmentType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amount, setAmount] = useState('50');
  const [targetExactBalance, setTargetExactBalance] = useState('');
  const [reason, setReason] = useState('Manual Admin Balance Adjustment');

  useEffect(() => {
    if (userItem) {
      setTargetExactBalance(userItem.wallet.availableBalance.toString());
    }
  }, [userItem]);

  if (!userItem) return null;

  const currentAvailable = userItem.wallet.availableBalance;
  const currentPending = userItem.wallet.pendingBalance || 0;

  // Calculation for Mode 0 (Offset)
  const numOffset = Math.max(0, parseFloat(amount) || 0);
  const simulatedOffsetBalance =
    adjustmentType === 'CREDIT'
      ? Number((currentAvailable + numOffset).toFixed(4))
      : Math.max(0, Number((currentAvailable - numOffset).toFixed(4)));

  // Calculation for Mode 1 (Exact Balance)
  const numExact = Math.max(0, parseFloat(targetExactBalance) || 0);
  const exactDiff = Number((numExact - currentAvailable).toFixed(4));
  const exactType: 'CREDIT' | 'DEBIT' = exactDiff >= 0 ? 'CREDIT' : 'DEBIT';
  const exactAmount = Math.abs(exactDiff);

  const resultingBalance = modeTab === 0 ? simulatedOffsetBalance : numExact;
  const effectiveType = modeTab === 0 ? adjustmentType : exactType;
  const effectiveAmount = modeTab === 0 ? numOffset : exactAmount;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount <= 0 && modeTab === 0) return;
    if (effectiveAmount === 0 && modeTab === 1 && numExact === currentAvailable) {
      onClose();
      return;
    }

    const finalReason = reason.trim() || (modeTab === 1 ? `Admin balance set directly to ${numExact} USDT` : 'Admin manual balance adjustment');
    onConfirm(userItem.profile.id, effectiveType, effectiveAmount, finalReason);
    onClose();
  };

  const handlePreset = (delta: number) => {
    if (modeTab === 0) {
      if (delta > 0) {
        setAdjustmentType('CREDIT');
        setAmount(delta.toString());
      } else {
        setAdjustmentType('DEBIT');
        setAmount(Math.abs(delta).toString());
      }
    } else {
      if (delta === 0) {
        setTargetExactBalance('0');
      } else {
        const nextVal = Math.max(0, currentAvailable + delta);
        setTargetExactBalance(nextVal.toString());
      }
    }
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
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.85)'
          }
        }
      }}
    >
      <form onSubmit={handleApply}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWalletIcon sx={{ color: '#8b5cf6' }} />
          Wallet Balance Control — {userItem.profile.name}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
            Real-time balance adjustment with immediate database persistence and live UI sync.
          </Typography>

          {/* User Current Balance Snapshot */}
          <Paper
            sx={{
              p: 2,
              mb: 2.5,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 2.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>
                Current Balance
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>
                {formatUSDT(currentAvailable)}
              </Typography>
              {currentPending > 0 && (
                <Typography variant="caption" sx={{ color: '#fbbf24', display: 'block' }}>
                  Pending: {formatUSDT(currentPending)}
                </Typography>
              )}
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>
                Resulting New Balance
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: resultingBalance > currentAvailable ? '#34d399' : resultingBalance < currentAvailable ? '#f87171' : '#e2e8f0'
                }}
              >
                {formatUSDT(resultingBalance)}
              </Typography>
              <Typography variant="caption" sx={{ color: effectiveType === 'CREDIT' ? '#34d399' : '#f87171', fontWeight: 700 }}>
                {effectiveType === 'CREDIT' ? `+${effectiveAmount.toFixed(2)} USDT` : `-${effectiveAmount.toFixed(2)} USDT`}
              </Typography>
            </Box>
          </Paper>

          {/* Mode Selector Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2.5 }}>
            <Tabs
              value={modeTab}
              onChange={(_, v) => setModeTab(v)}
              textColor="secondary"
              indicatorColor="secondary"
              variant="fullWidth"
            >
              <Tab label="Add / Deduct Amount (+/-)" sx={{ fontWeight: 700, textTransform: 'none' }} />
              <Tab label="Direct Set Exact Balance" sx={{ fontWeight: 700, textTransform: 'none' }} />
            </Tabs>
          </Box>

          {/* Quick Preset Buttons */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, mb: 1, display: 'block' }}>
              Quick Presets:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label="+10 USDT" onClick={() => handlePreset(10)} color="success" size="small" variant="outlined" clickable sx={{ fontWeight: 700 }} />
              <Chip label="+50 USDT" onClick={() => handlePreset(50)} color="success" size="small" variant="outlined" clickable sx={{ fontWeight: 700 }} />
              <Chip label="+100 USDT" onClick={() => handlePreset(100)} color="success" size="small" variant="outlined" clickable sx={{ fontWeight: 700 }} />
              <Chip label="+500 USDT" onClick={() => handlePreset(500)} color="success" size="small" variant="outlined" clickable sx={{ fontWeight: 700 }} />
              <Chip label="-10 USDT" onClick={() => handlePreset(-10)} color="error" size="small" variant="outlined" clickable sx={{ fontWeight: 700 }} />
              <Chip label="-50 USDT" onClick={() => handlePreset(-50)} color="error" size="small" variant="outlined" clickable sx={{ fontWeight: 700 }} />
              <Chip label="-100 USDT" onClick={() => handlePreset(-100)} color="error" size="small" variant="outlined" clickable sx={{ fontWeight: 700 }} />
              <Chip label="Set to 0" onClick={() => { setModeTab(1); setTargetExactBalance('0'); }} color="warning" size="small" variant="outlined" clickable sx={{ fontWeight: 700 }} />
            </Stack>
          </Box>

          {/* Mode 0: Add/Deduct Amount */}
          {modeTab === 0 && (
            <>
              <Box sx={{ mb: 2 }}>
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
                        <AddCircleOutlineIcon sx={{ color: '#34d399', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#34d399' }}>
                          Credit (Add)
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="DEBIT"
                    control={<Radio color="error" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RemoveCircleOutlineIcon sx={{ color: '#f87171', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#f87171' }}>
                          Debit (Deduct)
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
                sx={{ mb: 2 }}
                slotProps={{ htmlInput: { min: '0.01', step: '0.01' } }}
              />
            </>
          )}

          {/* Mode 1: Set Exact Balance */}
          {modeTab === 1 && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Exact New Balance (USDT)"
                type="number"
                value={targetExactBalance}
                onChange={(e) => setTargetExactBalance(e.target.value)}
                required
                helperText="Enter the exact final available balance for this user."
                slotProps={{ htmlInput: { min: '0', step: '0.01' } }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            label="Audit Reason / Transaction Note"
            placeholder="e.g. Deposit Compensation, Manual Correction, Promo Reward"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            multiline
            rows={2}
            helperText="This reason will be logged in the immutable global audit ledger."
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={effectiveType === 'CREDIT' ? 'success' : 'error'}
            sx={{ fontWeight: 800, px: 3 }}
          >
            {effectiveType === 'CREDIT' ? `Credit +${effectiveAmount.toFixed(2)} USDT` : `Debit -${effectiveAmount.toFixed(2)} USDT`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
