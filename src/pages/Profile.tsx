import React from 'react';
import { Box, Typography } from '@mui/material';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { LevelCard } from '../components/profile/LevelCard';
import { ReferralSection } from '../components/profile/ReferralSection';
import { ReferralTree } from '../components/profile/ReferralTree';
import { ReferralEarnings } from '../components/profile/ReferralEarnings';

export const Profile: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          My Account & Team Overview
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          Manage your account profile, tier status, referral network, and commission earnings.
        </Typography>
      </Box>

      {/* User Information */}
      <ProfileHeader />

      {/* Level 1-4 Tier Card */}
      <LevelCard />

      {/* Referral Link & Member Counts */}
      <ReferralSection />

      {/* A/B/C Expandable Tree */}
      <ReferralTree />

      {/* Commission Earnings & Ledger */}
      <ReferralEarnings />
    </Box>
  );
};
