# База данных sARA2

## Обзор

База данных sARA2 использует SQLite с Prisma ORM для управления схемой и данными.

## Структура базы данных

### Основные таблицы

- **users** - Пользователи системы
- **vacancies** - Вакансии
- **connections** - Связи между пользователями (друзья)
- **applications** - Заявки на вакансии
- **notifications** - Уведомления
- **work_experience** - Опыт работы пользователей

### Справочные таблицы

- **vacancy_types** - Типы вакансий (обычная, фриланс, стажировка, креативный проект)
- **fields** - Сферы деятельности
- **skills** - Навыки
- **work_formats** - Форматы работы (офис, удаленно, гибрид)
- **working_styles** - Стили работы (полный день, неполный день, фиксированные часы)
- **offers** - Предложения работодателя
- **participant_receives** - Что получает участник

### Связующие таблицы (many-to-many)

- **vacancy_fields** - Связь вакансий со сферами деятельности
- **vacancy_skills** - Связь вакансий с навыками
- **vacancy_offers** - Связь вакансий с предложениями
- **vacancy_participants** - Связь вакансий с тем, что получает участник
- **vacancy_photos** - Фотографии вакансий

## Команды для работы с БД

### Генерация Prisma Client
```bash
npm run db:generate
```

### Применение изменений схемы
```bash
npm run db:push
```

### Заполнение базы данных тестовыми данными
```bash
npm run db:seed
```

### Открытие Prisma Studio (веб-интерфейс для БД)
```bash
npm run db:studio
```

### Создание миграции
```bash
npm run db:migrate
```

## Заполнение базы данных

### Автоматическое заполнение (seed)

Запустите команду для заполнения БД тестовыми данными:

```bash
npm run db:seed
```

Это создаст:
- 26 тестовых пользователей
- 4 типа вакансий
- 8 сфер деятельности
- 10 навыков
- 3 формата работы
- 3 стиля работы
- 8 предложений работодателя
- 5 типов того, что получает участник
- 10 тестовых вакансий
- 50+ связей между пользователями
- 4 записи об опыте работы
- 3 уведомления

### Тестовые пользователи

После выполнения seed создаются следующие пользователи:

#### Основные пользователи:
1. **Александр Иванов** (alex@example.com) - Senior Frontend Developer
2. **Мария Петрова** (maria@example.com) - Backend Developer  
3. **Дмитрий Сидоров** (dmitry@example.com) - Full Stack Developer
4. **Анна Козлова** (anna@example.com) - UX/UI Designer
5. **Сергей Волков** (sergey@example.com) - DevOps Engineer
6. **Елена Морозова** (elena@example.com) - Product Manager

#### Дополнительные пользователи для тестирования связей:
7. **Иван Петров** (user1@example.com) - Frontend Developer
8. **Ольга Сидорова** (user2@example.com) - QA Engineer
9. **Михаил Козлов** (user3@example.com) - Data Scientist
10. **Екатерина Волкова** (user4@example.com) - Marketing Manager
11. **Андрей Морозов** (user5@example.com) - System Administrator
12. **Наталья Петрова** (user6@example.com) - HR Manager
13. **Павел Сидоров** (user7@example.com) - Mobile Developer
14. **Светлана Козлова** (user8@example.com) - Business Analyst
15. **Денис Волков** (user9@example.com) - Security Engineer
16. **Татьяна Морозова** (user10@example.com) - Content Manager
17. **Алексей Петров** (user11@example.com) - Database Administrator
18. **Марина Сидорова** (user12@example.com) - Project Manager
19. **Роман Козлов** (user13@example.com) - Technical Writer
20. **Юлия Волкова** (user14@example.com) - Sales Manager
21. **Владимир Морозов** (user15@example.com) - Game Developer
22. **Ангелина Петрова** (user16@example.com) - Digital Marketing Specialist
23. **Григорий Сидоров** (user17@example.com) - Blockchain Developer
24. **Евгения Козлова** (user18@example.com) - UI/UX Designer
25. **Артем Волков** (user19@example.com) - Cloud Architect
26. **Кристина Морозова** (user20@example.com) - Data Engineer

**Пароль для всех пользователей:** `password123`

### Тестирование функциональности "Мои связи"

Для тестирования функции "друзья друзей":
1. Войдите как `alex@example.com`
2. Перейдите на `/connections`
3. Нажмите на вкладку "Мои связи"
4. Увидите друзей друзей и сможете отправлять запросы в друзья

## Схема базы данных

Схема определена в файле `prisma/schema.prisma`. Основные модели:

### User
```prisma
model User {
  id              Int      @id @default(autoincrement())
  name            String
  email           String   @unique
  passwordHash    String
  phone           String?
  location        String?
  company         String?
  position        String?
  experienceYears Int?
  bio             String?
  avatarUrl       String?
  status          String   @default("Открыт к предложениям")
  skills          String?  // JSON array
  interests       String?  // JSON array
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Vacancy
```prisma
model Vacancy {
  id                    Int      @id @default(autoincrement())
  title                 String
  company               String
  description           String?
  requirements          String?
  salaryMin             Int?
  salaryMax             Int?
  salaryCurrency        String?
  location              String?
  type                  String?
  experienceLevel       String?
  skillsRequired        String?  // JSON array
  userId                Int?
  vacancyTypeId         Int?
  workFormatId          Int?
  workingStyleId        Int?
  hoursPerWeek          Int?
  startDate             DateTime?
  endDate               DateTime?
  contactEmail          String?
  telegramUsername      String?
  acquiredSkills        String?  // JSON array
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### Connection
```prisma
model Connection {
  id              Int      @id @default(autoincrement())
  userId          Int
  connectedUserId Int
  connectionType  String   @default("friend")
  status          String   @default("pending") // pending, accepted, rejected
  createdAt       DateTime @default(now())
}
```

## Резервное копирование

Для создания резервной копии базы данных:

```bash
cp prisma/dev.db prisma/dev.db.backup
```

Для восстановления из резервной копии:

```bash
cp prisma/dev.db.backup prisma/dev.db
```

## Очистка базы данных

Для полной очистки базы данных:

```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

## Проблемы и решения

### Ошибка "Database is locked"
- Убедитесь, что все процессы Node.js остановлены
- Перезапустите сервер

### Ошибка "Schema is out of sync"
- Выполните `npm run db:push`

### Ошибка "Prisma Client is out of sync"
- Выполните `npm run db:generate`
