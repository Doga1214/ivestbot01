import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#080A12',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        pt: 6,
        pb: 5
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {/* Logo & Info */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              onClick={() => navigate('/')}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5, cursor: 'pointer' }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4L12 2L20 4V12L12 22L4 12V4Z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M9 8V16M9 8L15 16M15 8V16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Ivestbot
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: '#9CA3AF', maxWidth: 360, lineHeight: 1.6, mb: 2 }}>
              The premier Web3 automated crypto yield & 24h reservation doubling protocol. Smart algorithmic arbitrage and lifetime multi-tier referral commissions.
            </Typography>

            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Built for high-performance traders and global liquidity nodes.
            </Typography>
          </Grid>

          {/* Platform Links */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', mb: 2 }}>
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Link onClick={() => navigate('/reservation')} sx={{ color: '#9CA3AF', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#a78bfa' }, fontSize: '0.88rem' }}>
                Reservations
              </Link>
              <Link onClick={() => navigate('/wallet')} sx={{ color: '#9CA3AF', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#a78bfa' }, fontSize: '0.88rem' }}>
                Wallet & Ledger
              </Link>
              <Link onClick={() => navigate('/referrals')} sx={{ color: '#9CA3AF', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#a78bfa' }, fontSize: '0.88rem' }}>
                Affiliate Hub
              </Link>
              <Link onClick={() => navigate('/profile')} sx={{ color: '#9CA3AF', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#a78bfa' }, fontSize: '0.88rem' }}>
                Account Overview
              </Link>
            </Box>
          </Grid>

          {/* Protocol Links */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', mb: 2 }}>
              Protocol
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
                Smart Contracts
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
                Audits & Proof
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
                Node Network
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
                Security Vaults
              </Typography>
            </Box>
          </Grid>

          {/* Community & Legal */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', mb: 2 }}>
              Compliance & Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
                Terms of Service
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.88rem' }}>
                KYC Guidelines
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Copyright */}
        <Box
          sx={{
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            © {new Date().getFullYear()} Ivestbot Protocol. All rights reserved.
          </Typography>

          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            24h Algorithmic Yield Protocol • Principle Doubling in 35 Days
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
