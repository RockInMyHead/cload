import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FiKey, FiCopy, FiCheck, FiEye, FiEyeOff, FiCode } from 'react-icons/fi';

const ApiKeyContainer = styled.div`
  background: #ffffff;
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(208, 240, 192, 0.3);
`;

const ApiKeyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const ApiKeyIcon = styled(FiKey)`
  font-size: 24px;
  color: #8FBC8F;
`;

const ApiKeyTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

const ApiKeyDescription = styled.p`
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
`;

const ApiKeyValueContainer = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #8FBC8F;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #98FB98;
    box-shadow: 0 0 0 3px rgba(143, 188, 143, 0.1);
  }
`;

const ApiKeyValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #495057;
  word-break: break-all;
  flex: 1;
  min-width: 0;
`;

const ApiKeyActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #8FBC8F;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(143, 188, 143, 0.1);
    color: #7ACD32;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CopySuccess = styled.div`
  color: #27ae60;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DeveloperButton = styled.button`
  margin-top: 16px;
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.3s ease;

  &:hover {
    background: #556cd6;
  }
`;

const ApiKeyCard: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Отладочная информация
  React.useEffect(() => {
    console.log('ApiKeyCard: user =', user);
    console.log('ApiKeyCard: user.apiKey =', user?.apiKey);
  }, [user]);

  const handleCopyApiKey = async () => {
    if (user?.apiKey) {
      try {
        await navigator.clipboard.writeText(user.apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy API key:', err);
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = user.apiKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!user?.apiKey) {
    return (
      <ApiKeyContainer>
        <ApiKeyHeader>
          <ApiKeyIcon />
          <ApiKeyTitle>API Ключ</ApiKeyTitle>
        </ApiKeyHeader>
        <ApiKeyDescription>
          API ключ не найден. Выйдите и войдите заново для генерации нового ключа.
        </ApiKeyDescription>
      </ApiKeyContainer>
    );
  }

  return (
    <ApiKeyContainer>
      <ApiKeyHeader>
        <ApiKeyIcon />
        <ApiKeyTitle>API Ключ</ApiKeyTitle>
      </ApiKeyHeader>
      
      <ApiKeyDescription>
        Используйте этот ключ для доступа к API Windexs Cloud. 
        Храните его в безопасном месте и не передавайте третьим лицам.
      </ApiKeyDescription>

      <ApiKeyValueContainer>
        <ApiKeyValue>
          {isVisible ? user.apiKey : '•'.repeat(user.apiKey.length)}
        </ApiKeyValue>
        
        <ApiKeyActions>
          <ActionButton
            onClick={toggleVisibility}
            title={isVisible ? 'Скрыть ключ' : 'Показать ключ'}
          >
            {isVisible ? <FiEyeOff /> : <FiEye />}
          </ActionButton>
          
          <ActionButton
            onClick={handleCopyApiKey}
            title="Копировать ключ"
            disabled={copied}
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </ActionButton>
        </ApiKeyActions>
      </ApiKeyValueContainer>
      <DeveloperButton onClick={() => window.location.href = '/developer'}> <FiCode /> Разработчикам </DeveloperButton>

      {copied && (
        <CopySuccess>
          <FiCheck />
          Ключ скопирован в буфер обмена!
        </CopySuccess>
      )}
    </ApiKeyContainer>
  );
};

export default ApiKeyCard;
