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
  Divider,
  InputAdornment
} from '@mui/material';
import {
  FileText,
  Printer,
  Search,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Scale
} from 'lucide-react';

export interface PolicyDocumentViewProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const PolicyDocumentView: React.FC<PolicyDocumentViewProps> = ({ isModal = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<string>('all');

  const policySections = useMemo(() => [
    {
      id: 'sec-1',
      num: 1,
      title: 'ACCOUNT POLICY',
      content: [
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
      requirements: [
        'Full Name',
        'Mobile Number',
        'Email Address',
        'Unique IvestBot ID',
        'Required account verification information',
        'Wallet/payment information'
      ],
      rules: [
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
      wallets: [
        {
          name: 'Main Wallet',
          desc: 'Displays the user’s available balance for trading, reservations, and immediate withdrawals.'
        },
        {
          name: 'Reserve Wallet',
          desc: 'Displays funds allocated to active eligible reservation pools and 24-hour yield cycles.'
        },
        {
          name: 'Reward Wallet',
          desc: 'Displays eligible rewards, lucky spin prizes, referral credits, or other promotional balances.'
        }
      ],
      transactionTypes: [
        'Deposits',
        'Withdrawals',
        'Transfers',
        'Reservation transactions',
        'Referral rewards',
        'Other wallet adjustments'
      ],
      note: 'Each transaction is cryptographically ledgered with a clear status and verifiable reference ID.'
    },
    {
      id: 'sec-4',
      num: 4,
      title: 'DEPOSIT POLICY',
      minDeposit: '$50 USDT',
      flow: 'Pending → Under Review → Approved / Rejected',
      details: [
        'Minimum Deposit: $50 USDT equivalent.',
        'Once a deposit has been successfully verified and approved on-chain, the applicable amount will be immediately reflected in the user’s wallet.',
        'IvestBot reviews and may reject deposits that are unverified, duplicate, incorrectly submitted, inconsistent with payment information, or suspected of fraudulent activity.'
      ]
    },
    {
      id: 'sec-5',
      num: 5,
      title: 'WITHDRAWAL POLICY & 6-LEVEL STRUCTURE',
      minWithdrawal: '$50 USDT',
      tiers: [
        { level: 'Level 1', maxMonthly: '$300', maxCount: '2' },
        { level: 'Level 2', maxMonthly: '$1,000', maxCount: '5' },
        { level: 'Level 3', maxMonthly: '$2,000', maxCount: '10' },
        { level: 'Level 4', maxMonthly: '$3,000', maxCount: '20' },
        { level: 'Level 5', maxMonthly: '$5,000', maxCount: '35' },
        { level: 'Level 6', maxMonthly: '$10,000', maxCount: '50' }
      ],
      conditions: [
        'The user must have sufficient eligible wallet balance.',
        'Required IvestBot ID verification must be completed.',
        'The applicable monthly withdrawal limit cannot be exceeded.',
        'The applicable monthly withdrawal count cannot be exceeded.',
        'Withdrawal information (USDT TRC20/BEP20 address) must be accurate and valid.',
        'Additional verification may be requested when necessary.',
        'Applicable processing or network fees, if any, will be displayed before confirmation.',
        'Withdrawal requests are audited and reviewed before on-chain dispatch.'
      ]
    },
    {
      id: 'sec-6',
      num: 6,
      title: 'WITHDRAWAL PROCESS LIFECYCLE',
      stages: 'Pending → Under Review → Approved → Processing → Completed',
      rejectionStatus: 'Rejected / Cancelled (with explicit audit reason provided in user dashboard)',
      notes: 'Real-time telemetry and status updates are displayed in the user’s transaction ledger.'
    },
    {
      id: 'sec-7',
      num: 7,
      title: 'WITHDRAWAL LIMIT RESET',
      content: [
        'Monthly withdrawal limits and withdrawal counts operate strictly according to IvestBot’s defined 30-day rolling monthly cycle.',
        'The user dashboard displays:',
        '• Monthly withdrawal limit',
        '• Amount already withdrawn in the current period',
        '• Remaining withdrawal limit balance',
        '• Number of withdrawals used',
        '• Remaining withdrawal requests available'
      ]
    },
    {
      id: 'sec-8',
      num: 8,
      title: 'LEVEL SYSTEM',
      levels: 'Level 1 → Level 2 → Level 3 → Level 4 → Level 5 → Level 6',
      criteria: [
        'IvestBot ID verification status',
        'Eligible platform reservation and trading volume',
        'Active referral and network member count',
        'Team volume and pool contributions',
        'Other published platform conditions'
      ],
      disclaimer: 'Level status reflects protocol permissions and tier privileges; it does not automatically guarantee any financial return or profit.'
    },
    {
      id: 'sec-9',
      num: 9,
      title: 'REFERRAL PROGRAM',
      features: [
        'Unique cryptographic referral invite link and 8-character referral code.',
        'Real-time referral registration and network tier tracking (Level A, B, and C).',
        'Comprehensive referral commission history with transparent ledgering.',
        'Tiered referral rewards credited upon eligible reservation completions.'
      ],
      prohibited: [
        'Self-referrals (signing up under one’s own account)',
        'Fake accounts or bot generation',
        'Duplicate accounts created to claim bonuses',
        'Artificial referral volume manipulation',
        'Misuse or deceptive promotion of referral codes'
      ]
    },
    {
      id: 'sec-10',
      num: 10,
      title: 'RESERVATION SYSTEM',
      stages: 'Available → Reserved → Processing → Completed / Cancelled',
      requirements: [
        'Before confirming a reservation, the system displays the exact reservation amount, duration cycle, expected yield rate, and applicable lock period.',
        'The required balance is locked in the Reserve Wallet for the active reservation cycle and cannot be concurrently withdrawn until settlement.'
      ]
    },
    {
      id: 'sec-11',
      num: 11,
      title: 'RESERVATION CYCLE',
      timerDesc: 'Standard reservation pools operate on dynamic 24-hour cycles. The platform displays real-time countdown timers: NEXT RESERVATION AVAILABLE IN HH : MM : SS.',
      rules: 'The protocol automatically prevents duplicate or conflicting overlapping reservation attempts.'
    },
    {
      id: 'sec-12',
      num: 12,
      title: 'TRANSACTION HISTORY & LEDGER TRANSPARENCY',
      sampleTable: [
        { date: '27 Sep', type: 'Deposit', amount: '$100.00 USDT', status: 'Approved' },
        { date: '27 Sep', type: 'Reservation', amount: '$50.00 USDT', status: 'Completed' },
        { date: '28 Sep', type: 'Reward / Profit', amount: '$4.50 USDT', status: 'Credited' },
        { date: '29 Sep', type: 'Withdrawal', amount: '$50.00 USDT', status: 'Pending / In Review' }
      ],
      fields: ['Transaction ID', 'Date & Timestamp', 'Transaction Type', 'Amount', 'Wallet Type', 'Status', 'Fee', 'Reference / TX Hash']
    },
    {
      id: 'sec-13',
      num: 13,
      title: 'SECURITY POLICY',
      protocols: [
        'Multi-factor authentication (2FA) & security passcodes.',
        'Mobile and email verification mechanisms.',
        'Mandatory 6-digit withdrawal security PIN.',
        'Automated fraud and suspicious velocity detection.',
        'IvestBot never requests users to disclose passwords, seed phrases, or security PINs.'
      ]
    },
    {
      id: 'sec-14',
      num: 14,
      title: 'ACCOUNT RESTRICTIONS & ENFORCEMENT',
      grounds: [
        'Evidence of fraudulent transactions or exploit attempts.',
        'Fake, forged, or manipulated IvestBot ID verification documents.',
        'Multiple unauthorized or bot accounts.',
        'Self-referral circular funding rings.',
        'Violation of platform community or security guidelines.'
      ]
    },
    {
      id: 'sec-15',
      num: 15,
      title: 'FEES & CHARGES',
      details: [
        'Deposit Fee: $0.00 (Zero platform deposit charge).',
        'Withdrawal Fee: Displayed dynamically before transaction submission.',
        'Network Fee: Standard blockchain gas (TRC20 / BEP20) as applicable.',
        'Processing Fee: Clear itemized disclosure on confirmation dialog.'
      ]
    },
    {
      id: 'sec-16',
      num: 16,
      title: 'BALANCE & RETURN DISCLOSURE',
      warning: 'No wallet balance, reward, or platform activity should be represented as a guaranteed, risk-free, or assured financial return. Users must evaluate all market risks and local regulations before participating in decentralized yield pools.'
    },
    {
      id: 'sec-17',
      num: 17,
      title: 'USER RESPONSIBILITIES',
      items: [
        'Providing accurate, verifiable account details.',
        'Maintaining the security of account credentials and PINs.',
        'Double-checking crypto recipient addresses before submitting withdrawals.',
        'Ensuring compliance with local tax and financial jurisdiction laws.'
      ]
    },
    {
      id: 'sec-18',
      num: 18,
      title: 'PROHIBITED ACTIVITIES',
      items: [
        'Money laundering, terrorist financing, or unlawful asset transfers.',
        'Automated bot attacks, API scraping, or reverse engineering.',
        'Collusion, sybil attacks, and referral manipulation schemes.',
        'Providing false identity or payment documentation.'
      ]
    },
    {
      id: 'sec-19',
      num: 19,
      title: 'POLICY UPDATES & AMENDMENTS',
      details: 'IvestBot reserves the right to amend this policy as required by operational, technical, or regulatory developments. Policy revisions will be posted with an updated version number and effective timestamp.'
    },
    {
      id: 'sec-20',
      num: 20,
      title: 'USER ACKNOWLEDGEMENT & BINDING ACCEPTANCE',
      details: 'By registering, accessing, depositing, or transacting on IvestBot, the user unconditionally confirms that they have read, understood, and agreed to all 20 sections of Policy Version 1.0.'
    }
  ], []);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return policySections;
    const q = searchTerm.toLowerCase();
    return policySections.filter(sec => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchSub = sec.subtitle?.toLowerCase().includes(q);
      const matchContent = JSON.stringify(sec).toLowerCase().includes(q);
      return matchTitle || matchSub || matchContent;
    });
  }, [policySections, searchTerm]);

  // Handle PDF Print
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
          .print-header {
            display: block !important;
            text-align: center;
            border-bottom: 2px solid #0F172A;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
        }
        @media screen {
          .print-only-header {
            display: none;
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
                  USER, WALLET & WITHDRAWAL POLICY
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

      {/* ─── SEARCH & FILTER CONTROLS ──────────────────────────── */}
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

            {/* Standard List Items */}
            {sec.content && (
              <Box component="ul" sx={{ pl: 2.5, m: 0, color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.7 }}>
                {sec.content.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </Box>
            )}

            {/* Section 2: Verification */}
            {sec.requirements && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#FEF08A', fontWeight: 700, display: 'block', mb: 0.8 }}>
                  Required Information:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {sec.requirements.map((r, i) => (
                    <Chip key={i} label={r} size="small" sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', color: '#E2E8F0', border: '1px solid #334155' }} />
                  ))}
                </Box>
              </Box>
            )}

            {sec.rules && (
              <Box component="ul" sx={{ pl: 2.5, m: 0, color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.7 }}>
                {sec.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </Box>
            )}

            {/* Section 3: Wallets */}
            {sec.wallets && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, my: 1.5 }}>
                {sec.wallets.map((w, idx) => (
                  <Paper key={idx} sx={{ p: 1.5, bgcolor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FBBF24', mb: 0.5 }}>
                      {w.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', lineHeight: 1.5 }}>
                      {w.desc}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {sec.transactionTypes && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>
                  Ledgered Transactions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.5 }}>
                  {sec.transactionTypes.map((t, i) => (
                    <Chip key={i} label={t} size="small" variant="outlined" sx={{ color: '#CBD5E1', borderColor: '#475569' }} />
                  ))}
                </Box>
              </Box>
            )}

            {/* Section 4: Deposit */}
            {sec.flow && (
              <Paper sx={{ p: 1.5, my: 1.5, bgcolor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#4ADE80', fontWeight: 800, display: 'block', mb: 0.5 }}>
                  Approval Workflow:
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                  {sec.flow}
                </Typography>
              </Paper>
            )}

            {sec.details && !Array.isArray(sec.details) && (
              <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.7 }}>
                {sec.details}
              </Typography>
            )}

            {sec.details && Array.isArray(sec.details) && (
              <Box component="ul" sx={{ pl: 2.5, m: 0, color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.7 }}>
                {sec.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </Box>
            )}

            {/* Section 5: Conditions */}
            {sec.conditions && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#FEF08A', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Mandatory Withdrawal Conditions:
                </Typography>
                <Box component="ul" sx={{ pl: 2.5, m: 0, color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.7 }}>
                  {sec.conditions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </Box>
              </Box>
            )}

            {/* Section 12: Sample Table */}
            {sec.sampleTable && (
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
                      {sec.sampleTable.map((row, i) => (
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

            {/* Warning callouts */}
            {sec.warning && (
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
                  {sec.warning}
                </Typography>
              </Box>
            )}

            {sec.disclaimer && (
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
                  ⚖️ {sec.disclaimer}
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
          IVESTBOT PROTOCOL COMPLIANCE & GOVERNANCE
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
