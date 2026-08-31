import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid
} from '@mui/material';
import {
  MilitaryTechIcon,
  ArrowUpwardIcon,
  CheckCircleIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { levelService } from '../../services/levelService';

export const LevelCard: React.FC = () => {
  const { wallet, userLevel, referralSummary } = useApp();

  const progressData = levelService.getLevelProgress(userLevel, {
    walletBalance: wallet.totalBalance,
    aMembers: referralSummary.aMembersCount,
    bMembers: referralSummary.bMembersCount,
    cMembers: referralSummary.cMembersCount
  });

  const currentLevelDef = levelService.getLevelRequirements(userLevel);

  return (
    <Card
      sx={{
        background: 'linear-gradient(145deg, #111522 0%, #171B2A 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
        mb: 4
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <MilitaryTechIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                My Level: LEVEL {userLevel}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                {currentLevelDef.title} — Active Membership Tier
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<ArrowUpwardIcon />}
            label={progressData.nextLevel ? `Goal: Level ${progressData.nextLevel}` : 'VIP Max Level'}
            color="primary"
            sx={{ fontWeight: 700, px: 1 }}
          />
        </Box>

        {/* Progress to Next Level */}
        <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {progressData.nextLevel ? `Progression toward Level ${progressData.nextLevel}` : 'Highest Level Achieved'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a78bfa' }}>
              {progressData.progressPercent}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressData.progressPercent}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)',
                borderRadius: 5
              }
            }}
          />
        </Box>

        {/* Requirement Breakdown */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Tier Qualification Criteria
        </Typography>

        <Grid container spacing={2}>
          {progressData.requirementsText.map((req, idx) => (
            <Grid size={{ xs: 12, sm: 4 }} key={idx}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                  {req}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
