import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ShieldIcon,
  DownloadIcon,
  UploadFileIcon,
  HistoryIcon,
  CheckCircleOutlineIcon,
  SearchIcon,
  RefreshIcon,
  InfoOutlinedIcon
} from '../common/Icons';
import { walletService, type WalletSnapshot } from '../../services/walletService';
import { formatUSDT, formatDateTime } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const AdminBackupRestore: React.FC = () => {
  const { showSnackbar, refreshWallet } = useApp();
  const [snapshots, setSnapshots] = useState<WalletSnapshot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] = useState<WalletSnapshot | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadSnapshots = () => {
    const list = walletService.getSnapshots();
    setSnapshots(list);
  };

  useEffect(() => {
    loadSnapshots();

    const handleSnapshotCreated = () => {
      loadSnapshots();
    };
    window.addEventListener('ivestbot_snapshot_created', handleSnapshotCreated);
    return () => {
      window.removeEventListener('ivestbot_snapshot_created', handleSnapshotCreated);
    };
  }, []);

  const handleExportBackup = () => {
    try {
      setIsExporting(true);
      const jsonStr = walletService.exportFullSystemBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ivestbot_system_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      showSnackbar('💾 Full Platform Backup JSON exported successfully!', 'success');
    } catch {
      setIsExporting(false);
      showSnackbar('Failed to export system backup.', 'error');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = walletService.importSystemBackup(content);
      if (res.success) {
        loadSnapshots();
        refreshWallet();
        showSnackbar(res.message, 'success');
      } else {
        showSnackbar(res.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleOpenRollback = (snp: WalletSnapshot) => {
    setSelectedSnapshot(snp);
    setRollbackReason(`Restore to state prior to action: ${snp.actionType}`);
    setIsRollbackOpen(true);
  };

  const handleConfirmRollback = () => {
    if (!selectedSnapshot) return;
    if (!rollbackReason.trim()) {
      showSnackbar('Please provide a mandatory reason for balance rollback.', 'error');
      return;
    }

    try {
      walletService.restoreSnapshot(selectedSnapshot.id, rollbackReason);
      loadSnapshots();
      refreshWallet();
      setIsRollbackOpen(false);
      showSnackbar(`✅ Successfully restored user wallet to snapshot checkpoint!`, 'success');
    } catch (err: any) {
      showSnackbar(err.message || 'Rollback failed.', 'error');
    }
  };

  const filteredSnapshots = snapshots.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      (s.userName || '').toLowerCase().includes(q) ||
      (s.userEmail || '').toLowerCase().includes(q) ||
      (s.userId || '').toLowerCase().includes(q) ||
      (s.actionType || '').toLowerCase().includes(q) ||
      (s.reason || '').toLowerCase().includes(q) ||
      (s.integrityHash || '').toLowerCase().includes(q)
    );
  });

  return (
    <Box>
      {/* Overview KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: '#111522', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ShieldIcon sx={{ fontSize: 16 }} />
                  <span>AI Balance Protection</span>
                </Typography>
                <Chip label="100% INTEGRITY" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 800, fontSize: '0.68rem' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff' }}>
                Zero Balance Deletion
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Every balance delta requires an immutable cryptographic snapshot
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: '#111522', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HistoryIcon sx={{ fontSize: 16 }} />
                  <span>Active Snapshot Checkpoints</span>
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff' }}>
                {snapshots.length} Recorded Checkpoints
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Full rollback and forensic audit available
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: '#111522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700 }}>
                  Full Backup Hub
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleExportBackup}
                  disabled={isExporting}
                  startIcon={<DownloadIcon />}
                  sx={{
                    bgcolor: '#8b5cf6',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#7c3aed' }
                  }}
                >
                  Export JSON
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#e2e8f0',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2
                  }}
                >
                  Import JSON
                  <input type="file" accept=".json" hidden onChange={handleImportFile} />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snapshots Table Card */}
      <Card sx={{ bgcolor: '#111522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
                Immutable Wallet Snapshots & Audit Log
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Every single credit, debit, deposit approval, withdrawal settlement, or AI reward creates a checkpoint
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
              <TextField
                size="small"
                placeholder="Search user, action, hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  width: { xs: '100%', sm: 260 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 2.5,
                    color: '#fff',
                    fontSize: '0.85rem'
                  }
                }}
              />
              <IconButton onClick={loadSnapshots} size="small" sx={{ color: '#9CA3AF', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          {filteredSnapshots.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 44, color: '#34d399', mb: 1, opacity: 0.8 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
                No snapshots recorded yet
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Snapshots are automatically created when deposits, withdrawals, or admin balance adjustments occur.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.08)' } }}>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action Type</TableCell>
                    <TableCell>Before Balance</TableCell>
                    <TableCell>After Balance</TableCell>
                    <TableCell>Reason & Audit Hash</TableCell>
                    <TableCell align="right">Safety Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSnapshots.map((snp) => (
                    <TableRow key={snp.id} sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)' } }}>
                      <TableCell sx={{ color: '#9CA3AF', fontSize: '0.78rem' }}>
                        {formatDateTime(snp.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>
                          {snp.userName || 'User'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>
                          {(snp.userId || '').slice(0, 10)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={snp.actionType}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            bgcolor:
                              snp.actionType === 'ADMIN_CREDIT' || snp.actionType === 'DEPOSIT_APPROVED'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : snp.actionType === 'ADMIN_DEBIT' || snp.actionType === 'WITHDRAWAL_SUBMIT'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(139, 92, 246, 0.15)',
                            color:
                              snp.actionType === 'ADMIN_CREDIT' || snp.actionType === 'DEPOSIT_APPROVED'
                                ? '#34d399'
                                : snp.actionType === 'ADMIN_DEBIT' || snp.actionType === 'WITHDRAWAL_SUBMIT'
                                ? '#f87171'
                                : '#c084fc'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#9CA3AF', fontSize: '0.82rem' }}>
                        {formatUSDT(snp.beforeBalance.available)}
                      </TableCell>
                      <TableCell sx={{ color: '#34d399', fontWeight: 800, fontSize: '0.82rem' }}>
                        {formatUSDT(snp.afterBalance.available)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '0.78rem' }}>
                          {snp.reason}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280', fontFamily: 'monospace', fontSize: '0.68rem' }}>
                          {snp.integrityHash}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Restore user wallet back to this exact balance state">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenRollback(snp)}
                            sx={{
                              borderColor: 'rgba(139, 92, 246, 0.4)',
                              color: '#c084fc',
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: 2,
                              '&:hover': { borderColor: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)' }
                            }}
                          >
                            Rollback
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Rollback Confirmation Modal */}
      <Dialog
        open={isRollbackOpen}
        onClose={() => setIsRollbackOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              backgroundImage: 'none',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 3.5,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          🛡️ Confirm Wallet Balance Rollback
        </DialogTitle>
        <DialogContent>
          {selectedSnapshot && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                You are about to restore <strong>{selectedSnapshot.userName || 'the user'}</strong>'s balance back to the state recorded on <strong>{formatDateTime(selectedSnapshot.timestamp)}</strong>:
              </Typography>

              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Restored Available Balance:</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#34d399', fontWeight: 800 }}>{formatUSDT(selectedSnapshot.afterBalance.available)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Restored Total Net Balance:</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 800 }}>{formatUSDT(selectedSnapshot.afterBalance.total)}</Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Mandatory Reason for Rollback"
                placeholder="e.g. Correcting inadvertent manual adjustment or verifying transaction"
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 2.5,
                    color: '#fff'
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsRollbackOpen(false)} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRollback}
            sx={{
              bgcolor: '#8b5cf6',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { bgcolor: '#7c3aed' }
            }}
          >
            Confirm & Execute Rollback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
