import React from 'react';
import { Box } from '@mui/material';
import { Hero } from '../components/home/Hero';
import { PlatformFeatures } from '../components/home/PlatformFeatures';
import { HowItWorks } from '../components/home/HowItWorks';
import { LevelOverview } from '../components/home/LevelOverview';
import { ReferralOverview } from '../components/home/ReferralOverview';
import { FAQ } from '../components/home/FAQ';
import { Footer } from '../components/home/Footer';
import { AnnouncementModal } from '../components/home/AnnouncementModal';
import { useApp } from '../context/AppContext';

export const Home: React.FC = () => {
  const { isAnnouncementOpen, closeAnnouncement } = useApp();

  return (
    <Box>
      <AnnouncementModal open={isAnnouncementOpen || undefined} onClose={closeAnnouncement} />
      <Hero />
      <PlatformFeatures />
      <HowItWorks />
      <LevelOverview />
      <ReferralOverview />
      <FAQ />
      <Footer />
    </Box>
  );
};
