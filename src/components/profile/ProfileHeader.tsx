import React, { useState, useRef } from 'react';
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
  CheckCircleIcon,
  ContentCopyIcon,
  HourglassBottomIcon,
  ShieldOutlinedIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  onOpenKyc?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onOpenKyc }) => {
  const { user, kyc, logout, updateUserProfile, showSnackbar } = useApp();
  const navigate = useNavigate();
  const [showUsername, setShowUsername] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    showSnackbar('Logged out successfully.', 'info');
  };

  const isKycVerified = user.kycStatus === 'VERIFIED' || kyc?.status === 'VERIFIED';
  const isKycPending = user.kycStatus === 'PENDING' || kyc?.status === 'PENDING';

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`${label} copied to clipboard!`, 'success');
  };

  // Profile Image Upload handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Image size should be less than 5MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      updateUserProfile({ avatarUrl: result });
      showSnackbar('Profile picture updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Clean numeric or short UUID for display
  const displayUuid = user.id ? user.id.replace(/-/g, '').slice(0, 8).toUpperCase() : '15239596';

  return (
    <Box sx={{ mb: 2.5 }}>
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

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
            {/* User Avatar with Camera Badge */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Box
                onClick={handleAvatarClick}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a8a, #4338ca, #8b5cf6)',
                  p: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.03)'
                  }
                }}
              >
                {user.avatarUrl ? (
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name || user.username}
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      bgcolor: '#0B0F19',
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#60a5fa'
                    }}
                  >
                    {user.username ? user.username.substring(0, 2).toUpperCase() : 'NL'}
                  </Avatar>
                )}
              </Box>

              {/* Camera Icon Overlay */}
              <Box
                onClick={handleAvatarClick}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: '#00E5FF',
                  border: '2px solid #121422',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#000',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#38bdf8',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>

            {/* Username, UUID & Badges */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {/* Username with Eye Toggle & Copy Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: showUsername ? 'normal' : '0.15em',
                    color: '#ffffff',
                    fontFamily: showUsername ? 'inherit' : 'monospace',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase'
                  }}
                >
                  {showUsername ? user.username : '••••••••'}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => setShowUsername(!showUsername)}
                  sx={{ color: '#9CA3AF', p: 0.5, '&:hover': { color: '#ffffff' } }}
                >
                  {showUsername ? <VisibilityIcon sx={{ fontSize: 18 }} /> : <VisibilityOffIcon sx={{ fontSize: 18 }} />}
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => handleCopy(user.username, 'Username')}
                  sx={{ color: '#9CA3AF', p: 0.5, '&:hover': { color: '#ffffff' } }}
                >
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              {/* UUID with Copy Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.85rem' }}>
                  UUID: {displayUuid}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(displayUuid, 'UUID')}
                  sx={{ color: '#9CA3AF', p: 0.25, '&:hover': { color: '#ffffff' } }}
                >
                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>

              {/* Badges: Level & KYC Status */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {/* Level Badge */}
                <Chip
                  label={`Level ${user.level || 1}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    height: 26,
                    borderRadius: 2,
                    px: 0.5
                  }}
                />

                {/* KYC Status Badge (Replacing Points Badge as requested) */}
                <Chip
                  icon={
                    isKycVerified ? (
                      <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />
                    ) : isKycPending ? (
                      <HourglassBottomIcon sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />
                    ) : (
                      <ShieldOutlinedIcon sx={{ fontSize: '14px !important', color: '#9CA3AF !important' }} />
                    )
                  }
                  label={
                    isKycVerified
                      ? 'KYC Verified'
                      : isKycPending
                      ? 'KYC Pending'
                      : 'KYC Unverified'
                  }
                  size="small"
                  sx={{
                    bgcolor: isKycVerified
                      ? 'rgba(16, 185, 129, 0.12)'
                      : isKycPending
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(255, 255, 255, 0.06)',
                    border: isKycVerified
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : isKycPending
                      ? '1px solid rgba(245, 158, 11, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    color: isKycVerified
                      ? '#34d399'
                      : isKycPending
                      ? '#fbbf24'
                      : '#9CA3AF',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    height: 26,
                    borderRadius: 2,
                    px: 0.5
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
              py: 1.5,
              borderRadius: 3.5,
              fontWeight: 800,
              fontSize: '0.95rem',
              letterSpacing: '0.02em',
              background: isKycVerified
                ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                : isKycPending
                ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              boxShadow: isKycVerified
                ? '0 8px 24px rgba(16, 185, 129, 0.3)'
                : '0 8px 24px rgba(139, 92, 246, 0.35)',
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: isKycVerified
                  ? 'linear-gradient(135deg, #047857 0%, #059669 100%)'
                  : isKycPending
                  ? 'linear-gradient(135deg, #b45309 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
                boxShadow: '0 10px 28px rgba(139, 92, 246, 0.45)'
              }
            }}
          >
            {isKycVerified ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize="small" /> Identity Verified (KYC Completed)
              </Box>
            ) : isKycPending ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HourglassBottomIcon fontSize="small" /> KYC Under Review
              </Box>
            ) : (
              'Complete Your KYC'
            )}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
