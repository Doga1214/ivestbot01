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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  Alert
} from '@mui/material';
import type { AdminUserListItem } from '../../services/adminService';
import type { WalletStatus, WalletRestrictions } from '../../services/walletService';

interface AdminWalletRestrictionsModalProps {
  userItem: AdminUserListItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (
    userId: string,
    status: WalletStatus,
    restrictions: WalletRestrictions,
    reason?: string
  ) => void;
}

export const AdminWalletRestrictionsModal: React.FC<AdminWalletRestrictionsModalProps> = ({
  userItem,
  open,
  onClose,
  onConfirm
}) => {
  const [status, setStatus] = useState<WalletStatus>('ACTIVE');
  const [canDeposit, setCanDeposit] = useState(true);
  const [canWithdraw, setCanWithdraw] = useState(true);
  const [canReserve, setCanReserve] = useState(true);
  const [canTrade, setCanTrade] = useState(true);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (userItem) {
      setStatus(userItem.wallet.status || 'ACTIVE');
      setCanDeposit(userItem.wallet.restrictions?.canDeposit ?? true);
      setCanWithdraw(userItem.wallet.restrictions?.canWithdraw ?? true);
      setCanReserve(userItem.wallet.restrictions?.canReserve ?? true);
      setCanTrade(userItem.wallet.restrictions?.canTrade ?? true);
      setReason(userItem.wallet.restrictionReason || '');
    }
  }, [userItem]);

  if (!userItem) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      userItem.profile.id,
      status,
      { canDeposit, canWithdraw, canReserve, canTrade },
      reason.trim() || undefined
    );
    onClose();
  };

  const getStatusAlert = () => {
    if (status === 'INACTIVE') {
      return (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          <strong>Wallet Inactive:</strong> User will be blocked from depositing, withdrawing, or executing AI mining.
        </Alert>
      );
    }
    if (status === 'FROZEN') {
      return (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          <strong>Wallet Frozen:</strong> Funds are locked. User cannot withdraw or trade until thawed.
        </Alert>
      );
    }
    if (status === 'RESTRICTED') {
      return (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          <strong>Custom Restrictions:</strong> Selective switches below will take effect for this user.
        </Alert>
      );
    }
    return null;
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
      <form onSubmit={handleSave}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          WP Swings Wallet Restrictions — {userItem.profile.name}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2.5 }}>
            Configure granular restrictions, wallet status (Inactive / Frozen), and lockouts.
          </Typography>

          {getStatusAlert()}

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Overall Wallet Status</InputLabel>
            <Select
              value={status}
              label="Overall Wallet Status"
              onChange={(e) => setStatus(e.target.value as WalletStatus)}
            >
              <MenuItem value="ACTIVE">ACTIVE (Normal Operations)</MenuItem>
              <MenuItem value="RESTRICTED">RESTRICTED (Custom Feature Toggles)</MenuItem>
              <MenuItem value="FROZEN">FROZEN (Locked / Under Investigation)</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE (Deactivated Wallet)</MenuItem>
            </Select>
          </FormControl>

          {/* Granular Feature Permissions */}
          <Paper
            sx={{
              p: 2.5,
              mb: 3,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#e2e8f0' }}>
              Granular Feature Permissions
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={canDeposit}
                    onChange={(e) => setCanDeposit(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Allow USDT Deposits
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      If disabled, user cannot submit new deposit verifications.
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={canWithdraw}
                    onChange={(e) => setCanWithdraw(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Allow USDT Withdrawals
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      If disabled, user cannot request balance cashouts.
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={canReserve}
                    onChange={(e) => setCanReserve(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Allow AI Mining & Daily Reservations
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      If disabled, user cannot start daily Star AI cycle.
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={canTrade}
                    onChange={(e) => setCanTrade(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Allow Trading Simulator
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      If disabled, trading terminal is locked.
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Paper>

          <TextField
            fullWidth
            label="Admin Reason / Display Note to User"
            placeholder="e.g. Account undergoing compliance review. Please contact support."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            helperText="This reason is displayed when a user attempts a restricted action."
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 800, px: 3 }}>
            Save Wallet Rules
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
