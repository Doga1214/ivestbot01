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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import { SearchIcon, ReceiptLongIcon } from '../common/Icons';
import type { WalletTransaction } from '../../services/walletService';
import { formatUSDT, formatDateTime } from '../../utils/formatters';

interface AdminGlobalLedgerProps {
  transactions: WalletTransaction[];
}

export const AdminGlobalLedger: React.FC<AdminGlobalLedgerProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      tx.referenceId.toLowerCase().includes(term) ||
      tx.description.toLowerCase().includes(term) ||
      (tx.userName && tx.userName.toLowerCase().includes(term)) ||
      (tx.userEmail && tx.userEmail.toLowerCase().includes(term)) ||
      (tx.adminRemarks && tx.adminRemarks.toLowerCase().includes(term));

    return matchesType && matchesSearch;
  });

  const getTypeChip = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <Chip label="DEPOSIT" color="success" size="small" sx={{ fontWeight: 800 }} />;
      case 'WITHDRAWAL':
        return <Chip label="WITHDRAWAL" color="error" size="small" sx={{ fontWeight: 800 }} />;
      case 'ADMIN_CREDIT':
        return <Chip label="ADMIN CREDIT" color="primary" size="small" sx={{ fontWeight: 800 }} />;
      case 'ADMIN_DEBIT':
        return <Chip label="ADMIN DEBIT" color="warning" size="small" sx={{ fontWeight: 800 }} />;
      case 'WELCOME_BONUS':
      case 'REFERRAL_BONUS':
        return <Chip label="BONUS" color="secondary" size="small" sx={{ fontWeight: 800 }} />;
      default:
        return <Chip label={type} size="small" sx={{ fontWeight: 800 }} />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <Chip label={status} color="success" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />;
      case 'PENDING':
        return <Chip label="PENDING" color="warning" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />;
      case 'REJECTED':
      case 'FAILED':
        return <Chip label={status} color="error" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />;
      default:
        return <Chip label={status} size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />;
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
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            mb: 3
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Global Platform Ledger & Audit Trail
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Complete chronological audit logs of all wallet events, admin adjustments, and payouts.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="DEPOSIT">Deposits</MenuItem>
                <MenuItem value="WITHDRAWAL">Withdrawals</MenuItem>
                <MenuItem value="ADMIN_CREDIT">Admin Credits</MenuItem>
                <MenuItem value="ADMIN_DEBIT">Admin Debits</MenuItem>
                <MenuItem value="WELCOME_BONUS">Milestone Bonuses</MenuItem>
                <MenuItem value="DAILY_PROFIT">Daily Profits</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search reference ID or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        </Box>

        {filtered.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.1)'
            }}
          >
            <ReceiptLongIcon sx={{ fontSize: 48, color: '#4B5563', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#9CA3AF' }}>
              No Transactions Match Filter
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#9CA3AF', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.08)' } }}>
                  <TableCell>Ref ID / Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Details / Description</TableCell>
                  <TableCell>Admin Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((tx) => {
                  const isPositive =
                    tx.type === 'DEPOSIT' ||
                    tx.type === 'ADMIN_CREDIT' ||
                    tx.type === 'DAILY_PROFIT' ||
                    tx.type === 'WELCOME_BONUS' ||
                    tx.type === 'REFERRAL_BONUS';

                  return (
                    <TableRow
                      key={tx.id}
                      hover
                      sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', py: 1.5 } }}
                    >
                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#a78bfa', display: 'block' }}>
                          {tx.referenceId}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          {formatDateTime(tx.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {tx.userName || 'Demo User'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {getTypeChip(tx.type)}
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 900,
                            color: isPositive ? '#34d399' : '#f87171'
                          }}
                        >
                          {isPositive ? '+' : '-'}{formatUSDT(tx.amount)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {getStatusChip(tx.status)}
                      </TableCell>

                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="caption" sx={{ color: '#e2e8f0', display: 'block' }}>
                          {tx.description}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 180 }}>
                        <Typography variant="caption" sx={{ color: tx.adminRemarks ? '#a78bfa' : '#6B7280', fontStyle: tx.adminRemarks ? 'italic' : 'normal' }}>
                          {tx.adminRemarks || '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
