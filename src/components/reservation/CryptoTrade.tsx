import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  SwapHorizIcon,
  ShowChartIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

export const CryptoTrade: React.FC = () => {
  const { markets, tradeHistory, executeDemoTrade } = useApp();

  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeAmount, setTradeAmount] = useState<string>('0.05');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const currentMarket = markets.find(m => m.symbol === selectedPair) || markets[0];
  const numAmount = parseFloat(tradeAmount) || 0;
  const totalCost = Number((numAmount * currentMarket.price).toFixed(2));

  const handleOpenConfirm = (side: 'BUY' | 'SELL') => {
    setTradeSide(side);
    setIsConfirmModalOpen(true);
  };

  const handleExecute = async () => {
    await executeDemoTrade({
      pair: currentMarket.symbol,
      side: tradeSide,
      amount: numAmount,
      price: currentMarket.price
    });
    setIsConfirmModalOpen(false);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <ShowChartIcon sx={{ color: '#8b5cf6' }} />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Crypto Market Simulation (DEMO ONLY)
        </Typography>
        <Chip label="DEMO SANDBOX" color="primary" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
      </Box>

      {/* Market Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {markets.map((m) => {
          const isUp = m.change24h >= 0;
          const isSelected = m.symbol === selectedPair;

          return (
            <Grid size={{ xs: 12, sm: 4 }} key={m.symbol}>
              <Paper
                onClick={() => setSelectedPair(m.symbol)}
                sx={{
                  p: 2.5,
                  cursor: 'pointer',
                  borderRadius: 3,
                  backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.12)' : '#111522',
                  border: isSelected ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#8b5cf6',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {m.symbol}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      {m.name}
                    </Typography>
                  </Box>
                  <Chip
                    icon={isUp ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                    label={`${isUp ? '+' : ''}${m.change24h}%`}
                    color={isUp ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                  />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}>
                  ${m.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  24h Vol: {m.volume}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Trade Panel */}
      <Card sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <CardContent sx={{ p: '0 !important' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SwapHorizIcon sx={{ color: '#8b5cf6' }} />
            <span>Order Ticket: {selectedPair}</span>
          </Typography>

          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                Current Spot Price
              </Typography>
              <TextField
                fullWidth
                disabled
                value={`$${currentMarket.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                Quantity ({selectedPair.split('/')[0]})
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
                Simulated Value
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={() => handleOpenConfirm('BUY')}
                  sx={{ py: 1.2, fontWeight: 700 }}
                >
                  DEMO BUY {selectedPair.split('/')[0]}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={() => handleOpenConfirm('SELL')}
                  sx={{ py: 1.2, fontWeight: 700 }}
                >
                  DEMO SELL {selectedPair.split('/')[0]}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Trade History */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Demo Trade Execution History
          </Typography>

          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Pair</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Side</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Total USDT</TableCell>
                  <TableCell sx={{ color: '#9CA3AF', fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tradeHistory.map((th) => (
                  <TableRow key={th.id}>
                    <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{formatDate(th.createdAt)}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{th.pair}</TableCell>
                    <TableCell>
                      <Chip
                        label={th.side}
                        color={th.side === 'BUY' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>{th.amount}</TableCell>
                    <TableCell>${th.price.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>${th.totalUSDT.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label="DEMO FILLED" size="small" sx={{ fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.08)' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        slotProps={{ paper: { sx: { p: 1, backgroundColor: '#111522', border: '1px solid rgba(255,255,255,0.1)' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Demo Trade Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
            You are placing a simulated demo {tradeSide} order for {tradeAmount} {selectedPair.split('/')[0]} at ${currentMarket.price.toLocaleString()}.
          </Typography>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700 }}>
              Order Value: ${totalCost.toFixed(2)} USDT (Demo)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsConfirmModalOpen(false)} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={tradeSide === 'BUY' ? 'success' : 'error'}
            onClick={handleExecute}
            sx={{ fontWeight: 700 }}
          >
            Confirm {tradeSide}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
