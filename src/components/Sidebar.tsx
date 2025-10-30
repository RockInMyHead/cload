import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { FileItem } from '../types/FileItem';
import { FiHome, FiStar, FiTrash2, FiHardDrive, FiUser, FiSettings, FiDollarSign, FiKey } from 'react-icons/fi';
import { FiCode } from 'react-icons/fi';
import BillingCard from './BillingCard';
import { API_BASE_URL } from '../utils/api';

const SidebarContainer = styled.aside<{ isOpen?: boolean }>`
  width: 250px;
  background: #ffffff;
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(208, 240, 192, 0.3);
  padding: 20px 0;
  overflow-y: auto;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    bottom: 0;
    left: 0;
    width: 80%;
    max-width: 300px;
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    display: block;
    padding: 0;
    border-right: none;
    border-top: none;
  }
`;

const MobileOverlay = styled.div<{ isOpen: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    top: 60px;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(0,0,0,0.3);
  }
`;

// Стили для модального окна тарификации
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
`;

const SidebarSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 20px 10px;
`;

const MenuItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.active ? '#8FBC8F' : '#333'};
  background: ${props => props.active ? 'rgba(143, 188, 143, 0.1)' : 'transparent'};
  border-right: ${props => props.active ? '3px solid #8FBC8F' : '3px solid transparent'};

  &:hover {
    background: rgba(143, 188, 143, 0.05);
    color: #8FBC8F;
  }
`;

const MenuIcon = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
`;

const MenuText = styled.span`
  font-weight: 500;
`;

const StorageInfo = styled.div`
  margin: 20px;
  padding: 15px;
  background: rgba(143, 188, 143, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(143, 188, 143, 0.2);
`;

const StorageTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StorageIcon = styled(FiHardDrive)`
  font-size: 16px;
  color: #8FBC8F;
`;

const StorageBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e1e5e9;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
`;

const StorageProgress = styled.div<{ percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #8FBC8F 0%, #98FB98 100%);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const StorageText = styled.div`
  font-size: 12px;
  color: #666;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;

interface SidebarProps {
  files: FileItem[];
  currentPath: string;
  onPathChange: (path: string) => void;
  apiKey?: string;
}

interface BillingData {
  usedMB: number;
  freeMB: number;
  totalMB: number;
  overLimitMB: number;
  cost: number;
  isOverLimit: boolean;
  usedFormatted: string;
  freeFormatted: string;
  totalFormatted: string;
  overLimitFormatted: string;
  pricePerMB: number;
  freeStorageMB: number;
}

const Sidebar: React.FC<SidebarProps & {isMobileOpen?: boolean; onClose?: () => void}> = ({ files, currentPath, onPathChange, apiKey, isMobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [billing, setBilling] = useState<BillingData | null>(null);

  const openBilling = () => setIsBillingOpen(true);
  const closeBilling = () => setIsBillingOpen(false);

  useEffect(() => {
    const fetchBilling = async () => {
      if (!apiKey) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/billing`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setBilling(data.billing);
        }
      } catch (error) {
        console.error('Ошибка загрузки тарификации:', error);
      }
    };

    fetchBilling();
  }, [apiKey]);

  const calculateStorageUsed = () => {
    if (billing) {
      return Math.min((billing.totalMB / billing.freeStorageMB) * 100, 100);
    }
    
    // Fallback к старому расчету
    const totalSize = files
      .filter(file => file.type === 'file')
      .reduce((sum, file) => sum + (file.size || 0), 0);
    
    const totalStorage = 3 * 1024 * 1024 * 1024; // 3GB
    return Math.round((totalSize / totalStorage) * 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    if (billing) {
      return billing.totalFormatted;
    }
    
    const totalBytes = files
      .filter(file => file.type === 'file')
      .reduce((sum, file) => sum + (file.size || 0), 0);
    
    return formatFileSize(totalBytes);
  };

  const storageUsed = calculateStorageUsed();

  return (
    <>
      <MobileOverlay isOpen={!!isMobileOpen} onClick={onClose} />
      <SidebarContainer isOpen={!!isMobileOpen}>
        <SidebarSection>
          <MenuItem
            active={location.pathname === '/'}
            onClick={() => { navigate('/'); onPathChange('/'); }}
          >
            <MenuIcon><FiHome /></MenuIcon>
            <MenuText>Главная</MenuText>
          </MenuItem>
          
          <MenuItem 
            active={currentPath === '/favorites'} 
            onClick={() => onPathChange('/favorites')}
          >
            <MenuIcon>
              <FiStar />
            </MenuIcon>
            <MenuText>Избранное</MenuText>
          </MenuItem>
          
          <MenuItem 
            active={currentPath === '/trash'} 
            onClick={() => onPathChange('/trash')}
          >
            <MenuIcon>
              <FiTrash2 />
            </MenuIcon>
            <MenuText>Корзина</MenuText>
          </MenuItem>
        </SidebarSection>
        <SidebarSection>
          <SectionTitle>Профиль</SectionTitle>
          <MenuItem active={location.pathname === '/profile'} onClick={() => navigate('/profile')}>
            <MenuIcon><FiUser /></MenuIcon>
            <MenuText>Профиль</MenuText>
          </MenuItem>
          <MenuItem active={location.pathname === '/settings'} onClick={() => navigate('/settings')}>
            <MenuIcon><FiSettings /></MenuIcon>
            <MenuText>Настройки</MenuText>
          </MenuItem>
        </SidebarSection>

        <SidebarSection>
          <SectionTitle>API Ключ</SectionTitle>
          <StorageInfo>
            <StorageTitle><FiKey /> Ваш ключ</StorageTitle>
            <StorageText style={{wordBreak: 'break-all', fontSize: '12px', color: '#495057'}}>
              {apiKey}
            </StorageText>
          </StorageInfo>
        </SidebarSection>
        <SidebarSection>
          <MenuItem active={location.pathname === '/developer'} onClick={() => { navigate('/developer'); onClose?.(); }}>
            <MenuIcon><FiCode /></MenuIcon>
            <MenuText>Разработчикам</MenuText>
          </MenuItem>
        </SidebarSection>

        <SidebarSection>
          <SectionTitle>Тарификация</SectionTitle>
          <MenuItem active={location.pathname === '/billing'} onClick={() => { navigate('/billing'); onClose?.(); }}>
            <MenuIcon><FiDollarSign /></MenuIcon>
            <MenuText>Тарификация</MenuText>
          </MenuItem>
        </SidebarSection>
        {/* Рендер модальной логики удалён */}
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
