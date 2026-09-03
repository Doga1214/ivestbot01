import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  VerifiedUserIcon,
  CheckIcon,
  CancelIcon,
  SearchIcon,
  RefreshIcon,
  ContentCopyIcon,
  DescriptionIcon,
  PendingActionsIcon
} from '../common/Icons';
import type { KycSubmission } from '../../services/walletService';
import type { AdminUserListItem } from '../../services/adminService';
import { formatDateTime } from '../../utils/formatters';

interface AdminKycQueueProps {
  users: AdminUserListItem[];
  currentKyc?: KycSubmission;
  onVerify: (userId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
  showSnackbar?: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminKycQueue: React.FC<AdminKycQueueProps> = ({
  users,
  onVerify,
  onRefresh,
  showSnackbar
}) => {
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [actionType, setActionType] = useState<'VERIFIED' | 'REJECTED' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Users who have submitted KYC or have KYC status
  const allKycUsers = useMemo(() => {
    return users.filter(u => {
      const status = u.kycSubmission?.status || u.profile.kycStatus;
      return status && status !== 'NOT_SUBMITTED';
    });
  }, [users]);

  // Counts for filters
  const pendingCount = useMemo(() => {
    return allKycUsers.filter(u => (u.kycSubmission?.status || u.profile.kycStatus) === 'PENDING').length;
  }, [allKycUsers]);

  const verifiedCount = useMemo(() => {
    return allKycUsers.filter(u => (u.kycSubmission?.status || u.profile.kycStatus) === 'VERIFIED').length;
  }, [allKycUsers]);

  const rejectedCount = useMemo(() => {
    return allKycUsers.filter(u => (u.kycSubmission?.status || u.profile.kycStatus) === 'REJECTED').length;
  }, [allKycUsers]);

  // Filtered and searched list
  const filteredUsers = useMemo(() => {
    return allKycUsers.filter(u => {
      const status = u.kycSubmission?.status || u.profile.kycStatus || 'PENDING';
      if (filterStatus !== 'ALL' && status !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (u.kycSubmission?.fullName || u.profile.name || '').toLowerCase();
        const email = (u.profile.email || '').toLowerCase();
        const username = (u.profile.username || '').toLowerCase();
        const docNum = (u.kycSubmission?.documentNumber || '').toLowerCase();
        return name.includes(q) || email.includes(q) || username.includes(q) || docNum.includes(q);
      }
      return true;
    });
  }, [allKycUsers, filterStatus, searchQuery]);

  const handleOpenAction = (user: AdminUserListItem, status: 'VERIFIED' | 'REJECTED') => {
    setSelectedUser(user);
    setActionType(status);
    setAdminNotes(
      status === 'VERIFIED'
        ? 'Identity document verified and approved by Compliance Officer.'
        : 'Document unreadable, blurred, or details did not match.'
    );
  };

  const handleConfirm = async () => {
    if (!selectedUser || !actionType || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onVerify(selectedUser.profile.id, actionType, adminNotes);
      if (showSnackbar) {
        showSnackbar(`KYC for ${selectedUser.profile.name} marked as ${actionType}!`, 'success');
      }
      setSelectedUser(null);
      setActionType(null);
    } catch {
      if (showSnackbar) {
        showSnackbar('Failed to update KYC status. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        if (showSnackbar) {
          showSnackbar('KYC queue refreshed from database.', 'info');
        }
      } finally {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (showSnackbar) {
      showSnackbar(`${label} copied to clipboard!`, 'info');
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: '#111522',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Title & Actions */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <VerifiedUserIcon sx={{ color: '#8b5cf6', fontSize: 26 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                KYC Identity Verification Queue
              </Typography>
              {pendingCount > 0 && (
                <Chip
                  label={`${pendingCount} Pending`}
                  color="error"
                  size="small"
                  sx={{ fontWeight: 800, height: 22, fontSize: '0.75rem' }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Review government IDs submitted by users for compliance verification and tier upgrades.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={isRefreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#E5E7EB',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Filter Chips & Search Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={`Pending (${pendingCount})`}
              onClick={() => setFilterStatus('PENDING')}
              color={filterStatus === 'PENDING' ? 'warning' : 'default'}
              variant={filterStatus === 'PENDING' ? 'filled' : 'outlined'}
              icon={<PendingActionsIcon />}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`Verified (${verifiedCount})`}
              onClick={() => setFilterStatus('VERIFIED')}
              color={filterStatus === 'VERIFIED' ? 'success' : 'default'}
              variant={filterStatus === 'VERIFIED' ? 'filled' : 'outlined'}
              icon={<CheckIcon />}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`Rejected (${rejectedCount})`}
              onClick={() => setFilterStatus('REJECTED')}
              color={filterStatus === 'REJECTED' ? 'error' : 'default'}
              variant={filterStatus === 'REJECTED' ? 'filled' : 'outlined'}
              icon={<CancelIcon />}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`All (${allKycUsers.length})`}
              onClick={() => setFilterStatus('ALL')}
              color={filterStatus === 'ALL' ? 'primary' : 'default'}
              variant={filterStatus === 'ALL' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <TextField
            size="small"
            placeholder="Search by name, email, or ID number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6B7280', fontSize: 20 }} />
                  </InputAdornment>
                )
              }
            }}
            sx={{
              minWidth: { xs: '100%', md: 280 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          />
        </Box>

        {/* KYC Queue Table */}
        {filteredUsers.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.1)'
            }}
          >
            <VerifiedUserIcon sx={{ fontSize: 48, color: '#4B5563', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#9CA3AF' }}>
              {filterStatus === 'PENDING'
                ? 'No Pending KYC Submissions'
                : `No KYC Submissions Found for ${filterStatus}`}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              When users submit verification documents from their profile, requests will show up here instantly.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.08)' } }}>
                  <TableCell>User</TableCell>
                  <TableCell>Legal Full Name</TableCell>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Document Number</TableCell>
                  <TableCell>Document File</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted At</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((item) => {
                  const kyc = item.kycSubmission;
                  const currentStatus = kyc?.status || item.profile.kycStatus || 'PENDING';
                  const docType = kyc?.documentType || 'PASSPORT';
                  const docNum = kyc?.documentNumber || '—';
                  const legalName = kyc?.fullName || item.profile.name;
                  const fileName = kyc?.documentFileName || 'id_document.pdf';
                  const submitDate = kyc?.submittedAt || item.profile.createdAt;

                  return (
                    <TableRow
                      key={item.profile.id}
                      hover
                      sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', py: 1.8 } }}
                    >
                      {/* User Account Details */}
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                          {item.profile.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                          {item.profile.email}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                          @{item.profile.username}
                        </Typography>
                      </TableCell>

                      {/* Legal Full Name */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#F3F4F6' }}>
                          {legalName}
                        </Typography>
                      </TableCell>

                      {/* Document Type */}
                      <TableCell>
                        <Chip
                          label={docType.replace('_', ' ')}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: 'rgba(139, 92, 246, 0.15)',
                            color: '#c4b5fd',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                          }}
                        />
                      </TableCell>

                      {/* Document Number */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: 700 }}>
                            {docNum}
                          </Typography>
                          {docNum !== '—' && (
                            <Tooltip title="Copy Document Number">
                              <IconButton size="small" onClick={() => handleCopy(docNum, 'Document Number')} sx={{ color: '#6B7280', p: 0.5 }}>
                                <ContentCopyIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      {/* Document File / Attachment */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <DescriptionIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                          <Typography variant="caption" sx={{ color: '#D1D5DB', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {fileName}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={currentStatus}
                          color={
                            currentStatus === 'VERIFIED'
                              ? 'success'
                              : currentStatus === 'PENDING'
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                        />
                      </TableCell>

                      {/* Submission Date */}
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                          {submitDate ? formatDateTime(submitDate) : 'Recent'}
                        </Typography>
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => handleOpenAction(item, 'VERIFIED')}
                            disabled={currentStatus === 'VERIFIED'}
                            sx={{ fontWeight: 800, textTransform: 'none', px: 1.5 }}
                          >
                            Verify
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => handleOpenAction(item, 'REJECTED')}
                            disabled={currentStatus === 'REJECTED'}
                            sx={{ fontWeight: 700, textTransform: 'none', px: 1.5 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {/* Verification / Rejection Dialog */}
      <Dialog
        open={Boolean(selectedUser && actionType)}
        onClose={() => { if (!isSubmitting) { setSelectedUser(null); setActionType(null); } }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {actionType === 'VERIFIED' ? 'Approve KYC Verification' : 'Reject KYC Submission'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
            {actionType === 'VERIFIED'
              ? `Confirm KYC approval for "${selectedUser?.profile.name}" (${selectedUser?.kycSubmission?.fullName || selectedUser?.profile.name})? User status will be set to VERIFIED instantly.`
              : `Reject KYC submission for "${selectedUser?.profile.name}"? Please provide a reason.`}
          </Typography>

          <TextField
            fullWidth
            label="Compliance / Review Notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            multiline
            rows={3}
            placeholder="Enter reason or approval comments..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => { setSelectedUser(null); setActionType(null); }}
            disabled={isSubmitting}
            sx={{ color: '#9CA3AF' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === 'VERIFIED' ? 'success' : 'error'}
            onClick={handleConfirm}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ fontWeight: 800, px: 3 }}
          >
            {isSubmitting ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
