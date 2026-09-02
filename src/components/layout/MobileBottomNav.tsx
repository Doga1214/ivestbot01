import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import {
  HomeOutlinedIcon,
  EventAvailableOutlinedIcon,
  AccountBalanceWalletOutlinedIcon,
  PersonOutlineOutlinedIcon,
  GroupsIcon
} from '../common/Icons';
import { useNavigate, useLocation } from 'react-router-dom';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    switch (location.pathname) {
      case '/':
        return 0;
      case '/reservation':
        return 1;
      case '/wallet':
        return 2;
      case '/referrals':
        return 3;
      case '/profile':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', md: 'none' },
        zIndex: 1200,
        borderTop: '1px solid rgba(255, 255, 255, 0.09)',
        background: 'rgba(11, 14, 23, 0.92)',
        backdropFilter: 'blur(20px)',
        pb: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.5)'
      }}
      elevation={12}
    >
      <BottomNavigation
        showLabels
        value={getActiveTab()}
        onChange={(_event, newValue) => {
          switch (newValue) {
            case 0:
              navigate('/');
              break;
            case 1:
              navigate('/reservation');
              break;
            case 2:
              navigate('/wallet');
              break;
            case 3:
              navigate('/referrals');
              break;
            case 4:
              navigate('/profile');
              break;
          }
        }}
        sx={{
          backgroundColor: 'transparent',
          height: 60,
          '& .MuiBottomNavigationAction-root': {
            color: '#858E9E',
            minWidth: 0,
            padding: '6px 0',
            transition: 'all 0.2s ease',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.68rem',
              fontWeight: 600,
              mt: 0.3,
              letterSpacing: '-0.01em',
              '&.Mui-selected': {
                fontSize: '0.72rem',
                fontWeight: 800
              }
            },
            '&.Mui-selected': {
              color: '#c4b5fd',
              '& .MuiSvgIcon-root': {
                transform: 'translateY(-2px) scale(1.1)',
                filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.6))',
                transition: 'transform 0.2s ease'
              }
            }
          }
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeOutlinedIcon sx={{ fontSize: 22 }} />} />
        <BottomNavigationAction label="Reserve" icon={<EventAvailableOutlinedIcon sx={{ fontSize: 22 }} />} />
        <BottomNavigationAction label="Wallet" icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 22 }} />} />
        <BottomNavigationAction label="Referrals" icon={<GroupsIcon sx={{ fontSize: 22 }} />} />
        <BottomNavigationAction label="Profile" icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />} />
      </BottomNavigation>
    </Paper>
  );
};
