import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMoreIcon } from '../common/Icons';

export const FAQ: React.FC = () => {
  const faqs = [
    {
      q: 'How does the 24-hour reservation cycle work?',
      a: 'Each user is eligible to initiate one reservation every 24 hours. The reservation uses your available USDT balance to participate in automated daily algorithmic settlement with a 20-second processing period.'
    },
    {
      q: 'What is the daily configured yield rate?',
      a: 'The platform operates with a daily yield rate of 2.8571% (approx 2.86%). At this rate, executing one reservation every 24 hours doubles your principle amount in exactly 35 days (35 days × 2.8571% = 100% net profit). The yield is credited directly to your available wallet balance upon completion of the 20-second processing window.'
    },
    {
      q: 'How do referral commissions and deposit milestone bonuses work?',
      a: 'When you invite members using your referral link, you earn lifetime commissions on their reservations: 1.0% on direct Tier A members, 0.5% on Tier B members, and 0.5% on Tier C members. In addition, when new invited members deposit between 50 USDT and 1,000 USDT, sponsors earn an instant 5 USDT bonus per 50 USDT deposited (e.g. 50 USDT deposit -> +5 USDT sponsor bonus & +1 USDT user bonus; 1000 USDT deposit -> +100 USDT sponsor bonus & +20 USDT user bonus).'
    },
    {
      q: 'What are the requirements for Level 2, 3, and 4?',
      a: 'Higher levels require both a minimum wallet balance and team structure milestones (e.g. Level 2 requires 400 USDT, 3 A members, and 4 B+C members). Progression is calculated automatically on the server.'
    },
    {
      q: 'How do deposits and withdrawals affect my balance?',
      a: 'New accounts start with 0.00 USDT. When you submit a deposit with your transaction hash, funds are immediately added to your wallet available balance. When you request a withdrawal, the amount is instantly deducted and tracked on your ledger.'
    }
  ];

  return (
    <Box sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
          Frequently Asked Questions
        </Typography>
        <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
          Everything you need to know about the Ivestbot platform
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {faqs.map((faq, idx) => (
          <Accordion
            key={idx}
            sx={{
              backgroundColor: '#111522',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px !important',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#a78bfa' }} />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {faq.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.6 }}>
                {faq.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};
