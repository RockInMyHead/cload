# Windexs Cloud API Server

Полноценный бэкенд сервер для Windexs Cloud - облачного хранилища файлов.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск сервера
```bash
# Режим разработки (с автоперезагрузкой)
npm run dev

# Продакшен режим
npm start
```

### 3. Проверка работы
Откройте в браузере: http://localhost:3001/health

## 📡 API Endpoints

### Аутентификация
- `POST /api/register` - Регистрация пользователя
- `POST /api/login` - Вход в систему
- `GET /api/user` - Получение информации о пользователе

### Файлы
- `GET /api/files` - Получение списка файлов
- `POST /api/upload` - Загрузка файла
- `GET /api/files/:fileId` - Получение информации о файле
- `PUT /api/files/:fileId` - Переименование файла
- `DELETE /api/files/:fileId` - Удаление файла
- `GET /api/download/:fileId` - Скачивание файла

### Папки
- `POST /api/folders` - Создание папки

### Поиск
- `GET /api/search` - Поиск файлов

### Система
- `GET /health` - Проверка здоровья сервера

## 🔑 Использование API

### Получение API ключа
1. Зарегистрируйтесь: `POST /api/register`
2. Войдите в систему: `POST /api/login`
3. Скопируйте `apiKey` из ответа

### Пример запроса
```javascript
const apiKey = 'WDX_123_ABC_DEF';

fetch('http://localhost:3001/api/files', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Пример cURL
```bash
curl -H "Authorization: Bearer WDX_123_ABC_DEF" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/files
```

## 📁 Структура проекта

```
server/
├── index.js          # Основной файл сервера
├── package.json      # Зависимости и скрипты
├── README.md         # Документация
├── uploads/          # Загруженные файлы (создается автоматически)
│   └── {userId}/     # Папки пользователей
└── data/             # JSON файлы с данными (создается автоматически)
    ├── users.json    # Пользователи
    └── files.json    # Метаданные файлов
```

## 🔧 Настройка

### Переменные окружения
```bash
PORT=3001              # Порт сервера (по умолчанию 3001)
```

### CORS
Сервер настроен для работы с фронтендом на `http://localhost:3000`

## 📊 Хранение данных

### Пользователи
- Хранятся в `data/users.json`
- Пароли хешируются с помощью bcrypt
- API ключи генерируются автоматически

### Файлы
- Метаданные в `data/files.json`
- Файлы на диске в `uploads/{userId}/`
- Максимальный размер файла: 100MB

## 🛡️ Безопасность

- ✅ Хеширование паролей (bcrypt)
- ✅ Валидация API ключей
- ✅ CORS настройки
- ✅ Helmet для безопасности заголовков
- ✅ Ограничение размера файлов
- ✅ Изоляция файлов по пользователям

## 🐛 Troubleshooting

### Проблема: Сервер не запускается
**Решение**: Проверьте, что порт 3001 свободен
```bash
lsof -i :3001
```

### Проблема: CORS ошибки
**Решение**: Убедитесь, что фронтенд работает на http://localhost:3000

### Проблема: Файлы не загружаются
**Решение**: Проверьте права доступа к папке uploads
```bash
chmod 755 uploads/
```

## 📈 Мониторинг

### Логи
Сервер использует Morgan для логирования запросов

### Метрики
- Количество пользователей
- Количество файлов
- Размер хранилища

## 🔄 Интеграция с фронтендом

Обновите URL в фронтенде:
```javascript
// Вместо http://localhost:3000/api
const API_BASE_URL = 'http://localhost:3001/api';
```

## 📚 Дополнительные ресурсы

- [Express.js документация](https://expressjs.com/)
- [Multer для загрузки файлов](https://github.com/expressjs/multer)
- [bcrypt для хеширования](https://github.com/dcodeIO/bcrypt.js)

---

**Версия**: 1.0.0  
**Автор**: Windexs Cloud Team  
**Лицензия**: ISC
