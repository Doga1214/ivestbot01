import React from 'react';
import { Box, Container, Typography, Card, CardContent, Chip, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MilitaryTechIcon, CheckCircleOutlineIcon } from '../common/Icons';
import { levelService } from '../../services/levelService';

export const LevelOverview: React.FC = () => {
  const levels = levelService.getAllLevelRequirements();

  return (
    <Box sx={{ py: 8, bgcolor: 'rgba(8, 10, 18, 0.5)', position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="VIP TIERS"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 215, 0, 0.1)',
              color: '#FFD700',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              border: '1px solid rgba(255, 215, 0, 0.25)',
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
            Tiered VIP Architecture
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF', maxWidth: 650, mx: 'auto', mt: 1 }}>
            Automated server-qualified tier progression unlocking elite status, fee rebates, and community bonuses.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {levels.map((lvl) => {
            const isTopLevel = lvl.level === 4;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={lvl.level}>
                <Card
                  sx={{
                    height: '100%',
                    background: isTopLevel
                      ? 'linear-gradient(145deg, #171b2a 0%, #2e1065 100%)'
                      : '#111522',
                    border: isTopLevel
                      ? '1px solid rgba(255, 215, 0, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 4,
                    position: 'relative',
                    transition: 'all 0.35s ease',
                    boxShadow: isTopLevel ? '0 12px 30px rgba(255, 215, 0, 0.15)' : 'none',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      borderColor: isTopLevel ? '#FFD700' : 'rgba(139, 92, 246, 0.5)',
                      boxShadow: isTopLevel
                        ? '0 16px 40px rgba(255, 215, 0, 0.25)'
                        : '0 16px 40px rgba(139, 92, 246, 0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip
                        icon={<MilitaryTechIcon style={{ color: isTopLevel ? '#FFD700' : '#a78bfa' }} />}
                        label={`LEVEL ${lvl.level}`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: isTopLevel ? 'rgba(255, 215, 0, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                          color: isTopLevel ? '#FFD700' : '#a78bfa',
                          border: `1px solid ${isTopLevel ? 'rgba(255, 215, 0, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                        }}
                      />
                      {isTopLevel && (
                        <Chip
                          label="★ VIP"
                          size="small"
                          sx={{ bgcolor: '#FFD700', color: '#000', fontWeight: 900, fontSize: '0.68rem', height: 20 }}
                        />
                      )}
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', mb: 2.5 }}>
                      {lvl.title}
                    </Typography>

                    <Stack spacing={1.6} sx={{ fontSize: '0.88rem', color: '#9CA3AF' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <span>Min Wallet Balance</span>
                        <strong style={{ color: '#fff' }}>{lvl.minWalletUSDT} USDT</strong>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <span>Direct (A) Members</span>
                        <strong style={{ color: '#38bdf8' }}>{lvl.requiredAMembers}</strong>
                      </Box>
                      {lvl.requiredBCMembers !== undefined && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <span>Team (B+C) Members</span>
                          <strong style={{ color: '#a78bfa' }}>{lvl.requiredBCMembers}</strong>
                        </Box>
                      )}
                      {lvl.requiredLevel2Members !== undefined && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Level 2 Leaders</span>
                          <strong style={{ color: '#34d399' }}>{lvl.requiredLevel2Members}</strong>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};
