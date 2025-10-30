import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLogOut, FiCloud, FiKey, FiCopy, FiCheck, FiMenu } from 'react-icons/fi';

const HeaderContainer = styled.header`
  background: #ffffff;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(208, 240, 192, 0.3);
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  @media (max-width: 768px) { display: block; }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    justify-content: flex-start;
    width: auto;
  }
`;

const LogoIcon = styled(FiCloud)`
  font-size: 24px;
  color: #8FBC8F;
`;

const LogoText = styled.h1`
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #8FBC8F 0%, #98FB98 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-weight: 500;
`;

const UserIcon = styled(FiUser)`
  font-size: 18px;
  color: #8FBC8F;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background: #f5f5f5;
    color: #e74c3c;
  }
`;

const LogoutIcon = styled(FiLogOut)`
  font-size: 16px;
`;

const BillingButton = styled.button`
  background: none;
  border: none;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover { background: #f5f5f5; }
`;

const ApiKeySection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const ApiKeyTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ApiKeyValue = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 8px 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #495057;
  word-break: break-all;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 300px;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserInfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const UserEmail = styled.span`
  font-size: 12px;
  color: #666;
`;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const PaymentInfo = styled.div`
  margin-left: 20px;
  color: #333;
  font-size: 14px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Header: React.FC<{onMenuClick?: () => void}> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [monthlyCost, setMonthlyCost] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Отладочная информация
  React.useEffect(() => {
    console.log('Header: user =', user);
    console.log('Header: user.apiKey =', user?.apiKey);
  }, [user]);

  useEffect(() => {
    const fetchBilling = async () => {
      if (!user?.apiKey) return;
      try {
        const res = await fetch(`${API_BASE_URL}/billing`, {
          headers: { Authorization: `Bearer ${user.apiKey}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setMonthlyCost(data.billing.cost);
        }
      } catch (err) {
        console.error('Ошибка загрузки тарификации в Header:', err);
      }
    };
    fetchBilling();
  }, [user?.apiKey]);

  const handleCopyApiKey = async () => {
    if (user?.apiKey) {
      try {
        await navigator.clipboard.writeText(user.apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy API key:', err);
      }
    }
  };

  // Закрываем меню при клике вне его
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <HeaderContainer>
      <Logo>
        {onMenuClick && <MenuButton onClick={onMenuClick}><FiMenu /></MenuButton>}
        <LogoIcon />
        <LogoText>Windexs Cloud</LogoText>
      </Logo>
      {monthlyCost !== null && <PaymentInfo>Ежем. плата: {monthlyCost} ₽</PaymentInfo>}
      <UserSection>
        <UserMenu data-user-menu>
          <UserButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <UserIcon />
            <UserInfoColumn>
              <UserName>{user?.name}</UserName>
              <UserEmail>{user?.email}</UserEmail>
            </UserInfoColumn>
          </UserButton>
          
          <DropdownMenu isOpen={isMenuOpen}>
            <ApiKeySection>
              <ApiKeyTitle>
                <FiKey />
                API Ключ
              </ApiKeyTitle>
              <ApiKeyValue>
                <span>{user?.apiKey || 'API ключ не найден'}</span>
                <CopyButton onClick={handleCopyApiKey}>
                  {copied ? <FiCheck /> : <FiCopy />}
                </CopyButton>
              </ApiKeyValue>
            </ApiKeySection>
            
            <MenuItem onClick={logout}>
              <LogoutIcon />
              <span>Выйти</span>
            </MenuItem>
          </DropdownMenu>
        </UserMenu>
      </UserSection>
    </HeaderContainer>
  );
};

export default Header;
