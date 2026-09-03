import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  Chip,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  PersonOutlineIcon,
  AccountBalanceWalletIcon,
  TuneIcon,
  GroupsIcon,
  ReceiptLongIcon,
  ElectricBoltIcon,
  LockClockIcon,
  AddCircleOutlineIcon,
  RemoveCircleOutlineIcon,
  CheckCircleIcon,
  DeleteOutlineIcon
} from '../common/Icons';
import { adminService, type UserDetailed360 } from '../../services/adminService';
import type { WalletStatus, WalletRestrictions } from '../../services/walletService';
import { formatUSDT, formatDateTime } from '../../utils/formatters';

interface AdminUserDetailModalProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  showSnackbar: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({
  userId,
  open,
  onClose,
  onRefresh,
  showSnackbar
}) => {
  const [data, setData] = useState<UserDetailed360 | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Edit Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<number>(1);
  const [accountStatus, setAccountStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'BLOCKED'>('ACTIVE');
  const [kycStatus, setKycStatus] = useState<'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('NOT_SUBMITTED');

  // Wallet Adjust State
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('Admin Manual Adjustment');

  // Restrictions State
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('ACTIVE');
  const [canDeposit, setCanDeposit] = useState(true);
  const [canWithdraw, setCanWithdraw] = useState(true);
  const [canReserve, setCanReserve] = useState(true);
  const [canTrade, setCanTrade] = useState(true);
  const [restrictionReason, setRestrictionReason] = useState('');

  // Delete User State
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const detailed = await adminService.getUserDetailed360(userId);
      if (detailed) {
        setData(detailed);
        setName(detailed.profile.name);
        setEmail(detailed.profile.email);
        setLevel(detailed.profile.level || 1);
        setAccountStatus(detailed.profile.status);
        setKycStatus(detailed.profile.kycStatus);

        setWalletStatus(detailed.wallet.status || 'ACTIVE');
        setCanDeposit(detailed.wallet.restrictions?.canDeposit ?? true);
        setCanWithdraw(detailed.wallet.restrictions?.canWithdraw ?? true);
        setCanReserve(detailed.wallet.restrictions?.canReserve ?? true);
        setCanTrade(detailed.wallet.restrictions?.canTrade ?? true);
        setRestrictionReason(detailed.wallet.restrictionReason || '');
      }
    } catch (err) {
      console.error('[Error loading 360 data]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      loadData();
      setActiveTab(0);
    } else {
      setData(null);
    }
  }, [open, userId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    await adminService.updateUserProfile(data.profile.id, {
      name,
      email,
      level,
      status: accountStatus,
      kycStatus
    });
    showSnackbar('User profile details updated successfully!', 'success');
    await loadData();
    onRefresh();
  };

  const handleQuickAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    const amt = parseFloat(adjustAmount);
    if (!amt || amt <= 0) {
      showSnackbar('Please enter a valid amount', 'error');
      return;
    }

    if (adjustType === 'CREDIT') {
      adminService.creditUserWallet(data.profile.id, amt, adjustReason);
      showSnackbar(`Credited +${amt.toFixed(2)} USDT to ${data.profile.name}!`, 'success');
    } else {
      adminService.debitUserWallet(data.profile.id, amt, adjustReason);
      showSnackbar(`Debited -${amt.toFixed(2)} USDT from ${data.profile.name}!`, 'info');
    }
    setAdjustAmount('');
    await loadData();
    onRefresh();
  };

  const handleSaveRestrictions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    const restrictions: WalletRestrictions = {
      canDeposit,
      canWithdraw,
      canReserve,
      canTrade
    };
    adminService.updateUserWalletRestrictions(
      data.profile.id,
      walletStatus,
      restrictions,
      restrictionReason.trim() || undefined
    );
    showSnackbar('Wallet rules and restrictions updated!', 'success');
    await loadData();
    onRefresh();
  };

  const handleResetCooldown = async () => {
    adminService.resetUserMiningLock();
    showSnackbar('24-Hour Mining Cycle Lock reset! User can start AI mining cycle immediately.', 'success');
    await loadData();
    onRefresh();
  };

  const handleImpersonate = () => {
    if (!data) return;
    adminService.impersonateUser(data.profile.id);
    showSnackbar(`Switched active user to ${data.profile.name} (@${data.profile.username})!`, 'info');
    onClose();
  };

  const handlePermanentDelete = async () => {
    if (!data) return;
    setIsDeletingUser(true);
    try {
      await adminService.deleteUser(data.profile.id);
      showSnackbar(`User ${data.profile.name} permanently wiped from database and all systems.`, 'info');
      setIsConfirmDeleteOpen(false);
      onClose();
      onRefresh();
    } catch (err) {
      showSnackbar('Error deleting user: ' + String(err), 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#111522',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 3.5,
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)'
          }
        }
      }}
    >
      {loading || !data ? (
        <DialogContent sx={{ minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 5 }}>
          <CircularProgress color="secondary" sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#c4b5fd', fontWeight: 700 }}>
            Loading 360° User Intelligence Data...
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Synchronizing profile, multi-tier downlines, and ledger records from Supabase
          </Typography>
        </DialogContent>
      ) : (
        <>
          {/* Header Banner */}
          <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.4rem',
                fontWeight: 900
              }}
            >
              {data.profile.name.charAt(0)}
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {data.profile.name}
                </Typography>
                <Chip
                  label={`LVL ${data.profile.level || 1}`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                />
                <Chip
                  label={data.profile.status}
                  color={data.profile.status === 'ACTIVE' ? 'success' : data.profile.status === 'INACTIVE' ? 'warning' : 'error'}
                  size="small"
                  sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                @{data.profile.username} • {data.profile.email} • Ref: <strong>{data.profile.referralCode}</strong>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              startIcon={<ElectricBoltIcon />}
              onClick={handleImpersonate}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Login As User
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="warning"
              startIcon={<LockClockIcon />}
              onClick={handleResetCooldown}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Unlock 24h Lock
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Navigation Tabs */}
      <Box sx={{ px: 3, pt: 1, bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#9CA3AF',
              '&.Mui-selected': { color: '#a78bfa' }
            }
          }}
        >
          <Tab icon={<PersonOutlineIcon fontSize="small" />} iconPosition="start" label="Profile & Controls" />
          <Tab icon={<AccountBalanceWalletIcon fontSize="small" />} iconPosition="start" label="Financials 360°" />
          <Tab icon={<TuneIcon fontSize="small" />} iconPosition="start" label="WP Swings Rules" />
          <Tab icon={<GroupsIcon fontSize="small" />} iconPosition="start" label="Team Network" />
          <Tab icon={<ReceiptLongIcon fontSize="small" />} iconPosition="start" label="Ledger History" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, minHeight: 380 }}>
        {/* Tab 0: Profile & Account Controls */}
        {activeTab === 0 && (
          <form onSubmit={handleSaveProfile}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Edit Account Parameters & Status
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>VIP Level</InputLabel>
                  <Select
                    value={level}
                    label="VIP Level"
                    onChange={(e) => setLevel(Number(e.target.value))}
                  >
                    <MenuItem value={1}>Level 1 (Direct 10%, B 5%, C 2%)</MenuItem>
                    <MenuItem value={2}>Level 2 (VIP Silver)</MenuItem>
                    <MenuItem value={3}>Level 3 (VIP Gold)</MenuItem>
                    <MenuItem value={4}>Level 4 (VIP Platinum)</MenuItem>
                    <MenuItem value={5}>Level 5 (VIP Diamond)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Account Status</InputLabel>
                  <Select
                    value={accountStatus}
                    label="Account Status"
                    onChange={(e) => setAccountStatus(e.target.value as any)}
                  >
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                    <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
                    <MenuItem value="BLOCKED">BLOCKED / BANNED</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>KYC Status</InputLabel>
                  <Select
                    value={kycStatus}
                    label="KYC Status"
                    onChange={(e) => setKycStatus(e.target.value as any)}
                  >
                    <MenuItem value="NOT_SUBMITTED">NOT SUBMITTED</MenuItem>
                    <MenuItem value="PENDING">PENDING REVIEW</MenuItem>
                    <MenuItem value="VERIFIED">VERIFIED</MenuItem>
                    <MenuItem value="REJECTED">REJECTED</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                    Member Registered: <strong>{formatDateTime(data.profile.createdAt)}</strong> • User ID: <code style={{ color: '#a78bfa' }}>{data.profile.id}</code>
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, pt: 1 }}>
                <Button type="submit" variant="contained" color="primary" startIcon={<CheckCircleIcon />} sx={{ fontWeight: 800 }}>
                  Save Profile Changes
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    '&:hover': {
                      borderColor: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    }
                  }}
                >
                  Permanently Delete User Account
                </Button>
              </Grid>
            </Grid>
          </form>
        )}

        {/* Tab 1: Financials 360° & Quick Adjust */}
        {activeTab === 1 && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700 }}>Available Balance</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>{formatUSDT(data.wallet.availableBalance)}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 700 }}>Pending Balance</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#fbbf24' }}>{formatUSDT(data.wallet.pendingBalance)}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700 }}>Lifetime Deposits</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#60a5fa' }}>{formatUSDT(data.lifetimeDeposits)}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#c084fc', fontWeight: 700 }}>Lifetime Profits</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#c084fc' }}>{formatUSDT(data.lifetimeProfits)}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Quick Balance Adjustment Form */}
            <Paper sx={{ p: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                Direct Wallet Balance Adjustment (WP Swings Style)
              </Typography>
              <form onSubmit={handleQuickAdjust}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Action</InputLabel>
                      <Select
                        value={adjustType}
                        label="Action"
                        onChange={(e) => setAdjustType(e.target.value as any)}
                      >
                        <MenuItem value="CREDIT">Credit (+) Add</MenuItem>
                        <MenuItem value="DEBIT">Debit (-) Deduct</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Amount (USDT)"
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Transaction Reason"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      color={adjustType === 'CREDIT' ? 'success' : 'error'}
                      size="medium"
                      startIcon={adjustType === 'CREDIT' ? <AddCircleOutlineIcon /> : <RemoveCircleOutlineIcon />}
                      sx={{ fontWeight: 800, height: 40 }}
                    >
                      Apply
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Box>
        )}

        {/* Tab 2: WP Swings Wallet Rules */}
        {activeTab === 2 && (
          <form onSubmit={handleSaveRestrictions}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              WP Swings Wallet Restrictions & Lockouts
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2.5 }}>
              Block individual wallet actions or deactivate the entire wallet for compliance or investigation.
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Wallet Status</InputLabel>
                  <Select
                    value={walletStatus}
                    label="Wallet Status"
                    onChange={(e) => setWalletStatus(e.target.value as any)}
                  >
                    <MenuItem value="ACTIVE">ACTIVE (Normal Operations)</MenuItem>
                    <MenuItem value="RESTRICTED">RESTRICTED (Custom Switches)</MenuItem>
                    <MenuItem value="FROZEN">FROZEN (Locked / Investigation)</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE (Deactivated)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Display Reason to User"
                  value={restrictionReason}
                  onChange={(e) => setRestrictionReason(e.target.value)}
                  placeholder="e.g. KYC verification pending"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={canDeposit} onChange={(e) => setCanDeposit(e.target.checked)} color="success" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Allow Deposits (canDeposit)</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch checked={canWithdraw} onChange={(e) => setCanWithdraw(e.target.checked)} color="success" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Allow Withdrawals (canWithdraw)</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch checked={canReserve} onChange={(e) => setCanReserve(e.target.checked)} color="success" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Allow AI Mining & Daily Reservation (canReserve)</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch checked={canTrade} onChange={(e) => setCanTrade(e.target.checked)} color="success" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Allow Trading Terminal (canTrade)</Typography>}
                  />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 800 }}>
                  Save WP Swings Rules
                </Button>
              </Grid>
            </Grid>
          </form>
        )}

        {/* Tab 3: Team Network */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Referral Team & Network Tree
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
              Sponsor: <strong>{data.profile.referredBy || 'None (Direct Platform Register)'}</strong>
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2.5, bgcolor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 800 }}>LEVEL A (Direct 10%)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, my: 0.5 }}>{data.referralSummary.aMembersCount}</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Members Registered</Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2.5, bgcolor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 800 }}>LEVEL B (Indirect 5%)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, my: 0.5 }}>{data.referralSummary.bMembersCount}</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Members Registered</Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2.5, bgcolor: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>LEVEL C (Indirect 2%)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, my: 0.5 }}>{data.referralSummary.cMembersCount}</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Members Registered</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 4: Ledger History */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Individual User Transaction Ledger
            </Typography>

            {data.transactions.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>No transactions logged for this user yet.</Alert>
            ) : (
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700 } }}>
                      <TableCell>Ref ID / Time</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.transactions.map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#a78bfa' }}>{tx.referenceId}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: '#6B7280' }}>{formatDateTime(tx.createdAt)}</Typography>
                        </TableCell>
                        <TableCell><Chip label={tx.type} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} /></TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: tx.type === 'DEPOSIT' || tx.type === 'ADMIN_CREDIT' || tx.type === 'DAILY_PROFIT' ? '#34d399' : '#f87171' }}>
                            {formatUSDT(tx.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell><Chip label={tx.status} color="success" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} /></TableCell>
                        <TableCell><Typography variant="caption" sx={{ color: '#e2e8f0' }}>{tx.description}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} sx={{ color: '#9CA3AF', fontWeight: 700 }}>
          Close
        </Button>
      </DialogActions>
      </>
      )}

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={isConfirmDeleteOpen}
        onClose={() => !isDeletingUser && setIsConfirmDeleteOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#111528',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 3,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ color: '#ef4444', fontWeight: 800 }}>
          Permanently Delete User Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#9CA3AF' }}>
            Are you sure you want to permanently delete user{' '}
            <strong style={{ color: '#fff' }}>{data?.profile.name}</strong> (@{data?.profile.username})?
            <br /><br />
            This will completely and permanently purge all database records across Supabase:
            wallet balance (<strong>{data?.wallet.availableBalance.toFixed(2)} USDT</strong>), transactions, deposits, withdrawals, KYC documents, reservations, and database profile.
            <br /><br />
            <span style={{ color: '#f87171', fontWeight: 700 }}>⚠️ This user will NOT appear in Inactive or anywhere else. This action cannot be undone.</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setIsConfirmDeleteOpen(false)}
            disabled={isDeletingUser}
            sx={{ color: '#9CA3AF', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeletingUser}
            onClick={handlePermanentDelete}
            sx={{ fontWeight: 800 }}
          >
            {isDeletingUser ? <CircularProgress size={20} color="inherit" /> : 'Yes, Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};
