import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import FileManager from './FileManager';
// import ApiKeyCard from './ApiKeyCard';
import { FileItem } from '../types/FileItem';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const DashboardContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    display: block;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  background: #ffffff;
  backdrop-filter: blur(10px);
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow: hidden;
`;

const Dashboard: React.FC = () => {
  const { isAuthenticated, user, initializing } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [pathHistory, setPathHistory] = useState<string[]>(['/']);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      navigate('/login');
    }
  }, [initializing, isAuthenticated, navigate]);

  useEffect(() => {
    // Загружаем файлы с API сервера при инициализации
    if (user?.apiKey) {
      loadFilesFromAPI();
    }
  }, [user?.apiKey]);

  const loadFilesFromAPI = async () => {
    if (!user?.apiKey) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/files`, {
        headers: {
          'Authorization': `Bearer ${user.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Преобразуем данные с сервера в формат FileItem
        const apiFiles: FileItem[] = data.files.map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          path: file.path,
          previewUrl: file.previewUrl,
          createdAt: new Date(file.createdAt),
          modifiedAt: new Date(file.modifiedAt),
          parentId: file.parentId
        }));
        setFiles(apiFiles);
      } else {
        console.error('Ошибка загрузки файлов:', data.error);
      }
    } catch (error) {
      console.error('Ошибка загрузки файлов с сервера:', error);
    }
  };

  const saveFiles: React.Dispatch<React.SetStateAction<FileItem[]>> = (newFiles) => {
    setFiles(newFiles);
    // Файлы теперь сохраняются на сервере через API
    // localStorage больше не используется для хранения файлов
  };

  const handlePathChange = (newPath: string) => {
    if (newPath !== currentPath) {
      setPathHistory(prev => [...prev, newPath]);
      setCurrentPath(newPath);
    }
  };

  const goBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      newHistory.pop();
      setPathHistory(newHistory);
      setCurrentPath(newHistory[newHistory.length - 1]);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardContainer>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <MainContent>
        <Sidebar 
          files={files}
          currentPath={currentPath}
          onPathChange={handlePathChange}
          apiKey={user?.apiKey}
          isMobileOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <ContentArea>
          <FileManager
            files={files}
            setFiles={saveFiles}
            currentPath={currentPath}
            onPathChange={handlePathChange}
            onGoBack={goBack}
            canGoBack={pathHistory.length > 1}
          />
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
