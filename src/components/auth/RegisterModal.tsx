import React, { useState, useEffect, useRef } from 'react';
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
  CardGiftcardIcon,
  ArrowBackIcon,
  MarkEmailReadIcon
} from '../common/Icons';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const RegisterModal: React.FC = () => {
  const {
    isRegisterModalOpen,
    closeRegisterModal,
    openLoginModal,
    initialReferralCode,
    sendEmailOtp,
    verifyOtpAndRegister,
    resendEmailOtp
  } = useApp();
  const navigate = useNavigate();

  // Step 1: User details
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode || '');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: 6-Digit OTP
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial referral code if changed
  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode);
    }
  }, [initialReferralCode]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, resendCooldown]);

  if (!isRegisterModalOpen) return null;

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanName = fullName.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanUsername || !cleanEmail) {
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

    try {
      const res = await sendEmailOtp(cleanEmail, password, { name: cleanName, username: cleanUsername });
      setStep('OTP');
      setResendCooldown(60);
      setIsResendActive(true);
      setInfoMessage(res.message);
      setOtpDigits(['', '', '', '', '', '']);
      // Auto-focus first OTP digit box after state transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 6-Digit OTP Box Changes
  const handleOtpChange = (index: number, value: string) => {
    // Handle paste of whole 6-digit code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const nextFocusIndex = Math.min(pasted.length, 5);
        otpInputRefs.current[nextFocusIndex]?.focus();
      }
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto-advance to next box if filled
    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Step 2: Verify OTP & Complete Registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyOtpAndRegister({
        name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
        otp: fullOtp
      });
      navigate('/profile');
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await resendEmailOtp(email.trim());
      setResendCooldown(60);
      setInfoMessage(res.message);
    } catch (err: any) {
      setError(err?.message || 'Could not resend OTP. Please try again in a few seconds.');
    } finally {
      setLoading(false);
    }
  };

  // Reset modal state on close
  const handleClose = () => {
    closeRegisterModal();
    setTimeout(() => {
      setStep('DETAILS');
      setError(null);
      setInfoMessage(null);
      setOtpDigits(['', '', '', '', '', '']);
    }, 200);
  };

  return (
    <Dialog
      open={isRegisterModalOpen}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            p: { xs: 0.5, sm: 1 },
            m: { xs: 1.5, sm: 2 },
            width: { xs: 'calc(100% - 24px)', sm: 'auto' },
            borderRadius: 3.5,
            background: '#111522',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {step === 'OTP' ? (
            <IconButton
              onClick={() => {
                setStep('DETAILS');
                setError(null);
              }}
              size="small"
              sx={{ color: '#9CA3AF', mr: 0.5 }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          ) : (
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
          )}
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {step === 'DETAILS' ? 'Create Account' : 'Verify Email'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#9CA3AF' }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {step === 'DETAILS' ? (
          <>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
              Join Ivestbot to start 24-hour daily reservations and build your referral team.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSendOtp}>
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue & Verify Email'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Already have an account?{' '}
                  <Typography
                    component="span"
                    variant="body2"
                    onClick={() => {
                      handleClose();
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
          </>
        ) : (
          /* STEP 2: EMAIL OTP VERIFICATION */
          <Box component="form" onSubmit={handleVerifyOtp} sx={{ pt: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  color: '#a78bfa'
                }}
              >
                <MarkEmailReadIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>
                Check Your Email
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
                We sent a 6-digit verification code to:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#a78bfa', wordBreak: 'break-all' }}>
                {email}
              </Typography>
            </Box>

            {infoMessage && (
              <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
                {infoMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* 6-DIGIT OTP INPUT BOXES */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 1.5 }, my: 2 }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '44px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    background: '#1A2035',
                    border: digit ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    outline: 'none',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: digit ? '0 0 12px rgba(139, 92, 246, 0.3)' : 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#a78bfa';
                    e.target.style.boxShadow = '0 0 12px rgba(167, 139, 250, 0.4)';
                  }}
                  onBlur={(e) => {
                    if (!digit) {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              ))}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || otpDigits.some((d) => !d)}
              sx={{ mt: 2, mb: 2, py: 1.3, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Complete Registration'}
            </Button>

            {/* Resend OTP Section */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Didn't receive code?{' '}
                {resendCooldown > 0 ? (
                  <Typography component="span" variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                    Resend in {resendCooldown}s
                  </Typography>
                ) : (
                  <Typography
                    component="span"
                    variant="body2"
                    onClick={handleResend}
                    sx={{
                      color: '#a78bfa',
                      fontWeight: 700,
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Resend Code
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
