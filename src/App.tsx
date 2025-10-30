import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import AccountPage from './components/AccountPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import SettingsPageWrapper from './components/SettingsPageWrapper';
import DeveloperPage from './components/DeveloperPage';
import DeveloperPageWrapper from './components/DeveloperPageWrapper';
import TermsPage from './components/TermsPage';
import BillingPage from './components/BillingPage';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
`;

function App() {
  return (
    <AuthProvider>
      <AppContainer>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPageWrapper />} />
            <Route path="/developer" element={<DeveloperPageWrapper />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        </Router>
        <Footer />
      </AppContainer>
    </AuthProvider>
  );
}

export default App;
