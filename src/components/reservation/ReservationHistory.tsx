import React from 'react';
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
  Box
} from '@mui/material';
import { HistoryIcon } from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { formatDate, formatUSDT } from '../../utils/formatters';
import { WALLET_CONFIG } from '../../config/walletConfig';

export const ReservationHistory: React.FC = () => {
  const { reservationHistory } = useApp();

  const formatDurationText = (seconds?: number) => {
    if (!seconds) return '24h 00m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HistoryIcon sx={{ color: '#8b5cf6' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            AI Mining Settlement History
          </Typography>
        </Box>

        {reservationHistory.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#9CA3AF', py: 3, textAlign: 'center' }}>
            No mining settlement records yet. Activate your first 24-hour AI bot above!
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Started Date</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Mining Balance</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Active Duration</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Yield Rate</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Profit Credited</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Cycle Type</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Reference ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservationHistory.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{formatDate(res.startedAt)}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{formatUSDT(res.amount)}</TableCell>
                    <TableCell sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                      {formatDurationText(res.activeDurationSeconds)}
                    </TableCell>
                    <TableCell sx={{ color: '#60a5fa', fontWeight: 700 }}>
                      {(res.effectiveRate || res.dailyRate || WALLET_CONFIG.defaultDailyRate).toFixed(4)}%
                    </TableCell>
                    <TableCell sx={{ color: '#34d399', fontWeight: 800 }}>
                      +{res.profit.toFixed(4)} USDT
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={res.isFullCycle ? '24H FULL CYCLE' : 'PRO-RATA HARVEST'}
                        color={res.isFullCycle ? 'success' : 'secondary'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={res.status}
                        color={res.status === 'COMPLETED' ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#6B7280', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {res.referenceId}
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
