import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Paper
} from '@mui/material';
import {
  ContentCopyIcon,
  GroupsIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const ReferralSection: React.FC = () => {
  const { referralSummary, showSnackbar } = useApp();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`${label} copied to clipboard!`, 'success');
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <GroupsIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              My Referral Network
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Share your invite link to build direct A members and passive B/C networks
            </Typography>
          </Box>
        </Box>

        {/* Link & Code Copy Boxes */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5, fontWeight: 600 }}>
              Personal Referral Invite Link
            </Typography>
            <Paper
              sx={{
                p: 1.5,
                bgcolor: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {referralSummary.referralLink}
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<ContentCopyIcon fontSize="small" />}
                onClick={() => handleCopy(referralSummary.referralLink, 'Referral Link')}
                sx={{ flexShrink: 0, fontWeight: 700 }}
              >
                COPY LINK
              </Button>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5, fontWeight: 600 }}>
              Referral Code
            </Typography>
            <Paper
              sx={{
                p: 1.5,
                bgcolor: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  color: '#a78bfa',
                  fontWeight: 900,
                  letterSpacing: '0.1em'
                }}
              >
                {referralSummary.referralCode}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon fontSize="small" />}
                onClick={() => handleCopy(referralSummary.referralCode, 'Referral Code')}
                sx={{ flexShrink: 0, fontWeight: 700, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
              >
                COPY
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Member Count Cards */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Network Member Counts
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 600, display: 'block' }}>
                A Members (Direct)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mt: 0.5 }}>
                {referralSummary.aMembersCount}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 600, display: 'block' }}>
                B Members (Tier 2)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mt: 0.5 }}>
                {referralSummary.bMembersCount}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600, display: 'block' }}>
                C Members (Tier 3)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mt: 0.5 }}>
                {referralSummary.cMembersCount}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block' }}>
                Total Members
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mt: 0.5 }}>
                {referralSummary.totalMembersCount}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 600, display: 'block' }}>
                Active (Deposited)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#34d399', mt: 0.5 }}>
                {referralSummary.activeMembersCount}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 600, display: 'block' }}>
                Inactive (Pending)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#fbbf24', mt: 0.5 }}>
                {referralSummary.inactiveMembersCount}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
