import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Paper,
  Stack,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  CloseIcon,
  ElectricBoltIcon,
  CardGiftcardIcon,
  TrendingUpIcon,
  GroupsIcon,
  CheckCircleIcon
} from '../common/Icons';

interface AnnouncementModalProps {
  open?: boolean;
  onClose?: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ open: externalOpen, onClose: externalClose }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = localStorage.getItem('ivestbot_announcement_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        setInternalOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  // Determine whether modal is shown
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('ivestbot_announcement_dismissed', 'true');
    }
    setInternalOpen(false);
    if (externalClose) {
      externalClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: 'linear-gradient(145deg, #111522 0%, #171b2e 100%)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: 4,
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
            p: { xs: 1, sm: 2 }
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}
          >
            <ElectricBoltIcon />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>
                Platform Announcement
              </Typography>
              <Chip label="NEW" color="primary" size="small" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              IVESTBOT 2.0 System & Referral Rewards Update
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#9CA3AF', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        {/* Highlight Banner: Deposit Referral Bonus Event */}
        <Paper
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CardGiftcardIcon sx={{ color: '#a78bfa' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff' }}>
              🎁 Exclusive Deposit Referral Milestone Bonus
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#d1d5db', lineHeight: 1.6, mb: 1.5 }}>
            Invite friends to join with your referral link! When they deposit between <strong>50 USDT</strong> and <strong>1,000 USDT</strong>, both of you earn instant bonuses:
          </Typography>

          <Stack spacing={1} sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', p: 1.5, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#9CA3AF' }}>50 USDT Deposit:</span>
              <strong style={{ color: '#34d399' }}>Sponsor: +5 USDT &nbsp;|&nbsp; User: +1 USDT</strong>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#9CA3AF' }}>100 USDT Deposit:</span>
              <strong style={{ color: '#34d399' }}>Sponsor: +10 USDT &nbsp;|&nbsp; User: +2 USDT</strong>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#9CA3AF' }}>500 USDT Deposit:</span>
              <strong style={{ color: '#34d399' }}>Sponsor: +50 USDT &nbsp;|&nbsp; User: +10 USDT</strong>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#9CA3AF' }}>1,000 USDT Deposit:</span>
              <strong style={{ color: '#34d399' }}>Sponsor: +100 USDT &nbsp;|&nbsp; User: +20 USDT</strong>
            </Box>
          </Stack>
        </Paper>

        {/* Feature Highlights Grid */}
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <TrendingUpIcon sx={{ color: '#8b5cf6', fontSize: 22, mt: 0.3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff' }}>
                2.86% Daily (35-Day Principle 2X Doubling)
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Participate with your available USDT balance in one reservation every 24 hours. Your principle doubles in 35 days (100% total profit).
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <GroupsIcon sx={{ color: '#3b82f6', fontSize: 22, mt: 0.3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff' }}>
                A/B/C Multi-Tier Referral Network
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Earn direct <strong>1.0%</strong> on Tier A members, and <strong>0.5%</strong> on Tier B & C team members.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 22, mt: 0.3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff' }}>
                Instant Wallet Crediting & Zero Initial Lock
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                New accounts start at 0.00 USDT. Deposits are immediately reflected and credited to available balances.
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        <FormControlLabel
          control={
            <Checkbox
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              size="small"
              color="primary"
            />
          }
          label={
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Don't show this notification popup again on this device
            </Typography>
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={handleClose}
          sx={{ py: 1.2, fontWeight: 800, fontSize: '1rem' }}
        >
          Welcome
        </Button>
      </DialogActions>
    </Dialog>
  );
};
