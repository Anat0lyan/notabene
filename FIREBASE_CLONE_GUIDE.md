# Руководство по клонированию проекта Notabene на Firebase

## Общее описание проекта

**Notabene** — это веб-приложение для управления заметками и задачами с поддержкой тегов, поиска, фильтрации и статистики. Приложение состоит из фронтенда на Vue 3 и бэкенда на Express.js с базой данных PostgreSQL.

## Архитектура проекта

### Технологический стек

**Frontend:**
- Vue 3 (Composition API)
- Vue Router 4.2.5
- Pinia 2.1.7 (state management)
- Vite 5.0.0 (build tool)
- TypeScript 5.3.3
- Axios 1.6.0 (HTTP client)

**Backend:**
- Express.js 4.18.2
- Node.js (ES Modules)
- TypeScript 5.3.3
- PostgreSQL 8.11.3 (через pg)
- JWT (jsonwebtoken 9.0.2) для аутентификации
- bcryptjs 2.4.3 для хеширования паролей

### Структура проекта

```
notebene/
├── client/              # Vue.js фронтенд
│   ├── src/
│   │   ├── components/  # Vue компоненты
│   │   ├── views/       # Страницы приложения
│   │   ├── stores/      # Pinia stores
│   │   ├── router/      # Vue Router конфигурация
│   │   ├── services/    # API сервисы
│   │   └── types/       # TypeScript типы
│   ├── package.json
│   └── vite.config.ts
│
└── server/              # Express.js бэкенд
    ├── routes/          # API роуты
    ├── middleware/      # Middleware (auth)
    ├── config/          # Конфигурация БД
    ├── types/           # TypeScript типы
    ├── package.json
    └── index.ts         # Точка входа
```

## Функциональность приложения

### 1. Аутентификация и авторизация

**Эндпоинты:**
- `POST /api/auth/login` - вход пользователя
- `POST /api/auth/register` - регистрация нового пользователя

**Функции:**
- JWT токены с сроком действия 7 дней
- Хеширование паролей через bcryptjs (10 раундов)
- Middleware для проверки токенов на защищенных роутах
- Хранение токена в localStorage на клиенте

**Тестовый аккаунт:**
- Username: `admin`
- Password: `admin`

### 2. Управление заметками (Notes)

**Эндпоинты:**
- `GET /api/notes` - получить все заметки (с фильтрами)
- `GET /api/notes/:id` - получить заметку по ID
- `POST /api/notes` - создать новую заметку
- `PUT /api/notes/:id` - обновить заметку
- `DELETE /api/notes/:id` - удалить заметку
- `PATCH /api/notes/:id/archive` - архивировать/разархивировать
- `PATCH /api/notes/:id/favorite` - добавить/убрать из избранного

**Параметры запросов:**
- `search` - поиск по тексту (title, content)
- `tags` - фильтрация по тегам (массив ID тегов)
- `sort` - сортировка: `created_at`, `updated_at`, `title`
- `order` - порядок: `ASC`, `DESC`
- `archived` - показать архивированные (`true`/`false`)

**Структура заметки:**
```typescript
interface Note {
  id: number;
  user_id: number;
  title: string;
  content?: string | null;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  is_favorite: boolean;
  tags?: Tag[];
}
```

### 3. Управление тегами (Tags)

**Эндпоинты:**
- `GET /api/tags` - получить все теги пользователя
- `PUT /api/tags/:id` - обновить тег (имя, цвет)
- `PATCH /api/tags/:id/color` - обновить цвет тега
- `DELETE /api/tags/:id` - удалить тег

**Особенности:**
- Теги создаются автоматически при добавлении к заметке
- Теги привязаны к пользователю (user_id)
- Поддержка цветов для тегов
- Счетчик количества заметок с тегом

**Структура тега:**
```typescript
interface Tag {
  id: number;
  user_id: number;
  name: string;
  color?: string | null;
  created_at: string;
  note_count?: number;
}
```

### 4. Управление задачами (Tasks)

**Эндпоинты:**
- `GET /api/tasks` - получить все задачи (с фильтрами)
- `GET /api/tasks/by-note/:noteId` - получить задачи по заметке
- `GET /api/tasks/:id` - получить задачу по ID
- `GET /api/tasks/stats` - получить статистику задач
- `POST /api/tasks` - создать задачу
- `PUT /api/tasks/:id` - обновить задачу
- `PATCH /api/tasks/:id/toggle` - переключить статус выполнения
- `DELETE /api/tasks/:id` - удалить задачу

**Параметры запросов:**
- `filter` - фильтр: `all`, `today`, `upcoming`, `overdue`, `completed`, `pending`
- `sort` - сортировка: `due_date`, `priority`, `created_at`, `title`
- `order` - порядок: `ASC`, `DESC`

**Структура задачи:**
```typescript
interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  due_date?: string | null;
  priority: 'low' | 'medium' | 'high';
  note_id?: number | null;
  note_title?: string | null;
  recurring_type: 'none' | 'daily' | 'weekly' | 'monthly';
  recurring_interval: number;
  reminder?: string | null;
  created_at: string;
  updated_at: string;
}
```

**Статистика задач:**
```typescript
interface TaskStats {
  total: number;
  completed: number;
  due_today: number;
  overdue: number;
  upcoming: number;
}
```

## Схема базы данных PostgreSQL

### Таблица `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `notes`
```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Таблица `tags`
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);
```

### Таблица `note_tags` (связь many-to-many)
```sql
CREATE TABLE note_tags (
  note_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Таблица `tasks`
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  note_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recurring_type VARCHAR(20) DEFAULT 'none' CHECK (recurring_type IN ('none', 'daily', 'weekly', 'monthly')),
  recurring_interval INTEGER DEFAULT 1,
  reminder TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL
);
```

### Индексы
- `idx_notes_user_id` на `notes(user_id)`
- `idx_notes_archived` на `notes(is_archived)`
- `idx_note_tags_note_id` на `note_tags(note_id)`
- `idx_note_tags_tag_id` на `note_tags(tag_id)`
- `idx_note_tags_user_id` на `note_tags(user_id)`
- `idx_tags_user_id` на `tags(user_id)`
- `idx_tasks_user_id` на `tasks(user_id)`
- `idx_tasks_completed` на `tasks(completed)`
- `idx_tasks_due_date` на `tasks(due_date)`
- `idx_tasks_note_id` на `tasks(note_id)`

## Frontend компоненты и страницы

### Компоненты (`client/src/components/`)

1. **Navigation.vue** - навигационное меню
2. **TagInput.vue** - ввод тегов
3. **TagItem.vue** - элемент тега в списке
4. **TaskCard.vue** - карточка задачи
5. **TaskForm.vue** - форма создания/редактирования задачи
6. **NoteTasks.vue** - список задач для заметки
7. **Dropdown.vue** - выпадающий список

### Страницы (`client/src/views/`)

1. **Login.vue** - страница входа/регистрации
2. **Notes.vue** - список заметок с фильтрами и поиском
3. **NoteDetail.vue** - просмотр заметки
4. **NoteEdit.vue** - создание/редактирование заметки
5. **Dashboard.vue** - дашборд с задачами и статистикой

### Pinia Stores (`client/src/stores/`)

1. **auth.js** - управление аутентификацией
   - `token`, `user`
   - `login(username, password)`
   - `register(username, password)`
   - `logout()`

2. **notes.js** - управление заметками
   - `notes`, `tags`, `loading`
   - `searchQuery`, `selectedTags`, `sortBy`, `sortOrder`
   - `fetchNotes()`, `fetchTags()`, `createNote()`, `updateNote()`, `deleteNote()`
   - `toggleFavorite()`, `toggleArchive()`
   - `updateTag()`, `deleteTag()`

3. **tasks.js** - управление задачами
   - `tasks`, `stats`, `loading`
   - `filter`, `sortBy`, `sortOrder`
   - `fetchTasks()`, `fetchStats()`, `createTask()`, `updateTask()`, `deleteTask()`
   - `toggleTask()`

### Роутинг (`client/src/router/index.js`)

```javascript
Routes:
- /login - Login
- / - Notes (требует auth)
- /dashboard - Dashboard (требует auth)
- /note/:id - NoteDetail (требует auth)
- /note/:id/edit - NoteEdit (требует auth)
- /note/new - NoteEdit (требует auth)
```

## API сервис (`client/src/services/api.js`)

- Базовый URL: `http://localhost:3000/api` (dev) или `/api` (production)
- Автоматическое добавление JWT токена в заголовки
- Обработка ошибок 401 (редирект на /login)
- Таймаут запросов: 10 секунд

## Переменные окружения

### Backend (`server/.env`)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notabene
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=production
SERVE_STATIC=true
```

### Frontend (`client/.env.local`)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Миграция на Firebase

### Что нужно заменить:

1. **База данных PostgreSQL → Firestore**
   - Коллекции: `users`, `notes`, `tags`, `tasks`
   - Подколлекции: `note_tags` можно хранить как массив в документе заметки
   - Правила безопасности Firestore для изоляции данных пользователей

2. **Аутентификация JWT → Firebase Authentication**
   - Заменить JWT на Firebase Auth токены
   - Использовать Firebase Auth для регистрации/входа
   - Middleware для проверки Firebase токенов

3. **Backend Express.js → Cloud Functions**
   - Конвертировать Express роуты в Cloud Functions
   - Или использовать Firebase Hosting + Cloud Functions для API
   - Или полностью перейти на клиентскую логику с Firestore SDK

4. **Хранение статики**
   - Frontend деплой на Firebase Hosting
   - Автоматическая сборка через Firebase CLI

### Структура Firestore:

```
users/{userId}
  - username: string
  - createdAt: timestamp

notes/{noteId}
  - userId: string
  - title: string
  - content: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - isArchived: boolean
  - isFavorite: boolean
  - tags: array of tag objects

tags/{tagId}
  - userId: string
  - name: string
  - color: string | null
  - createdAt: timestamp

tasks/{taskId}
  - userId: string
  - title: string
  - description: string | null
  - completed: boolean
  - dueDate: timestamp | null
  - priority: 'low' | 'medium' | 'high'
  - noteId: string | null
  - recurringType: string
  - recurringInterval: number
  - reminder: timestamp | null
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Правила безопасности Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /tags/{tagId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Ключевые особенности реализации

1. **Многоуровневая изоляция данных**
   - Все таблицы имеют `user_id` для изоляции данных пользователей
   - Все запросы фильтруются по `user_id`

2. **Автоматическое создание тегов**
   - Теги создаются "на лету" при добавлении к заметке
   - Проверка уникальности по комбинации `user_id` + `name`

3. **Гибкая фильтрация и сортировка**
   - Фильтрация на уровне SQL для производительности
   - Поддержка множественных фильтров одновременно

4. **Связь задач с заметками**
   - Задачи могут быть привязаны к заметкам через `note_id`
   - При удалении заметки задачи остаются (ON DELETE SET NULL)

5. **Статистика в реальном времени**
   - Агрегация данных на уровне SQL
   - Кэширование на клиенте через Pinia

## Команды для запуска

### Development

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

### Production Build

```bash
# Build frontend
cd client
npm install
npm run build

# Build backend
cd ../server
npm install
npm run build

# Start server
NODE_ENV=production npm start
```

## Зависимости проекта

### Frontend (`client/package.json`)
```json
{
  "dependencies": {
    "vue": "^3.3.4",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.3",
    "vue-tsc": "^1.8.22"
  }
}
```

### Backend (`server/package.json`)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "@types/pg": "^8.10.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

## Дополнительные детали

### Middleware аутентификации
- Проверка JWT токена в заголовке `Authorization: Bearer <token>`
- Извлечение `userId` из токена
- Проверка существования пользователя в БД
- Добавление `req.user` с `id` и `username`

### Обработка ошибок
- Единообразные ответы об ошибках: `{ error: string }`
- HTTP статусы: 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)
- Логирование ошибок на сервере

### Производительность
- Индексы на часто используемых полях
- Агрегация данных на уровне SQL
- Кэширование на клиенте через Pinia stores

## Рекомендации для миграции на Firebase

1. **Начните с аутентификации**
   - Интегрируйте Firebase Authentication
   - Замените JWT на Firebase токены

2. **Мигрируйте данные постепенно**
   - Сначала заметки (notes)
   - Затем теги (tags)
   - Потом задачи (tasks)

3. **Используйте Firestore SDK на клиенте**
   - Уберите зависимость от Express API
   - Используйте real-time listeners для обновлений

4. **Cloud Functions для сложной логики**
   - Агрегация статистики
   - Сложные запросы
   - Валидация данных

5. **Оптимизируйте структуру данных**
   - Денормализация для частых запросов
   - Используйте подколлекции где уместно
   - Индексы для сложных запросов

Этот документ содержит всю необходимую информацию для воссоздания проекта Notabene на платформе Firebase с помощью ИИ.

