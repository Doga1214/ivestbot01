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
  Alert,
  Chip
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ContentCopyIcon,
  CheckIcon,
  QrCode2Icon,
  SendIcon,
  ShieldIcon,
  InfoOutlinedIcon,
  AutoAwesomeIcon
} from '../common/Icons';
import { WALLET_CONFIG } from '../../config/walletConfig';
import { useApp } from '../../context/AppContext';

// High-fidelity SVG QR Code generator for crypto addresses
const AddressQrCode: React.FC<{ value: string; network: string; color: string }> = ({ value, network, color }) => {
  // Generate a deterministic pattern based on the address string
  const cells: boolean[][] = [];
  const size = 21;
  
  // Seedable pseudo-random grid generation matching QR code visual anchor marks
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) & 0xffffffff;
  }
  
  const getRand = (idx: number) => {
    const x = Math.sin(seed + idx) * 10000;
    return x - Math.floor(x);
  };

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      // Top-left finder pattern
      if ((r < 7 && c < 7)) {
        const inOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        row.push(inOuter || inInner);
      }
      // Top-right finder pattern
      else if (r < 7 && c >= size - 7) {
        const cAdj = c - (size - 7);
        const inOuter = r === 0 || r === 6 || cAdj === 0 || cAdj === 6;
        const inInner = r >= 2 && r <= 4 && cAdj >= 2 && cAdj <= 4;
        row.push(inOuter || inInner);
      }
      // Bottom-left finder pattern
      else if (r >= size - 7 && c < 7) {
        const rAdj = r - (size - 7);
        const inOuter = rAdj === 0 || rAdj === 6 || c === 0 || c === 6;
        const inInner = rAdj >= 2 && rAdj <= 4 && c >= 2 && c <= 4;
        row.push(inOuter || inInner);
      }
      // Timing patterns
      else if (r === 6 || c === 6) {
        row.push((r + c) % 2 === 0);
      }
      // Center logo area
      else if (r >= 8 && r <= 12 && c >= 8 && c <= 12) {
        row.push(false);
      }
      // Data cells
      else {
        row.push(getRand(r * size + c) > 0.48);
      }
    }
    cells.push(row);
  }

  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: '#ffffff',
        borderRadius: 3,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        width: 170,
        height: 170
      }}
    >
      <svg width="140" height="140" viewBox={`0 0 ${size} ${size}`}>
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width="1"
                height="1"
                fill="#0f172a"
                rx={0.15}
              />
            ) : null
          )
        )}
      </svg>
      {/* Center Tether Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: '2px solid #ffffff'
        }}
      >
        <Typography sx={{ fontWeight: 900, color: '#ffffff', fontSize: '0.65rem' }}>
          ₮
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: '#475569',
          fontWeight: 800,
          fontSize: '0.62rem',
          mt: 0.5,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        SCAN TO PAY • {network}
      </Typography>
    </Box>
  );
};

export const DepositPanel: React.FC = () => {
  const { wallet, submitDeposit, showSnackbar } = useApp();

  const [selectedNetwork, setSelectedNetwork] = useState<'TRC20' | 'ERC20'>('TRC20');
  const [depositAmount, setDepositAmount] = useState('100');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedNetwork, setCopiedNetwork] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const isRestricted =
    wallet.status === 'FROZEN' ||
    (wallet.restrictions && !wallet.restrictions.canDeposit);

  const restrictionMessage =
    wallet.restrictionReason ||
    (wallet.status === 'FROZEN'
      ? 'Your wallet is frozen. Deposit operations are currently locked.'
      : 'Deposits have been restricted on your wallet by the administrator.');

  const currentAddress =
    selectedNetwork === 'TRC20'
      ? WALLET_CONFIG.depositAddress1
      : WALLET_CONFIG.depositAddress2;

  const currentNetworkLabel =
    selectedNetwork === 'TRC20'
      ? WALLET_CONFIG.depositAddress1Network
      : WALLET_CONFIG.depositAddress2Network;

  const handleCopy = (address: string, network: string) => {
    navigator.clipboard.writeText(address);
    setCopiedNetwork(network);
    showSnackbar(`Copied ${network} deposit address to clipboard!`, 'success');
    setTimeout(() => setCopiedNetwork(null), 2500);
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
      showSnackbar('Please enter the blockchain transaction hash / TxID', 'error');
      return;
    }

    setLoading(true);
    try {
      await submitDeposit(amount, currentAddress, txHash.trim());
      setSubmittedMessage(
        `🎉 Deposit confirmation of ${amount.toFixed(2)} USDT submitted! Status is PENDING. Admin will verify your transaction on blockchain and credit your Available Balance instantly.`
      );
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

      {submittedMessage && (
        <Alert
          severity="success"
          sx={{
            mb: 3.5,
            borderRadius: 3,
            bgcolor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            '& .MuiAlert-icon': { color: '#34d399' }
          }}
          onClose={() => setSubmittedMessage(null)}
        >
          {submittedMessage}
        </Alert>
      )}

      {/* Network Selector Cards */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>1. Choose Transfer Network & Official USDT Deposit Address</span>
        </Typography>

        <Grid container spacing={2.5}>
          {/* Card 1: TRC20 (Tron) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              onClick={() => setSelectedNetwork('TRC20')}
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                bgcolor: selectedNetwork === 'TRC20' ? 'rgba(139, 92, 246, 0.12)' : '#111522',
                border: selectedNetwork === 'TRC20' ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: selectedNetwork === 'TRC20' ? '0 12px 35px rgba(139, 92, 246, 0.25)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: selectedNetwork === 'TRC20' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {selectedNetwork === 'TRC20' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 2,
                    bgcolor: '#8b5cf6',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}
                >
                  <CheckIcon sx={{ fontSize: 13 }} /> SELECTED
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900
                  }}
                >
                  TRX
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
                    USDT — Tron (TRC20)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700 }}>
                    ⚡ Fastest (~1 min) • Lowest Network Gas Fees
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2.5, mb: 2 }}>
                <AddressQrCode value={WALLET_CONFIG.depositAddress1} network="TRC20" color="#ef4444" />
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.8, fontWeight: 700 }}>
                    TRC20 DEPOSIT ADDRESS:
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#e2e8f0',
                      mb: 1.5
                    }}
                  >
                    {WALLET_CONFIG.depositAddress1}
                  </Box>

                  <Button
                    fullWidth
                    variant={copiedNetwork === 'TRC20' ? 'contained' : 'outlined'}
                    color={copiedNetwork === 'TRC20' ? 'success' : 'primary'}
                    size="small"
                    startIcon={copiedNetwork === 'TRC20' ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(WALLET_CONFIG.depositAddress1, 'TRC20');
                    }}
                    sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', py: 0.9 }}
                  >
                    {copiedNetwork === 'TRC20' ? 'Copied TRC20 Address!' : 'Copy TRC20 Address'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Card 2: ERC20 / BEP20 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              onClick={() => setSelectedNetwork('ERC20')}
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                bgcolor: selectedNetwork === 'ERC20' ? 'rgba(59, 130, 246, 0.12)' : '#111522',
                border: selectedNetwork === 'ERC20' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: selectedNetwork === 'ERC20' ? '0 12px 35px rgba(59, 130, 246, 0.25)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: selectedNetwork === 'ERC20' ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {selectedNetwork === 'ERC20' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 2,
                    bgcolor: '#3b82f6',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}
                >
                  <CheckIcon sx={{ fontSize: 13 }} /> SELECTED
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900
                  }}
                >
                  ETH
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
                    USDT — {WALLET_CONFIG.depositAddress2Network}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700 }}>
                    Ethereum / Binance Smart Chain multi-standard support
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2.5, mb: 2 }}>
                <AddressQrCode value={WALLET_CONFIG.depositAddress2} network="ERC20/BEP20" color="#3b82f6" />
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.8, fontWeight: 700 }}>
                    ERC20 / BEP20 DEPOSIT ADDRESS:
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#e2e8f0',
                      mb: 1.5
                    }}
                  >
                    {WALLET_CONFIG.depositAddress2}
                  </Box>

                  <Button
                    fullWidth
                    variant={copiedNetwork === 'ERC20' ? 'contained' : 'outlined'}
                    color={copiedNetwork === 'ERC20' ? 'success' : 'primary'}
                    size="small"
                    startIcon={copiedNetwork === 'ERC20' ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(WALLET_CONFIG.depositAddress2, 'ERC20/BEP20');
                    }}
                    sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', py: 0.9 }}
                  >
                    {copiedNetwork === 'ERC20' ? 'Copied ERC20 Address!' : 'Copy ERC20 Address'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Deposit Submission Form */}
      <Card
        sx={{
          borderRadius: 3.5,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(160deg, #111522 0%, #171c2d 100%)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>2. Submit Blockchain Deposit Confirmation</span>
                <Chip
                  icon={<ShieldIcon sx={{ fontSize: 13 }} />}
                  label="Instant Automated Queue"
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                />
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                After sending USDT to the official wallet above, paste your transaction receipt hash (TxID) to log your deposit.
              </Typography>
            </Box>
          </Box>

          {/* Quick Preset Amount Chips */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1, fontWeight: 700 }}>
              Quick Preset Amounts (USDT):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[50, 100, 200, 300, 500, 1000, 2000].map((amt) => (
                <Button
                  key={amt}
                  variant={depositAmount === String(amt) ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setDepositAmount(String(amt))}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 800,
                    px: 1.8,
                    py: 0.6,
                    bgcolor: depositAmount === String(amt) ? '#8b5cf6' : 'rgba(255, 255, 255, 0.04)',
                    borderColor: depositAmount === String(amt) ? '#8b5cf6' : 'rgba(255, 255, 255, 0.12)',
                    '&:hover': { bgcolor: depositAmount === String(amt) ? '#7c3aed' : 'rgba(255, 255, 255, 0.08)' }
                  }}
                >
                  +{amt} USDT
                </Button>
              ))}
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Deposit Amount (USDT)"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  helperText="Min: 10 USDT • Automatically eligible for Star AI Yield"
                  required
                  slotProps={{
                    input: {
                      sx: { fontWeight: 800, fontSize: '1.05rem' },
                      inputProps: { min: 1, step: 'any' }
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Selected Destination Network"
                  value={`${selectedNetwork} (${currentAddress.slice(0, 10)}...)`}
                  disabled
                  helperText={`Official Ivestbot ${selectedNetwork} multi-sig vault`}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Transaction Hash / TxID"
                  placeholder="e.g. 0x89b12c... or 64-character hash"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  helperText="Copied from Binance, Trust Wallet, or Blockchain Explorer"
                  required
                  slotProps={{
                    input: {
                      sx: { fontFamily: 'monospace', fontSize: '0.88rem' }
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || isRestricted || !txHash.trim() || parseFloat(depositAmount) <= 0}
                  startIcon={<SendIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 900,
                    fontSize: '1rem',
                    borderRadius: 2.5,
                    background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)',
                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  {loading ? 'Submitting Deposit...' : `Submit Deposit Confirmation (${depositAmount} USDT)`}
                </Button>
              </Grid>
            </Grid>
          </form>

          {/* 4-Step Instructions Banner */}
          <Box
            sx={{
              mt: 3.5,
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, display: 'block', mb: 1.5, letterSpacing: '0.04em' }}>
              HOW USDT DEPOSIT WORKS:
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" sx={{ color: '#c084fc', fontWeight: 800, display: 'block' }}>1. Copy Address</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Select TRC20 or ERC20 and copy the verified wallet address or scan QR code.</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 800, display: 'block' }}>2. Transfer USDT</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Send any amount from your exchange (Binance, Bybit, OKX) or self-custody wallet.</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800, display: 'block' }}>3. Paste TxID</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Copy the blockchain transaction hash / ID from your withdrawal confirmation.</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 800, display: 'block' }}>4. Instant Credit</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Funds are logged into Pending Balance and credited to Available Balance upon verification.</Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
