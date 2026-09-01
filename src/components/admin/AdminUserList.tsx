import React, { useState } from 'react';
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
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  SearchIcon,
  AddCircleOutlineIcon,
  TuneIcon,
  VisibilityIcon,
  DeleteOutlineIcon
} from '../common/Icons';
import type { AdminUserListItem } from '../../services/adminService';
import { formatUSDT, formatDateTime } from '../../utils/formatters';
import { AdminWalletAdjustModal } from './AdminWalletAdjustModal';
import { AdminWalletRestrictionsModal } from './AdminWalletRestrictionsModal';
import { AdminUserDetailModal } from './AdminUserDetailModal';
import type { WalletStatus, WalletRestrictions } from '../../services/walletService';

interface AdminUserListProps {
  users: AdminUserListItem[];
  onAdjustBalance: (userId: string, type: 'CREDIT' | 'DEBIT', amount: number, reason: string) => void;
  onUpdateRestrictions: (userId: string, status: WalletStatus, restrictions: WalletRestrictions, reason?: string) => void;
  onDeleteUser: (userId: string, userName: string) => Promise<void>;
  onRefresh: () => void;
  showSnackbar: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminUserList: React.FC<AdminUserListProps> = ({
  users,
  onAdjustBalance,
  onUpdateRestrictions,
  onDeleteUser,
  onRefresh,
  showSnackbar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdjustUser, setSelectedAdjustUser] = useState<AdminUserListItem | null>(null);
  const [selectedRestrictionsUser, setSelectedRestrictionsUser] = useState<AdminUserListItem | null>(null);
  const [selectedDetailUserId, setSelectedDetailUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUserListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.profile.name.toLowerCase().includes(term) ||
      u.profile.username.toLowerCase().includes(term) ||
      u.profile.email.toLowerCase().includes(term) ||
      u.profile.referralCode.toLowerCase().includes(term)
    );
  });

  const getWalletStatusChip = (status: WalletStatus, restrictions?: WalletRestrictions) => {
    if (status === 'INACTIVE') {
      return <Chip label="INACTIVE" color="error" size="small" sx={{ fontWeight: 800 }} />;
    }
    if (status === 'FROZEN') {
      return <Chip label="FROZEN" color="warning" size="small" sx={{ fontWeight: 800 }} />;
    }
    if (status === 'RESTRICTED' || (restrictions && (!restrictions.canDeposit || !restrictions.canWithdraw || !restrictions.canReserve))) {
      return <Chip label="RESTRICTED" color="secondary" size="small" sx={{ fontWeight: 800 }} />;
    }
    return <Chip label="ACTIVE" color="success" size="small" sx={{ fontWeight: 800 }} />;
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
      <CardContent sx={{ p: 3 }}>
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
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              User Intelligence & Account Controls
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Full 360° user overview, WP Swings controls, credit/debit, restrictions, and permanent account deletion.
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search by name, email, or referral..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                  </InputAdornment>
                )
              }
            }}
          />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.08)' } }}>
                <TableCell>User Profile</TableCell>
                <TableCell>Ref Code / Sponsor</TableCell>
                <TableCell align="right">Available Balance</TableCell>
                <TableCell align="right">Pending Deposit</TableCell>
                <TableCell align="center">Wallet Status</TableCell>
                <TableCell align="center">KYC</TableCell>
                <TableCell align="center">Registered</TableCell>
                <TableCell align="center">Admin Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((item) => (
                <TableRow
                  key={item.profile.id}
                  hover
                  sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', py: 1.8 } }}
                >
                  <TableCell
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedDetailUserId(item.profile.id)}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', '&:hover': { color: '#a78bfa' } }}>
                      {item.profile.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      @{item.profile.username} • {item.profile.email}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#a78bfa', display: 'block' }}>
                      {item.profile.referralCode}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      Sponsor: {item.profile.referredBy || 'None'}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399' }}>
                      {formatUSDT(item.wallet.availableBalance)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    {item.wallet.pendingBalance > 0 ? (
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                        {formatUSDT(item.wallet.pendingBalance)}
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        0.00
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {getWalletStatusChip(item.wallet.status, item.wallet.restrictions)}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={item.profile.kycStatus || 'NOT_SUBMITTED'}
                      size="small"
                      color={
                        item.profile.kycStatus === 'VERIFIED'
                          ? 'success'
                          : item.profile.kycStatus === 'PENDING'
                          ? 'warning'
                          : 'default'
                      }
                      sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      {formatDateTime(item.profile.createdAt)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Tooltip title="View 360° User Intelligence & Controls">
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => setSelectedDetailUserId(item.profile.id)}
                          sx={{ fontWeight: 700, textTransform: 'none', px: 1.2 }}
                        >
                          360° Info
                        </Button>
                      </Tooltip>

                      <Tooltip title="Credit / Debit Wallet Balance">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<AddCircleOutlineIcon />}
                          onClick={() => setSelectedAdjustUser(item)}
                          sx={{ fontWeight: 700, textTransform: 'none', px: 1.2 }}
                        >
                          Adjust
                        </Button>
                      </Tooltip>

                      <Tooltip title="WP Swings Wallet Restrictions & Inactive Toggle">
                        <Button
                          variant="outlined"
                          color="warning"
                          size="small"
                          startIcon={<TuneIcon />}
                          onClick={() => setSelectedRestrictionsUser(item)}
                          sx={{ fontWeight: 700, textTransform: 'none', px: 1.2 }}
                        >
                          Rules
                        </Button>
                      </Tooltip>

                      <Tooltip title="Permanently Delete User Account">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => setUserToDelete(item)}
                          sx={{
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 1.2,
                            borderColor: 'rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            '&:hover': {
                              borderColor: '#ef4444',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)'
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* 360° User Detail Modal */}
      <AdminUserDetailModal
        userId={selectedDetailUserId}
        open={Boolean(selectedDetailUserId)}
        onClose={() => setSelectedDetailUserId(null)}
        onRefresh={onRefresh}
        showSnackbar={showSnackbar}
      />

      {/* Wallet Balance Adjust Modal */}
      <AdminWalletAdjustModal
        open={Boolean(selectedAdjustUser)}
        userItem={selectedAdjustUser}
        onClose={() => setSelectedAdjustUser(null)}
        onConfirm={(userId, type, amount, reason) => {
          onAdjustBalance(userId, type, amount, reason);
        }}
      />

      {/* Wallet Restrictions Modal */}
      <AdminWalletRestrictionsModal
        open={Boolean(selectedRestrictionsUser)}
        userItem={selectedRestrictionsUser}
        onClose={() => setSelectedRestrictionsUser(null)}
        onConfirm={(userId, status, restrictions, reason) => {
          onUpdateRestrictions(userId, status, restrictions, reason);
        }}
      />

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={Boolean(userToDelete)}
        onClose={() => !isDeleting && setUserToDelete(null)}
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
            <strong style={{ color: '#fff' }}>{userToDelete?.profile.name}</strong> (@{userToDelete?.profile.username})?
            <br /><br />
            This will permanently remove their wallet balance (<strong>{userToDelete?.wallet.availableBalance.toFixed(2)} USDT</strong>), transaction history, deposits, withdrawals, KYC records, and database profile.
            <br /><br />
            <span style={{ color: '#f87171', fontWeight: 700 }}>⚠️ This action cannot be undone.</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setUserToDelete(null)}
            disabled={isDeleting}
            sx={{ color: '#9CA3AF', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeleting}
            onClick={async () => {
              if (!userToDelete) return;
              setIsDeleting(true);
              try {
                await onDeleteUser(userToDelete.profile.id, userToDelete.profile.name);
                setUserToDelete(null);
                onRefresh();
              } finally {
                setIsDeleting(false);
              }
            }}
            sx={{ fontWeight: 800 }}
          >
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Yes, Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
