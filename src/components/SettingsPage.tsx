import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 20px;
`;

const Title = styled.h2`
  margin: 0 0 20px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #555;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  width: fit-content;
  padding: 8px 16px;
  background: #8FBC8F;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Message = styled.div`
  color: #27ae60;
  font-size: 14px;
`;

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setMessage('Новый пароль и подтверждение не совпадают');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.apiKey}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Пароль успешно изменён');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(data.error || 'Ошибка смены пароля');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setMessage('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Настройки</Title>
      <Form onSubmit={handleSubmit}>
        <div>
          <Label>Текущий пароль</Label>
          <Input type="password" value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            disabled={loading} />
        </div>
        <div>
          <Label>Новый пароль</Label>
          <Input type="password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            disabled={loading} />
        </div>
        <div>
          <Label>Подтвердите новый пароль</Label>
          <Input type="password" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохраняю...' : 'Сохранить'}
        </Button>
      </Form>
      {message && <Message>{message}</Message>}
    </Container>
  );
};

export default SettingsPage;
