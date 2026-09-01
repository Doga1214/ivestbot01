import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  ArrowUpwardIcon,
  AccountBalanceWalletIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { formatUSDT } from '../../utils/formatters';

export const WithdrawalPanel: React.FC = () => {
  const { wallet, transactions, submitWithdrawal, cancelWithdrawal, showSnackbar } = useApp();

  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active pending withdrawals for this user
  const pendingWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING');

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (txId: string) => {
    setCancellingId(txId);
    try {
      await cancelWithdrawal(txId);
    } catch {
      // handled
    } finally {
      setCancellingId(null);
    }
  };

  const isRestricted =
    wallet.status === 'INACTIVE' ||
    wallet.status === 'FROZEN' ||
    (wallet.restrictions && !wallet.restrictions.canWithdraw);

  const restrictionMessage =
    wallet.restrictionReason ||
    (wallet.status === 'INACTIVE'
      ? 'Your wallet is inactive. Cashout operations are currently disabled.'
      : wallet.status === 'FROZEN'
      ? 'Your wallet is frozen. Withdrawals are temporarily locked.'
      : 'Withdrawals have been restricted on your account by the administrator.');

  const numAmount = parseFloat(withdrawAmount) || 0;

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) {
      showSnackbar(restrictionMessage, 'error');
      return;
    }
    if (numAmount <= 0) {
      showSnackbar('Please enter a valid withdrawal amount', 'error');
      return;
    }
    if (numAmount > wallet.availableBalance) {
      showSnackbar(`Insufficient available balance (${wallet.availableBalance.toFixed(2)} USDT)`, 'error');
      return;
    }
    if (!recipientAddress.trim()) {
      showSnackbar('Please enter your receiving USDT wallet address', 'error');
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmWithdrawal = async () => {
    setLoading(true);
    try {
      await submitWithdrawal(numAmount, recipientAddress);
      setIsConfirmOpen(false);
      setRecipientAddress('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed';
      showSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Pending Withdrawals Active Card with Cancel Option */}
      {pendingWithdrawals.length > 0 && (
        <Card sx={{ mb: 3.5, border: '1px solid rgba(245, 158, 11, 0.3)', bgcolor: 'rgba(245, 158, 11, 0.05)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fbbf24', mb: 1.5 }}>
              ⏳ Pending Withdrawal Requests ({pendingWithdrawals.length})
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
              These requests are currently under review by Admin. You can cancel any pending request to refund the amount back to your available balance immediately.
            </Typography>

            {pendingWithdrawals.map(tx => (
              <Box
                key={tx.id}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1.5
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f87171' }}>
                    {formatUSDT(tx.amount)} — {tx.referenceId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', wordBreak: 'break-all' }}>
                    To: <code style={{ color: '#60a5fa' }}>{tx.address}</code>
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={cancellingId === tx.id}
                  onClick={() => handleCancel(tx.id)}
                  sx={{ fontWeight: 800, textTransform: 'none', flexShrink: 0 }}
                >
                  {cancellingId === tx.id ? 'Cancelling...' : 'Cancel Request & Refund'}
                </Button>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Withdrawal Submission Card */}
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          {/* Wallet Restriction Warning Banner */}
          {isRestricted && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <strong>Withdrawal Restricted:</strong> {restrictionMessage}
            </Alert>
          )}

          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Request USDT Withdrawal
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
            Submit withdrawal to receive USDT to your personal external wallet address.
          </Typography>

          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              bgcolor: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWalletIcon sx={{ color: '#34d399' }} />
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Available for Withdrawal:</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#34d399' }}>
              {formatUSDT(wallet.availableBalance)}
            </Typography>
          </Box>

          <form onSubmit={handleOpenConfirm}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Withdrawal Amount (USDT)"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Recipient Wallet Address (TRC20 / ERC20)"
                  placeholder="e.g. 0x... or T..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<ArrowUpwardIcon />}
                  disabled={wallet.availableBalance <= 0 || isRestricted}
                  sx={{ px: 4, py: 1.2, fontWeight: 700 }}
                >
                  Submit Withdrawal Request
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* Confirmation Modal */}
          <Dialog
            open={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            slotProps={{ paper: { sx: { p: 1, backgroundColor: '#111522', border: '1px solid rgba(255,255,255,0.1)' } } }}
          >
            <DialogTitle sx={{ fontWeight: 800 }}>Confirm Withdrawal Request</DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                Are you sure you want to withdraw <strong>{numAmount} USDT</strong> to the address below?
              </Typography>

              <Alert severity="info" sx={{ mb: 2, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {recipientAddress}
              </Alert>

              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Note: The amount will be locked in Pending Balance until approved. You can cancel it anytime before approval.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setIsConfirmOpen(false)} sx={{ color: '#9CA3AF' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleConfirmWithdrawal}
                disabled={loading}
                sx={{ fontWeight: 700 }}
              >
                {loading ? 'Processing...' : 'Confirm & Submit'}
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};
