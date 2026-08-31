import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AdminPanelSettingsIcon,
  LogoutIcon,
  RefreshIcon,
  HomeOutlinedIcon,
  SendIcon
} from '../common/Icons';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
  onBroadcast?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onRefresh, onLogout, onBroadcast }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3.5,
        p: 2.5,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(30, 41, 59, 0.6) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
          }}
        >
          <AdminPanelSettingsIcon sx={{ color: '#fff', fontSize: 28 }} />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Master Admin Control Plane
            </Typography>
            <Chip
              label="WP Swings Engine Active"
              color="secondary"
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.7rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            Direct financial control, deposit verification queue, user wallet restriction, & audit logs.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
        {onBroadcast && (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<SendIcon />}
            onClick={onBroadcast}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Broadcast Notice
          </Button>
        )}

        <Tooltip title="Refresh Platform State">
          <IconButton
            onClick={onRefresh}
            sx={{
              color: '#a78bfa',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button
          variant="outlined"
          size="small"
          startIcon={<HomeOutlinedIcon />}
          onClick={() => navigate('/')}
          sx={{
            color: '#e2e8f0',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            fontWeight: 700
          }}
        >
          User Front
        </Button>

        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{ fontWeight: 700 }}
        >
          Exit Admin
        </Button>
      </Box>
    </Box>
  );
};
