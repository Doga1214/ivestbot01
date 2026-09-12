import React from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import { ExpandMoreIcon, HelpOutlineIcon } from '../common/Icons';

export const FAQ: React.FC = () => {
  const faqs = [
    {
      q: 'How does the 24-hour reservation cycle work?',
      a: 'Each user is eligible to initiate one reservation every 24 hours. The reservation uses your available USDT balance to participate in automated daily algorithmic settlement with a 20-second processing period.'
    },
    {
      q: 'What is the daily configured yield rate and 45-day doubling rule?',
      a: 'The platform operates with a daily yield rate of 2.2222% (approx 2.22%). At this rate, executing one reservation every 24 hours doubles your principal amount in exactly 45 days (45 days × 2.2222% = 100% net profit). The yield is credited directly to your available wallet balance upon completion of the 20-second processing window.'
    },
    {
      q: 'How do multi-tier referral commissions work?',
      a: 'When you invite members using your referral link, you earn lifetime daily commissions on all their completed reservations: 0.1% on direct Tier A members, 0.05% on Tier B members, and 0.025% on Tier C members. Rewards are credited directly to your balance automatically upon 24-hour cycle completion.'
    },
    {
      q: 'What are the requirements for Level 2, 3, and 4 VIP tiers?',
      a: 'Higher VIP levels require both a minimum wallet balance and team structure milestones (e.g. Level 2 requires 400 USDT, 3 A members, and 4 B+C members). Progression is calculated automatically in real-time by the server.'
    },
    {
      q: 'How do deposits and withdrawals affect my balance?',
      a: 'When you submit a deposit with your blockchain transaction hash (TxID), funds are verified and credited to your available balance. When you request a withdrawal, the amount is processed to your TRC20/BEP20 address.'
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'rgba(8, 10, 18, 0.6)', position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            icon={<HelpOutlineIcon style={{ color: '#a78bfa' }} />}
            label="FREQUENTLY ASKED QUESTIONS"
            size="small"
            sx={{
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              color: '#a78bfa',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              mb: 1.5
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            Got Questions? We Have Answers
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF', maxWidth: 600, mx: 'auto', mt: 1 }}>
            Everything you need to know about the 45-day doubling protocol, yield rates, and payouts.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 840, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqs.map((faq, idx) => (
            <Accordion
              key={idx}
              defaultExpanded={idx === 0 || idx === 1}
              sx={{
                backgroundColor: '#111522',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px !important',
                transition: 'all 0.3s ease',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  borderColor: 'rgba(139, 92, 246, 0.4)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.12)'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#a78bfa' }} />}
                sx={{ px: 3, py: 1 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '1.02rem' }}>
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.7, fontSize: '0.92rem' }}>
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
