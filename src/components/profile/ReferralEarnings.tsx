import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import {
  MonetizationOnIcon,
  CardGiftcardIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { formatDate, formatUSDT } from '../../utils/formatters';

export const ReferralEarnings: React.FC = () => {
  const { referralSummary } = useApp();

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <MonetizationOnIcon sx={{ color: '#10b981', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Referral Commissions & Earnings
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Automated multi-tier commissions & deposit milestone bonuses credited to your balance
            </Typography>
          </Box>
        </Box>

        {/* Totals Grid */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
              <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 600, display: 'block' }}>
                Tier A Direct Earnings (1.0% + Bonuses)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mt: 0.5 }}>
                {formatUSDT(referralSummary.tierAEarnings)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 600, display: 'block' }}>
                Tier B Secondary Earnings (0.5%)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mt: 0.5 }}>
                {formatUSDT(referralSummary.tierBEarnings)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600, display: 'block' }}>
                Tier C Tertiary Earnings (0.5%)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mt: 0.5 }}>
                {formatUSDT(referralSummary.tierCEarnings)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Earnings Transaction Log */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Recent Referral Bonus Payouts
        </Typography>

        {referralSummary.earningsHistory.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#9CA3AF', py: 3, textAlign: 'center' }}>
            No referral bonus payouts yet. Commissions are generated when team members deposit or complete reservations!
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#9CA3AF' }}>Date</TableCell>
                  <TableCell sx={{ color: '#9CA3AF' }}>From Member</TableCell>
                  <TableCell sx={{ color: '#9CA3AF' }}>Type / Tier</TableCell>
                  <TableCell sx={{ color: '#9CA3AF' }}>Details</TableCell>
                  <TableCell sx={{ color: '#9CA3AF' }}>Bonus Credited</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referralSummary.earningsHistory.map((eh) => (
                  <TableRow key={eh.id}>
                    <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{formatDate(eh.createdAt)}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>@{eh.fromMemberUsername}</TableCell>
                    <TableCell>
                      <Chip
                        label={eh.tier === 'DEPOSIT_BONUS' ? 'DEPOSIT BONUS' : `Tier ${eh.tier}`}
                        color={eh.tier === 'DEPOSIT_BONUS' ? 'warning' : eh.tier === 'A' ? 'primary' : eh.tier === 'B' ? 'secondary' : 'success'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                      {eh.description || `${eh.rate}% Commission`}
                    </TableCell>
                    <TableCell sx={{ color: '#34d399', fontWeight: 800 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CardGiftcardIcon sx={{ fontSize: 16 }} />
                        +{eh.amount.toFixed(4)} USDT
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
