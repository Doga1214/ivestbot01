import React from 'react';
import { Box } from '@mui/material';
import { Hero } from '../components/home/Hero';
import { TrustTicker } from '../components/home/TrustTicker';
import { PlatformStatsBar } from '../components/home/PlatformStatsBar';
import { TrendingPools } from '../components/home/TrendingPools';
import { PlatformFeatures } from '../components/home/PlatformFeatures';
import { HowItWorks } from '../components/home/HowItWorks';
import { LiveActionDemo } from '../components/home/LiveActionDemo';
import { BottomCtaBanner } from '../components/home/BottomCtaBanner';
import { Footer } from '../components/home/Footer';
import { AnnouncementModal } from '../components/home/AnnouncementModal';
import { useApp } from '../context/AppContext';

export const Home: React.FC = () => {
  const { isAnnouncementOpen, closeAnnouncement } = useApp();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#080A12' }}>
      {/* Global Announcement Alert Modal if active */}
      <AnnouncementModal open={isAnnouncementOpen || undefined} onClose={closeAnnouncement} />

      {/* 1. Hero Section with 4 Floating Cyber Asset Cards */}
      <Hero />

      {/* 2. Trust Ticker Bar */}
      <TrustTicker />

      {/* 3. Platform Stats KPI Bar */}
      <PlatformStatsBar />

      {/* 4. Trending Collections & 24h Ranking Pools */}
      <TrendingPools />

      {/* 5. Everything You Need to Thrive in Web3 Feature Grid */}
      <PlatformFeatures />

      {/* 6. Three Steps to Your First Reward Timeline */}
      <HowItWorks />

      {/* 7. See Ivestbot in Action Video/Simulation Container */}
      <LiveActionDemo />

      {/* 8. Bottom Gradient CTA Banner */}
      <BottomCtaBanner />

      {/* 9. Modern Web3 Footer */}
      <Footer />
    </Box>
  );
};

export default Home;
