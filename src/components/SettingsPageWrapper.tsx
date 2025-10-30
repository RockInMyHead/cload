import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import SettingsPage from './SettingsPage';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  background: #ffffff;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const SettingsPageWrapper: React.FC = () => {
  const { user, initializing } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (initializing) return null;
  if (!user) return null;

  return (
    <PageContainer>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <MainContent>
        <Sidebar
          files={[]}
          currentPath="/"
          onPathChange={() => {}}
          apiKey={user.apiKey}
          isMobileOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <ContentArea>
          <SettingsPage />
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default SettingsPageWrapper;
