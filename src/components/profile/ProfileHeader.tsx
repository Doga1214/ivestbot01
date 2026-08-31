import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip, Button } from '@mui/material';
import {
  EditIcon,
  VerifiedIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const ProfileHeader: React.FC = () => {
  const { user, showSnackbar } = useApp();

  if (!user) return null;

  return (
    <Card
      sx={{
        background: 'linear-gradient(145deg, #111522 0%, #171B2A 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
        mb: 4
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2.5
          }}
        >
          {/* User Info Left */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                fontSize: '1.6rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {user.name}
                </Typography>
                <VerifiedIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                <Chip
                  label={user.status}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                @{user.username} &nbsp;•&nbsp; {user.email}
              </Typography>

              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 0.5 }}>
                User ID: {user.id} &nbsp;•&nbsp; Sponsor Code: {user.referredBy || 'DIRECT'}
              </Typography>
            </Box>
          </Box>

          {/* Edit Profile Action */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => showSnackbar('Profile details synced with account database.', 'info')}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(139, 92, 246, 0.08)'
              }
            }}
          >
            Edit Profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
