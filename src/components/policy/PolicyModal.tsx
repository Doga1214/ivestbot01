import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { Scale, X } from 'lucide-react';
import { PolicyDocumentView } from './PolicyDocumentView';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#0B0F19',
            backgroundImage: 'none',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: { xs: 2.5, sm: 4 },
            p: 0,
            maxHeight: '90vh',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.15)'
          }
        }
      }}
    >
      {/* Modal Top Header Bar */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(15, 23, 42, 0.95)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              bgcolor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Scale size={18} color="#FBBF24" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2 }}>
              IvestBot Official Policy
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Policy Version 1.0 (PDF &amp; Document)
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#94A3B8',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      {/* Modal Content */}
      <DialogContent sx={{ p: 0, bgcolor: '#080A12' }}>
        <PolicyDocumentView isModal={true} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
