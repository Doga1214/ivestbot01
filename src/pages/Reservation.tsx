import React from 'react';
import { Box, Typography } from '@mui/material';
import { StarAiMiningCard } from '../components/reservation/StarAiMiningCard';
import { ReservationCard } from '../components/reservation/ReservationCard';
import { ReservationHistory } from '../components/reservation/ReservationHistory';

export const Reservation: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Reservation & AI Mining Terminal
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          Participate in automated 24-hour yield cycles, direct reservations, and live Star AI USDT mining.
        </Typography>
      </Box>

      {/* 1. Star AI USDT Mining Engine */}
      <StarAiMiningCard />

      {/* 2. Direct 24-Hour Yield Reservation Terminal */}
      <ReservationCard />

      {/* 3. Settlement & Mining History Ledger */}
      <ReservationHistory />
    </Box>
  );
};
