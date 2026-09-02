import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
  Chip,
  Paper
} from '@mui/material';
import {
  ArrowUpwardIcon,
  AccountBalanceWalletIcon,
  OpenInNewIcon,
  DeleteOutlineIcon,
  BookmarkAddIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { formatUSDT } from '../../utils/formatters';
import { WALLET_CONFIG } from '../../config/walletConfig';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  networkId: string;
}

const SAVED_ADDRESSES_KEY = 'ivestbot_saved_withdrawal_addresses';

export const WithdrawalPanel: React.FC = () => {
  const { wallet, transactions, submitWithdrawal, cancelWithdrawal, showSnackbar } = useApp();

  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('TRC20');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('100');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [saveAddressLabel, setSaveAddressLabel] = useState<string>('');
  const [shouldSaveAddress, setShouldSaveAddress] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Load saved address book from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_ADDRESSES_KEY);
      if (stored) {
        setSavedAddresses(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveAddressBook = (list: SavedAddress[]) => {
    setSavedAddresses(list);
    localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(list));
  };

  const currentNetwork = useMemo(() => {
    return (
      WALLET_CONFIG.withdrawalNetworks.find(n => n.id === selectedNetworkId) ||
      WALLET_CONFIG.withdrawalNetworks[0]
    );
  }, [selectedNetworkId]);

  // Active pending withdrawals for this user
  const pendingWithdrawals = transactions.filter(
    t => t.type === 'WITHDRAWAL' && t.status === 'PENDING'
  );

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
  const minLimit = WALLET_CONFIG.minWithdrawalUSDT || 100;
  const networkFee = currentNetwork.fee;
  const netReceived = Math.max(0, numAmount - networkFee);

  // Address pattern validation
  const addressValidation = useMemo(() => {
    const trimmed = recipientAddress.trim();
    if (!trimmed) return { isValid: true, warning: null };

    const regex = new RegExp(currentNetwork.addressPattern);
    if (!regex.test(trimmed)) {
      return {
        isValid: false,
        warning: `Invalid format for ${currentNetwork.name}. ${currentNetwork.hint}`
      };
    }
    return { isValid: true, warning: null };
  }, [recipientAddress, currentNetwork]);

  const handleSelectSavedAddress = (saved: SavedAddress) => {
    setSelectedNetworkId(saved.networkId);
    setRecipientAddress(saved.address);
    showSnackbar(`Loaded saved address "${saved.label}"`, 'info');
  };

  const handleDeleteSavedAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAddresses.filter(a => a.id !== id);
    saveAddressBook(updated);
    showSnackbar('Address removed from address book', 'info');
  };

  const handleAddCurrentToAddressBook = () => {
    const trimmed = recipientAddress.trim();
    if (!trimmed) {
      showSnackbar('Please enter an address first', 'error');
      return;
    }
    if (!addressValidation.isValid) {
      showSnackbar('Cannot save invalid address format', 'error');
      return;
    }
    const label = saveAddressLabel.trim() || `${currentNetwork.id} Wallet`;
    const newEntry: SavedAddress = {
      id: `addr_${Date.now()}`,
      label,
      address: trimmed,
      networkId: selectedNetworkId
    };
    const updated = [newEntry, ...savedAddresses.filter(a => a.address !== trimmed)];
    saveAddressBook(updated);
    setSaveAddressLabel('');
    setShouldSaveAddress(false);
    showSnackbar(`Saved "${label}" to your address book!`, 'success');
  };

  const handleQuickPercent = (pct: number) => {
    if (wallet.availableBalance <= 0) {
      setWithdrawAmount('0');
      return;
    }
    const amt = Math.floor((wallet.availableBalance * pct) / 100);
    setWithdrawAmount(String(amt));
  };

  const handleQuickAmount = (amt: number) => {
    setWithdrawAmount(String(amt));
  };

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

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRestricted) {
      showSnackbar(restrictionMessage, 'error');
      return;
    }
    if (numAmount < minLimit) {
      showSnackbar(`Minimum withdrawal amount is ${minLimit} USDT`, 'error');
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
    if (!addressValidation.isValid) {
      showSnackbar(addressValidation.warning || 'Invalid address format', 'error');
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmWithdrawal = async () => {
    setLoading(true);
    try {
      // Submit withdrawal with network tag in description
      const fullAddressWithNetwork = `[${currentNetwork.id}] ${recipientAddress.trim()}`;
      await submitWithdrawal(numAmount, fullAddressWithNetwork);

      // Save to address book if opted
      if (shouldSaveAddress && saveAddressLabel.trim()) {
        handleAddCurrentToAddressBook();
      }

      setIsConfirmOpen(false);
      setRecipientAddress('');
      showSnackbar(`Withdrawal request of ${numAmount} USDT submitted successfully!`, 'success');
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
        <Card sx={{ mb: 3.5, border: '1px solid rgba(245, 158, 11, 0.35)', bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>⏳ Pending Withdrawal Requests</span>
                <Chip size="small" label={`${pendingWithdrawals.length} Active`} sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 800 }} />
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Est. Admin Review: ~15-30 Mins
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2.5, fontSize: '0.85rem' }}>
              Your funds are securely held in pending verification. You can cancel any pending request at any time to refund the entire amount back to your available balance immediately.
            </Typography>

            {pendingWithdrawals.map(tx => {
              const explorerUrl = tx.txHash
                ? currentNetwork.explorerTxUrl + tx.txHash
                : null;

              return (
                <Box
                  key={tx.id}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#f87171', fontSize: '1rem' }}>
                        {formatUSDT(tx.amount)}
                      </Typography>
                      <Chip
                        size="small"
                        label={tx.referenceId}
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.06)', color: '#9CA3AF', fontFamily: 'monospace', fontSize: '0.72rem' }}
                      />
                      <Chip
                        size="small"
                        label="Under Review"
                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      To: <span style={{ color: '#60a5fa' }}>{tx.address}</span>
                    </Typography>
                    {explorerUrl && (
                      <Box sx={{ mt: 0.5 }}>
                        <Button
                          size="small"
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                          sx={{ p: 0, fontSize: '0.75rem', textTransform: 'none', color: '#38bdf8' }}
                        >
                          View on Blockchain Explorer
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={cancellingId === tx.id}
                    onClick={() => handleCancel(tx.id)}
                    sx={{ fontWeight: 800, textTransform: 'none', px: 2, py: 0.8, borderRadius: 2, flexShrink: 0 }}
                  >
                    {cancellingId === tx.id ? 'Cancelling...' : 'Cancel & Instant Refund'}
                  </Button>
                </Box>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Main Withdrawal Submission Card */}
      <Card sx={{ borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.08)', background: 'linear-gradient(160deg, #111522 0%, #161c2d 100%)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          {/* Wallet Restriction Warning Banner */}
          {isRestricted && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <strong>Withdrawal Restricted:</strong> {restrictionMessage}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                Request USDT Cashout
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                Receive USDT directly to your verified personal crypto wallet.
              </Typography>
            </Box>

            <Chip
              label={`Min Cashout: ${minLimit} USDT`}
              sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontWeight: 800, fontSize: '0.75rem' }}
            />
          </Box>

          {/* Available for Withdrawal Balance Banner */}
          <Box
            sx={{
              p: 2,
              mb: 3.5,
              borderRadius: 2.5,
              bgcolor: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <AccountBalanceWalletIcon sx={{ color: '#34d399', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                  Available Balance for Cashout:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399', lineHeight: 1.1 }}>
                  {formatUSDT(wallet.availableBalance)}
                </Typography>
              </Box>
            </Box>

            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={() => handleQuickPercent(100)}
              sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
            >
              Withdraw All
            </Button>
          </Box>

          {/* Network Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.04em' }}>
              1. SELECT TRANSFER NETWORK (USDT)
            </Typography>
            <Grid container spacing={1.5}>
              {WALLET_CONFIG.withdrawalNetworks.map(net => {
                const isSelected = selectedNetworkId === net.id;
                return (
                  <Grid size={{ xs: 6, sm: 3 }} key={net.id}>
                    <Paper
                      onClick={() => setSelectedNetworkId(net.id)}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        borderRadius: 2.5,
                        textAlign: 'center',
                        bgcolor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: net.badgeColor }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? '#ffffff' : '#D1D5DB', fontSize: '0.85rem' }}>
                          {net.id}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.72rem' }}>
                        Fee: {net.fee} USDT
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Saved Address Book quick bar */}
          {savedAddresses.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1, letterSpacing: '0.04em' }}>
                SAVED ADDRESS BOOK
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {savedAddresses.map(saved => (
                  <Chip
                    key={saved.id}
                    label={`${saved.label} (${saved.networkId})`}
                    onClick={() => handleSelectSavedAddress(saved)}
                    onDelete={(e) => handleDeleteSavedAddress(saved.id, e)}
                    deleteIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#E2E8F0',
                      fontWeight: 700,
                      '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <form onSubmit={handleOpenConfirm}>
            <Grid container spacing={2.5}>
              {/* Recipient Address */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, display: 'block', mb: 0.8, letterSpacing: '0.04em' }}>
                  2. RECIPIENT {currentNetwork.name.toUpperCase()} ADDRESS
                </Typography>
                <TextField
                  fullWidth
                  placeholder={`Paste ${currentNetwork.name} address (${currentNetwork.hint})`}
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  error={!addressValidation.isValid && recipientAddress.trim().length > 0}
                  helperText={
                    !addressValidation.isValid && recipientAddress.trim().length > 0
                      ? addressValidation.warning
                      : currentNetwork.hint
                  }
                  required
                  slotProps={{
                    input: {
                      sx: { fontFamily: 'monospace', fontSize: '0.9rem' }
                    }
                  }}
                />

                {/* Save Address Option */}
                {recipientAddress.trim() && addressValidation.isValid && (
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                      size="small"
                      placeholder="Address Label (e.g. Binance, TrustWallet)"
                      value={saveAddressLabel}
                      onChange={(e) => setSaveAddressLabel(e.target.value)}
                      sx={{ maxWidth: 260 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<BookmarkAddIcon />}
                      onClick={handleAddCurrentToAddressBook}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Save to Address Book
                    </Button>
                  </Box>
                )}
              </Grid>

              {/* Withdrawal Amount & Presets */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: '0.04em' }}>
                    3. WITHDRAWAL AMOUNT (USDT)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Min: {minLimit} USDT | Max: 50,000 USDT
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      inputProps: { min: minLimit, step: 'any' }
                    }
                  }}
                />

                {/* Quick Selection Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label="Min (100₮)"
                    clickable
                    size="small"
                    onClick={() => handleQuickAmount(minLimit)}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', fontWeight: 800 }}
                  />
                  <Chip
                    label="200₮"
                    clickable
                    size="small"
                    onClick={() => handleQuickAmount(200)}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', fontWeight: 800 }}
                  />
                  <Chip
                    label="500₮"
                    clickable
                    size="small"
                    onClick={() => handleQuickAmount(500)}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', fontWeight: 800 }}
                  />
                  <Chip
                    label="1,000₮"
                    clickable
                    size="small"
                    onClick={() => handleQuickAmount(1000)}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', fontWeight: 800 }}
                  />
                  <Chip
                    label="25%"
                    clickable
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => handleQuickPercent(25)}
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    label="50%"
                    clickable
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => handleQuickPercent(50)}
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    label="75%"
                    clickable
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => handleQuickPercent(75)}
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    label="100% (MAX)"
                    clickable
                    size="small"
                    color="success"
                    onClick={() => handleQuickPercent(100)}
                    sx={{ fontWeight: 900 }}
                  />
                </Box>
              </Grid>

              {/* Real-time Fee & Net Payout Ledger Breakdown */}
              <Grid size={{ xs: 12 }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1.5, letterSpacing: '0.04em' }}>
                    FEE & CASHOUT SUMMARY
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Gross Withdrawal Amount:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                      {numAmount.toFixed(2)} USDT
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      {currentNetwork.name} Network Gas Fee:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#f87171' }}>
                      - {networkFee.toFixed(2)} USDT
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Platform Service Fee:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#34d399' }}>
                      0.00 USDT (0% Free)
                    </Typography>
                  </Box>

                  <Box sx={{ my: 1.5, borderBottom: '1px dashed rgba(255, 255, 255, 0.12)' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#ffffff' }}>
                      You Will Receive (Net Payout):
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>
                      {netReceived.toFixed(2)} USDT
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Submit Button */}
              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  startIcon={<ArrowUpwardIcon />}
                  disabled={wallet.availableBalance < minLimit || isRestricted || numAmount < minLimit}
                  sx={{
                    py: 1.5,
                    fontWeight: 900,
                    fontSize: '1rem',
                    borderRadius: 2.5,
                    background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)',
                    boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)'
                  }}
                >
                  Submit Cashout Request ({numAmount.toFixed(2)} USDT)
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* Confirmation Modal */}
          <Dialog
            open={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            maxWidth="xs"
            fullWidth
            slotProps={{ paper: { sx: { p: 1, backgroundColor: '#0d111d', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3.5 } } }}
          >
            <DialogTitle sx={{ fontWeight: 900, fontSize: '1.2rem', pb: 1 }}>Confirm USDT Cashout</DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                Please review your withdrawal details carefully before confirming.
              </Typography>

              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Network:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#60a5fa' }}>{currentNetwork.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Gross Amount:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#ffffff' }}>{numAmount.toFixed(2)} USDT</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Network Gas Fee:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#f87171' }}>-{networkFee.toFixed(2)} USDT</Typography>
                </Box>
                <Box sx={{ my: 1, borderBottom: '1px dashed rgba(255, 255, 255, 0.1)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399' }}>Net Recipient Amount:</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399' }}>{netReceived.toFixed(2)} USDT</Typography>
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5 }}>
                Destination Address:
              </Typography>
              <Alert severity="info" sx={{ mb: 2, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {recipientAddress}
              </Alert>

              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                🛡️ Note: The amount will be locked in Pending Balance until verified by admin. You can cancel and receive an instant refund anytime before approval.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={() => setIsConfirmOpen(false)} sx={{ color: '#9CA3AF', fontWeight: 700 }}>
                Back
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleConfirmWithdrawal}
                disabled={loading}
                sx={{
                  fontWeight: 900,
                  px: 3,
                  background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)'
                }}
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
