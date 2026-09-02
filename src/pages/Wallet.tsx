import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { WalletSummary } from '../components/wallet/WalletSummary';
import { DepositPanel } from '../components/wallet/DepositPanel';
import { WithdrawalPanel } from '../components/wallet/WithdrawalPanel';
import { KycPanel } from '../components/wallet/KycPanel';
import { TransactionHistory } from '../components/wallet/TransactionHistory';
import {
  ArrowDownwardIcon,
  ArrowUpwardIcon,
  VerifiedUserIcon,
  ReceiptLongIcon
} from '../components/common/Icons';

export const Wallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          USDT Financial Wallet
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          Manage your deposits, withdrawals, identity compliance, and ledger transactions.
        </Typography>
      </Box>

      {/* Top Balances */}
      <WalletSummary />

      {/* Navigation Tabs */}
      <Paper
        sx={{
          mb: 3.5,
          backgroundColor: '#111522',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 3
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: { xs: 46, sm: 52 },
            '& .MuiTab-root': {
              minHeight: { xs: 46, sm: 52 },
              fontWeight: 700,
              fontSize: { xs: '0.82rem', sm: '0.9rem' },
              color: '#9CA3AF',
              px: { xs: 1.5, sm: 2.5 },
              '&.Mui-selected': {
                color: '#a78bfa'
              }
            }
          }}
        >
          <Tab icon={<ArrowDownwardIcon />} iconPosition="start" label="Deposit" />
          <Tab icon={<ArrowUpwardIcon />} iconPosition="start" label="Withdrawal" />
          <Tab icon={<VerifiedUserIcon />} iconPosition="start" label="KYC Verification" />
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Ledger History" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {activeTab === 0 && <DepositPanel />}
      {activeTab === 1 && <WithdrawalPanel />}
      {activeTab === 2 && <KycPanel />}
      {activeTab === 3 && <TransactionHistory />}
    </Box>
  );
};
