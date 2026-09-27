import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Paper,
  Avatar,
  Fade,
  Slide,
  Tooltip
} from '@mui/material';
import {
  X,
  Send,
  Bot,
  Trash2,
  ExternalLink,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { chatService, DEFAULT_QUICK_PROMPTS } from '../../services/chatService';
import type { ChatMessage, ChatAction } from '../../types/chat';

interface ChatbotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ isOpen, onClose }) => {
  const { user, openLoginModal } = useApp();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userId = user?.id || 'guest';

  // Load chat history
  useEffect(() => {
    if (isOpen) {
      const history = chatService.getHistory(userId);
      setMessages(history);
    }
  }, [isOpen, userId]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Create user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);

    // Save history with user message
    chatService.saveHistory(userId, newHistory);

    // Simulate AI thinking time (400-800ms) for natural feel
    setTimeout(async () => {
      const botResponse = await chatService.processMessage(query, user as any);
      const updatedHistory = [...newHistory, botResponse];
      setMessages(updatedHistory);
      setIsTyping(false);
      chatService.saveHistory(userId, updatedHistory);
    }, 600);
  };

  const handleClearHistory = () => {
    chatService.clearHistory(userId);
    const fresh = chatService.getHistory(userId);
    setMessages(fresh);
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.type === 'navigate') {
      navigate(action.payload);
      // On mobile screen minimize or close
      if (window.innerWidth < 600) {
        onClose();
      }
    } else if (action.type === 'link') {
      window.open(action.payload, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'quick_reply') {
      if (action.payload === 'login') {
        openLoginModal();
      } else {
        handleSendMessage(action.payload);
      }
    }
  };

  // Helper to render basic markdown (bold, code, links, bullets)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Parse markdown-style links [text](url) and bold **text** and code `text`
      const parts = line.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);

      const parsedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} style={{ color: '#FEF08A', fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <span
              key={pIdx}
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#FBBF24',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.85em'
              }}
            >
              {part.slice(1, -1)}
            </span>
          );
        }
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
          const match = part.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            return (
              <a
                key={pIdx}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#38BDF8', textDecoration: 'underline', fontWeight: 600 }}
              >
                {match[1]}
              </a>
            );
          }
        }
        return part;
      });

      return (
        <Box key={idx} sx={{ minHeight: line.trim() === '' ? '8px' : 'auto', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.5, color: '#E2E8F0' }}>
            {parsedLine}
          </Typography>
        </Box>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          bottom: { xs: 0, sm: '80px' },
          right: { xs: 0, sm: '20px' },
          width: {
            xs: '100vw',
            sm: isExpanded ? '520px' : '380px'
          },
          height: {
            xs: '85vh',
            sm: isExpanded ? '640px' : '530px'
          },
          maxHeight: { xs: '90vh', sm: '80vh' },
          bgcolor: '#0B0F19',
          color: '#F8FAFC',
          borderRadius: { xs: '20px 20px 0 0', sm: '20px' },
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 158, 11, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1400,
          overflow: 'hidden',
          transition: 'width 0.3s ease, height 0.3s ease'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.15)',
                border: '1.5px solid #F59E0B',
                width: 40,
                height: 40
              }}
            >
              <Bot size={22} color="#F59E0B" />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#F8FAFC', lineHeight: 1.2 }}>
                  Ivestbot AI Assistant
                </Typography>
                <Chip
                  size="small"
                  label="Online"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ADE80',
                    border: '1px solid rgba(34, 197, 94, 0.4)'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                Instant 24/7 automated support
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Clear chat">
              <IconButton size="small" onClick={handleClearHistory} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
                <Trash2 size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isExpanded ? 'Minimize' : 'Expand'}>
              <IconButton
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{ color: '#94A3B8', display: { xs: 'none', sm: 'inline-flex' } }}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
              <X size={20} />
            </IconButton>
          </Box>
        </Box>

        {/* Quick Help Prompts Bar */}
        <Box
          sx={{
            py: 1,
            px: 1.5,
            bgcolor: 'rgba(15, 23, 42, 0.7)',
            borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
            overflowX: 'auto',
            display: 'flex',
            gap: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none'
          }}
        >
          {DEFAULT_QUICK_PROMPTS.map((prompt) => (
            <Chip
              key={prompt.id}
              label={`${prompt.icon} ${prompt.title}`}
              clickable
              onClick={() => handleSendMessage(prompt.query)}
              size="small"
              sx={{
                bgcolor: 'rgba(30, 41, 59, 0.8)',
                color: '#CBD5E1',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(245, 158, 11, 0.2)',
                  borderColor: '#F59E0B',
                  color: '#FEF08A'
                }
              }}
            />
          ))}
        </Box>

        {/* Chat Message Stream */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            bgcolor: '#080A12'
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <Fade key={msg.id} in timeout={300}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '85%',
                      p: 1.5,
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: isUser
                        ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
                        : 'rgba(30, 41, 59, 0.75)',
                      border: isUser ? '1px solid rgba(254, 240, 138, 0.3)' : '1px solid rgba(51, 65, 85, 0.8)',
                      color: isUser ? '#FFFFFF' : '#E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    {renderFormattedText(msg.text)}

                    {/* Action buttons embedded in message */}
                    {msg.actions && msg.actions.length > 0 && (
                      <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {msg.actions.map((act, aIdx) => (
                          <Button
                            key={aIdx}
                            size="small"
                            variant="contained"
                            onClick={() => handleActionClick(act)}
                            endIcon={act.type === 'link' ? <ExternalLink size={13} /> : undefined}
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.2)',
                              color: '#FEF08A',
                              border: '1px solid #F59E0B',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              py: 0.4,
                              px: 1.2,
                              borderRadius: '8px',
                              '&:hover': {
                                bgcolor: '#F59E0B',
                                color: '#0F172A'
                              }
                            }}
                          >
                            {act.label}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Quick Replies below message */}
                  {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1, ml: 0.5 }}>
                      {msg.quickReplies.map((qr, qIdx) => (
                        <Chip
                          key={qIdx}
                          label={qr}
                          size="small"
                          onClick={() => handleSendMessage(qr)}
                          clickable
                          sx={{
                            bgcolor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            color: '#94A3B8',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#F59E0B',
                              color: '#FBBF24',
                              bgcolor: 'rgba(245, 158, 11, 0.1)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748B', mt: 0.3, px: 0.5 }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Fade>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1, my: 0.5 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(30, 41, 59, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#F59E0B',
                    animation: 'typingBounce 1.2s infinite ease-in-out'
                  }}
                />
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#F59E0B',
                    animation: 'typingBounce 1.2s infinite ease-in-out 0.2s'
                  }}
                />
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#F59E0B',
                    animation: 'typingBounce 1.2s infinite ease-in-out 0.4s'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                AI is typing...
              </Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Bar */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          sx={{
            p: 1.5,
            pb: { xs: 'calc(14px + env(safe-area-inset-bottom, 0px))', sm: 1.5 },
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(51, 65, 85, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <TextField
            fullWidth
            placeholder="Type your question or query..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            variant="outlined"
            size="small"
            disabled={isTyping}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#080A12',
                borderRadius: '12px',
                color: '#F8FAFC',
                fontSize: '0.875rem',
                '& fieldset': {
                  borderColor: 'rgba(71, 85, 105, 0.6)'
                },
                '&:hover fieldset': {
                  borderColor: '#F59E0B'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F59E0B'
                }
              }
            }}
          />

          <IconButton
            type="submit"
            disabled={!inputText.trim() || isTyping}
            sx={{
              bgcolor: '#F59E0B',
              color: '#0F172A',
              width: 40,
              height: 40,
              borderRadius: '12px',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#D97706',
                transform: 'scale(1.05)'
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(71, 85, 105, 0.4)',
                color: '#64748B'
              }
            }}
          >
            <Send size={18} />
          </IconButton>
        </Box>
      </Paper>
    </Slide>
  );
};
