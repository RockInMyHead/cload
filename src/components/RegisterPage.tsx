import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FiCloud, FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 10px;
    align-items: flex-start;
    padding-top: 20px;
  }
`;

const RegisterCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 480px) {
    padding: 30px 20px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    max-width: 100%;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const LogoIcon = styled(FiCloud)`
  font-size: 48px;
  color: #8FBC8F;
  margin-right: 15px;
`;

const LogoText = styled.h1`
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #8FBC8F 0%, #98FB98 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 20px 15px 50px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #8FBC8F;
    box-shadow: 0 0 0 3px rgba(143, 188, 143, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 18px;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;

  &:hover {
    color: #8FBC8F;
  }
`;

const RegisterButton = styled.button`
  background: linear-gradient(135deg, #8FBC8F 0%, #98FB98 100%);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(143, 188, 143, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
`;

// Контейнер для пользовательских условий
const TermsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 10px 0;
  padding: 10px;
  background: rgba(143, 188, 143, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(143, 188, 143, 0.1);

  @media (max-width: 480px) {
    padding: 8px;
    gap: 8px;
  }
`;

const TermsCheckbox = styled.input`
  margin-top: 2px;
  width: 16px;
  height: 16px;
  accent-color: #8FBC8F;

  &:focus {
    outline: 2px solid rgba(143, 188, 143, 0.3);
    outline-offset: 2px;
  }
`;

const TermsLabel = styled.label`
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  flex: 1;
  cursor: pointer;

  a {
    color: #8FBC8F;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
`;

const LinkStyled = styled(Link)`
  color: #8FBC8F;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
    color: #7ACD32;
  }
`;


const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Валидация
    if (!name.trim()) {
      setError('Введите имя');
      return;
    }

    if (!email.trim()) {
      setError('Введите email');
      return;
    }

    if (!password) {
      setError('Введите пароль');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!acceptedTerms) { setError('Необходимо принять условия'); return; }

    setLoading(true);

    try {
      const success = await register(name.trim(), email.trim(), password);
      if (success) {
        setSuccess('Регистрация успешна! Добро пожаловать!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError('Пользователь с таким email уже существует');
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <LogoIcon />
          <LogoText>Windexs Cloud</LogoText>
        </Logo>
        <Title>Создать аккаунт</Title>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FiUser />
            </InputIcon>
            <Input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiMail />
            </InputIcon>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiLock />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </PasswordToggle>
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FiLock />
            </InputIcon>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </PasswordToggle>
          </InputGroup>

          <TermsContainer>
            <TermsCheckbox
              type="checkbox"
              id="tos"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
            />
            <TermsLabel htmlFor="tos">
              Я принимаю <Link to="/terms">пользовательские условия</Link>
            </TermsLabel>
          </TermsContainer>

          <RegisterButton type="submit" disabled={loading || !acceptedTerms}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </RegisterButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </Form>

        <LoginLink>
          Уже есть аккаунт? <LinkStyled to="/login">Войти</LinkStyled>
        </LoginLink>


      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;

