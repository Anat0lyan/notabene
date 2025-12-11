#!/bin/bash
# Скрипт для деплоя проекта в Firebase

set -e

echo "🔨 Начинаем деплой в Firebase..."

# Проверка наличия Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI не установлен. Установите его:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Сборка фронтенда
echo "📦 Собираем фронтенд..."
cd client
if [ ! -d "node_modules" ]; then
  echo "📥 Устанавливаем зависимости..."
  npm install
fi
npm run build
cd ..

# Проверка наличия собранных файлов
if [ ! -d "client/dist" ]; then
    echo "❌ Ошибка: папка client/dist не найдена после сборки"
    exit 1
fi

# Деплой в Firebase
echo "🚀 Деплоим в Firebase..."
firebase deploy

echo "✅ Деплой завершен!"
echo ""
echo "Ваше приложение доступно по адресу:"
PROJECT_ID=$(firebase use 2>&1 | grep -oP '(?<=\[default\] ).*' || cat .firebaserc | grep -oP '(?<="default": ")[^"]*')
if [ -n "$PROJECT_ID" ]; then
    echo "  https://${PROJECT_ID}.web.app"
    echo "  https://${PROJECT_ID}.firebaseapp.com"
else
    echo "  Проверьте URL в Firebase Console"
fi
