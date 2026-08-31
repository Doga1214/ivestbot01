import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import {
  VerifiedUserIcon,
  UploadFileIcon,
  CheckCircleIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const KycPanel: React.FC = () => {
  const { kyc, submitKyc, showSnackbar } = useApp();

  const [fullName, setFullName] = useState(kyc.fullName || '');
  const [docType, setDocType] = useState(kyc.documentType || 'PASSPORT');
  const [docNumber, setDocNumber] = useState(kyc.documentNumber || '');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !docNumber.trim()) {
      showSnackbar('Please enter your full name and document number', 'error');
      return;
    }

    setLoading(true);
    try {
      await submitKyc({
        fullName,
        documentType: docType,
        documentNumber: docNumber,
        documentFileName: selectedFileName || 'identity_document.pdf'
      });
    } catch {
      showSnackbar('Failed to submit KYC', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Chip icon={<CheckCircleIcon />} label="VERIFIED" color="success" sx={{ fontWeight: 700 }} />;
      case 'PENDING':
        return <Chip label="REVIEW PENDING" color="warning" sx={{ fontWeight: 700 }} />;
      case 'REJECTED':
        return <Chip label="REJECTED" color="error" sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label="NOT VERIFIED" color="default" sx={{ fontWeight: 700 }} />;
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <VerifiedUserIcon sx={{ color: '#8b5cf6', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Identity Verification (KYC)
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Verify your identity to unlock advanced limits and verified member tier
              </Typography>
            </Box>
          </Box>
          {getStatusChip(kyc.status)}
        </Box>

        {kyc.status === 'PENDING' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Your KYC submission is currently under automated compliance review. You will be notified once verified.
          </Alert>
        )}

        {kyc.status === 'VERIFIED' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your identity has been verified. All account features and higher withdrawal limits are active.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Legal Name"
                placeholder="As shown on your official ID"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={kyc.status === 'PENDING' || kyc.status === 'VERIFIED'}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Document Type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                disabled={kyc.status === 'PENDING' || kyc.status === 'VERIFIED'}
              >
                <MenuItem value="PASSPORT">Passport</MenuItem>
                <MenuItem value="NATIONAL_ID">National Identity Card / Aadhaar</MenuItem>
                <MenuItem value="DRIVERS_LICENSE">Driver's License</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Document Number"
                placeholder="e.g. A12345678"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                disabled={kyc.status === 'PENDING' || kyc.status === 'VERIFIED'}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<UploadFileIcon />}
                disabled={kyc.status === 'PENDING' || kyc.status === 'VERIFIED'}
                sx={{
                  py: 1.8,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  textTransform: 'none'
                }}
              >
                {selectedFileName || 'Upload Document (JPG/PDF)'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFileName(e.target.files[0].name);
                    }
                  }}
                />
              </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || kyc.status === 'PENDING' || kyc.status === 'VERIFIED'}
                sx={{ px: 4, py: 1.2, fontWeight: 700 }}
              >
                {loading ? 'Submitting...' : 'Submit Verification Documents'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};
