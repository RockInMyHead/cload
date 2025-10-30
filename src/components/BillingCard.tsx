import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiHardDrive, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { API_BASE_URL } from '../utils/api';
// Новые styled-компоненты для баланса и истории
const BalanceContainer = styled.div`margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;`;
const BalanceLabel = styled.span`font-size: 14px; color: #666;`;
const BalanceValue = styled.span`font-size: 18px; font-weight: 600; color: #333;`;
const TopUpButton = styled.button`padding: 6px 12px; background: #8FBC8F; color: white; border: none; border-radius: 4px; cursor: pointer;`;
const HistoryContainer = styled.div`margin-top: 30px;`;
const HistoryTitle = styled.h4`margin: 0 0 10px; font-size: 16px; color: #333;`;
const HistoryRow = styled.div`display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e1e5e9; font-size: 14px;`;
const HistoryDate = styled.span`color: #666;`;
const HistoryUsed = styled.span`font-weight: 500; color: #333;`;

const BillingContainer = styled.div`
  background: #ffffff;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  margin: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(208, 240, 192, 0.3);
  max-width: 100%;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: anywhere;
`;

const BillingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const BillingIcon = styled(FiHardDrive)`
  font-size: 24px;
  color: #8FBC8F;
`;

const BillingTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

const StorageInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const StorageItem = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(143, 188, 143, 0.3);
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StorageLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
`;

const StorageValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e1e5e9;
  border-radius: 4px;
  overflow: hidden;
  margin: 15px 0;
`;

const ProgressFill = styled.div<{ percentage: number; isOverLimit: boolean }>`
  height: 100%;
  background: ${props => props.isOverLimit 
    ? 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)' 
    : 'linear-gradient(90deg, #8FBC8F 0%, #98FB98 100%)'};
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.3s ease;
`;

const BillingInfo = styled.div<{ isOverLimit: boolean }>`
  background: ${props => props.isOverLimit ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid ${props => props.isOverLimit ? 'rgba(231, 76, 60, 0.3)' : 'rgba(143, 188, 143, 0.3)'};
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  word-wrap: break-word;
  overflow-wrap: anywhere;
`;

const BillingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
  
  &:last-child {
    margin-bottom: 0;
    font-weight: 600;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

const BillingLabel = styled.span`
  color: #666;
  font-size: 14px;
  flex-shrink: 0;
`;

const BillingValue = styled.span<{ isOverLimit?: boolean }>`
  color: ${props => props.isOverLimit ? '#e74c3c' : '#333'};
  font-size: 14px;
  font-weight: ${props => props.isOverLimit ? '600' : '500'};
  word-break: break-word;
  overflow-wrap: anywhere;
  text-align: right;
`;

const StatusIcon = styled.div<{ isOverLimit: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => props.isOverLimit ? '#e74c3c' : '#27ae60'};
  font-size: 14px;
  font-weight: 500;
`;

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

interface BillingCardProps {
  apiKey: string;
}

const BillingCard: React.FC<BillingCardProps> = ({ apiKey }) => {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<Array<{date:string; usedMB:number}>>([]);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/billing`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!response.ok) throw new Error();
        const data = await response.json();
        if (data.success) setBilling(data.billing);
      } catch (err) {
        setError('Ошибка загрузки данных тарификации');
      } finally { setLoading(false); }
    };

    fetchBilling();
    // Получаем баланс пользователя
    const fetchUser = async () => {
      const res = await fetch(`${API_BASE_URL}/user`, { headers:{ 'Authorization': `Bearer ${apiKey}` } });
      const json = await res.json();
      if (json.success) setBalance(json.user.balance ?? 0);
    };
    fetchUser();
    // Получаем историю использования
    const fetchHistory = async () => {
      const res = await fetch(`${API_BASE_URL}/billing/history`, { headers:{ 'Authorization': `Bearer ${apiKey}` } });
      const json = await res.json();
      if (json.success) setHistory(json.history);
    };
    fetchHistory();
  }, [apiKey]);

  // Фолбэк: если история пуста, но есть использованные данные, показываем текущее использование
  useEffect(() => {
    if (!loading && billing && history.length === 0 && billing.usedMB > 0) {
      const today = new Date().toLocaleDateString('ru-RU');
      setHistory([{ date: today, usedMB: Math.round(billing.usedMB * 100) / 100 }]);
    }
  }, [loading, billing, history]);

  const handleTopUp = async () => {
    const amount = parseFloat(prompt('Введите сумму пополнения ₽', '0') || '0');
    if (amount > 0) {
      const res = await fetch(`${API_BASE_URL}/user/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ amount })
      });
      const json = await res.json();
      if (json.success) {
        setBalance(json.balance);
      }
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;
  if (!billing) return <div>Данные тарификации не найдены.</div>;

  return (
    <BillingContainer>
      <BillingHeader>
        <BillingIcon />
        <BillingTitle>Тарификация</BillingTitle>
      </BillingHeader>

      <StorageInfo>
        <StorageItem>
          <StorageLabel>Использовано</StorageLabel>
          <StorageValue>{billing.usedFormatted}</StorageValue>
        </StorageItem>
        <StorageItem>
          <StorageLabel>Свободно</StorageLabel>
          <StorageValue>{billing.freeFormatted}</StorageValue>
        </StorageItem>
        <StorageItem>
          <StorageLabel>Всего</StorageLabel>
          <StorageValue>{billing.totalFormatted}</StorageValue>
        </StorageItem>
      </StorageInfo>

      <ProgressBar>
        <ProgressFill percentage={billing.usedMB / billing.totalMB * 100} isOverLimit={billing.isOverLimit} />
      </ProgressBar>

      <BillingInfo isOverLimit={billing.isOverLimit}>
        <BillingRow>
          <BillingLabel>Стоимость за 1 МБ</BillingLabel>
          <BillingValue>{billing.pricePerMB?.toFixed(2) ?? '0.00'} ₽</BillingValue>
        </BillingRow>
        <BillingRow>
          <BillingLabel>Лимит использования</BillingLabel>
          <BillingValue>{billing.overLimitFormatted}</BillingValue>
        </BillingRow>
        <BillingRow>
          <BillingLabel>Текущий баланс</BillingLabel>
          <BillingValue>{balance?.toFixed(2) ?? '0.00'} ₽</BillingValue>
        </BillingRow>
        <BillingRow>
          <BillingLabel>Текущее использование</BillingLabel>
          <BillingValue>{billing.usedFormatted}</BillingValue>
        </BillingRow>
        <BillingRow>
          <BillingLabel>Статус</BillingLabel>
          <StatusIcon isOverLimit={billing.isOverLimit}>
            {billing.isOverLimit ? <FiAlertTriangle /> : <FiCheckCircle />}
            {billing.isOverLimit ? 'Превышен лимит' : 'В пределах лимита'}
          </StatusIcon>
        </BillingRow>
        {billing.isOverLimit && (
          <>
            <BillingRow>
              <BillingLabel>Превышение лимита:</BillingLabel>
              <BillingValue isOverLimit>{billing.overLimitFormatted}</BillingValue>
            </BillingRow>
            <BillingRow>
              <BillingLabel>Стоимость:</BillingLabel>
              <BillingValue isOverLimit>{billing.cost} ₽</BillingValue>
            </BillingRow>
          </>
        )}
        {/* Ежемесячная плата */}
        <BillingRow>
          <BillingLabel>Ежем. плата:</BillingLabel>
          <BillingValue>{(billing.cost ?? 0).toFixed(2)} ₽</BillingValue>
        </BillingRow>
      </BillingInfo>

      <TopUpButton onClick={handleTopUp}>Пополнить баланс</TopUpButton>

      <HistoryContainer>
        <HistoryTitle>История использования</HistoryTitle>
        {history.length === 0 ? (
          <p>Нет истории использования.</p>
        ) : (
          <div>
            {history.map((item, index) => (
              <HistoryRow key={index}>
                <HistoryDate>{item.date}</HistoryDate>
                <HistoryUsed>{item.usedMB} МБ</HistoryUsed>
              </HistoryRow>
            ))}
          </div>
        )}
      </HistoryContainer>
    </BillingContainer>
  );
};

export default BillingCard;