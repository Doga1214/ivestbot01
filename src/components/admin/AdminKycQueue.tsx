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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { VerifiedUserIcon, CheckIcon, CancelIcon } from '../common/Icons';
import type { KycSubmission } from '../../services/walletService';
import type { AdminUserListItem } from '../../services/adminService';
import { formatDateTime } from '../../utils/formatters';

interface AdminKycQueueProps {
  users: AdminUserListItem[];
  currentKyc: KycSubmission;
  onVerify: (userId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => void;
}

export const AdminKycQueue: React.FC<AdminKycQueueProps> = ({
  users,
  currentKyc,
  onVerify
}) => {
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [actionType, setActionType] = useState<'VERIFIED' | 'REJECTED' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Collect users who have KYC submissions
  const kycUsers = users.filter(u => u.profile.kycStatus === 'PENDING' || u.profile.kycStatus === 'VERIFIED');

  const handleOpenAction = (user: AdminUserListItem, status: 'VERIFIED' | 'REJECTED') => {
    setSelectedUser(user);
    setActionType(status);
    setAdminNotes(status === 'VERIFIED' ? 'Document verified and matched with user identity.' : 'Document unreadable or invalid.');
  };

  const handleConfirm = () => {
    if (!selectedUser || !actionType) return;
    onVerify(selectedUser.profile.id, actionType, adminNotes);
    setSelectedUser(null);
    setActionType(null);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              KYC Identity Verification Queue
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Review government IDs submitted by users for high-tier withdrawals and VIP privileges.
            </Typography>
          </Box>
        </Box>

        {kycUsers.length === 0 && currentKyc.status === 'NOT_SUBMITTED' ? (
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
              No Pending KYC Submissions
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Submissions from the User Wallet KYC panel will appear here.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.08)' } }}>
                  <TableCell>User</TableCell>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Document Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kycUsers.map((item) => (
                  <TableRow
                    key={item.profile.id}
                    hover
                    sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', py: 1.8 } }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                        {item.profile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {item.profile.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {currentKyc.documentType || 'PASSPORT'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#60a5fa' }}>
                        {currentKyc.documentNumber || 'PASS-9821421'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.profile.kycStatus}
                        color={item.profile.kycStatus === 'VERIFIED' ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {currentKyc.submittedAt ? formatDateTime(currentKyc.submittedAt) : 'Recent'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={() => handleOpenAction(item, 'VERIFIED')}
                          sx={{ fontWeight: 800, textTransform: 'none' }}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleOpenAction(item, 'REJECTED')}
                          sx={{ fontWeight: 700, textTransform: 'none' }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      <Dialog
        open={Boolean(selectedUser && actionType)}
        onClose={() => { setSelectedUser(null); setActionType(null); }}
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
        <DialogTitle sx={{ fontWeight: 800 }}>
          {actionType === 'VERIFIED' ? 'Approve KYC Verification' : 'Reject KYC Submission'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
            {actionType === 'VERIFIED'
              ? `Confirm KYC approval for ${selectedUser?.profile.name}? Status will update to VERIFIED.`
              : `Reject KYC for ${selectedUser?.profile.name}?`}
          </Typography>

          <TextField
            fullWidth
            label="Verification Notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => { setSelectedUser(null); setActionType(null); }} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === 'VERIFIED' ? 'success' : 'error'}
            onClick={handleConfirm}
            sx={{ fontWeight: 800 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
