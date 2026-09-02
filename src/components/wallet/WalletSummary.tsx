import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import {
  AccountBalanceWalletIcon,
  CheckCircleOutlineIcon,
  PendingActionsIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { formatUSDT } from '../../utils/formatters';

export const WalletSummary: React.FC = () => {
  const { wallet } = useApp();

  return (
    <Card
      sx={{
        background: 'linear-gradient(145deg, #111522 0%, #171B2A 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
        mb: 4
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 3.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: { xs: 38, sm: 44 },
                height: { xs: 38, sm: 44 },
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}
            >
              <AccountBalanceWalletIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.4rem' } }}>
                USDT Financial Wallet
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: { xs: '0.72rem', sm: '0.78rem' } }}>
                Multi-network asset balance tracking with admin transaction verification
              </Typography>
            </Box>
          </Box>

          <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
            {wallet.status === 'INACTIVE' && (
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', fontWeight: 800, fontSize: '0.75rem' }}>
                WALLET INACTIVE
              </Box>
            )}
            {wallet.status === 'FROZEN' && (
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#fbbf24', fontWeight: 800, fontSize: '0.75rem' }}>
                WALLET FROZEN
              </Box>
            )}
            {wallet.status === 'RESTRICTED' && (
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', color: '#c084fc', fontWeight: 800, fontSize: '0.75rem' }}>
                CUSTOM RESTRICTIONS
              </Box>
            )}
            {wallet.status === 'ACTIVE' && (
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontWeight: 800, fontSize: '0.75rem' }}>
                WALLET ACTIVE
              </Box>
            )}
          </Box>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Card 1: Total Balance */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, fontSize: '0.78rem' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 16, color: '#a78bfa' }} />
                <span>Total Net Balance</span>
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffffff', fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.1rem' } }}>
                {formatUSDT(wallet.totalBalance)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.72rem' }}>
                Available + Pending Funds
              </Typography>
            </Box>
          </Grid>

          {/* Card 2: Available Balance */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Typography variant="caption" sx={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, fontSize: '0.78rem' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#34d399' }} />
                <span>Available Balance</span>
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#34d399', fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.1rem' } }}>
                {formatUSDT(wallet.availableBalance)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.72rem' }}>
                Ready to mine & reserve
              </Typography>
            </Box>
          </Grid>

          {/* Card 3: Pending Balance (Admin Verification) */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <Typography variant="caption" sx={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, fontSize: '0.78rem' }}>
                <PendingActionsIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                <span>Pending Verification</span>
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#fbbf24', fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.1rem' } }}>
                {formatUSDT(wallet.pendingBalance)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: '0.72rem' }}>
                Under review by Admin
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
