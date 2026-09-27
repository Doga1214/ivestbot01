import React, { useEffect } from 'react';
import { Container, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PolicyDocumentView } from '../components/policy/PolicyDocumentView';

export const PolicyPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#080A12', py: 4 }}>
      <Container maxWidth="lg">
        {/* Navigation bar */}
        <Box sx={{ mb: 2 }} className="no-print">
          <Button
            onClick={() => navigate(-1)}
            sx={{
              color: '#94A3B8',
              bgcolor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.8,
              '&:hover': {
                bgcolor: 'rgba(245, 158, 11, 0.15)',
                color: '#FEF08A'
              }
            }}
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </Button>
        </Box>

        <PolicyDocumentView isModal={false} />
      </Container>
    </Box>
  );
};
