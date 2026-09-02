import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  VisibilityIcon,
  VisibilityOffIcon,
  PhotoCameraIcon,
  ExitToAppIcon,
  CheckCircleIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  onOpenKyc?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onOpenKyc }) => {
  const { user, kyc, logout, showSnackbar } = useApp();
  const navigate = useNavigate();
  const [showUsername, setShowUsername] = useState<boolean>(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    showSnackbar('Logged out successfully.', 'info');
  };

  const isKycVerified = user.kycStatus === 'VERIFIED' || kyc?.status === 'VERIFIED';
  const isKycPending = user.kycStatus === 'PENDING' || kyc?.status === 'PENDING';

  // Dynamic user points based on activity/balance
  const userPoints = 1000 + (user.level * 85);

  return (
    <Box sx={{ mb: 2.5 }}>
      {/* App Top Title Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          px: 0.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}
          >
            {/* Geometric N/I shape */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 4L12 2L20 4V12L12 22L4 12V4Z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 8V16M9 8L15 16M15 8V16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Ivestbot
          </Typography>
        </Box>

        <Tooltip title="Log Out">
          <IconButton
            onClick={handleLogout}
            sx={{
              color: '#9CA3AF',
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' }
            }}
          >
            <ExitToAppIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* User Identity & KYC Card */}
      <Card
        sx={{
          background: 'linear-gradient(145deg, #121422 0%, #161a29 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* Avatar and Masked Info Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.5 }}>
            {/* Cyber-Hexagon Avatar Frame with Camera Badge */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: 3.5,
                  background: 'linear-gradient(135deg, #1e3a8a, #4338ca, #6d28d9)',
                  p: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)'
                }}
              >
                <Avatar
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: '#0B0F19',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    color: '#60a5fa'
                  }}
                >
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M8 8V16M8 8L16 16M16 8V16" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Avatar>
              </Box>

              {/* Camera Icon Overlay */}
              <Box
                onClick={() => showSnackbar('Avatar customized for your Ivestbot account.', 'info')}
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: '#38bdf8',
                  border: '2px solid #121422',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#000',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>

            {/* Username & Badges */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {/* Masked Username with Eye Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: showUsername ? 'normal' : '0.2em',
                    color: '#ffffff',
                    fontFamily: showUsername ? 'inherit' : 'monospace',
                    fontSize: showUsername ? '1.05rem' : '1.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {showUsername ? `@${user.username}` : '•••••••••••••'}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => setShowUsername(!showUsername)}
                  sx={{ color: '#9CA3AF', p: 0.5, '&:hover': { color: '#ffffff' } }}
                >
                  {showUsername ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </Box>

              {/* Pills / Badges */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Level ${user.level || 2}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    height: 26,
                    borderRadius: 2
                  }}
                />

                <Chip
                  label={`${userPoints} IVEST pts`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    height: 26,
                    borderRadius: 2
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Full-Width Action Button: Complete Your KYC */}
          <Button
            fullWidth
            variant="contained"
            onClick={onOpenKyc}
            sx={{
              py: 1.4,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '0.95rem',
              letterSpacing: '0.02em',
              background: isKycVerified
                ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                : isKycPending
                ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              boxShadow: isKycVerified
                ? '0 8px 24px rgba(16, 185, 129, 0.3)'
                : '0 8px 24px rgba(124, 58, 237, 0.35)',
              textTransform: 'none',
              '&:hover': {
                background: isKycVerified
                  ? 'linear-gradient(135deg, #047857 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)'
              }
            }}
          >
            {isKycVerified ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize="small" /> Identity Verified (KYC Completed)
              </Box>
            ) : isKycPending ? (
              'KYC Under Review'
            ) : (
              'Complete Your KYC'
            )}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
