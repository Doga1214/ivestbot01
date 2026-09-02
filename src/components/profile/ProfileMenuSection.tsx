import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  SettingsIcon,
  ShieldOutlinedIcon,
  SchoolIcon,
  BarChartIcon,
  WarningAmberIcon,
  ChevronRightIcon,
  CloseIcon,
  CheckCircleIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const ProfileMenuSection: React.FC = () => {
  const { user, updateUserProfile, showSnackbar } = useApp();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  // Settings form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');

  // 2FA state simulation
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  const handleSaveSettings = () => {
    if (!editUsername.trim()) {
      showSnackbar('Username cannot be empty.', 'error');
      return;
    }
    updateUserProfile({
      name: editName.trim(),
      username: editUsername.trim()
    });
    setSettingsOpen(false);
  };

  const menuItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon sx={{ color: '#a855f7', fontSize: 24 }} />,
      onClick: () => {
        setEditName(user?.name || '');
        setEditUsername(user?.username || '');
        setSettingsOpen(true);
      }
    },
    {
      id: 'security',
      label: 'Security (2FA)',
      icon: <ShieldOutlinedIcon sx={{ color: '#a855f7', fontSize: 24 }} />,
      onClick: () => setSecurityOpen(true)
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: <SchoolIcon sx={{ color: '#a855f7', fontSize: 24 }} />,
      onClick: () => setLearnOpen(true)
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: <BarChartIcon sx={{ color: '#a855f7', fontSize: 24 }} />,
      onClick: () => setLeaderboardOpen(true)
    },
    {
      id: 'disclaimer',
      label: 'Disclaimer',
      icon: <WarningAmberIcon sx={{ color: '#a855f7', fontSize: 24 }} />,
      onClick: () => setDisclaimerOpen(true)
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
      {menuItems.map(item => (
        <Paper
          key={item.id}
          onClick={item.onClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 2,
            bgcolor: '#111522',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3.5,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            '&:hover': {
              bgcolor: 'rgba(139, 92, 246, 0.08)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              transform: 'translateX(4px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: 'rgba(168, 85, 247, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {item.icon}
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
              {item.label}
            </Typography>
          </Box>

          <ChevronRightIcon sx={{ color: '#9CA3AF', fontSize: 22 }} />
        </Paper>
      ))}

      {/* ─── MODAL: SETTINGS ────────────────────────────────────── */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="xs"
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Account Settings
          </Typography>
          <IconButton onClick={() => setSettingsOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Username"
              value={editUsername}
              onChange={e => setEditUsername(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Email Address"
              value={user?.email || ''}
              disabled
              fullWidth
              size="small"
              helperText="Email is bound to account and cannot be modified."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSettingsOpen(false)} sx={{ color: '#9CA3AF', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── MODAL: SECURITY (2FA) ──────────────────────────────── */}
      <Dialog
        open={securityOpen}
        onClose={() => setSecurityOpen(false)}
        maxWidth="xs"
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Security & Two-Factor Auth (2FA)
          </Typography>
          <IconButton onClick={() => setSecurityOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2.5, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                  Google Authenticator (2FA)
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  Secure withdrawals and account login with OTP codes.
                </Typography>
              </Box>
              <Switch
                checked={is2faEnabled}
                onChange={e => {
                  setIs2faEnabled(e.target.checked);
                  showSnackbar(
                    e.target.checked ? '2FA protection enabled successfully!' : '2FA disabled.',
                    e.target.checked ? 'success' : 'info'
                  );
                }}
                color="secondary"
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#34d399', mb: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                SSL & On-Chain Encryption Active
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              All wallet transactions are secured by TRC20 and multi-signature cold storage.
            </Typography>
          </Paper>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: LEARN ───────────────────────────────────────── */}
      <Dialog
        open={learnOpen}
        onClose={() => setLearnOpen(false)}
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            How NFT Legend Works
          </Typography>
          <IconButton onClick={() => setLearnOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#a78bfa', mb: 0.5 }}>
                1. 24-Hour Cycle Doubling
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Reserve funds for a 24-hour cycle. The system yields 2.857% daily return, compounding to double your full principal in 35 active cycles.
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#38bdf8', mb: 0.5 }}>
                2. 20-Second Automated Settlement
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                When your mining or doubling cycle completes, claim your returns with automated on-chain proof within 20 seconds.
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399', mb: 0.5 }}>
                3. Three-Tier Team Commissions
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Earn 10% on Level A, 5% on Level B, and 2% on Level C whenever downline members place doubling reservations.
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: LEADERBOARD ─────────────────────────────────── */}
      <Dialog
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        maxWidth="xs"
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Top Community Earners
          </Typography>
          <IconButton onClick={() => setLeaderboardOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <List sx={{ p: 0 }}>
            {[
              { rank: 1, user: 'CryptoTitan', amount: '18,450 USDT', color: '#FFD700' },
              { rank: 2, user: 'AlphaWhale', amount: '12,980 USDT', color: '#C0C0C0' },
              { rank: 3, user: 'MatrixNode', amount: '9,430 USDT', color: '#CD7F32' },
              { rank: 4, user: 'CyberMaster', amount: '6,210 USDT', color: '#a78bfa' }
            ].map(item => (
              <ListItem
                key={item.rank}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.04)',
                  borderRadius: 2,
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: item.color, width: 20 }}>
                    #{item.rank}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff' }}>
                    @{item.user}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399' }}>
                  {item.amount}
                </Typography>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: DISCLAIMER ──────────────────────────────────── */}
      <Dialog
        open={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <WarningAmberIcon sx={{ color: '#f59e0b' }} />
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Platform & Risk Disclaimer
            </Typography>
          </Box>
          <IconButton onClick={() => setDisclaimerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.6 }}>
            Digital asset investments and algorithmic reservation pools involve significant financial market risk. Historical returns do not guarantee future profitability. Please ensure full compliance with your local digital currency regulations and never deposit funds you cannot afford to risk.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
