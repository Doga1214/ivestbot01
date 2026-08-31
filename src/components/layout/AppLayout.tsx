import React from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#080A12',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.08) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.05) 0px, transparent 50%)
        `,
        pb: { xs: 9, md: 4 } // padding for mobile bottom nav
      }}
    >
      <Header />
      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 2.5, md: 4 } }}>
        {children}
      </Container>
      <MobileBottomNav />
    </Box>
  );
};
