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
  TetherIcon
} from '../common/Icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatUSDT } from '../../utils/formatters';
import { LuckySpinModal } from '../spin/LuckySpinModal';
import { Sparkles, Bot } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, wallet, isAuthenticated, logout, openLoginModal, openRegisterModal, openAnnouncement, openChat } = useApp();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [spinModalOpen, setSpinModalOpen] = React.useState<boolean>(false);
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
    { label: 'Referrals', path: '/referrals' },
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
        <Toolbar disableGutters sx={{ minHeight: { xs: 58, sm: 64, md: 70 }, justifyContent: 'space-between', px: { xs: 1, sm: 0 } }}>
          {/* Logo Brand */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.2 },
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <Box
              sx={{
                width: { xs: 32, sm: 38 },
                height: { xs: 32, sm: 38 },
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.05rem', sm: '1.2rem' }, color: '#fff' }}>I</Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
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
            {/* 24/7 AI Support Trigger */}
            <Tooltip title="24/7 AI & Live Support">
              <IconButton
                onClick={openChat}
                size="small"
                sx={{
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  bgcolor: 'rgba(59, 130, 246, 0.12)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(59, 130, 246, 0.25)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Bot size={18} />
              </IconButton>
            </Tooltip>

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
                    gap: 0.8,
                    px: 1.8,
                    py: 0.7,
                    borderRadius: 3,
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#10b981',
                      bgcolor: 'rgba(16, 185, 129, 0.15)'
                    }
                  }}
                >
                  <TetherIcon sx={{ fontSize: 16 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399' }}>
                    {formatUSDT(wallet.availableBalance)}
                  </Typography>
                </Box>

                {/* Lucky Spin Quick Chip */}
                <Chip
                  icon={<Sparkles size={14} color="#0F172A" />}
                  label="Spin & Win"
                  size="small"
                  onClick={() => setSpinModalOpen(true)}
                  sx={{
                    fontWeight: 900,
                    cursor: 'pointer',
                    bgcolor: '#F59E0B',
                    color: '#0F172A',
                    boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#FBBF24',
                      transform: 'scale(1.04)'
                    }
                  }}
                />

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
                  <MenuItem onClick={() => { handleMenuClose(); setSpinModalOpen(true); }}>
                    <ListItemIcon>
                      <Sparkles size={18} color="#F59E0B" />
                    </ListItemIcon>
                    <ListItemText primary="Lucky Spin Wheel" sx={{ color: '#FEF08A', fontWeight: 700 }} />
                  </MenuItem>
                  <MenuItem onClick={() => { handleMenuClose(); openChat(); }}>
                    <ListItemIcon>
                      <Bot size={18} color="#60a5fa" />
                    </ListItemIcon>
                    <ListItemText primary="24/7 AI Support" sx={{ color: '#93c5fd', fontWeight: 700 }} />
                  </MenuItem>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.5 } }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={openLoginModal}
                  sx={{ fontWeight: 700, color: '#ffffff', px: { xs: 1.2, sm: 2 }, fontSize: { xs: '0.82rem', sm: '0.9rem' } }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => openRegisterModal()}
                  sx={{ fontWeight: 700, px: { xs: 1.6, sm: 2.5 }, fontSize: { xs: '0.82rem', sm: '0.9rem' } }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {user?.id && (
        <LuckySpinModal
          isOpen={spinModalOpen}
          onClose={() => setSpinModalOpen(false)}
          userId={user.id}
          userLevel={user.level || 1}
        />
      )}
    </AppBar>
  );
};
