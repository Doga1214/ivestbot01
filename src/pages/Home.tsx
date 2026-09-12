import React from 'react';
import { Box } from '@mui/material';
import { Hero } from '../components/home/Hero';
import { CryptoLiveTicker } from '../components/home/CryptoLiveTicker';
import { TrustTicker } from '../components/home/TrustTicker';
import { PlatformStatsBar } from '../components/home/PlatformStatsBar';
import { TrendingPools } from '../components/home/TrendingPools';
import { YieldCalculator } from '../components/home/YieldCalculator';
import { PlatformFeatures } from '../components/home/PlatformFeatures';
import { LevelOverview } from '../components/home/LevelOverview';
import { ReferralOverview } from '../components/home/ReferralOverview';
import { HowItWorks } from '../components/home/HowItWorks';
import { LiveActionDemo } from '../components/home/LiveActionDemo';
import { FAQ } from '../components/home/FAQ';
import { BottomCtaBanner } from '../components/home/BottomCtaBanner';
import { Footer } from '../components/home/Footer';
import { AnnouncementModal } from '../components/home/AnnouncementModal';
import { useApp } from '../context/AppContext';

export const Home: React.FC = () => {
  const { isAnnouncementOpen, closeAnnouncement } = useApp();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#080A12', color: '#ffffff', overflowX: 'hidden' }}>
      {/* Global Announcement Alert Modal if active */}
      <AnnouncementModal open={isAnnouncementOpen || undefined} onClose={closeAnnouncement} />

      {/* 1. Hero Section with Live 45-Day 2.22% Doubling Metrics & Floating Cyber Asset Cards */}
      <Hero />

      {/* 2. Live Multi-Crypto Price Stream Ticker (BTC, ETH, SOL, BNB, TRX, TON) */}
      <CryptoLiveTicker />

      {/* 3. Platform Trust & Backer Ticker Bar */}
      <TrustTicker />

      {/* 4. Live Platform Key Metrics & Stats Bar */}
      <PlatformStatsBar />

      {/* 5. Trending 24H Liquidity Reservation Pools & Leaderboard */}
      <TrendingPools />

      {/* 6. Interactive 45-Day 2.22% Daily Yield & ROI Calculator */}
      <YieldCalculator />

      {/* 7. Institutional Web3 Platform Features */}
      <PlatformFeatures />

      {/* 8. VIP Tier Architecture & Progression */}
      <LevelOverview />

      {/* 9. 3-Tier Community Referral & Instant Milestone Bonus Breakdown */}
      <ReferralOverview />

      {/* 10. Three Simple Steps to Your First Daily Reward */}
      <HowItWorks />

      {/* 11. Interactive Live Yield Simulation Engine */}
      <LiveActionDemo />

      {/* 12. Frequently Asked Questions Accordion */}
      <FAQ />

      {/* 13. High-Impact Bottom Call to Action Banner */}
      <BottomCtaBanner />

      {/* 14. Modern Web3 Footer */}
      <Footer />
    </Box>
  );
};

export default Home;
