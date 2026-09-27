import React, { useState } from 'react';
import { Box, Tooltip, Badge } from '@mui/material';
import { MessageSquareText, Bot } from 'lucide-react';
import { ChatbotWidget } from './ChatbotWidget';

export const FloatingChatLauncher: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: '84px', md: '30px' },
          left: '20px',
          zIndex: 1000
        }}
      >
        <Tooltip title="24/7 AI & Live Support" placement="right" arrow>
          <Box
            component="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open AI Support Chat"
            sx={{
              width: { xs: '52px', sm: '56px' },
              height: { xs: '52px', sm: '56px' },
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E1B4B 100%)',
              border: '2px solid #60A5FA',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.45), 0 0 15px rgba(96, 165, 250, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
              '&:hover': {
                transform: 'scale(1.1) translateY(-2px)',
                boxShadow: '0 12px 30px rgba(59, 130, 246, 0.6), 0 0 20px rgba(96, 165, 250, 0.5)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
          >
            <Bot size={26} color="#FFFFFF" />

            {/* Pulse Indicator badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '14px',
                height: '14px',
                bgcolor: '#22C55E',
                borderRadius: '50%',
                border: '2px solid #0B0F19',
                boxShadow: '0 0 8px #22C55E'
              }}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Chat Window Component */}
      <ChatbotWidget isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
