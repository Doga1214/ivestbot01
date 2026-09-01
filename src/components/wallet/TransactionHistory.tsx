import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import { ReceiptLongIcon } from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import type { WalletTransaction } from '../../services/walletService';

export const TransactionHistory: React.FC = () => {
  const { user, transactions, cancelWithdrawal } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');

  const userTransactions = transactions.filter((tx) => {
    if (!user) return true;
    if (tx.userId && user.id && tx.userId.toLowerCase() === user.id.toLowerCase()) return true;
    if (tx.userEmail && user.email && tx.userEmail.toLowerCase() === user.email.toLowerCase()) return true;
    if (tx.userName && user.username && tx.userName.toLowerCase() === user.username.toLowerCase()) return true;
    if (tx.description && user.username && tx.description.toLowerCase().includes(user.username.toLowerCase())) return true;
    return !tx.userId; // include unassigned transactions
  });

  const filteredTransactions = userTransactions.filter((tx) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PENDING') return tx.status === 'PENDING';
    if (filterType === 'BONUS') return tx.type === 'REFERRAL_BONUS' || tx.type === 'WELCOME_BONUS';
    return tx.type === filterType;
  });

  const getTypeChip = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return <Chip label="DEPOSIT" color="success" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'WITHDRAWAL':
        return <Chip label="WITHDRAWAL" color="error" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'DAILY_PROFIT':
        return <Chip label="PROFIT" color="primary" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'REFERRAL_BONUS':
        return <Chip label="REF BONUS" color="secondary" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'WELCOME_BONUS':
        return <Chip label="WELCOME BONUS" color="info" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'RESERVATION':
        return <Chip label="RESERVE" color="warning" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
      default:
        return <Chip label={type} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
    }
  };

  const getStatusChip = (status: WalletTransaction['status']) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <Chip label="APPROVED" color="success" size="small" sx={{ fontWeight: 600, fontSize: '0.68rem' }} />;
      case 'PENDING':
        return <Chip label="PENDING VERIFICATION" color="warning" size="small" sx={{ fontWeight: 700, fontSize: '0.68rem' }} />;
      case 'REJECTED':
      case 'FAILED':
        return <Chip label="REJECTED" color="error" size="small" sx={{ fontWeight: 600, fontSize: '0.68rem' }} />;
      default:
        return <Chip label={status} size="small" sx={{ fontSize: '0.68rem' }} />;
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptLongIcon sx={{ color: '#8b5cf6' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Wallet Ledger Transactions
            </Typography>
          </Box>

          <Tabs
            value={filterType}
            onChange={(_e, val) => setFilterType(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': { minHeight: 36, py: 0.5, px: 1.5, fontSize: '0.8rem', fontWeight: 600 }
            }}
          >
            <Tab label="All Records" value="ALL" />
            <Tab label="Pending" value="PENDING" />
            <Tab label="Deposits" value="DEPOSIT" />
            <Tab label="Withdrawals" value="WITHDRAWAL" />
            <Tab label="Profits" value="DAILY_PROFIT" />
            <Tab label="Bonuses" value="BONUS" />
          </Tabs>
        </Box>

        {filteredTransactions.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#9CA3AF', py: 4, textAlign: 'center' }}>
            No transactions found for this filter.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Date & Time</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Reference ID</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600, textAlign: 'right' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((tx) => {
                  const isPositive =
                    tx.type === 'DEPOSIT' ||
                    tx.type === 'DAILY_PROFIT' ||
                    tx.type === 'REFERRAL_BONUS' ||
                    tx.type === 'WELCOME_BONUS' ||
                    tx.type === 'RESERVATION_RETURN';

                  return (
                    <TableRow key={tx.id}>
                      <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{formatDate(tx.createdAt)}</TableCell>
                      <TableCell>{getTypeChip(tx.type)}</TableCell>
                      <TableCell sx={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{tx.description}</TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: isPositive ? '#34d399' : '#f87171'
                        }}
                      >
                        {isPositive ? '+' : '-'}
                        {tx.amount.toFixed(2)} USDT
                      </TableCell>
                      <TableCell>{getStatusChip(tx.status)}</TableCell>
                      <TableCell sx={{ color: '#6B7280', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        {tx.referenceId}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        {tx.type === 'WITHDRAWAL' && tx.status === 'PENDING' ? (
                          <Chip
                            label="Cancel & Refund"
                            color="error"
                            variant="outlined"
                            size="small"
                            onClick={() => cancelWithdrawal(tx.id)}
                            sx={{ fontWeight: 800, cursor: 'pointer' }}
                          />
                        ) : (
                          <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>—</span>
                        )}
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
