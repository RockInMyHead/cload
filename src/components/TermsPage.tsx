import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiCloud } from 'react-icons/fi';

const TermsContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const TermsCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #8FBC8F;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const LogoIcon = styled(FiCloud)`
  font-size: 48px;
  color: #8FBC8F;
  margin-right: 15px;
`;

const LogoText = styled.h1`
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #8FBC8F 0%, #98FB98 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const Title = styled.h2`
  font-size: 28px;
  color: #333;
  margin: 0;
  font-weight: 600;
`;

const Content = styled.div`
  line-height: 1.7;
  color: #444;
  font-size: 16px;

  h3 {
    color: #8FBC8F;
    margin-top: 35px;
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 600;
  }

  p {
    margin-bottom: 20px;
  }

  ul {
    margin: 15px 0;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
    }
  }
`;

const HighlightBox = styled.div`
  background: #f8f9fa;
  border: 2px solid #8FBC8F;
  border-radius: 12px;
  padding: 25px;
  margin: 30px 0;
  text-align: center;

  h3 {
    color: #8FBC8F;
    margin-bottom: 15px;
    font-size: 20px;
  }

  p {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  span {
    color: #8FBC8F;
    font-weight: bold;
  }
`;

const BackButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #8FBC8F 0%, #98FB98 100%);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 30px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(143, 188, 143, 0.3);
  }
`;

const TermsPage: React.FC = () => {
  return (
    <TermsContainer>
      <TermsCard>
        <Header>
          <Logo>
            <LogoIcon />
            <LogoText>Windexs Cloud</LogoText>
          </Logo>
          <Title>Условия использования сервиса</Title>
        </Header>

        <Content>
          <p style={{fontWeight: '600', fontSize: '18px', marginBottom: '30px'}}>
            Добро пожаловать в Windexs Cloud. Настоящие Условия использования (далее – «Условия») описывают порядок предоставления и использования вами наших сервисов.
            Пожалуйста, внимательно ознакомьтесь с ними.
          </p>

          <h3>1. Термины и определения</h3>
          <p>
            1.1. «Сервис» — онлайн-платформа Windexs Cloud, её веб-интерфейс, API и сопутствующие мобильные/десктоп-приложения.<br/>
            1.2. «Пользователь» — физическое или юридическое лицо, принимающее Условия и использующее Сервис.<br/>
            1.3. «Контент» — любые файлы, документы, изображения, видео и иные данные, загружаемые или создаваемые Пользователем через Сервис.<br/>
            1.4. «API-ключ» — уникальный токен, позволяющий обращаться к API Сервиса от имени Пользователя.
          </p>

          <h3>2. Регистрация и аккаунт</h3>
          <p>
            2.1. Для доступа ко всем функциям Сервиса необходимо пройти регистрацию и подтвердить e-mail.<br/>
            2.2. Пользователь обязуется предоставить достоверную информацию при регистрации и своевременно её обновлять.<br/>
            2.3. Пользователь несёт ответственность за конфиденциальное хранение своих учётных данных и API-ключей и обязуется не передавать их третьим лицам.
          </p>

          <h3>3. Услуги и хранение данных</h3>
          <p>
            3.1. Windexs Cloud предоставляет:<br/>
            <ul>
              <li>3 ГБ бесплатного хранилища;</li>
              <li>дополнительные объёмы по тарифу 0,1 ₽ за 1 МБ.</li>
            </ul>
            3.2. Хранение данных осуществляется на наших защищённых серверах. Мы принимаем меры к сохранности ваших файлов, но не гарантируем их сохранность в неизменном виде и бессрочно.
          </p>

          <h3>4. Ограничения по содержимому</h3>
          <p>
            4.1. Запрещается загружать контент, нарушающий законодательство, авторские права или нормы морали.<br/>
            4.2. Запрещается использовать сервис для публикации экстремистских, порнографических, оскорбительных и иных противоправных материалов.
          </p>

          <h3>5. Платежи и расчёты</h3>
          <p>
            5.1. Стоимость сверх 3 ГБ рассчитывается помегабайтно: 0,1 ₽/1 МБ.<br/>
            5.2. Оплата производится автоматически с привязанной к аккаунту карты ежемесячно.<br/>
            5.3. Пользователь вправе отменить платные услуги в любой момент, предварительно оплатив фактически использованный объём.
          </p>

          <h3>6. Конфиденциальность и приватность</h3>
          <p>
            6.1. Мы собираем и храним персональные данные в соответствии с нашей Политикой конфиденциальности. Полная версия доступна на странице «Конфиденциальность».<br/>
            6.2. Любые персональные данные защищены и не передаются третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.
          </p>

          <h3>7. Отказ от гарантий</h3>
          <p>
            7.1. Сервис предоставляется «как есть» без каких-либо явных или подразумеваемых гарантий.<br/>
            7.2. Мы не гарантируем бесперебойную работу, точность или отсутствие ошибок.
          </p>

          <h3>8. Ограничение ответственности</h3>
          <p>
            8.1. Мы не несем ответственности за утрату, повреждение или несанкционированный доступ к вашим данным.<br/>
            8.2. В любом случае максимальная суммарная ответственность Windexs Cloud не превышает сумму средств, уплаченных вами за последние 12 месяцев.
          </p>

          <h3>9. Безопасность API-ключей</h3>
          <p>
            9.1. Пользователь обязуется хранить API-ключ в секрете и не передавать третьим лицам.<br/>
            9.2. В случае компрометации ключа пользователь должен немедленно запросить его деактивацию в личном кабинете.
          </p>

          <h3>10. Изменения условий</h3>
          <p>
            10.1. Мы оставляем за собой право вносить изменения в Условия.<br/>
            10.2. О любых существенных изменениях мы уведомим вас по электронной почте за 30 дней до вступления их в силу.
          </p>

          <h3>11. Прекращение обслуживания</h3>
          <p>
            11.1. Мы вправе приостановить или прекратить предоставление Сервиса в случае нарушения вами Условий.<br/>
            11.2. Пользователь может удалить свой аккаунт и все данные в любой момент, связавшись с поддержкой.
          </p>

          <h3>12. Применимое право и юрисдикция</h3>
          <p>
            12.1. Настоящие Условия регулируются законодательством Российской Федерации.<br/>
            12.2. Все споры разрешаются в соответствии с действующим законодательством РФ в судебном порядке.
          </p>

          <HighlightBox>
            <h3>Принятие условий</h3>
            <p>
              Нажимая на ссылку <span>принимаю</span>, вы подтверждаете, что ознакомились с настоящими Условиями использования, полностью их понимаете и соглашаетесь со всеми их положениями.
            </p>
          </HighlightBox>

          <div style={{textAlign: 'center', marginTop: '40px'}}>
            <BackButton to="/login">Вернуться к входу</BackButton>
          </div>

        </Content>
      </TermsCard>
    </TermsContainer>
  );
};

export default TermsPage;
