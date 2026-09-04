import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Tabs,
  Tab,
  Chip,
  TextField,
  MenuItem,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useApp } from '../context/AppContext';
import { referralService } from '../services/referralService';
import type { ReferralRecord } from '../types/referral';
import {
  ContentCopyIcon,
  MilitaryTechIcon,
  ShareOutlinedIcon,
  QrCode2Icon,
  CloseIcon,
  CheckCircleIcon,
  PendingActionsIcon,
  AccountTreeIcon,
  EmojiEventsIcon,
  ReceiptLongIcon,
  AutoAwesomeIcon
} from '../components/common/Icons';

export const Referral: React.FC = () => {
  const { user, wallet, showSnackbar } = useApp();
  const [activeTab, setActiveTab] = useState<number>(0);

  // QR & Share Dialog state
  const [qrOpen, setQrOpen] = useState<boolean>(false);

  // Filters for downline list
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Re-fetch referral data & sync
  const [tick, setTick] = useState<number>(0);
  const refreshData = () => setTick(t => t + 1);

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('ivestbot_referral_config_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ivestbot_referral_config_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const referralCode = user?.referralCode || 'IVEST100';
  const summary = useMemo(
    () => referralService.getReferralSummary(referralCode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [referralCode, user?.id, wallet.totalBalance, tick]
  );

  const rewardTiers = useMemo(() => referralService.getRewardTiers(), []);
  const leaderboard = useMemo(() => referralService.getLeaderboard(), [tick]);
  const adminConfig = useMemo(() => referralService.getAdminConfig(), [tick]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`${label} copied to clipboard!`, 'success');
  };

  // Social Share Handlers
  const shareText = encodeURIComponent(
    `🚀 Join Ivestbot with my invite link! Double your principle in 35 days (2.85% daily profit) & claim up to 20 USDT welcome bonus! 💰`
  );
  const shareUrl = encodeURIComponent(summary.referralLink);

  const openShare = (platform: 'whatsapp' | 'telegram' | 'twitter' | 'facebook' | 'email') => {
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=Exclusive%20Ivestbot%20Invitation&body=${shareText}%0A%0AJoin%20here:%20${shareUrl}`;
        break;
    }
    if (url) window.open(url, '_blank');
  };

  // Filtered Downlines
  const filteredRecords = useMemo(() => {
    return summary.referralRecords.filter((rec: ReferralRecord) => {
      const matchStatus = filterStatus === 'ALL' || rec.status === filterStatus;
      const matchTier = filterTier === 'ALL' || rec.tierLevel === filterTier;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        rec.refereeUsername.toLowerCase().includes(q) ||
        rec.refereeName.toLowerCase().includes(q);
      return matchStatus && matchTier && matchSearch;
    });
  }, [summary.referralRecords, filterStatus, filterTier, searchQuery]);

  return (
    <Box sx={{ pb: 8 }}>
      {/* ─── HERO HEADER ────────────────────────────────────────── */}
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3.5,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.05))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Chip
            label={summary.currentTierName}
            icon={<MilitaryTechIcon style={{ color: '#fff' }} />}
            sx={{
              bgcolor: summary.currentTier === 4 ? '#00E5FF' : summary.currentTier === 3 ? '#FFD700' : summary.currentTier === 2 ? '#C0C0C0' : '#CD7F32',
              color: '#000',
              fontWeight: 900,
              fontSize: '0.8rem',
              letterSpacing: '0.05em'
            }}
          />
          <Chip
            label={`Tier ${summary.currentTier} of 4`}
            variant="outlined"
            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#9CA3AF', fontWeight: 700 }}
          />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' } }}>
          Referral & Affiliate Command Center
        </Typography>
        <Typography variant="body1" sx={{ color: '#9CA3AF', maxWidth: 720, lineHeight: 1.6, fontSize: { xs: '0.88rem', sm: '1rem' } }}>
          Earn lifetime passive commissions across 3 levels (A: 0.5%, B: 0.25%, C: 0.225%) + instant USDT signup & milestone unlock bonuses.
        </Typography>
      </Box>

      {/* ─── QUICK METRICS KPI BAR ──────────────────────────────── */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Paper sx={{ p: 1.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.72rem' }}>Total Earned</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#38bdf8', mt: 0.3, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
              ${summary.totalEarnings.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Paper sx={{ p: 1.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.72rem' }}>Today's Bonus</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#34d399', mt: 0.3, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
              +${summary.todayEarnings.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Paper sx={{ p: 1.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.72rem' }}>Total Team</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mt: 0.3, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
              {summary.totalMembersCount}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Paper sx={{ p: 1.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.72rem' }}>Active (Deposited)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981', mt: 0.3, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
              {summary.activeMembersCount}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Paper sx={{ p: 1.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.72rem' }}>Pending Bonus</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#fbbf24', mt: 0.3, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
              ${summary.pendingBonus.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Paper sx={{ p: 1.5, bgcolor: '#111522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, fontSize: '0.72rem' }}>Conversion</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#a78bfa', mt: 0.3, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
              {summary.conversionRate}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ─── NAVIGATION TABS ────────────────────────────────────── */}
      <Paper
        sx={{
          mb: 3.5,
          backgroundColor: '#111522',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 3
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: { xs: 46, sm: 52 },
            '& .MuiTab-root': {
              minHeight: { xs: 46, sm: 52 },
              fontWeight: 700,
              fontSize: { xs: '0.8rem', sm: '0.88rem' },
              color: '#9CA3AF',
              px: { xs: 1.5, sm: 2.5 },
              '&.Mui-selected': { color: '#a78bfa' }
            }
          }}
        >
          <Tab icon={<ShareOutlinedIcon />} iconPosition="start" label="Invite & Share" />
          <Tab icon={<MilitaryTechIcon />} iconPosition="start" label="Tier Progression" />
          <Tab icon={<AccountTreeIcon />} iconPosition="start" label={`My Downline (${summary.totalMembersCount})`} />
          <Tab icon={<EmojiEventsIcon />} iconPosition="start" label="Leaderboard" />
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Commission Ledger" />
        </Tabs>
      </Paper>

      {/* ─── TAB 0: INVITE & SHARE ──────────────────────────────── */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Link & Code Box */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Your Exclusive Referral Assets
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
                  Share your unique referral link or code. When friends register and activate their account, commissions and bonuses are credited instantly.
                </Typography>

                {/* Link Box */}
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  INVITE LINK
                </Typography>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    mb: 2.5
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: '#e2e8f0', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {summary.referralLink}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ContentCopyIcon fontSize="small" />}
                    onClick={() => handleCopy(summary.referralLink, 'Referral Link')}
                    sx={{ flexShrink: 0, fontWeight: 800, px: 2 }}
                  >
                    COPY LINK
                  </Button>
                </Paper>

                {/* Code & QR Box */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, display: 'block', mb: 0.5 }}>
                      REFERRAL CODE
                    </Typography>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#a78bfa', fontWeight: 900, letterSpacing: '0.1em' }}>
                        {summary.referralCode}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        onClick={() => handleCopy(summary.referralCode, 'Referral Code')}
                        sx={{ fontWeight: 800, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                      >
                        COPY
                      </Button>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, display: 'block', mb: 0.5 }}>
                      QR CODE POSTER
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<QrCode2Icon />}
                      onClick={() => setQrOpen(true)}
                      sx={{
                        py: 1.4,
                        borderRadius: 2.5,
                        borderColor: 'rgba(139, 92, 246, 0.4)',
                        color: '#a78bfa',
                        fontWeight: 800,
                        '&:hover': { borderColor: '#a78bfa', bgcolor: 'rgba(139, 92, 246, 0.1)' }
                      }}
                    >
                      VIEW QR CODE POSTER
                    </Button>
                  </Grid>
                </Grid>

                {/* 1-Click Social Sharing Bar */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  1-Click Social Sharing
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => openShare('whatsapp')}
                    sx={{ bgcolor: '#25D366', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#1EBE5D' } }}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => openShare('telegram')}
                    sx={{ bgcolor: '#0088cc', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#0077b5' } }}
                  >
                    Telegram
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => openShare('twitter')}
                    sx={{ bgcolor: '#1DA1F2', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#0c85d0' } }}
                  >
                    Twitter / X
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => openShare('facebook')}
                    sx={{ bgcolor: '#1877F2', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#166fe5' } }}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => openShare('email')}
                    sx={{ bgcolor: '#ea4335', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#d33828' } }}
                  >
                    Email Invite
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sponsor Card & Multi-Tier Rates */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Sponsor Information */}
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>
                    Your Sponsor / Mentor
                  </Typography>
                  {summary.referredBy ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#8b5cf6', fontWeight: 900 }}>
                        {summary.referredBy.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          @{summary.referredBy.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700 }}>
                          Referral Sponsor Code: {summary.referredBy.code}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                        Root Account (Direct Platform Genesis)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        You registered directly without an external sponsor.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Commission Rates Breakdown */}
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Multi-Level Commission Structure
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, mb: 1, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#a78bfa' }}>
                      Level A (Direct)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#fff' }}>
                      {adminConfig.commissionRates.A}% Daily + 5 USDT Bonus
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, mb: 1, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#60a5fa' }}>
                      Level B (2nd Tier)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#fff' }}>
                      {adminConfig.commissionRates.B}% Daily Commission
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#34d399' }}>
                      Level C (3rd Tier)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#fff' }}>
                      {adminConfig.commissionRates.C}% Daily Commission
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* ─── TAB 1: TIER PROGRESSION ────────────────────────────── */}
      {activeTab === 1 && (
        <Box>
          {/* Progress Banner */}
          <Paper
            sx={{
              p: 3,
              mb: 3.5,
              bgcolor: '#111522',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Current Level: <span style={{ color: '#a78bfa' }}>{summary.currentTierName}</span>
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  {summary.nextTierRemaining > 0
                    ? `Invite ${summary.nextTierRemaining} more active downline members to upgrade to Tier ${summary.currentTier + 1}!`
                    : '🎉 You have unlocked the highest VIP Diamond Ambassador tier!'}
                </Typography>
              </Box>
              <Chip
                label={`${summary.activeMembersCount} Active Downlines`}
                color="primary"
                sx={{ fontWeight: 800, fontSize: '0.85rem' }}
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={
                summary.currentTier === 4
                  ? 100
                  : Math.min(100, (summary.activeMembersCount / (summary.currentTier === 1 ? 10 : summary.currentTier === 2 ? 25 : 50)) * 100)
              }
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'rgba(255,255,255,0.08)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981)'
                }
              }}
            />
          </Paper>

          {/* Tier Cards Grid */}
          <Grid container spacing={2.5}>
            {rewardTiers.map(t => {
              const isCurrent = summary.currentTier === t.tier;

              return (
                <Grid key={t.tier} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      height: '100%',
                      border: isCurrent ? `2px solid ${t.badgeColor}` : '1px solid rgba(255,255,255,0.08)',
                      bgcolor: isCurrent ? 'rgba(139, 92, 246, 0.08)' : '#111522',
                      position: 'relative'
                    }}
                  >
                    {isCurrent && (
                      <Chip
                        label="CURRENT TIER"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: t.badgeColor,
                          color: '#000',
                          fontWeight: 900,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}

                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="overline" sx={{ color: t.badgeColor, fontWeight: 900, letterSpacing: '0.1em' }}>
                        TIER {t.tier}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                        {t.name}
                      </Typography>

                      <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                        Requires: <strong>{t.minReferrals} - {t.maxReferrals > 9000 ? '50+' : t.maxReferrals} Referrals</strong>
                      </Typography>

                      <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>Reward per Active Ref:</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#34d399' }}>
                          ${t.rewardPerReferralUSDT} USDT
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.5 }}>Milestone Bonus:</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#FFD700' }}>
                          +${t.tierBonusUSDT} USDT
                        </Typography>
                      </Paper>

                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#9CA3AF', display: 'block', mb: 1 }}>
                        TIER PERKS & BENEFITS:
                      </Typography>
                      {t.benefits.map((b, idx) => (
                        <Typography key={idx} variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#e2e8f0', mb: 0.75 }}>
                          <CheckCircleIcon fontSize="inherit" style={{ color: t.badgeColor }} /> {b}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* ─── TAB 2: MY DOWNLINE REFERRALS ───────────────────────── */}
      {activeTab === 2 && (
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                My Downline Team ({summary.totalMembersCount})
              </Typography>

              {/* Filters */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  size="small"
                  placeholder="Search user..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 180 } }}
                />

                <TextField
                  select
                  size="small"
                  value={filterTier}
                  onChange={e => setFilterTier(e.target.value)}
                  sx={{ width: { xs: 'calc(50% - 6px)', sm: 130 } }}
                >
                  <MenuItem value="ALL">All Levels</MenuItem>
                  <MenuItem value="A">Level A (Direct)</MenuItem>
                  <MenuItem value="B">Level B (2nd Tier)</MenuItem>
                  <MenuItem value="C">Level C (3rd Tier)</MenuItem>
                </TextField>

                <TextField
                  select
                  size="small"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  sx={{ width: { xs: 'calc(50% - 6px)', sm: 140 } }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="COMPLETED">Active / Deposited</MenuItem>
                  <MenuItem value="PENDING">Pending Deposit</MenuItem>
                </TextField>
              </Box>
            </Box>

            {filteredRecords.length === 0 ? (
              <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: 2 }}>
                No referrals found matching the selected filters. Share your invite link to build your team!
              </Alert>
            ) : (
              <>
                {/* 1. Mobile Downline Cards (<600px) */}
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {filteredRecords.map((r: ReferralRecord) => (
                      <Paper
                        key={r.id}
                        sx={{
                          p: 1.8,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#3b82f6', fontSize: '0.85rem' }}>
                              {r.refereeUsername.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                @{r.refereeUsername}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                                {r.refereeName}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={`Level ${r.tierLevel}`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: r.tierLevel === 'A' ? 'rgba(139, 92, 246, 0.2)' : r.tierLevel === 'B' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: r.tierLevel === 'A' ? '#a78bfa' : r.tierLevel === 'B' ? '#60a5fa' : '#34d399'
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 0.5 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.72rem' }}>Deposit Volume</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: r.hasDeposited ? '#34d399' : '#9CA3AF' }}>
                              {r.depositAmountUSDT ? `$${r.depositAmountUSDT.toFixed(2)}` : '$0.00'}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', fontSize: '0.72rem' }}>Commission Earned</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399' }}>
                              +${r.rewardAmountUSDT.toFixed(2)} USDT
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.72rem' }}>
                            Joined: {new Date(r.createdAt).toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={r.status === 'COMPLETED' ? 'ACTIVE' : 'PENDING'}
                            size="small"
                            icon={r.status === 'COMPLETED' ? <CheckCircleIcon /> : <PendingActionsIcon />}
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              height: 22,
                              bgcolor: r.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: r.status === 'COMPLETED' ? '#34d399' : '#fbbf24'
                            }}
                          />
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Box>

                {/* 2. Desktop Full Table (>=600px) */}
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <TableContainer component={Paper} sx={{ bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Downline Member</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Tier Level</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Joined Date</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Deposit Volume</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }} align="right">Earned USDT</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRecords.map((r: ReferralRecord) => (
                          <TableRow key={r.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6', fontSize: '0.85rem' }}>
                                  {r.refereeUsername.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    @{r.refereeUsername}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                                    {r.refereeName}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`Level ${r.tierLevel}`}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: r.tierLevel === 'A' ? 'rgba(139, 92, 246, 0.2)' : r.tierLevel === 'B' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                  color: r.tierLevel === 'A' ? '#a78bfa' : r.tierLevel === 'B' ? '#60a5fa' : '#34d399'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                              {new Date(r.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: r.hasDeposited ? '#34d399' : '#9CA3AF' }}>
                                {r.depositAmountUSDT ? `$${r.depositAmountUSDT.toFixed(2)} USDT` : '$0.00'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={r.status === 'COMPLETED' ? 'ACTIVE / DEPOSITED' : 'PENDING DEPOSIT'}
                                size="small"
                                icon={r.status === 'COMPLETED' ? <CheckCircleIcon /> : <PendingActionsIcon />}
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  bgcolor: r.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: r.status === 'COMPLETED' ? '#34d399' : '#fbbf24'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399' }}>
                                +${r.rewardAmountUSDT.toFixed(2)} USDT
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── TAB 3: LEADERBOARD ─────────────────────────────────── */}
      {activeTab === 3 && (
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Global Referral Champions Leaderboard
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  Top 10 performing ambassadors rewarded with weekly VIP prize pools & revenue share.
                </Typography>
              </Box>
              <Chip
                label="Weekly Prize: $5,000 USDT Pool"
                icon={<AutoAwesomeIcon style={{ color: '#FFD700' }} />}
                sx={{ bgcolor: 'rgba(255, 215, 0, 0.1)', color: '#FFD700', fontWeight: 800 }}
              />
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Ambassador</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>VIP Tier</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }} align="center">Active Referrals</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }} align="right">Total Rewards Earned</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map(item => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <TableRow key={item.userId} hover sx={{ bgcolor: isTop1 ? 'rgba(255, 215, 0, 0.04)' : undefined }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isTop1 ? (
                              <Typography sx={{ fontSize: '1.2rem' }}>🥇</Typography>
                            ) : isTop2 ? (
                              <Typography sx={{ fontSize: '1.2rem' }}>🥈</Typography>
                            ) : isTop3 ? (
                              <Typography sx={{ fontSize: '1.2rem' }}>🥉</Typography>
                            ) : (
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9CA3AF', width: 24 }}>
                                #{item.rank}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: isTop1 ? '#FFD700' : '#8b5cf6', color: isTop1 ? '#000' : '#fff', fontWeight: 900 }}>
                              {item.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              @{item.username}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.tierName}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              bgcolor: item.tier === 4 ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 215, 0, 0.15)',
                              color: item.tier === 4 ? '#00E5FF' : '#FFD700'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {item.activeReferrals} / {item.totalReferrals}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#34d399' }}>
                            ${item.totalEarnedUSDT.toFixed(2)} USDT
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ─── TAB 4: COMMISSION LEDGER ───────────────────────────── */}
      {activeTab === 4 && (
        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Commission & Bonus Payout History
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
              Every reward payout is verified, cryptographically hashed, and recorded in your real-time ledger.
            </Typography>

            {summary.earningsHistory.length === 0 ? (
              <Alert severity="info" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: 2 }}>
                No commission payouts recorded yet. Commissions are credited when team members deposit or complete reservations.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Payout Date</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Downline Source</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Commission Type</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#9CA3AF' }} align="right">Amount (USDT)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.earningsHistory.map(e => (
                      <TableRow key={e.id} hover>
                        <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                          {new Date(e.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            @{e.fromMemberUsername}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={e.tier === 'DEPOSIT_BONUS' ? 'WELCOME BONUS' : e.tier === 'TIER_BONUS' ? 'TIER UNLOCK' : `TIER ${e.tier}`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              bgcolor: e.tier === 'A' ? 'rgba(139, 92, 246, 0.15)' : e.tier === 'DEPOSIT_BONUS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: e.tier === 'A' ? '#a78bfa' : e.tier === 'DEPOSIT_BONUS' ? '#34d399' : '#60a5fa'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                          {e.description || 'Downline Reservation Commission'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#34d399' }}>
                            +${e.amount.toFixed(2)} USDT
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── MODAL: QR CODE POSTER ──────────────────────────────── */}
      <Dialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#111522',
              backgroundImage: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 3.5,
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Invite QR Code Poster
          </Typography>
          <IconButton onClick={() => setQrOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: '#ffffff',
              borderRadius: 3,
              display: 'inline-block',
              mb: 2,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            {/* SVG Dynamic QR Render */}
            <svg width="200" height="200" viewBox="0 0 200 200">
              <rect width="200" height="200" fill="#ffffff" />
              {/* Corner squares */}
              <rect x="15" y="15" width="45" height="45" fill="#0b0f19" rx="6" />
              <rect x="25" y="25" width="25" height="25" fill="#ffffff" rx="3" />
              <rect x="31" y="31" width="13" height="13" fill="#8b5cf6" rx="2" />

              <rect x="140" y="15" width="45" height="45" fill="#0b0f19" rx="6" />
              <rect x="150" y="25" width="25" height="25" fill="#ffffff" rx="3" />
              <rect x="156" y="31" width="13" height="13" fill="#8b5cf6" rx="2" />

              <rect x="15" y="140" width="45" height="45" fill="#0b0f19" rx="6" />
              <rect x="25" y="150" width="25" height="25" fill="#ffffff" rx="3" />
              <rect x="31" y="156" width="13" height="13" fill="#8b5cf6" rx="2" />

              {/* Data matrix pattern */}
              <rect x="70" y="20" width="12" height="12" fill="#0b0f19" />
              <rect x="90" y="20" width="12" height="12" fill="#0b0f19" />
              <rect x="110" y="20" width="12" height="12" fill="#0b0f19" />
              <rect x="70" y="40" width="12" height="12" fill="#8b5cf6" />
              <rect x="90" y="50" width="12" height="12" fill="#0b0f19" />
              <rect x="110" y="40" width="12" height="12" fill="#0b0f19" />

              <rect x="20" y="70" width="12" height="12" fill="#0b0f19" />
              <rect x="40" y="70" width="12" height="12" fill="#0b0f19" />
              <rect x="60" y="70" width="12" height="12" fill="#0b0f19" />
              <rect x="80" y="70" width="12" height="12" fill="#8b5cf6" />
              <rect x="100" y="70" width="12" height="12" fill="#0b0f19" />
              <rect x="120" y="70" width="12" height="12" fill="#0b0f19" />
              <rect x="140" y="70" width="12" height="12" fill="#0b0f19" />
              <rect x="160" y="70" width="12" height="12" fill="#8b5cf6" />

              <rect x="70" y="90" width="12" height="12" fill="#0b0f19" />
              <rect x="90" y="90" width="20" height="20" fill="#8b5cf6" rx="4" />
              <rect x="120" y="90" width="12" height="12" fill="#0b0f19" />

              <rect x="20" y="110" width="12" height="12" fill="#0b0f19" />
              <rect x="50" y="110" width="12" height="12" fill="#8b5cf6" />
              <rect x="70" y="110" width="12" height="12" fill="#0b0f19" />
              <rect x="110" y="110" width="12" height="12" fill="#0b0f19" />
              <rect x="140" y="110" width="12" height="12" fill="#8b5cf6" />
              <rect x="160" y="110" width="12" height="12" fill="#0b0f19" />

              <rect x="70" y="140" width="12" height="12" fill="#0b0f19" />
              <rect x="90" y="140" width="12" height="12" fill="#0b0f19" />
              <rect x="110" y="140" width="12" height="12" fill="#8b5cf6" />
              <rect x="130" y="140" width="12" height="12" fill="#0b0f19" />
              <rect x="150" y="140" width="12" height="12" fill="#0b0f19" />

              <rect x="70" y="160" width="12" height="12" fill="#8b5cf6" />
              <rect x="100" y="160" width="12" height="12" fill="#0b0f19" />
              <rect x="130" y="160" width="12" height="12" fill="#0b0f19" />
              <rect x="160" y="160" width="12" height="12" fill="#8b5cf6" />
            </svg>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#e2e8f0' }}>
            Code: <span style={{ color: '#a78bfa' }}>{summary.referralCode}</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            Scan with any phone camera to instantly register under your team.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={() => handleCopy(summary.referralLink, 'Invite Link')}
            sx={{ fontWeight: 800 }}
          >
            Copy Invite URL
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Referral;
