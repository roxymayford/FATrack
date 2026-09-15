import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AllocationPage } from './pages/AllocationPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import './styles/index.css';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public marketing landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth & Onboarding */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected Application Views inside Swiss Layout */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <DashboardPage />
              </Layout>
            }
          />
          <Route
            path="/alokasi"
            element={
              <Layout>
                <AllocationPage />
              </Layout>
            }
          />
          <Route
            path="/rekomendasi"
            element={
              <Layout>
                <RecommendationsPage />
              </Layout>
            }
          />
          <Route
            path="/transaksi"
            element={
              <Layout>
                <TransactionsPage />
              </Layout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
