import React, { useState, useEffect, useCallback } from 'react';
import { Box, Tabs, Tab, Paper, Badge } from '@mui/material';
import { walletService } from '../services/walletService';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import type { AdminUserListItem, PlatformStats } from '../services/adminService';
import { useApp } from '../context/AppContext';
import { AdminAuthGate } from '../components/admin/AdminAuthGate';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminDepositQueue } from '../components/admin/AdminDepositQueue';
import { AdminWithdrawalQueue } from '../components/admin/AdminWithdrawalQueue';
import { AdminUserList } from '../components/admin/AdminUserList';
import { AdminKycQueue } from '../components/admin/AdminKycQueue';
import { AdminGlobalLedger } from '../components/admin/AdminGlobalLedger';
import { AdminBroadcastModal } from '../components/admin/AdminBroadcastModal';
import {
  ArrowDownwardIcon,
  ArrowUpwardIcon,
  GroupsIcon,
  VerifiedUserIcon,
  ReceiptLongIcon
} from '../components/common/Icons';

export const Admin: React.FC = () => {
  const {
    adminApproveDeposit,
    adminRejectDeposit,
    adminApproveWithdrawal,
    adminRejectWithdrawal,
    adminCreditUser,
    adminDebitUser,
    adminUpdateWalletRestrictions,
    adminVerifyKyc,
    kyc,
    showSnackbar
  } = useApp();

  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => adminService.isAdminAuthenticated());
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPendingDepositsCount: 0,
    totalPendingDepositsSum: 0,
    totalPendingWithdrawalsCount: 0,
    totalPendingWithdrawalsSum: 0,
    totalPlatformCirculation: 0,
    restrictedWalletsCount: 0
  });

  const loadAdminData = useCallback(async () => {
    try {
      await authService.syncAllUsersFromSupabase();
      await walletService.syncTransactionsFromSupabase();
    } catch {
      // ignore
    }
    const userList = adminService.getAdminUsersList();
    const platformStats = adminService.getPlatformStats();
    setUsers(userList);
    setStats(platformStats);
  }, []);

  useEffect(() => {
    if (!isAdminAuth) return;
    loadAdminData();

    // Fast real-time polling every 2.5s for instant deposit / withdrawal requests
    const interval = setInterval(() => {
      loadAdminData();
    }, 2500);

    return () => clearInterval(interval);
  }, [isAdminAuth, loadAdminData]);

  const handleLogout = () => {
    adminService.adminLogout();
    setIsAdminAuth(false);
    showSnackbar('Admin session closed.', 'info');
  };

  const handleApproveDeposit = (txId: string, remarks?: string) => {
    adminApproveDeposit(txId, remarks);
    loadAdminData();
  };

  const handleRejectDeposit = (txId: string, remarks?: string) => {
    adminRejectDeposit(txId, remarks);
    loadAdminData();
  };

  const handleApproveWithdrawal = (txId: string, remarks?: string) => {
    adminApproveWithdrawal(txId, remarks);
    loadAdminData();
  };

  const handleRejectWithdrawal = (txId: string, remarks?: string) => {
    adminRejectWithdrawal(txId, remarks);
    loadAdminData();
  };

  const handleAdjustBalance = (userId: string, type: 'CREDIT' | 'DEBIT', amount: number, reason: string) => {
    if (type === 'CREDIT') {
      adminCreditUser(userId, amount, reason);
    } else {
      adminDebitUser(userId, amount, reason);
    }
    loadAdminData();
  };

  const handleUpdateRestrictions = (
    userId: string,
    status: any,
    restrictions: any,
    reason?: string
  ) => {
    adminUpdateWalletRestrictions(userId, status, restrictions, reason);
    loadAdminData();
  };

  const handleVerifyKyc = (userId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    adminVerifyKyc(userId, status, notes);
    loadAdminData();
  };

  if (!isAdminAuth) {
    return <AdminAuthGate onSuccess={() => setIsAdminAuth(true)} />;
  }

  const pendingDeposits = adminService.getPendingDeposits();
  const pendingWithdrawals = adminService.getPendingWithdrawals();

  return (
    <Box sx={{ pb: 6 }}>
      {/* Admin Top Bar */}
      <AdminHeader
        onRefresh={loadAdminData}
        onLogout={handleLogout}
        onBroadcast={() => setIsBroadcastOpen(true)}
      />

      {/* KPI Overview */}
      <AdminOverview stats={stats} />

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
          sx={{
            minHeight: 54,
            '& .MuiTab-root': {
              minHeight: 54,
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#9CA3AF',
              '&.Mui-selected': {
                color: '#a78bfa'
              }
            }
          }}
        >
          <Tab
            icon={
              <Badge badgeContent={pendingDeposits.length} color="warning">
                <ArrowDownwardIcon />
              </Badge>
            }
            iconPosition="start"
            label="Pending Deposits"
          />

          <Tab
            icon={<GroupsIcon />}
            iconPosition="start"
            label="User Wallets & Controls"
          />

          <Tab
            icon={
              <Badge badgeContent={pendingWithdrawals.length} color="warning">
                <ArrowUpwardIcon />
              </Badge>
            }
            iconPosition="start"
            label="Withdrawals"
          />

          <Tab
            icon={<VerifiedUserIcon />}
            iconPosition="start"
            label="KYC Compliance"
          />

          <Tab
            icon={<ReceiptLongIcon />}
            iconPosition="start"
            label="Global Ledger Audit"
          />
        </Tabs>
      </Paper>

      {/* Panels */}
      {activeTab === 0 && (
        <AdminDepositQueue
          deposits={pendingDeposits}
          onApprove={handleApproveDeposit}
          onReject={handleRejectDeposit}
          showSnackbar={showSnackbar}
        />
      )}

      {activeTab === 1 && (
        <AdminUserList
          users={users}
          onAdjustBalance={handleAdjustBalance}
          onUpdateRestrictions={handleUpdateRestrictions}
          onRefresh={loadAdminData}
          showSnackbar={showSnackbar}
        />
      )}

      {activeTab === 2 && (
        <AdminWithdrawalQueue
          withdrawals={pendingWithdrawals}
          onApprove={handleApproveWithdrawal}
          onReject={handleRejectWithdrawal}
        />
      )}

      {activeTab === 3 && (
        <AdminKycQueue
          users={users}
          currentKyc={kyc}
          onVerify={handleVerifyKyc}
        />
      )}

      {activeTab === 4 && (
        <AdminGlobalLedger
          transactions={walletService.getTransactions()}
        />
      )}

      {/* Broadcast Announcement Modal */}
      <AdminBroadcastModal
        open={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        showSnackbar={showSnackbar}
      />
    </Box>
  );
};
