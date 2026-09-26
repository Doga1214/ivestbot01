import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import { theme } from './theme/theme';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { Reservation } from './pages/Reservation';
import { Wallet } from './pages/Wallet';
import { Profile } from './pages/Profile';
import { Referral } from './pages/Referral';
import { Admin } from './pages/Admin';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { FloatingSpinLauncher } from './components/common/FloatingSpinLauncher';
import { authService } from './services/authService';
import './App.css';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, openLoginModal } = useApp();
  const location = useLocation();
  const hasUserSession = isAuthenticated || !!authService.getCurrentUser();

  React.useEffect(() => {
    if (!hasUserSession) {
      openLoginModal();
    }
  }, [hasUserSession, openLoginModal, location]);

  if (!hasUserSession) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const ReferralQueryHandler: React.FC = () => {
  const { openRegisterModal } = useApp();
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref && ref.trim()) {
      openRegisterModal(ref.trim());
    }
  }, [location.search, openRegisterModal]);

  return null;
};

const AppContent: React.FC = () => {
  const { snackbar, closeSnackbar } = useApp();

  return (
    <AppLayout>
      <ReferralQueryHandler />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/reservation"
            element={
              <ProtectedRoute>
                <Reservation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <Referral />
              </ProtectedRoute>
            }
          />
          <Route path="/referral" element={<Navigate to="/referrals" replace />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Hidden Admin Portal */}
          <Route path="/admin" element={<Admin />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>

      {/* Global Modals */}
      <LoginModal />
      <RegisterModal />
      <FloatingSpinLauncher />

      {/* Global Notification Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: { xs: 7, md: 2 } }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
