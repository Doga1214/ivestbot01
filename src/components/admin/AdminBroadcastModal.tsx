import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { SendIcon } from '../common/Icons';
import { adminService } from '../../services/adminService';

interface AdminBroadcastModalProps {
  open: boolean;
  onClose: () => void;
  showSnackbar: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminBroadcastModal: React.FC<AdminBroadcastModalProps> = ({
  open,
  onClose,
  showSnackbar
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    adminService.broadcastAnnouncement(title, message, severity);
    showSnackbar('Platform announcement broadcasted live to all users!', 'success');
    setTitle('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#111522',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 3
          }
        }
      }}
    >
      <form onSubmit={handleBroadcast}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Broadcast Platform Announcement
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2.5 }}>
            Send real-time alerts, maintenance notices, or bonus promotions to all registered users.
          </Typography>

          <TextField
            fullWidth
            label="Announcement Title"
            placeholder="e.g. Deposit Milestone Event / Maintenance Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2.5 }}
          />

          <FormControl fullWidth sx={{ mb: 2.5 }}>
            <InputLabel>Alert Type / Severity</InputLabel>
            <Select
              value={severity}
              label="Alert Type / Severity"
              onChange={(e) => setSeverity(e.target.value as any)}
            >
              <MenuItem value="info">Information (Blue)</MenuItem>
              <MenuItem value="success">Success / Event Reward (Green)</MenuItem>
              <MenuItem value="warning">Warning / Cooldown Notice (Yellow)</MenuItem>
              <MenuItem value="error">Emergency / Maintenance (Red)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Announcement Message Content"
            placeholder="Describe details, time, bonus parameters..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={3}
            required
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} sx={{ color: '#9CA3AF' }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" startIcon={<SendIcon />} sx={{ fontWeight: 800 }}>
            Broadcast Now
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
