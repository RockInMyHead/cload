import React from 'react';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  position: relative;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;
const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
`;
const ProgressBarContainer = styled.div`
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  height: 8px;
  margin-bottom: 20px;
`;
const ProgressBar = styled.div<{ percent: number }>`
  width: ${props => props.percent}%;
  background: #8FBC8F;
  height: 100%;
  transition: width 0.3s ease;
`;
const StatItem = styled.div`
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
`;
// Styled для дашбордов
const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;
const StatCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;
const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 600;
`;
const StatValue = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 700;
`;
interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageBytes: number;
  limitBytes: number;
  ratePerMb: number;
}
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
const BillingModal: React.FC<BillingModalProps> = ({ isOpen, onClose, usageBytes, limitBytes, ratePerMb }) => {
  if (!isOpen) return null;
  const percent = usageBytes > limitBytes ? 100 : (usageBytes / limitBytes) * 100;
  const withinLimit = usageBytes <= limitBytes;
  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}><FiX /></CloseButton>
        <Title>Тарификация</Title>
        <ProgressBarContainer>
          <ProgressBar percent={percent} />
        </ProgressBarContainer>
        <StatGrid>
          <StatCard>
            <StatLabel>ИСПОЛЬЗОВАНО</StatLabel>
            <StatValue>{formatBytes(usageBytes)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>БЕСПЛАТНО</StatLabel>
            <StatValue>{formatBytes(limitBytes)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Статус</StatLabel>
            <StatValue>{withinLimit ? 'В пределах лимита' : 'Превышен лимит'}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Тариф за МБ</StatLabel>
            <StatValue>{ratePerMb} ₽</StatValue>
          </StatCard>
        </StatGrid>
      </ModalContent>
    </ModalOverlay>
  );
};
export default BillingModal;
