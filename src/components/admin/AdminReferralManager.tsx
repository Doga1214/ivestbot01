import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Tabs,
  Tab,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { referralService } from '../../services/referralService';
import { authService } from '../../services/authService';
import type { ReferralWithdrawalRequest, ReferralAdminConfig } from '../../types/referral';
import {
  MonetizationOnIcon,
  ShieldOutlinedIcon,
  TuneIcon,
  AccountTreeIcon,
  RefreshIcon,
  CloseIcon
} from '../common/Icons';

interface AdminReferralManagerProps {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const AdminReferralManager: React.FC<AdminReferralManagerProps> = ({ showSnackbar }) => {
  const [subTab, setSubTab] = useState<number>(0);
  const [tick, setTick] = useState<number>(0);
  const refresh = () => setTick(t => t + 1);

  // Data
  const withdrawals = useMemo(() => referralService.getWithdrawals(), [tick]);
  const fraudLogs = useMemo(() => referralService.getFraudLogs(), [tick]);
  const [config, setConfig] = useState<ReferralAdminConfig>(() => referralService.getAdminConfig());
  const allUsers = useMemo(() => authService.getAllUsers(), [tick]);

  // Dialog State for Approval
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [selectedReq, setSelectedReq] = useState<ReferralWithdrawalRequest | null>(null);
  const [txHashInput, setTxHashInput] = useState<string>('');
  const [remarksInput, setRemarksInput] = useState<string>('');

  // Downline Inspector Search
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener('ivestbot_referral_withdrawals_updated', handleUpdate);
    window.addEventListener('ivestbot_fraud_logs_updated', handleUpdate);
    return () => {
      window.removeEventListener('ivestbot_referral_withdrawals_updated', handleUpdate);
      window.removeEventListener('ivestbot_fraud_logs_updated', handleUpdate);
    };
  }, []);

  // Stats
  const totalPendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;
  const totalPendingSum = withdrawals
    .filter(w => w.status === 'PENDING')
    .reduce((sum, w) => sum + w.amountUSDT, 0);
  const totalApprovedSum = withdrawals
    .filter(w => w.status === 'APPROVED')
    .reduce((sum, w) => sum + w.amountUSDT, 0);
  const unhandledFraud = fraudLogs.filter(f => !f.resolved).length;

  // Actions
  const handleOpenApprove = (req: ReferralWithdrawalRequest) => {
    setSelectedReq(req);
    setTxHashInput(`0x${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`);
    setRemarksInput(`Transferred ${req.amountUSDT} USDT to ${req.network} address`);
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedReq) return;
    try {
      referralService.approveWithdrawal(selectedReq.id, txHashInput, remarksInput);
      showSnackbar(`Withdrawal request of ${selectedReq.amountUSDT} USDT approved!`, 'success');
      setApproveDialogOpen(false);
      setSelectedReq(null);
      refresh();
    } catch (err: any) {
      showSnackbar(err.message || 'Approval failed.', 'error');
    }
  };

  const handleReject = (req: ReferralWithdrawalRequest) => {
    if (window.confirm(`Are you sure you want to reject withdrawal request #${req.id.substring(0, 8)}? Amount will be refunded to user's reward balance.`)) {
      try {
        referralService.rejectWithdrawal(req.id, 'Rejected by Admin');
        showSnackbar(`Withdrawal request rejected. Funds returned to user.`, 'info');
        refresh();
      } catch (err: any) {
        showSnackbar(err.message || 'Rejection failed.', 'error');
      }
    }
  };

  const handleResolveFraud = (logId: string) => {
    referralService.resolveFraud(logId);
    showSnackbar('Fraud flag marked as resolved.', 'success');
    refresh();
  };

  const handleSaveConfig = () => {
    try {
      referralService.saveAdminConfig(config);
      showSnackbar('Referral reward & tier configuration saved successfully!', 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to save configuration.', 'error');
    }
  };

  // Selected User Downline for Inspector
  const inspectedSummary = useMemo(() => {
    if (!selectedUserId) return null;
    const targetUser = allUsers.find(u => u.id === selectedUserId);
    if (!targetUser) return null;
    return referralService.getReferralSummary(targetUser.referralCode);
  }, [selectedUserId, allUsers, tick]);

  return (
    <Box>
      {/* Top Metrics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700 }}>
              PENDING USDT WITHDRAWALS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: totalPendingWithdrawals > 0 ? '#fbbf24' : '#fff', mt: 0.5 }}>
              {totalPendingWithdrawals} (${totalPendingSum.toFixed(2)} USDT)
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700 }}>
              TOTAL PAYOUTS APPROVED
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#34d399', mt: 0.5 }}>
              ${totalApprovedSum.toFixed(2)} USDT
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700 }}>
              ACTIVE FRAUD FLAGS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: unhandledFraud > 0 ? '#f87171' : '#34d399', mt: 0.5 }}>
              {unhandledFraud} Flags
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700 }}>
              MIN WITHDRAWAL THRESHOLD
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#a78bfa', mt: 0.5 }}>
              {config.minWithdrawalUSDT} USDT
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Sub-Tabs Navigation */}
      <Paper
        sx={{
          mb: 3,
          backgroundColor: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 2.5
        }}
      >
        <Tabs
          value={subTab}
          onChange={(_e, val) => setSubTab(val)}
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
          <Tab
            icon={<MonetizationOnIcon />}
            iconPosition="start"
            label={`Withdrawal Queue (${totalPendingWithdrawals})`}
          />
          <Tab
            icon={<ShieldOutlinedIcon />}
            iconPosition="start"
            label={`Fraud & Security Logs (${unhandledFraud})`}
          />
          <Tab
            icon={<TuneIcon />}
            iconPosition="start"
            label="Reward & Tier Settings"
          />
          <Tab
            icon={<AccountTreeIcon />}
            iconPosition="start"
            label="User Downline Inspector"
          />
        </Tabs>
      </Paper>

      {/* ─── SUB-TAB 0: WITHDRAWAL QUEUE ───────────────────────── */}
      {subTab === 0 && (
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Referral USDT Withdrawal Requests ({withdrawals.length})
              </Typography>
              <Button size="small" startIcon={<RefreshIcon />} onClick={refresh} sx={{ color: '#9CA3AF' }}>
                Refresh Queue
              </Button>
            </Box>

            {withdrawals.length === 0 ? (
              <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: 2 }}>
                No referral withdrawal requests found.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Network</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Destination Address</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {withdrawals.map(w => (
                      <TableRow key={w.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            @{w.userName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                            {w.userEmail || w.userId.substring(0, 8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399' }}>
                            ${w.amountUSDT.toFixed(2)} USDT
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={w.network} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#e2e8f0' }}>
                            {w.walletAddress}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                          {new Date(w.requestedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={w.status}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              bgcolor: w.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : w.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: w.status === 'APPROVED' ? '#34d399' : w.status === 'REJECTED' ? '#f87171' : '#fbbf24'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {w.status === 'PENDING' ? (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleOpenApprove(w)}
                                sx={{ fontWeight: 800, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleReject(w)}
                                sx={{ fontWeight: 800, color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              >
                                Reject
                              </Button>
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                              {w.adminRemarks || 'Processed'}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── SUB-TAB 1: FRAUD & SECURITY LOGS ───────────────────── */}
      {subTab === 1 && (
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Referral Anti-Fraud & Risk Detection Logs
              </Typography>
              <Button size="small" startIcon={<RefreshIcon />} onClick={refresh} sx={{ color: '#9CA3AF' }}>
                Refresh
              </Button>
            </Box>

            {fraudLogs.length === 0 ? (
              <Alert severity="success" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: 2 }}>
                ✓ No suspicious fraud patterns detected. All referral links & registrations are compliant.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Timestamp</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Fraud Type</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Severity</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Details</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>IP Address</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }} align="right">Status / Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fraudLogs.map(f => (
                      <TableRow key={f.id} hover>
                        <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                          {new Date(f.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            @{f.userName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={f.fraudType} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={f.severity}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: f.severity === 'CRITICAL' ? '#ef4444' : f.severity === 'HIGH' ? '#f97316' : '#eab308',
                              color: '#fff'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#e2e8f0', fontSize: '0.85rem', maxWidth: 300 }}>
                          {f.details}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', color: '#9CA3AF' }}>
                          {f.ipAddress}
                        </TableCell>
                        <TableCell align="right">
                          {f.resolved ? (
                            <Chip label="RESOLVED" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 800 }} />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleResolveFraud(f.id)}
                              sx={{ fontWeight: 800, color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                            >
                              Resolve Flag
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── SUB-TAB 2: REWARD & TIER SETTINGS ───────────────────── */}
      {subTab === 2 && (
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Configure Referral Rates, Tiers & Rules
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
              Control the commission rates, VIP milestone unlock bonuses, and minimum withdrawal thresholds across the platform.
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* General Rules */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                    General Payout Rules
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                      MINIMUM WITHDRAWAL (USDT)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={config.minWithdrawalUSDT}
                      onChange={e => setConfig({ ...config, minWithdrawalUSDT: parseFloat(e.target.value) || 0 })}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                      BASE SIGNUP REWARD PER ACTIVE REFERRAL (USDT)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={config.baseRewardUSDT}
                      onChange={e => setConfig({ ...config, baseRewardUSDT: parseFloat(e.target.value) || 0 })}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                      MINIMUM ACCOUNT AGE (DAYS BEFORE WITHDRAWAL)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={config.minAccountAgeDays}
                      onChange={e => setConfig({ ...config, minAccountAgeDays: parseInt(e.target.value) || 0 })}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Multi-Level Commission Percentages */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                    Multi-Level Commission Percentages (%)
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#a78bfa', display: 'block', mb: 0.5 }}>
                      LEVEL A (DIRECT REFERRALS) COMMISSION %
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={config.commissionRates.A}
                      onChange={e => setConfig({
                        ...config,
                        commissionRates: { ...config.commissionRates, A: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#60a5fa', display: 'block', mb: 0.5 }}>
                      LEVEL B (2ND TIER INDIRECT) COMMISSION %
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={config.commissionRates.B}
                      onChange={e => setConfig({
                        ...config,
                        commissionRates: { ...config.commissionRates, B: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#34d399', display: 'block', mb: 0.5 }}>
                      LEVEL C (3RD TIER INDIRECT) COMMISSION %
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={config.commissionRates.C}
                      onChange={e => setConfig({
                        ...config,
                        commissionRates: { ...config.commissionRates, C: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Tier Milestone Bonuses */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
              VIP Tier Milestone Bonuses (USDT)
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Paper sx={{ p: 2, bgcolor: '#111522', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#CD7F32' }}>Tier 1 (Bronze) Milestone</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={config.tierRates.tier1Bonus}
                    onChange={e => setConfig({
                      ...config,
                      tierRates: { ...config.tierRates, tier1Bonus: parseFloat(e.target.value) || 0 }
                    })}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Paper sx={{ p: 2, bgcolor: '#111522', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#C0C0C0' }}>Tier 2 (Silver) Milestone</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={config.tierRates.tier2Bonus}
                    onChange={e => setConfig({
                      ...config,
                      tierRates: { ...config.tierRates, tier2Bonus: parseFloat(e.target.value) || 0 }
                    })}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Paper sx={{ p: 2, bgcolor: '#111522', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#FFD700' }}>Tier 3 (Gold) Milestone</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={config.tierRates.tier3Bonus}
                    onChange={e => setConfig({
                      ...config,
                      tierRates: { ...config.tierRates, tier3Bonus: parseFloat(e.target.value) || 0 }
                    })}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Paper sx={{ p: 2, bgcolor: '#111522', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#00E5FF' }}>Tier 4 (Diamond) Milestone</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={config.tierRates.tier4Bonus}
                    onChange={e => setConfig({
                      ...config,
                      tierRates: { ...config.tierRates, tier4Bonus: parseFloat(e.target.value) || 0 }
                    })}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              size="large"
              onClick={handleSaveConfig}
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                px: 4,
                py: 1.2
              }}
            >
              Save Configuration Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── SUB-TAB 3: USER DOWNLINE INSPECTOR ─────────────────── */}
      {subTab === 3 && (
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Inspect User Referral Downline & Tree
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
              Select any registered user to inspect their entire direct and indirect downline genealogy.
            </Typography>

            <Box sx={{ maxWidth: 400, mb: 3 }}>
              <TextField
                select
                fullWidth
                label="Select User Account"
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
              >
                {allUsers.map(u => (
                  <MenuItem key={u.id} value={u.id}>
                    @{u.username} ({u.name || 'User'}) — Ref: {u.referralCode}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {inspectedSummary && (
              <Box>
                <Paper sx={{ p: 2.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Direct Level A:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#a78bfa' }}>
                        {inspectedSummary.aMembersCount} Members
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Level B:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#60a5fa' }}>
                        {inspectedSummary.bMembersCount} Members
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Level C:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>
                        {inspectedSummary.cMembersCount} Members
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Total Commissions:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFD700' }}>
                        ${inspectedSummary.totalEarnings.toFixed(2)} USDT
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <TableContainer component={Paper} sx={{ bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Downline Member</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Level</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Joined Date</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Deposit Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inspectedSummary.referralRecords.map(r => (
                        <TableRow key={r.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              @{r.refereeUsername}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                              {r.refereeName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={`Level ${r.tierLevel}`} size="small" sx={{ fontWeight: 800 }} />
                          </TableCell>
                          <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={r.status}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                bgcolor: r.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: r.status === 'COMPLETED' ? '#34d399' : '#fbbf24'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: r.hasDeposited ? '#34d399' : '#9CA3AF' }}>
                              {r.depositAmountUSDT ? `$${r.depositAmountUSDT.toFixed(2)} USDT` : '$0.00'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── MODAL: APPROVE WITHDRAWAL ──────────────────────────── */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              backgroundImage: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 3.5,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Approve USDT Withdrawal
          </Typography>
          <IconButton onClick={() => setApproveDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedReq && (
            <Box>
              <Paper sx={{ p: 2, mb: 2.5, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>User:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>@{selectedReq.userName}</Typography>

                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 1 }}>Amount:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#34d399' }}>${selectedReq.amountUSDT} USDT</Typography>

                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 1 }}>Destination ({selectedReq.network}):</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#e2e8f0', wordBreak: 'break-all' }}>
                  {selectedReq.walletAddress}
                </Typography>
              </Paper>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                  TRANSACTION HASH / TXID (OPTIONAL)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={txHashInput}
                  onChange={e => setTxHashInput(e.target.value)}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                  ADMIN REMARKS
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={remarksInput}
                  onChange={e => setRemarksInput(e.target.value)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApproveDialogOpen(false)} sx={{ color: '#9CA3AF', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmApprove}
            sx={{ fontWeight: 800, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
          >
            Confirm & Complete Payout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
