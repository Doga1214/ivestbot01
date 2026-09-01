import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  NotificationsNoneIcon,
  LogoutIcon,
  PersonOutlineIcon,
  AdminPanelSettingsIcon
} from '../common/Icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatUSDT } from '../../utils/formatters';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, wallet, isAuthenticated, logout, openLoginModal, openRegisterModal, openAnnouncement } = useApp();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Reservation', path: '/reservation' },
    { label: 'Wallet', path: '/wallet' },
    { label: 'Profile', path: '/profile' }
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'rgba(8, 10, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'none'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 70, justifyContent: 'space-between' }}>
          {/* Logo Brand */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>I</Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              IVESTBOT
            </Typography>
          </Box>

          {/* Desktop Nav Links (Exactly 4 user pages) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    px: 2,
                    py: 0.8,
                    fontWeight: 700,
                    color: isActive ? '#a78bfa' : '#9CA3AF',
                    backgroundColor: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid transparent',
                    '&:hover': {
                      color: '#ffffff',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Right Action / User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Announcement Bell Trigger */}
            <Tooltip title="Platform Announcements & Bonus Updates">
              <IconButton
                onClick={openAnnouncement}
                size="small"
                sx={{
                  color: '#a78bfa',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  bgcolor: 'rgba(139, 92, 246, 0.1)'
                }}
              >
                <NotificationsNoneIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <>
                {/* Wallet Balance Badge */}
                <Box
                  onClick={() => navigate('/wallet')}
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: 1,
                    px: 1.8,
                    py: 0.7,
                    borderRadius: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#8b5cf6' }
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>
                    USDT:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399' }}>
                    {formatUSDT(wallet.availableBalance)}
                  </Typography>
                </Box>

                {/* Level Chip */}
                <Chip
                  label={`LVL ${user?.level || 1}`}
                  color="primary"
                  size="small"
                  onClick={() => navigate('/profile')}
                  sx={{ fontWeight: 800, cursor: 'pointer' }}
                />

                {/* Profile Avatar Button */}
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    p: 0.5,
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff'
                  }}
                >
                  <PersonOutlineIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        backgroundColor: '#111522',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff' }}>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      @{user?.username}
                    </Typography>
                  </Box>
                  <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                    <ListItemIcon>
                      <PersonOutlineIcon fontSize="small" sx={{ color: '#a78bfa' }} />
                    </ListItemIcon>
                    <ListItemText primary="My Profile & Team" />
                  </MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); navigate('/wallet'); }}>
                    <ListItemIcon>
                      <NotificationsNoneIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                    </ListItemIcon>
                    <ListItemText primary="Wallet & Deposits" />
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: '#f87171' }} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" sx={{ color: '#f87171' }} />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  onClick={openLoginModal}
                  sx={{ fontWeight: 700, color: '#ffffff' }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => openRegisterModal()}
                  sx={{ fontWeight: 700, px: 2.5 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
