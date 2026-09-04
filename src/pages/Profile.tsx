import React, { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileWalletIncomeCard } from '../components/profile/ProfileWalletIncomeCard';
import { ProfileTeamCard } from '../components/profile/ProfileTeamCard';
import { ProfileMenuSection } from '../components/profile/ProfileMenuSection';
import { KycPanel } from '../components/wallet/KycPanel';
import { CloseIcon } from '../components/common/Icons';

export const Profile: React.FC = () => {
  const [kycDialogOpen, setKycDialogOpen] = useState<boolean>(false);

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', pb: 12, px: { xs: 1.5, sm: 2 } }}>
      {/* 1. User Identity & Top KYC Card with Photo Upload & Status */}
      <ProfileHeader onOpenKyc={() => setKycDialogOpen(true)} />

      {/* 2. Wallet Balance & 7 Income Matrix Rows Card */}
      <ProfileWalletIncomeCard />

      {/* 3. My Team Stats (100% Real Data) & 4 Action Buttons Card */}
      <ProfileTeamCard />

      {/* 4. Settings, Security (2FA), Learn, Leaderboard, Disclaimer Menu */}
      <ProfileMenuSection />

      {/* ─── MODAL: KYC VERIFICATION ───────────────────────────────── */}
      <Dialog
        open={kycDialogOpen}
        onClose={() => setKycDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              backgroundImage: 'none',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 3.5,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Identity & KYC Compliance
          </Typography>
          <IconButton onClick={() => setKycDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <KycPanel />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Profile;
