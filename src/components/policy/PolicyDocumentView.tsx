import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment
} from '@mui/material';
import {
  Printer,
  Search,
  ShieldCheck,
  AlertTriangle,
  Scale
} from 'lucide-react';

export interface PolicyDocumentViewProps {
  isModal?: boolean;
  onClose?: () => void;
}

interface PolicySectionItem {
  id: string;
  num: number;
  title: string;
  subtitle?: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  badges?: string[];
  warningNote?: string;
  infoNote?: string;
  hasTable?: 'withdrawal' | 'transaction' | 'wallets' | 'none';
}

export const PolicyDocumentView: React.FC<PolicyDocumentViewProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const policySections: PolicySectionItem[] = useMemo(() => [
    {
      id: 'sec-1',
      num: 1,
      title: 'ACCOUNT POLICY',
      bulletPoints: [
        'Every user must create and maintain a unique IvestBot account.',
        'Only one account is permitted per individual unless otherwise authorized by IvestBot.',
        'Users must provide accurate and up-to-date account information.',
        'Users are responsible for keeping their login credentials secure.',
        'Sharing, selling, or transferring an account may be prohibited.',
        'Duplicate, fraudulent, or suspicious accounts may be placed under review or restricted.',
        'Each account will be associated with a unique IvestBot ID.'
      ]
    },
    {
      id: 'sec-2',
      num: 2,
      title: 'IVESTBOT ID & ACCOUNT VERIFICATION',
      subtitle: 'Platform Account Identification & Verification System',
      badges: [
        'Full Name',
        'Mobile Number',
        'Email Address',
        'Unique IvestBot ID',
        'Verification Documents',
        'Wallet Address'
      ],
      bulletPoints: [
        'Each registered user will receive a unique IvestBot ID.',
        'The IvestBot ID will be linked to the user’s IvestBot account.',
        'Users may be required to create and upload their IvestBot ID verification information/document through the IvestBot platform.',
        'The information provided must match the user’s registered account details.',
        'One IvestBot ID should be associated with one user account.',
        'Fake, duplicate, manipulated, or invalid IvestBot IDs may be rejected.',
        'Withdrawal access may require successful IvestBot ID verification.',
        'Additional verification may be requested when required for account security or transaction review.'
      ]
    },
    {
      id: 'sec-3',
      num: 3,
      title: 'IVESTBOT WALLET SYSTEM',
      hasTable: 'wallets',
      bulletPoints: [
        'Main Wallet: Displays the user’s available balance.',
        'Reserve Wallet: Displays funds allocated to eligible reservation activities.',
        'Reward Wallet: Displays eligible rewards, referral credits, or other platform credits.',
        'Transaction History: Users can view all deposits, withdrawals, transfers, reservation returns, and referral credits.',
        'Each transaction has a clear status and verifiable reference ID.'
      ]
    },
    {
      id: 'sec-4',
      num: 4,
      title: 'DEPOSIT POLICY',
      badges: ['Minimum Deposit: $50 USDT', 'Workflow: Pending → Under Review → Approved / Rejected'],
      bulletPoints: [
        'Minimum Deposit: $50 USDT equivalent.',
        'Deposit requests follow: Pending → Under Review → Approved / Rejected.',
        'Once a deposit has been successfully verified and approved, the applicable amount will be reflected in the user’s wallet.',
        'IvestBot may review or reject deposits that are unverified, duplicate, incorrectly submitted, inconsistent with payment information, or suspected of fraudulent activity.'
      ]
    },
    {
      id: 'sec-5',
      num: 5,
      title: 'WITHDRAWAL POLICY',
      subtitle: '6-Level Tiered Withdrawal Matrix ($50 Minimum)',
      hasTable: 'withdrawal',
      bulletPoints: [
        'Minimum Withdrawal Amount: $50 USDT.',
        'The user must have sufficient eligible wallet balance.',
        'Required IvestBot ID verification must be completed.',
        'The applicable monthly withdrawal limit cannot be exceeded.',
        'The applicable monthly withdrawal count cannot be exceeded.',
        'Withdrawal information must be accurate and valid.',
        'Additional verification may be requested when necessary.',
        'Applicable processing or network fees, if any, will be displayed before confirmation.',
        'Withdrawal requests may be reviewed before processing.'
      ]
    },
    {
      id: 'sec-6',
      num: 6,
      title: 'WITHDRAWAL PROCESS',
      badges: ['Pending → Under Review → Approved → Processing → Completed'],
      bulletPoints: [
        'A withdrawal request follows: Pending → Under Review → Approved → Processing → Completed.',
        'If the request cannot be processed: Rejected / Cancelled.',
        'The applicable status or reason is transparently displayed to the user in their transaction history.'
      ]
    },
    {
      id: 'sec-7',
      num: 7,
      title: 'WITHDRAWAL LIMIT RESET',
      bulletPoints: [
        'Monthly withdrawal limits and withdrawal counts will operate according to IvestBot’s defined monthly cycle.',
        'The user dashboard displays:',
        '• Monthly withdrawal limit',
        '• Amount already withdrawn',
        '• Remaining withdrawal limit',
        '• Number of withdrawals used',
        '• Remaining withdrawal requests'
      ]
    },
    {
      id: 'sec-8',
      num: 8,
      title: 'LEVEL SYSTEM',
      badges: ['Level 1 → Level 2 → Level 3 → Level 4 → Level 5 → Level 6'],
      bulletPoints: [
        'IvestBot operates with six levels: Level 1 through Level 6.',
        'A user’s level depends on eligibility factors such as IvestBot ID verification, eligible platform activity, referral requirements, and team volume.',
        'The exact requirements for each level are clearly displayed on the user dashboard.'
      ],
      infoNote: 'Level status does not automatically guarantee any financial return or profit.'
    },
    {
      id: 'sec-9',
      num: 9,
      title: 'REFERRAL PROGRAM',
      bulletPoints: [
        'Eligible users receive a unique referral link and referral code.',
        'The referral system includes unique link tracking, registration tracking, referral history, eligible rewards, and level progression.',
        'Referral rewards are credited only when applicable eligibility requirements have been satisfied.',
        'Prohibited activities: Self-referrals, fake accounts, duplicate accounts, artificial referral activity, referral manipulation, and misuse of codes.'
      ]
    },
    {
      id: 'sec-10',
      num: 10,
      title: 'RESERVATION SYSTEM',
      badges: ['Available → Reserved → Processing → Completed / Cancelled'],
      bulletPoints: [
        'IvestBot provides a Reservation feature for eligible users.',
        'A reservation follows: Available → Reserved → Processing → Completed / Cancelled.',
        'Before confirming a reservation, the system displays reservation amount, applicable conditions, status, cycle/time, and fees.',
        'The required amount is allocated or locked according to reservation rules.'
      ]
    },
    {
      id: 'sec-11',
      num: 11,
      title: 'RESERVATION CYCLE',
      badges: ['NEXT RESERVATION AVAILABLE IN HH : MM : SS'],
      bulletPoints: [
        'IvestBot uses a 24-hour reservation cycle with live countdown timers displayed on the dashboard.',
        'The system automatically prevents duplicate or conflicting reservation requests.',
        'Reservation availability, eligibility, and completion conditions are clearly communicated.'
      ]
    },
    {
      id: 'sec-12',
      num: 12,
      title: 'TRANSACTION HISTORY',
      hasTable: 'transaction',
      bulletPoints: [
        'The IvestBot dashboard provides a transparent transaction history.',
        'Records include Transaction ID, Date and Time, Transaction Type, Amount, Wallet, Status, Applicable Fee, and Reference information.'
      ]
    },
    {
      id: 'sec-13',
      num: 13,
      title: 'SECURITY POLICY',
      bulletPoints: [
        'IvestBot utilizes login authentication, email/mobile verification, IvestBot ID verification, withdrawal 6-digit PIN, transaction monitoring, and security alerts.',
        'Users are responsible for protecting passwords, OTPs, recovery information, login credentials, and PINs.',
        'IvestBot will never require users to publicly disclose confidential login credentials or PINs.'
      ]
    },
    {
      id: 'sec-14',
      num: 14,
      title: 'ACCOUNT RESTRICTIONS',
      bulletPoints: [
        'IvestBot may restrict or suspend account functions when there is evidence of fraudulent activity, fake IvestBot ID, duplicate accounts, self-referrals, payment manipulation, system abuse, or rule violations.',
        'Where appropriate, accounts may be placed under review before further action is taken.'
      ]
    },
    {
      id: 'sec-15',
      num: 15,
      title: 'FEES & CHARGES',
      bulletPoints: [
        'Any applicable fees are clearly displayed before confirming any transaction.',
        'Deposit Fee: Zero / As displayed.',
        'Withdrawal Fee: As displayed on confirmation modal.',
        'Network Fee: Standard on-chain gas as applicable.',
        'Processing Fee: As displayed.'
      ]
    },
    {
      id: 'sec-16',
      num: 16,
      title: 'BALANCE & RETURN DISCLOSURE',
      warningNote: 'No wallet balance, reward, or platform activity should be represented as a guaranteed, risk-free, or assured financial return. Users should review all applicable risks, conditions, fees, and legal disclosures before using financial or investment-related features.',
      bulletPoints: [
        'IvestBot clearly distinguishes between wallet balance, deposited funds, rewards, referral credits, and reserved amounts.'
      ]
    },
    {
      id: 'sec-17',
      num: 17,
      title: 'USER RESPONSIBILITIES',
      bulletPoints: [
        'Providing accurate account information.',
        'Creating and maintaining their IvestBot ID.',
        'Completing required IvestBot ID verification.',
        'Maintaining account and PIN security.',
        'Reviewing transaction details before confirmation.',
        'Using valid payment/wallet addresses.',
        'Following IvestBot published policies.'
      ]
    },
    {
      id: 'sec-18',
      num: 18,
      title: 'PROHIBITED ACTIVITIES',
      bulletPoints: [
        'Fraudulent transactions and payment manipulation.',
        'Fake or manipulated IvestBot ID information.',
        'Unauthorized duplicate accounts and bot manipulation.',
        'Referral abuse and self-referrals.',
        'Unauthorized system access or exploiting technical vulnerabilities.',
        'Any activity prohibited by applicable law.'
      ]
    },
    {
      id: 'sec-19',
      num: 19,
      title: 'POLICY UPDATES',
      bulletPoints: [
        'IvestBot may update this policy due to platform improvements, security requirements, operational changes, or legal requirements.',
        'Updated policies will be published with an applicable effective date.'
      ]
    },
    {
      id: 'sec-20',
      num: 20,
      title: 'USER ACKNOWLEDGEMENT',
      bulletPoints: [
        'By using IvestBot, users acknowledge that they have reviewed the applicable Account Rules, IvestBot ID Rules, Wallet Rules, Deposit Policy, Withdrawal Policy, Referral Policy, Reservation Policy, and Security Requirements.',
        'Users should only use features for which they meet the applicable eligibility requirements.'
      ]
    }
  ], []);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return policySections;
    const q = searchTerm.toLowerCase();
    return policySections.filter(sec => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchSub = sec.subtitle ? sec.subtitle.toLowerCase().includes(q) : false;
      const matchPoints = sec.bulletPoints ? sec.bulletPoints.some(p => p.toLowerCase().includes(q)) : false;
      const matchBadges = sec.badges ? sec.badges.some(b => b.toLowerCase().includes(q)) : false;
      return matchTitle || matchSub || matchPoints || matchBadges;
    });
  }, [policySections, searchTerm]);

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <Box
      id="ivestbot-policy-document-root"
      sx={{
        color: '#F8FAFC',
        fontFamily: "'Inter', sans-serif",
        p: { xs: 1.5, sm: 3 }
      }}
    >
      {/* ─── PRINTABLE STYLING INJECTION ────────────────────────── */}
      <style>{`
        @media print {
          body {
            background-color: #FFFFFF !important;
            color: #0F172A !important;
          }
          #ivestbot-policy-document-root {
            padding: 0 !important;
            background: #FFFFFF !important;
            color: #0F172A !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-card {
            border: 1px solid #CBD5E1 !important;
            background: #FFFFFF !important;
            color: #0F172A !important;
            box-shadow: none !important;
            break-inside: avoid;
            margin-bottom: 20px !important;
            padding: 16px !important;
          }
          .printable-table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          .printable-table th, .printable-table td {
            border: 1px solid #CBD5E1 !important;
            color: #0F172A !important;
            padding: 8px !important;
          }
        }
      `}</style>

      {/* ─── OFFICIAL DOCUMENT HEADER ──────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(245, 158, 11, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                }}
              >
                <Scale size={24} color="#0F172A" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  IVESTBOT OFFICIAL POLICY
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#FBBF24', fontWeight: 700, fontSize: '0.85rem' }}>
                  USER, WALLET &amp; WITHDRAWAL POLICY
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1.5 }}>
              <Chip
                label="Policy Version 1.0"
                size="small"
                sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#FEF08A', fontWeight: 800, border: '1px solid #F59E0B' }}
              />
              <Chip
                label="Status: ACTIVE & ENFORCED"
                size="small"
                sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', fontWeight: 700, border: '1px solid rgba(34, 197, 94, 0.4)' }}
              />
              <Chip
                label="Minimum Deposit: $50"
                size="small"
                sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontWeight: 700 }}
              />
              <Chip
                label="Minimum Withdrawal: $50"
                size="small"
                sx={{ bgcolor: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', fontWeight: 700 }}
              />
            </Box>
          </Box>

          {/* Action Buttons (Print / PDF / Download) */}
          <Box className="no-print" sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handlePrintPdf}
              sx={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#0F172A',
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: '12px',
                px: 2.5,
                py: 1,
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg, #FBBF24 0%, #B45309 100%)'
                }
              }}
            >
              <Printer size={18} /> Print / Save as PDF
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ─── QUICK WITHDRAWAL SUMMARY CARD (HIGHLIGHT) ──────────── */}
      <Paper
        className="printable-card"
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 3.5,
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
          <ShieldCheck size={22} color="#38BDF8" />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#38BDF8', fontSize: '1.1rem' }}>
            IVESTBOT — QUICK 6-LEVEL WITHDRAWAL SUMMARY
          </Typography>
        </Box>

        <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Table className="printable-table" size="small">
            <TableHead sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)' }}>
              <TableRow>
                <TableCell sx={{ color: '#FEF08A', fontWeight: 800, py: 1.2 }}>Tier Level</TableCell>
                <TableCell sx={{ color: '#FEF08A', fontWeight: 800, py: 1.2, textAlign: 'right' }}>Max Monthly Withdrawal</TableCell>
                <TableCell sx={{ color: '#FEF08A', fontWeight: 800, py: 1.2, textAlign: 'right' }}>Max Withdrawals / Month</TableCell>
                <TableCell sx={{ color: '#FEF08A', fontWeight: 800, py: 1.2, textAlign: 'center' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { level: 'Level 1', max: '$300', count: '2' },
                { level: 'Level 2', max: '$1,000', count: '5' },
                { level: 'Level 3', max: '$2,000', count: '10' },
                { level: 'Level 4', max: '$3,000', count: '20' },
                { level: 'Level 5', max: '$5,000', count: '35' },
                { level: 'Level 6', max: '$10,000', count: '50' }
              ].map((row, idx) => (
                <TableRow
                  key={row.level}
                  sx={{
                    bgcolor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.08)' }
                  }}
                >
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                    <span style={{ color: '#F59E0B' }}>●</span> {row.level}
                  </TableCell>
                  <TableCell sx={{ color: '#4ADE80', fontWeight: 800, textAlign: 'right' }}>
                    {row.max} USDT
                  </TableCell>
                  <TableCell sx={{ color: '#38BDF8', fontWeight: 800, textAlign: 'right' }}>
                    {row.count} times / month
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip label="Active Policy" size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.12)', color: '#4ADE80', fontSize: '0.68rem', height: 20 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
            📌 <strong>Minimum Withdrawal:</strong> <span style={{ color: '#FBBF24' }}>$50 USDT</span> &nbsp;|&nbsp; <strong>Minimum Deposit:</strong> <span style={{ color: '#FBBF24' }}>$50 USDT</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Requires valid IvestBot ID verification &amp; 6-digit withdrawal PIN
          </Typography>
        </Box>
      </Paper>

      {/* ─── SEARCH CONTROLS ───────────────────────────────────── */}
      <Box className="no-print" sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search policy rules (e.g. withdrawal, deposit, verification, PIN, Level 3)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#94A3B8" />
              </InputAdornment>
            ),
            sx: {
              bgcolor: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '12px',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }
          }}
        />
      </Box>

      {/* ─── POLICY SECTIONS (1 TO 20) ─────────────────────────── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {filteredSections.map((sec) => (
          <Paper
            key={sec.id}
            id={sec.id}
            className="printable-card"
            sx={{
              p: { xs: 2.2, md: 3 },
              borderRadius: 3,
              bgcolor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'rgba(245, 158, 11, 0.3)'
              }
            }}
          >
            {/* Section Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FBBF24',
                  fontWeight: 900,
                  fontSize: '0.85rem'
                }}
              >
                {sec.num}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#F8FAFC', fontSize: '1.05rem' }}>
                {sec.num}. {sec.title}
              </Typography>
            </Box>

            {sec.subtitle && (
              <Typography variant="subtitle2" sx={{ color: '#94A3B8', mb: 1.5, fontSize: '0.88rem' }}>
                {sec.subtitle}
              </Typography>
            )}

            {/* Badges */}
            {sec.badges && sec.badges.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {sec.badges.map((b, i) => (
                  <Chip
                    key={i}
                    label={b}
                    size="small"
                    sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', color: '#FEF08A', border: '1px solid #334155' }}
                  />
                ))}
              </Box>
            )}

            {/* Bullet Points */}
            {sec.bulletPoints && sec.bulletPoints.length > 0 && (
              <Box component="ul" sx={{ pl: 2.5, m: 0, color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.7 }}>
                {sec.bulletPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </Box>
            )}

            {/* Wallets Table */}
            {sec.hasTable === 'wallets' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, my: 1.5 }}>
                <Paper sx={{ p: 1.5, bgcolor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FBBF24', mb: 0.5 }}>
                    Main Wallet
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', lineHeight: 1.5 }}>
                    Displays the user’s available balance.
                  </Typography>
                </Paper>
                <Paper sx={{ p: 1.5, bgcolor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8', mb: 0.5 }}>
                    Reserve Wallet
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', lineHeight: 1.5 }}>
                    Displays funds allocated to eligible reservation activities.
                  </Typography>
                </Paper>
                <Paper sx={{ p: 1.5, bgcolor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4ADE80', mb: 0.5 }}>
                    Reward Wallet
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', lineHeight: 1.5 }}>
                    Displays eligible rewards, referral credits, or other platform credits.
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Section 12 Sample Table */}
            {sec.hasTable === 'transaction' && (
              <Box sx={{ my: 1.5 }}>
                <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#FEF08A', fontWeight: 800 }}>Date</TableCell>
                        <TableCell sx={{ color: '#FEF08A', fontWeight: 800 }}>Type</TableCell>
                        <TableCell sx={{ color: '#FEF08A', fontWeight: 800 }}>Amount</TableCell>
                        <TableCell sx={{ color: '#FEF08A', fontWeight: 800 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { date: '27 Sep', type: 'Deposit', amount: '$100.00 USDT', status: 'Approved' },
                        { date: '27 Sep', type: 'Reservation', amount: '$50.00 USDT', status: 'Completed' },
                        { date: '28 Sep', type: 'Reward', amount: '$4.50 USDT', status: 'Credited' },
                        { date: '29 Sep', type: 'Withdrawal', amount: '$50.00 USDT', status: 'Pending' }
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ color: '#94A3B8' }}>{row.date}</TableCell>
                          <TableCell sx={{ color: '#FFFFFF', fontWeight: 700 }}>{row.type}</TableCell>
                          <TableCell sx={{ color: '#4ADE80', fontWeight: 800 }}>{row.amount}</TableCell>
                          <TableCell sx={{ color: '#38BDF8' }}>{row.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Warning Note */}
            {sec.warningNote && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <AlertTriangle size={20} color="#F87171" style={{ flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: '#FCA5A5', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {sec.warningNote}
                </Typography>
              </Box>
            )}

            {/* Info Note */}
            {sec.infoNote && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.2,
                  borderRadius: 2,
                  bgcolor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <Typography variant="caption" sx={{ color: '#FEF08A', fontWeight: 600 }}>
                  ⚖️ {sec.infoNote}
                </Typography>
              </Box>
            )}
          </Paper>
        ))}
      </Box>

      {/* ─── DOCUMENT FOOTER & SEAL ────────────────────────────── */}
      <Paper
        className="printable-card"
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3.5,
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#FEF08A', mb: 0.5 }}>
          IVESTBOT PROTOCOL COMPLIANCE &amp; GOVERNANCE
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 650, mx: 'auto', mb: 2, fontSize: '0.85rem' }}>
          This document represents the binding platform policy for all registered user accounts on IvestBot. All rules, limits, tier structures, and verification requirements are cryptographically verified and enforced across the network.
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
          Document Hash: IVEST-POL-V1.0-2026-USDT • Effective Date: Active
        </Typography>
      </Paper>
    </Box>
  );
};
