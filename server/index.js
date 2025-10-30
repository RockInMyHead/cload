const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// Константы тарификации
const BILLING_CONSTANTS = {
  FREE_STORAGE_MB: 3 * 1024, // 3 ГБ в МБ
  PRICE_PER_MB: 0.1, // 0.1 рубль за МБ
  MAX_FILE_SIZE_MB: 100 // Максимальный размер файла
};

// Функция для безопасного декодирования имен файлов
const decodeFileName = (filename) => {
  try {
    // Сначала пробуем декодировать как UTF-8
    return decodeURIComponent(filename);
  } catch (e) {
    try {
      // Если не получилось, пробуем декодировать из latin1 в UTF-8
      const buffer = Buffer.from(filename, 'latin1');
      return buffer.toString('utf8');
    } catch (e2) {
      // Если ничего не получилось, возвращаем как есть
      return filename;
    }
  }
};

// Создаем папки для хранения
const uploadsDir = path.join(__dirname, 'uploads');
const usersDir = path.join(__dirname, 'data');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(usersDir)) {
  fs.mkdirSync(usersDir, { recursive: true });
}

// Безопасные заголовки без CORP проверки
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
  })
);
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://92.51.38.132:3001', 'http://92.51.38.132'], // Allow production and dev URLs
  credentials: true
}));
// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Serve static files from the React build directory
const buildPath = path.join(__dirname, '../build');
app.use(express.static(buildPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для правильной обработки multipart данных
app.use((req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    req.setEncoding('latin1');
  }
  next();
});

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id || 'anonymous';
    const userUploadDir = path.join(uploadsDir, userId);
    
    if (!fs.existsSync(userUploadDir)) {
      fs.mkdirSync(userUploadDir, { recursive: true });
    }
    
    cb(null, userUploadDir);
  },
  filename: (req, file, cb) => {
    const decodedName = decodeFileName(file.originalname);
    const uniqueName = `${uuidv4()}-${decodedName}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Разрешаем все типы файлов для демо
    cb(null, true);
  }
});

// In-memory хранилище (в реальном приложении используйте базу данных)
let users = [];
let files = [];

// Загружаем данные при запуске
const loadData = () => {
  try {
    const usersFile = path.join(usersDir, 'users.json');
    const filesFile = path.join(usersDir, 'files.json');
    
    if (fs.existsSync(usersFile)) {
      users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    }
    
    if (fs.existsSync(filesFile)) {
      files = JSON.parse(fs.readFileSync(filesFile, 'utf8'));
    }
    
    console.log(`📊 Загружено ${users.length} пользователей и ${files.length} файлов`);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
};

// Сохраняем данные
const saveData = () => {
  try {
    const usersFile = path.join(usersDir, 'users.json');
    const filesFile = path.join(usersDir, 'files.json');
    
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    fs.writeFileSync(filesFile, JSON.stringify(files, null, 2));
  } catch (error) {
    console.error('Ошибка сохранения данных:', error);
  }
};

// Функции тарификации
const calculateUserStorage = (userId) => {
  const userFiles = files.filter(f => f.userId === userId);
  const totalSizeBytes = userFiles.reduce((sum, file) => sum + (file.size || 0), 0);
  const totalSizeMB = totalSizeBytes / (1024 * 1024);
  
  return {
    usedMB: Math.round(totalSizeMB * 100) / 100,
    freeMB: BILLING_CONSTANTS.FREE_STORAGE_MB,
    totalMB: totalSizeMB,
    isOverLimit: totalSizeMB > BILLING_CONSTANTS.FREE_STORAGE_MB
  };
};

const calculateBilling = (userId) => {
  const storage = calculateUserStorage(userId);
  const overLimitMB = Math.max(0, storage.totalMB - BILLING_CONSTANTS.FREE_STORAGE_MB);
  const cost = overLimitMB * BILLING_CONSTANTS.PRICE_PER_MB;
  
  return {
    ...storage,
    overLimitMB: Math.round(overLimitMB * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    canUpload: storage.totalMB < BILLING_CONSTANTS.FREE_STORAGE_MB + (BILLING_CONSTANTS.MAX_FILE_SIZE_MB * 2) // Буфер для загрузки
  };
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Middleware для проверки API ключа
const authenticateApiKey = (req, res, next) => {
  // Получаем apiKey из заголовка или из query для iframe
  const authHeader = req.headers.authorization;
  let apiKey = req.query.apiKey;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  }
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API ключ не предоставлен',
      message: 'Используйте заголовок Bearer или query параметр apiKey'
    });
  }
  
  // Ищем пользователя по API ключу
  const user = users.find(u => u.apiKey === apiKey);
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Неверный API ключ',
      message: 'Проверьте правильность API ключа'
    });
  }
  
  req.user = user;
  next();
};

// Генерируем короткий API ключ
const generateApiKey = (userId) => {
  // Создаем короткий ключ: WDX + 8 символов
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'WDX_';
  
  // Добавляем 8 случайных символов
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// Routes

// Проверка здоровья сервера
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Windexs Cloud API Server работает!',
    timestamp: new Date().toISOString(),
    users: users.length,
    files: files.length
  });
});

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Не все поля заполнены',
        required: ['name', 'email', 'password']
      });
    }
    
    // Нормализуем email (приводим к нижнему регистру и удаляем пробелы)
    const normalizedEmail = email.trim().toLowerCase();
    
    // Проверяем, существует ли пользователь
    const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Пользователь с таким email уже существует'
      });
    }
    
    // Создаем нового пользователя
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = generateApiKey(userId);
    
    const newUser = {
      id: userId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      apiKey,
      balance: 0, // Баланс пользователя
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveData();
    
    // Возвращаем пользователя без пароля
    const { password: _, ...userResponse } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Вход пользователя
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны'
      });
    }
    
    // Нормализуем email (приводим к нижнему регистру и удаляем пробелы)
    const normalizedEmail = email.trim().toLowerCase();

    // Ищем пользователя
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль'
      });
    }
    
    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль'
      });
    }
    
    // Обновляем API ключ при каждом входе
    user.apiKey = generateApiKey(user.id);
    user.updatedAt = new Date().toISOString();
    saveData();
    
    // Возвращаем пользователя без пароля
    const { password: _, ...userResponse } = user;
    
    res.json({
      success: true,
      message: 'Успешный вход в систему',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение API-ключа по email и паролю
app.post('/api/key', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email и пароль обязательны' });
    }
    // Нормализуем email
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }
    res.json({ success: true, apiKey: user.apiKey });
  } catch (error) {
    console.error('Ошибка получения API-ключа:', error);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

// Получение информации о пользователе
app.get('/api/user', authenticateApiKey, (req, res) => {
  const { password: _, ...userResponse } = req.user;
  res.json({
    success: true,
    user: userResponse // включает баланс
  });
});

// Обновление имени и email пользователя
app.put('/api/user', authenticateApiKey, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Имя и email обязательны' });
    }
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    user.name = name;
    user.email = email;
    saveData();
    const { password: _, ...userResp } = user;
    res.json({ success: true, user: userResp });
  } catch (err) {
    console.error('Ошибка обновления профиля:', err);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

// Смена пароля
app.put('/api/user/password', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Текущий и новый пароль обязательны' });
    }
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, error: 'Текущий пароль неверен' });
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    saveData();
    res.json({ success: true, message: 'Пароль успешно изменён' });
  } catch (err) {
    console.error('Ошибка смены пароля:', err);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

// Получение информации о тарификации
app.get('/api/billing', authenticateApiKey, (req, res) => {
  try {
    const userId = req.user.id;
    const billing = calculateBilling(userId);
    
    res.json({
      success: true,
      billing: {
        ...billing,
        usedFormatted: formatBytes(billing.usedMB * 1024 * 1024),
        freeFormatted: formatBytes(billing.freeMB * 1024 * 1024),
        totalFormatted: formatBytes(billing.totalMB * 1024 * 1024),
        overLimitFormatted: formatBytes(billing.overLimitMB * 1024 * 1024),
        pricePerMB: BILLING_CONSTANTS.PRICE_PER_MB,
        freeStorageMB: BILLING_CONSTANTS.FREE_STORAGE_MB
      }
    });
    
  } catch (error) {
    console.error('Ошибка получения тарификации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение списка файлов
app.get('/api/files', authenticateApiKey, (req, res) => {
  try {
    const { path: filePath } = req.query;
    const userId = req.user.id;
    
    // Фильтруем файлы по пользователю и пути
    let userFiles = files.filter(f => f.userId === userId);
    
    if (filePath) {
      userFiles = userFiles.filter(f => f.path.startsWith(filePath));
    }
    
    res.json({
      success: true,
      files: userFiles,
      count: userFiles.length
    });
    
  } catch (error) {
    console.error('Ошибка получения файлов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Загрузка файла
app.post('/api/upload', authenticateApiKey, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не предоставлен' });
    }
    
    const { path: uploadPath = '/' } = req.body;
    const userId = req.user.id;
    
    // Проверяем лимиты перед загрузкой
    const billing = calculateBilling(userId);
    const fileSizeMB = req.file.size / (1024 * 1024);
    
    if (fileSizeMB > BILLING_CONSTANTS.MAX_FILE_SIZE_MB) {
      return res.status(400).json({ 
        error: `Размер файла превышает максимально допустимый (${BILLING_CONSTANTS.MAX_FILE_SIZE_MB} МБ)`,
        maxFileSize: BILLING_CONSTANTS.MAX_FILE_SIZE_MB
      });
    }
    
    if (billing.totalMB + fileSizeMB > BILLING_CONSTANTS.FREE_STORAGE_MB + (BILLING_CONSTANTS.MAX_FILE_SIZE_MB * 2)) {
      return res.status(400).json({ 
        error: 'Превышен лимит хранилища. Удалите файлы или оплатите дополнительное место.',
        billing: billing,
        fileSizeMB: Math.round(fileSizeMB * 100) / 100
      });
    }
    
    // Создаем запись о файле
    const decodedFileName = decodeFileName(req.file.originalname);
    const fileRecord = {
      id: uuidv4(),
      userId,
      name: decodedFileName,
      type: 'file',
      size: req.file.size,
      path: path.posix.join(uploadPath, decodedFileName),
      filename: req.file.filename, // Имя файла на диске
      mimeType: req.file.mimetype,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };
    
    // Добавляем URL предпросмотра для изображений
    if (fileRecord.mimeType.startsWith('image/')) {
      fileRecord.previewUrl = `${SERVER_URL}/uploads/${userId}/${fileRecord.filename}`;
    }

    files.push(fileRecord);
    saveData();
    
    // Получаем обновленную информацию о тарификации
    const updatedBilling = calculateBilling(userId);
    
    res.status(201).json({
      success: true,
      message: 'Файл успешно загружен',
      file: fileRecord,
      billing: updatedBilling
    });
    
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создание папки
app.post('/api/folders', authenticateApiKey, (req, res) => {
  try {
    const { name, path: folderPath = '/' } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя папки обязательно' });
    }
    
    const fullPath = path.posix.join(folderPath, name);
    
    // Проверяем, не существует ли уже папка
    const existingFolder = files.find(f => 
      f.userId === userId && 
      f.type === 'folder' && 
      f.path === fullPath
    );
    
    if (existingFolder) {
      return res.status(409).json({ error: 'Папка с таким именем уже существует' });
    }
    
    // Создаем папку
    const folderRecord = {
      id: uuidv4(),
      userId,
      name,
      type: 'folder',
      path: fullPath,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };
    
    files.push(folderRecord);
    saveData();
    
    res.status(201).json({
      success: true,
      message: 'Папка успешно создана',
      folder: folderRecord
    });
    
  } catch (error) {
    console.error('Ошибка создания папки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение информации о файле
app.get('/api/files/:fileId', authenticateApiKey, (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;
    
    const file = files.find(f => f.id === fileId && f.userId === userId);
    
    if (!file) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    res.json({
      success: true,
      file
    });
    
  } catch (error) {
    console.error('Ошибка получения файла:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Переименование файла/папки
app.put('/api/files/:fileId', authenticateApiKey, (req, res) => {
  try {
    const { fileId } = req.params;
    const { name } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ error: 'Новое имя обязательно' });
    }
    
    const file = files.find(f => f.id === fileId && f.userId === userId);
    
    if (!file) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    // Обновляем имя и путь
    const oldPath = file.path;
    const newPath = path.posix.join(path.posix.dirname(oldPath), name);
    
    file.name = name;
    file.path = newPath;
    file.modifiedAt = new Date().toISOString();
    
    saveData();
    
    res.json({
      success: true,
      message: 'Файл успешно переименован',
      file
    });
    
  } catch (error) {
    console.error('Ошибка переименования файла:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление файла/папки
app.delete('/api/files/:fileId', authenticateApiKey, (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;
    
    const fileIndex = files.findIndex(f => f.id === fileId && f.userId === userId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    const file = files[fileIndex];
    
    // Если это файл, удаляем его с диска
    if (file.type === 'file' && file.filename) {
      const filePath = path.join(uploadsDir, userId, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Удаляем запись из массива
    files.splice(fileIndex, 1);
    saveData();
    
    res.json({
      success: true,
      message: 'Файл успешно удален'
    });
    
  } catch (error) {
    console.error('Ошибка удаления файла:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Поиск файлов
app.get('/api/search', authenticateApiKey, (req, res) => {
  try {
    const { q: query, type } = req.query;
    const userId = req.user.id;
    
    if (!query) {
      return res.status(400).json({ error: 'Поисковый запрос обязателен' });
    }
    
    let userFiles = files.filter(f => f.userId === userId);
    
    // Фильтруем по типу если указан
    if (type) {
      userFiles = userFiles.filter(f => f.type === type);
    }
    
    // Ищем по имени
    const searchResults = userFiles.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
      success: true,
      query,
      results: searchResults,
      count: searchResults.length
    });
    
  } catch (error) {
    console.error('Ошибка поиска:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Скачивание файла
app.get('/api/download/:fileId', authenticateApiKey, (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;
    
    const file = files.find(f => f.id === fileId && f.userId === userId);
    
    if (!file || file.type !== 'file') {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    const filePath = path.join(uploadsDir, userId, file.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден на диске' });
    }
    
    res.download(filePath, file.name);
    
  } catch (error) {
    console.error('Ошибка скачивания файла:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение изображения по API ключу
app.get('/api/files/:fileId/image', async (req, res) => {
  // Разрешаем кросс-доменное встраивание - удаляем CORP заголовок, установленный helmet
  res.removeHeader('Cross-Origin-Resource-Policy');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  try {
    const apiKey = req.query.apiKey;
    if (!apiKey) {
      return res.status(401).send('API key required');
    }
    const user = users.find(u => u.apiKey === apiKey);
    if (!user) {
      return res.status(401).send('Invalid API key');
    }
    const fileId = req.params.fileId;
    const file = files.find(f => f.id === fileId && f.userId === user.id);
    if (!file || file.type !== 'file' || !file.filename) {
      return res.status(404).send('File not found');
    }
    const userDir = path.join(uploadsDir, user.id);
    const filePath = path.join(userDir, file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found on disk');
    }
    res.sendFile(filePath);
  } catch (error) {
    console.error('Ошибка отдачи изображения:', error);
    res.status(500).send('Server error');
  }
});

// Получение сырого контента файла для текстовых файлов
app.get('/api/files/:fileId/raw', authenticateApiKey, (req, res) => {
  // Разрешаем кросс-доменное встраивание - удаляем CORP заголовок
  res.removeHeader('Cross-Origin-Resource-Policy');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  try {
    const userId = req.user.id;
    const fileId = req.params.fileId;
    const file = files.find(f => f.id === fileId && f.userId === userId);
    if (!file) return res.status(404).json({ success:false, error:'Файл не найден' });
    if (file.type !== 'file' || !file.filename) {
      return res.status(400).json({ success:false, error:'Неподдерживаемый тип файла' });
    }
    const filePath = path.join(uploadsDir, userId, file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success:false, error:'Файл не найден на диске' });
    }
    res.setHeader('Content-Type', file.mimeType);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Ошибка отдачи сырого файла:', error);
    res.status(500).json({ success:false, error:'Внутренняя ошибка сервера' });
  }
});

// Пополнение баланса пользователя
app.put('/api/user/balance', authenticateApiKey, (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Сумма должна быть положительным числом' });
    }
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    user.balance = (user.balance || 0) + amount;
    user.updatedAt = new Date().toISOString();
    saveData();
    res.json({ success: true, balance: user.balance });
  } catch (err) {
    console.error('Ошибка пополнения баланса:', err);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

// История использования (группировка по дате)
app.get('/api/billing/history', authenticateApiKey, (req, res) => {
  try {
    const userId = req.user.id;
    const userFiles = files.filter(f => f.userId === userId && f.type === 'file');
    const historyMap = {};
    userFiles.forEach(f => {
      const dateKey = new Date(f.createdAt).toLocaleDateString('ru-RU');
      const mb = (f.size || 0) / (1024 * 1024);
      historyMap[dateKey] = (historyMap[dateKey] || 0) + mb;
    });
    const history = Object.entries(historyMap).map(([date, used]) => ({ date, usedMB: Math.round(used * 100) / 100 }));
    res.json({ success: true, history });
  } catch (err) {
    console.error('Ошибка получения истории тарификации:', err);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
});

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error('Ошибка сервера:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Файл слишком большой (максимум 100MB)' });
    }
  }

  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Загружаем данные при запуске
loadData();

// Единый catch-all handler для всех запросов
app.use((req, res) => {
  // Если это API запрос, возвращаем JSON ошибку 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Endpoint не найден',
      message: 'Проверьте правильность URL и метод запроса',
      availableEndpoints: [
        'GET /health',
        'POST /api/register',
        'POST /api/login',
        'GET /api/user',
        'GET /api/files',
        'POST /api/upload',
        'POST /api/folders',
        'GET /api/files/:fileId',
        'PUT /api/files/:fileId',
        'DELETE /api/files/:fileId',
        'GET /api/search',
        'GET /api/download/:fileId'
      ]
    });
  }

  // Для всех остальных запросов (включая статические файлы и React роуты) отправляем index.html
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      console.error('Ошибка отправки index.html:', err);
      res.status(500).send('Ошибка сервера');
    }
  });
});

// Запускаем сервер
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Windexs Cloud API Server запущен!');
  console.log(`📡 Сервер работает на порту ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💚 Проверка здоровья: http://localhost:${PORT}/health`);
  console.log(`📁 Загрузки: ${uploadsDir}`);
  console.log(`💾 Данные: ${usersDir}`);
  console.log('🔑 API ключи генерируются автоматически при регистрации/входе');
  console.log('📋 Используйте заголовок: Authorization: Bearer YOUR_API_KEY');
});

module.exports = app;
