# Быстрый старт

## 1. Установка зависимостей

```bash
cd client
npm install
```

## 2. Настройка Firebase

1. Создайте проект на [Firebase Console](https://console.firebase.google.com/)
2. Включите **Authentication** → **Email/Password**
3. Создайте базу данных **Firestore** (режим production)
4. Скопируйте конфигурацию из настроек проекта

## 3. Настройка переменных окружения

Создайте файл `client/.env.local`:

```env
VITE_FIREBASE_API_KEY=ваш-api-key
VITE_FIREBASE_AUTH_DOMAIN=ваш-проект.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ваш-project-id
VITE_FIREBASE_STORAGE_BUCKET=ваш-проект.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=ваш-app-id
```

## 4. Настройка Firebase проекта

Отредактируйте `.firebaserc`:

```json
{
  "projects": {
    "default": "ваш-project-id"
  }
}
```

## 5. Развертывание правил Firestore

```bash
firebase deploy --only firestore:rules
```

## 6. Запуск в режиме разработки

```bash
cd client
npm run dev
```

Откройте http://localhost:5173

## 7. Деплой на Firebase

```bash
./firebase-deploy.sh
```

Или вручную:

```bash
cd client
npm run build
cd ..
firebase deploy
```

---

**Готово!** Ваше приложение доступно на Firebase Hosting.
