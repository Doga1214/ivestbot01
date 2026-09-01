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
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  CloseIcon,
  VisibilityIcon,
  VisibilityOffIcon,
  HowToRegOutlinedIcon,
  PersonOutlineIcon,
  MailOutlineIcon,
  LockOutlinedIcon,
  CardGiftcardIcon
} from '../common/Icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const RegisterModal: React.FC = () => {
  const { isRegisterModalOpen, closeRegisterModal, openLoginModal, initialReferralCode, register } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode || '');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial referral code if changed
  React.useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode);
    }
  }, [initialReferralCode]);

  if (!isRegisterModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedTerms) {
      setError('Please agree to the Terms and Conditions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        referralCode: referralCode.trim() || undefined
      });
      navigate('/profile');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isRegisterModalOpen}
      onClose={closeRegisterModal}
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
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <HowToRegOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Create Account
          </Typography>
        </Box>
        <IconButton onClick={closeRegisterModal} sx={{ color: '#9CA3AF' }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
          Join Ivestbot to start 24-hour daily reservations and build your referral team.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            margin="dense"
            required
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
            label="Username"
            placeholder="e.g. rahul_trader"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="dense"
            required
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="dense"
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: '#6B7280' }} fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="dense"
            required
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

          <TextField
            fullWidth
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="dense"
            required
          />

          <TextField
            fullWidth
            label="Referral Code (Optional)"
            placeholder="e.g. IVEST100"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            margin="dense"
            helperText={initialReferralCode ? `Referral code auto-applied from link` : ''}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CardGiftcardIcon sx={{ color: '#8b5cf6' }} fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                I agree to the Terms of Service & Privacy Policy
              </Typography>
            }
            sx={{ mt: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 2, mb: 2, py: 1.2, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Already have an account?{' '}
              <Typography
                component="span"
                variant="body2"
                onClick={() => {
                  closeRegisterModal();
                  openLoginModal();
                }}
                sx={{
                  color: '#a78bfa',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Login here
              </Typography>
            </Typography>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};
