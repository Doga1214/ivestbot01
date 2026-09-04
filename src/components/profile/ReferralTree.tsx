import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper
} from '@mui/material';
import {
  ExpandMoreIcon,
  AccountTreeIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

export const ReferralTree: React.FC = () => {
  const { referralSummary } = useApp();
  const [expandedTier, setExpandedTier] = useState<string | false>('tierA');

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedTier(isExpanded ? panel : false);
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <AccountTreeIcon sx={{ color: '#8b5cf6' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Referral Hierarchy & Tree View
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Explore your downline members segmented by tier (A, B, C)
            </Typography>
          </Box>
        </Box>

        {/* Tier A Accordion */}
        <Accordion
          expanded={expandedTier === 'tierA'}
          onChange={handleChange('tierA')}
          sx={{
            bgcolor: '#111522',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '12px !important',
            mb: 2,
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#a78bfa' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip label="TIER A" color="primary" size="small" sx={{ fontWeight: 800 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Direct Referrals (0.5% Commission)
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                {referralSummary.tierAMembers.length} Members
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {referralSummary.tierAMembers.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9CA3AF', py: 2, textAlign: 'center' }}>
                No direct A members yet. Share your invite link!
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#9CA3AF' }}>Name</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Username</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Level</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Join Date</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {referralSummary.tierAMembers.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell sx={{ fontWeight: 700 }}>{m.name}</TableCell>
                        <TableCell sx={{ color: '#9CA3AF' }}>@{m.username}</TableCell>
                        <TableCell>
                          <Chip label={`Level ${m.level}`} size="small" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{formatDate(m.joinedAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={m.status}
                            color={m.status === 'ACTIVE' ? 'success' : 'warning'}
                            variant={m.status === 'ACTIVE' ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ fontSize: '0.68rem', fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Tier B Accordion */}
        <Accordion
          expanded={expandedTier === 'tierB'}
          onChange={handleChange('tierB')}
          sx={{
            bgcolor: '#111522',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '12px !important',
            mb: 2,
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#60a5fa' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip label="TIER B" color="secondary" size="small" sx={{ fontWeight: 800 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Secondary Referrals (0.25% Commission)
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#60a5fa' }}>
                {referralSummary.tierBMembers.length} Members
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {referralSummary.tierBMembers.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9CA3AF', py: 2, textAlign: 'center' }}>
                No secondary B members yet.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#9CA3AF' }}>Name</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Username</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Referred By</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Level</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Join Date</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {referralSummary.tierBMembers.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell sx={{ fontWeight: 700 }}>{m.name}</TableCell>
                        <TableCell sx={{ color: '#9CA3AF' }}>@{m.username}</TableCell>
                        <TableCell sx={{ color: '#a78bfa' }}>{m.referredBy}</TableCell>
                        <TableCell>
                          <Chip label={`Level ${m.level}`} size="small" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{formatDate(m.joinedAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={m.status}
                            color={m.status === 'ACTIVE' ? 'success' : 'warning'}
                            variant={m.status === 'ACTIVE' ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ fontSize: '0.68rem', fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Tier C Accordion */}
        <Accordion
          expanded={expandedTier === 'tierC'}
          onChange={handleChange('tierC')}
          sx={{
            bgcolor: '#111522',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px !important',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#34d399' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip label="TIER C" color="success" size="small" sx={{ fontWeight: 800 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Tertiary Referrals (0.225% Commission)
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399' }}>
                {referralSummary.tierCMembers.length} Members
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {referralSummary.tierCMembers.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9CA3AF', py: 2, textAlign: 'center' }}>
                No tertiary C members yet.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#9CA3AF' }}>Name</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Username</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Referred By</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Level</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Join Date</TableCell>
                      <TableCell sx={{ color: '#9CA3AF' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {referralSummary.tierCMembers.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell sx={{ fontWeight: 700 }}>{m.name}</TableCell>
                        <TableCell sx={{ color: '#9CA3AF' }}>@{m.username}</TableCell>
                        <TableCell sx={{ color: '#60a5fa' }}>{m.referredBy}</TableCell>
                        <TableCell>
                          <Chip label={`Level ${m.level}`} size="small" sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{formatDate(m.joinedAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={m.status}
                            color={m.status === 'ACTIVE' ? 'success' : 'warning'}
                            variant={m.status === 'ACTIVE' ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ fontSize: '0.68rem', fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};
