import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CloseIcon,
  VisibilityIcon,
  VisibilityOffIcon,
  LockOutlinedIcon,
  PersonOutlineIcon
} from '../common/Icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, openRegisterModal, login } = useApp();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setError('Please enter your username or email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(usernameOrEmail, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err?.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isLoginModalOpen}
      onClose={closeLoginModal}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            p: 1,
            background: '#111522',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <LockOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Login to Ivestbot
          </Typography>
        </Box>
        <IconButton onClick={closeLoginModal} sx={{ color: '#9CA3AF' }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
          Enter your account details to access your reservation wallet.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username or Email"
            variant="outlined"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            margin="normal"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: '#6B7280' }} fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#6B7280' }} fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: '#6B7280' }}
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
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
            sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Don't have an account?{' '}
              <Typography
                component="span"
                variant="body2"
                onClick={() => {
                  closeLoginModal();
                  openRegisterModal();
                }}
                sx={{
                  color: '#a78bfa',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Register here
              </Typography>
            </Typography>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};
