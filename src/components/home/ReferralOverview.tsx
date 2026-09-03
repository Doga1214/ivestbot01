import React from 'react';
import { Box, Typography, Paper, Stack, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  PeopleAltOutlinedIcon,
  MonetizationOnOutlinedIcon,
  ShareOutlinedIcon,
  CardGiftcardIcon
} from '../common/Icons';

export const ReferralOverview: React.FC = () => {
  return (
    <Box sx={{ py: 6 }}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}
      >
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="overline" sx={{ color: '#a78bfa', fontWeight: 700, letterSpacing: '0.05em' }}>
              COMMUNITY GROWTH
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
              A/B/C Multi-Tier Referral & Deposit Bonuses
            </Typography>
            <Typography variant="body1" sx={{ color: '#9CA3AF', lineHeight: 1.6, mb: 3 }}>
              Invite new members with your referral link. Earn lifetime daily commissions on reservations and instant cash bonuses whenever invited members make deposits!
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShareOutlinedIcon sx={{ color: '#8b5cf6' }} />
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  <strong>A Members (Direct)</strong>: 1.0% Lifetime Daily Reservation Commission
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleAltOutlinedIcon sx={{ color: '#3b82f6' }} />
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  <strong>B Members (Secondary)</strong>: 0.5% Lifetime Daily Reservation Commission
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MonetizationOnOutlinedIcon sx={{ color: '#10b981' }} />
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  <strong>C Members (Tertiary)</strong>: 0.5% Lifetime Daily Reservation Commission
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: '#111522',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, justifyContent: 'center' }}>
                <CardGiftcardIcon sx={{ color: '#8b5cf6' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, textAlign: 'center' }}>
                  Deposit Referral Milestone Bonus Table
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', textAlign: 'center', mb: 2 }}>
                Earned instantly when a new member registers & deposits via sponsor link
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>50 USDT Deposit</Typography>
                  <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 800 }}>Sponsor: +5 USDT | User: +1 USDT</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>100 USDT Deposit</Typography>
                  <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 800 }}>Sponsor: +10 USDT | User: +2 USDT</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>200 USDT Deposit</Typography>
                  <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 800 }}>Sponsor: +20 USDT | User: +4 USDT</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>500 USDT Deposit</Typography>
                  <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 800 }}>Sponsor: +50 USDT | User: +10 USDT</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#34d399' }}>1,000 USDT Deposit</Typography>
                  <Typography variant="body2" sx={{ color: '#34d399', fontWeight: 900 }}>Sponsor: +100 USDT | User: +20 USDT</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700 }}>Tier A</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>1.0%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700 }}>Tier B</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>0.5%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700 }}>Tier C</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>0.5%</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
