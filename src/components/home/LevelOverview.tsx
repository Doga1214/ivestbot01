import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MilitaryTechIcon } from '../common/Icons';
import { levelService } from '../../services/levelService';

export const LevelOverview: React.FC = () => {
  const levels = levelService.getAllLevelRequirements();

  return (
    <Box sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
          Tiered Level Architecture
        </Typography>
        <Typography variant="body1" sx={{ color: '#9CA3AF', maxWidth: 650, mx: 'auto' }}>
          Server-qualified progression unlocking higher status and community leadership rewards.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {levels.map((lvl) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={lvl.level}>
            <Card
              sx={{
                height: '100%',
                background:
                  lvl.level === 4
                    ? 'linear-gradient(145deg, #171b2a 0%, #1e1b4b 100%)'
                    : '#111522',
                border:
                  lvl.level === 4
                    ? '1px solid rgba(139, 92, 246, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 4,
                position: 'relative'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    icon={<MilitaryTechIcon />}
                    label={`LEVEL ${lvl.level}`}
                    color={lvl.level === 4 ? 'primary' : 'default'}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                  {lvl.level === 4 && (
                    <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700 }}>
                      VIP PARTNER
                    </Typography>
                  )}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {lvl.title}
                </Typography>

                <Stack spacing={1.5} sx={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Min Wallet:</span>
                    <strong style={{ color: '#fff' }}>{lvl.minWalletUSDT} USDT</strong>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Direct (A) Members:</span>
                    <strong style={{ color: '#fff' }}>{lvl.requiredAMembers}</strong>
                  </Box>
                  {lvl.requiredBCMembers !== undefined && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Team (B+C) Members:</span>
                      <strong style={{ color: '#fff' }}>{lvl.requiredBCMembers}</strong>
                    </Box>
                  )}
                  {lvl.requiredLevel2Members !== undefined && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Level 2 Members:</span>
                      <strong style={{ color: '#fff' }}>{lvl.requiredLevel2Members}</strong>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
