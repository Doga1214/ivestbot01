import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  AdminPanelSettingsIcon,
  LockOutlinedIcon,
  VisibilityIcon,
  VisibilityOffIcon
} from '../common/Icons';

interface AdminAuthGateProps {
  onSuccess: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ onSuccess }) => {
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const validKeys = ['admin123', 'admin', 'ivestbot2026', 'masterkey'];
      if (validKeys.includes(passkey.trim())) {
        localStorage.setItem('ivestbot_admin_session', 'true');
        onSuccess();
      } else {
        setError('Invalid Admin Security Passkey. Default key is: admin123');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <Box
      sx={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 460,
          width: '100%',
          p: { xs: 2.5, sm: 4 },
          background: 'linear-gradient(145deg, #111528 0%, #0d101d 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 36, color: '#ffffff' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
              Admin Control Plane
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Restricted backend management portal. Enter master passkey to access.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Master Admin Passkey"
              placeholder="e.g. admin123"
              type={showPassword ? 'text' : 'password'}
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              required
              autoFocus
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#8b5cf6' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#9CA3AF' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 800,
                fontSize: '1rem',
                borderRadius: 2.5
              }}
            >
              {loading ? 'Authenticating...' : 'Unlock Admin Portal'}
            </Button>
          </form>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Default development key: <code style={{ color: '#a78bfa' }}>admin123</code>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
