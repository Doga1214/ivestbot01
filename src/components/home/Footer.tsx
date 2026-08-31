import React from 'react';
import { Box, Typography, Container, Divider, Stack } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box sx={{ mt: 8, pt: 4, pb: 4, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ffffff 30%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            IVESTBOT
          </Typography>

          <Stack direction="row" spacing={3} sx={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
            <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>
              Terms of Service
            </Typography>
            <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>
              Privacy Policy
            </Typography>
            <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>
              Risk Disclaimer
            </Typography>
            <Typography variant="caption" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>
              Support
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(255, 255, 255, 0.05)' }} />

        <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', textAlign: 'center', lineHeight: 1.6 }}>
          © {new Date().getFullYear()} Ivestbot. All rights reserved. Configured rates and demo trade records are product parameters for simulation and testing purposes.
        </Typography>
      </Container>
    </Box>
  );
};
