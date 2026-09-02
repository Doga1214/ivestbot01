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
        zIndex: 1100,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#0B0E17'
      }}
      elevation={8}
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
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            color: '#9CA3AF',
            minWidth: 0,
            '&.Mui-selected': {
              color: '#a78bfa'
            }
          }
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeOutlinedIcon />} />
        <BottomNavigationAction label="Reserve" icon={<EventAvailableOutlinedIcon />} />
        <BottomNavigationAction label="Wallet" icon={<AccountBalanceWalletOutlinedIcon />} />
        <BottomNavigationAction label="Referrals" icon={<GroupsIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonOutlineOutlinedIcon />} />
      </BottomNavigation>
    </Paper>
  );
};
