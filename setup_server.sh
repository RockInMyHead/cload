#!/bin/bash

echo "=== Windexs Cloud - Настройка сервера ==="
echo "Подключение к серверу..."

# Команды для выполнения на сервере
ssh -o StrictHostKeyChecking=no root@92.51.38.132 << 'EOF'
echo "Пароль принят, выполняем настройку..."

# Останавливаем существующие процессы
echo "Останавливаем существующие процессы..."
pkill -f node || true
sleep 2

# Переходим в домашнюю директорию
cd ~

# Удаляем старую версию если существует
if [ -d "cload" ]; then
    echo "Удаляем старую версию..."
    rm -rf cload
fi

# Клонируем репозиторий
echo "Клонируем репозиторий..."
git clone https://github.com/RockInMyHead/cload.git

# Переходим в директорию проекта
cd cload

# Устанавливаем зависимости сервера
echo "Устанавливаем зависимости сервера..."
cd server
npm install

# Устанавливаем зависимости React
echo "Устанавливаем зависимости React..."
cd ..
npm install

# Собираем React приложение
echo "Собираем React приложение..."
npm run build

# Запускаем сервер
echo "Запускаем сервер..."
cd server
nohup node index.js > server.log 2>&1 &

echo "=== Установка завершена! ==="
echo "Проверьте работу: http://92.51.38.132:3001/"
echo "Логи сервера: ~/cload/server/server.log"
EOF

echo "=== Проверка работы ==="
sleep 3
curl -s http://92.51.38.132:3001/health

echo ""
echo "=== Готово! Откройте http://92.51.38.132:3001/ в браузере ==="
