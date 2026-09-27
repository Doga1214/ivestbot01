import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { Bot } from 'lucide-react';
import { ChatbotWidget } from './ChatbotWidget';
import { useApp } from '../../context/AppContext';

export const FloatingChatLauncher: React.FC = () => {
  const { isChatOpen, toggleChat, closeChat } = useApp();

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: '80px', sm: '28px' },
          left: { xs: '16px', sm: '24px' },
          zIndex: 1350,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Tooltip title="24/7 AI & Live Support Assistant" placement="right" arrow>
          <Box
            component="button"
            onClick={toggleChat}
            aria-label="Open AI Support Chat"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: { xs: '10px 14px', sm: '12px 18px' },
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #4F46E5 100%)',
              border: '1.5px solid rgba(147, 197, 253, 0.6)',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(37, 99, 235, 0.5), 0 0 20px rgba(96, 165, 250, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
              outline: 'none',
              '&:hover': {
                transform: 'scale(1.06) translateY(-2px)',
                boxShadow: '0 12px 35px rgba(37, 99, 235, 0.7), 0 0 25px rgba(96, 165, 250, 0.6)',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #6366F1 100%)'
              },
              '&:active': {
                transform: 'scale(0.96)'
              }
            }}
          >
            {/* Pulsing Bot Icon */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bot size={22} color="#FFFFFF" strokeWidth={2.2} />
              
              {/* Online Pulse Dot */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: '10px',
                  height: '10px',
                  bgcolor: '#22C55E',
                  borderRadius: '50%',
                  border: '2px solid #0B0F19',
                  boxShadow: '0 0 8px #22C55E'
                }}
              />
            </Box>

            {/* Label */}
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: '0.8rem', sm: '0.88rem' },
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}
            >
              AI Support
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      {/* Chat Window Component */}
      <ChatbotWidget isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
};
