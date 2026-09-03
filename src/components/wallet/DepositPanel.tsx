import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  IconButton,
  Tooltip,
  MenuItem,
  Alert,
  Chip
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ContentCopyIcon,
  QrCode2Icon,
  SendIcon,
  CardGiftcardIcon
} from '../common/Icons';
import { WALLET_CONFIG } from '../../config/walletConfig';
import { useApp } from '../../context/AppContext';

export const DepositPanel: React.FC = () => {
  const { wallet, submitDeposit, showSnackbar } = useApp();

  const [depositAmount, setDepositAmount] = useState('100');
  const [selectedAddress, setSelectedAddress] = useState(WALLET_CONFIG.depositAddress1);
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const isRestricted =
    wallet.status === 'FROZEN' ||
    (wallet.restrictions && !wallet.restrictions.canDeposit);

  const restrictionMessage =
    wallet.restrictionReason ||
    (wallet.status === 'FROZEN'
      ? 'Your wallet is frozen. Deposit operations are currently locked.'
      : 'Deposits have been restricted on your wallet by the administrator.');

  const numAmount = parseFloat(depositAmount) || 0;
  const units = Math.floor(Math.min(numAmount, WALLET_CONFIG.depositBonusRatio.maxDeposit) / WALLET_CONFIG.depositBonusRatio.unitDeposit);
  const estimatedUserBonus = units * WALLET_CONFIG.depositBonusRatio.newUserBonusPerUnit;
  const estimatedSponsorBonus = units * WALLET_CONFIG.depositBonusRatio.sponsorBonusPerUnit;

  const handleCopy = (address: string, network: string) => {
    navigator.clipboard.writeText(address);
    showSnackbar(`Copied ${network} deposit address to clipboard!`, 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) {
      showSnackbar(restrictionMessage, 'error');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      showSnackbar('Please enter a valid deposit amount', 'error');
      return;
    }
    if (!txHash.trim()) {
      showSnackbar('Please enter the transaction hash / receipt ID', 'error');
      return;
    }

    setLoading(true);
    try {
      await submitDeposit(amount, selectedAddress, txHash);
      setSubmittedMessage(`Deposit confirmation submitted! Status is PENDING. Admin will verify and credit ${amount} USDT to your available balance.`);
      setTxHash('');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to submit deposit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Wallet Restriction Warning Banner */}
      {isRestricted && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>Deposit Feature Restricted:</strong> {restrictionMessage}
        </Alert>
      )}

      {/* Deposit Milestone Reward Banner */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>
            <CardGiftcardIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Deposit Milestone Referral Reward (50 USDT – 1,000 USDT)
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Every 50 USDT deposited awards <strong>+5 USDT</strong> direct referral reward credited to your sponsor's active balance!
            </Typography>
          </Box>
        </Box>

        {numAmount >= 50 && estimatedSponsorBonus > 0 && (
          <Chip
            label={`Sponsor Referral Reward: +${estimatedSponsorBonus} USDT`}
            color="primary"
            sx={{ fontWeight: 800, flexShrink: 0 }}
          />
        )}
      </Paper>

      {/* Configured Deposit Addresses */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Official Deposit Addresses (USDT)
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Address 1 - TRC20 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: '#111522',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode2Icon sx={{ color: '#8b5cf6' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  USDT — {WALLET_CONFIG.depositAddress1Network}
                </Typography>
              </Box>
              <Tooltip title="Copy Address">
                <IconButton
                  size="small"
                  onClick={() => handleCopy(WALLET_CONFIG.depositAddress1, 'TRC20')}
                  sx={{ color: '#a78bfa', bgcolor: 'rgba(139, 92, 246, 0.1)' }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#e2e8f0'
              }}
            >
              {WALLET_CONFIG.depositAddress1}
            </Box>
          </Paper>
        </Grid>

        {/* Address 2 - ERC20/BEP20 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: '#111522',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode2Icon sx={{ color: '#3b82f6' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  USDT — {WALLET_CONFIG.depositAddress2Network}
                </Typography>
              </Box>
              <Tooltip title="Copy Address">
                <IconButton
                  size="small"
                  onClick={() => handleCopy(WALLET_CONFIG.depositAddress2, 'ERC20/BEP20')}
                  sx={{ color: '#60a5fa', bgcolor: 'rgba(59, 130, 246, 0.1)' }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#e2e8f0'
              }}
            >
              {WALLET_CONFIG.depositAddress2}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Deposit Submission Form */}
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Submit Deposit Confirmation
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
            After transferring USDT to either address above, submit your transfer details below for instant credit.
          </Typography>

          {submittedMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {submittedMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Deposit Amount (USDT)"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  helperText={
                    numAmount >= 50
                      ? `Qualifies for +${estimatedUserBonus} USDT Welcome Bonus & +${estimatedSponsorBonus} USDT Sponsor Bonus`
                      : 'Min 50 USDT for referral milestone bonuses'
                  }
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Payment Destination Network"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                >
                  <MenuItem value={WALLET_CONFIG.depositAddress1}>
                    TRC20 ({WALLET_CONFIG.depositAddress1.slice(0, 8)}...)
                  </MenuItem>
                  <MenuItem value={WALLET_CONFIG.depositAddress2}>
                    ERC20/BEP20 ({WALLET_CONFIG.depositAddress2.slice(0, 8)}...)
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Transaction Hash / TxID"
                  placeholder="e.g. 0x89b12c..."
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={<SendIcon />}
                  sx={{ px: 4, py: 1.2, fontWeight: 700 }}
                >
                  {loading ? 'Processing...' : 'Submit Deposit Confirmation'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
