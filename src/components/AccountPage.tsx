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

const Logout = styled.button`
  margin-top: 20px;
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
`;

const Message = styled.div`
  color: #27ae60;
  font-size: 14px;
`;

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.apiKey}`
        },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Данные сохранены');
        // Опционально обновить контекст или localStorage
        localStorage.setItem('windexs_user', JSON.stringify(data.user));
      } else {
        setMessage(data.error || 'Ошибка при сохранении');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Личный кабинет</Title>
      <Form onSubmit={handleSave}>
        <div>
          <Label>Имя</Label>
          <Input value={name} onChange={e => setName(e.target.value)} disabled={loading} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'Сохраняю...' : 'Сохранить'}</Button>
      </Form>
      {message && <Message>{message}</Message>}
      <Logout onClick={logout}>Выйти</Logout>
    </Container>
  );
};

export default AccountPage;
