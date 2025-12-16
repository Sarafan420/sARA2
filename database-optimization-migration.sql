
-- Миграция: Удаление устаревшего столбца User.skills
-- ПРИМЕЧАНИЕ: Перед выполнением убедитесь, что данные мигрированы в UserSkill

-- Шаг 1: Миграция данных из User.skills в UserSkill (выполнить вручную через скрипт)
-- Шаг 2: После миграции данных можно удалить столбец:
-- ALTER TABLE users DROP COLUMN skills;


-- Миграция: Удаление неиспользуемых столбцов из Vacancy
-- ПРИМЕЧАНИЕ: Проверьте, что эти столбцы действительно не используются

-- ALTER TABLE vacancies DROP COLUMN hours_per_week;
-- ALTER TABLE vacancies DROP COLUMN contact_email;
-- ALTER TABLE vacancies DROP COLUMN telegram_username;


-- Миграция: Объединение дублирующихся полей profileVisibility
-- ПРИМЕЧАНИЕ: Решите, какая таблица будет основной (UserPrivacySettings или UserProfileSettings)

-- Вариант 1: Использовать UserPrivacySettings.profileVisibility
-- Скопировать данные из UserProfileSettings в UserPrivacySettings если нужно
-- UPDATE user_privacy_settings SET profile_visibility = 
--   (SELECT profile_visibility FROM user_profile_settings WHERE user_id = user_privacy_settings.user_id)
--   WHERE EXISTS (SELECT 1 FROM user_profile_settings WHERE user_id = user_privacy_settings.user_id);

-- Затем удалить дублирующееся поле:
-- ALTER TABLE user_profile_settings DROP COLUMN profile_visibility;


-- Миграция: Удаление неиспользуемой таблицы UserSettings
-- ПРИМЕЧАНИЕ: Данные уже мигрированы в специализированные таблицы

-- DROP TABLE IF EXISTS user_settings;


-- Миграция: Миграция данных из Vacancy.skillsRequired в VacancySkill
-- ПРИМЕЧАНИЕ: Выполнить миграцию данных перед удалением столбца

-- После миграции данных:
-- ALTER TABLE vacancies DROP COLUMN skills_required;
