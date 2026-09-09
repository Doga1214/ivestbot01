import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Chip,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  VerifiedUserIcon,
  UploadFileIcon,
  CheckCircleIcon,
  HourglassBottomIcon,
  CancelIcon
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/formatters';

export const KycPanel: React.FC = () => {
  const { kyc, user, submitKyc, showSnackbar } = useApp();

  const isVerified = kyc.status === 'VERIFIED' || user?.kycStatus === 'VERIFIED';
  const isPending = !isVerified && (kyc.status === 'PENDING' || user?.kycStatus === 'PENDING');
  const isRejected = !isVerified && !isPending && (kyc.status === 'REJECTED' || user?.kycStatus === 'REJECTED');

  const [fullName, setFullName] = useState(kyc.fullName || user?.name || '');
  const [docType, setDocType] = useState(kyc.documentType || 'PASSPORT');
  const [docNumber, setDocNumber] = useState(kyc.documentNumber || '');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !docNumber.trim()) {
      showSnackbar('Please enter your full legal name and document number', 'error');
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

  const getStatusChip = () => {
    if (isVerified) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="VERIFIED & APPROVED"
          color="success"
          sx={{ fontWeight: 800, px: 1 }}
        />
      );
    }
    if (isPending) {
      return (
        <Chip
          icon={<HourglassBottomIcon />}
          label="COMPLIANCE REVIEW PENDING"
          color="warning"
          sx={{ fontWeight: 800, px: 1 }}
        />
      );
    }
    if (isRejected) {
      return (
        <Chip
          icon={<CancelIcon />}
          label="VERIFICATION REJECTED"
          color="error"
          sx={{ fontWeight: 800, px: 1 }}
        />
      );
    }
    return <Chip label="NOT VERIFIED" color="default" sx={{ fontWeight: 700 }} />;
  };

  return (
    <Card
      sx={{
        backgroundColor: '#111522',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 3.5,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: isVerified
                  ? 'rgba(16, 185, 129, 0.15)'
                  : isPending
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${
                  isVerified
                    ? 'rgba(16, 185, 129, 0.3)'
                    : isPending
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(139, 92, 246, 0.3)'
                }`
              }}
            >
              <VerifiedUserIcon
                sx={{
                  color: isVerified ? '#10b981' : isPending ? '#f59e0b' : '#8b5cf6',
                  fontSize: 28
                }}
              />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
                Identity Verification (KYC)
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                {isVerified
                  ? 'Your account has passed KYC compliance and identity verification.'
                  : isPending
                  ? 'Your documents have been submitted and are under review by compliance officers.'
                  : 'Submit official government ID to unlock advanced limits and verified member tier.'}
              </Typography>
            </Box>
          </Box>
          {getStatusChip()}
        </Box>

        {/* ─── CASE 1: VERIFIED STATE (Verification Section Complete) ───────────────── */}
        {isVerified && (
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <CheckCircleIcon sx={{ color: '#10b981', fontSize: 26 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#34d399' }}>
                Official Verification Confirmed
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#D1D5DB', mb: 2.5 }}>
              Your identity has been verified by the Compliance Officer. All account features, unrestricted VIP limits, and fast-track withdrawals are now active.
            </Typography>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 2.5 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                  Verified Full Legal Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>
                  {kyc.fullName || user?.name || 'Verified User'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                  Document Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#a78bfa' }}>
                  {(kyc.documentType || 'PASSPORT').replace('_', ' ')}
                </Typography>
              </Grid>

              {kyc.documentNumber && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                    Document Reference Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#60a5fa' }}>
                    {kyc.documentNumber.length > 4
                      ? `${kyc.documentNumber.slice(0, 2)}••••${kyc.documentNumber.slice(-2)}`
                      : kyc.documentNumber}
                  </Typography>
                </Grid>
              )}

              {kyc.reviewedAt && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                    Verification Timestamp
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#9CA3AF' }}>
                    {formatDateTime(kyc.reviewedAt)}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {kyc.adminNotes && (
              <Box sx={{ mt: 2.5, p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.3 }}>
                  Compliance Officer Notes:
                </Typography>
                <Typography variant="body2" sx={{ color: '#E5E7EB', fontWeight: 600 }}>
                  {kyc.adminNotes}
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* ─── CASE 2: PENDING REVIEW STATE ────────────────────────────────────────── */}
        {isPending && (
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <HourglassBottomIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fbbf24' }}>
                Verification In Progress
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#D1D5DB', mb: 2.5 }}>
              Your document submission has been received and queued for automated and compliance officer review. Standard review time is under 15 minutes.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Submitted Name:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff' }}>{kyc.fullName || user?.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Document Type:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#a78bfa' }}>{(kyc.documentType || 'PASSPORT').replace('_', ' ')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Attached File:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#60a5fa' }}>{kyc.documentFileName || 'id_document.pdf'}</Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* ─── CASE 3: NOT SUBMITTED OR REJECTED (Submission Form Shown) ──────────── */}
        {!isVerified && !isPending && (
          <Box>
            {isRejected && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Previous Submission Rejected
                </Typography>
                <Typography variant="body2">
                  {kyc.adminNotes || 'Document was unreadable or details did not match. Please verify your information and re-submit clear documents.'}
                </Typography>
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
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<UploadFileIcon />}
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
                      accept="image/*,.pdf"
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
                    disabled={loading}
                    sx={{
                      px: 4,
                      py: 1.3,
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                      borderRadius: 2.5
                    }}
                  >
                    {loading ? 'Submitting...' : isRejected ? 'Re-Submit Verification Documents' : 'Submit Verification Documents'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

