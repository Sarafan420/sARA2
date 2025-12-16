# Система логирования действий пользователей

## Обзор

Система логирования предоставляет полное отслеживание действий пользователей, событий безопасности и системных событий в приложении sARA2.

## Структура базы данных

### Таблицы логов

#### 1. `user_logs` - Логи действий пользователей
- `id` - Уникальный идентификатор
- `user_id` - ID пользователя
- `action_type` - Тип действия (login, logout, profile_update, vacancy_create, etc.)
- `action_data` - JSON с деталями действия
- `ip_address` - IP адрес пользователя
- `user_agent` - User Agent браузера
- `session_id` - ID сессии
- `created_at` - Время создания записи

#### 2. `security_logs` - Логи событий безопасности
- `id` - Уникальный идентификатор
- `user_id` - ID пользователя (может быть null для неуспешных попыток)
- `action_type` - Тип события (login_attempt, password_change, suspicious_activity)
- `action_data` - JSON с деталями события
- `ip_address` - IP адрес
- `user_agent` - User Agent браузера
- `success` - Успешность операции (boolean)
- `created_at` - Время создания записи

#### 3. `system_logs` - Системные логи
- `id` - Уникальный идентификатор
- `level` - Уровень лога (info, warning, error, debug)
- `message` - Сообщение лога
- `context` - JSON с контекстом
- `service` - Название сервиса/модуля
- `created_at` - Время создания записи

## API Endpoints

### Логирование действий

#### POST `/api/logs/user`
Логирование действий пользователя.

**Заголовки:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "actionType": "vacancy_hide",
  "actionData": {
    "vacancyId": 123,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### POST `/api/logs/security`
Логирование событий безопасности.

**Тело запроса:**
```json
{
  "actionType": "login_attempt",
  "actionData": {
    "email": "user@example.com",
    "reason": "invalid_password"
  },
  "success": false
}
```

### Получение логов

#### GET `/api/logs/user/:userId`
Получение логов конкретного пользователя.

**Параметры запроса:**
- `page` - Номер страницы (по умолчанию 1)
- `limit` - Количество записей на странице (по умолчанию 50)
- `actionType` - Фильтр по типу действия
- `startDate` - Дата начала (ISO 8601)
- `endDate` - Дата окончания (ISO 8601)

#### GET `/api/logs/security`
Получение логов безопасности.

**Параметры запроса:**
- `page` - Номер страницы
- `limit` - Количество записей на странице
- `actionType` - Фильтр по типу события
- `success` - Фильтр по успешности (true/false)
- `startDate` - Дата начала
- `endDate` - Дата окончания

#### GET `/api/logs/stats`
Получение статистики по логам.

**Параметры запроса:**
- `startDate` - Дата начала для статистики
- `endDate` - Дата окончания для статистики

## Утилита Logger

### Использование

```javascript
const Logger = require('./utils/logger');

// Логирование действия пользователя
await Logger.logUserAction(userId, 'profile_update', {
  field: 'name',
  oldValue: 'Old Name',
  newValue: 'New Name'
}, req);

// Логирование события безопасности
await Logger.logSecurityEvent(userId, 'password_change', {
  timestamp: new Date().toISOString()
}, true, req);

// Логирование системного события
await Logger.logSystemEvent('error', 'Database connection failed', {
  error: 'Connection timeout',
  retryCount: 3
}, 'database');

// Получение статистики
const stats = await Logger.getLogStats('2024-01-01', '2024-01-31');

// Очистка старых логов
await Logger.cleanupOldLogs(180); // Удалить логи старше 180 дней
```

## Страница мониторинга

### Доступ
Страница мониторинга доступна по адресу: `/admin/logs`

### Функциональность

1. **Вкладка "Действия пользователей"**
   - Просмотр всех действий пользователей
   - Фильтрация по типу действия, дате
   - Пагинация результатов

2. **Вкладка "События безопасности"**
   - Просмотр событий безопасности
   - Фильтрация по типу события, успешности, дате
   - Отображение неуспешных попыток входа

3. **Вкладка "Статистика"**
   - Общая статистика по всем типам логов
   - Количество событий по типам
   - Последние активности

## Типы действий

### Действия пользователей
- `login` - Вход в систему
- `logout` - Выход из системы
- `registration` - Регистрация нового пользователя
- `profile_update` - Обновление профиля
- `vacancy_create` - Создание вакансии
- `vacancy_update` - Обновление вакансии
- `vacancy_delete` - Удаление вакансии
- `vacancy_hide` - Скрытие вакансии
- `vacancy_show` - Показ скрытой вакансии
- `connection_request` - Запрос на подключение
- `connection_accept` - Принятие подключения
- `application_submit` - Подача заявки на вакансию

### События безопасности
- `login_attempt` - Попытка входа (успешная/неуспешная)
- `password_change` - Смена пароля
- `suspicious_activity` - Подозрительная активность
- `account_locked` - Блокировка аккаунта
- `failed_login_limit` - Превышение лимита неуспешных входов

## Безопасность и конфиденциальность

### Шифрование данных
- IP адреса и User Agent логируются в открытом виде для анализа безопасности
- Конфиденциальные данные (пароли, токены) НЕ логируются
- Email адреса логируются только для событий безопасности

### Хранение и архивирование
- Логи хранятся минимум 6 месяцев
- Автоматическая очистка логов старше 12 месяцев
- Возможность ручной очистки через API

### Права доступа
- Просмотр логов доступен только авторизованным пользователям
- В будущем планируется добавление ролевой модели для администраторов

## Мониторинг и алерты

### Рекомендуемые алерты
1. **Множественные неуспешные попытки входа** с одного IP
2. **Подозрительная активность** (необычные паттерны действий)
3. **Ошибки системы** (уровень error)
4. **Изменения критических данных** (пароли, настройки безопасности)

### Интеграция с внешними системами
- Возможность экспорта логов в формате JSON/CSV
- Webhook для отправки критических событий
- Интеграция с системами мониторинга (Prometheus, Grafana)

## Развертывание

### Переменные окружения
```env
# Настройки логирования
LOG_RETENTION_DAYS=180
LOG_CLEANUP_INTERVAL=24h
LOG_MAX_SIZE=100MB
```

### Автоматическая очистка
Рекомендуется настроить cron job для автоматической очистки старых логов:

```bash
# Очистка логов каждые 24 часа
0 2 * * * node /path/to/app/utils/cleanup-logs.js
```

## Примеры использования

### Логирование в контроллерах
```javascript
// В routes/vacancies.js
router.post('/', authenticateToken, async (req, res) => {
  try {
    const vacancy = await prisma.vacancy.create({...});
    
    // Логируем создание вакансии
    await Logger.logUserAction(req.user.id, 'vacancy_create', {
      vacancyId: vacancy.id,
      title: vacancy.title,
      company: vacancy.company
    }, req);
    
    res.json({ success: true, vacancy });
  } catch (error) {
    await Logger.logSystemEvent('error', 'Failed to create vacancy', {
      error: error.message,
      userId: req.user.id
    }, 'vacancies');
    
    res.status(500).json({ error: 'Failed to create vacancy' });
  }
});
```

### Middleware для автоматического логирования
```javascript
// middleware/logging.js
const Logger = require('../utils/logger');

const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    
    if (res.statusCode >= 400) {
      await Logger.logSystemEvent('warning', 'HTTP Error', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        ip: req.ip
      }, 'http');
    }
  });
  
  next();
};

module.exports = { logRequest };
```

## Troubleshooting

### Частые проблемы

1. **Логи не создаются**
   - Проверьте подключение к базе данных
   - Убедитесь, что таблицы логов созданы
   - Проверьте права доступа к базе данных

2. **Ошибки в API логов**
   - Проверьте валидность токена авторизации
   - Убедитесь в корректности JSON в actionData
   - Проверьте лимиты размера запроса

3. **Производительность**
   - Используйте индексы на часто запрашиваемые поля
   - Настройте автоматическую очистку старых логов
   - Рассмотрите возможность асинхронного логирования

### Логи системы
Система логирования сама создает логи о своей работе в таблице `system_logs`:
- Ошибки подключения к базе данных
- Проблемы с созданием логов
- Статистика очистки старых записей
