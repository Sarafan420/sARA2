#!/usr/bin/env node

/**
 * Скрипт для оптимизации базы данных
 * Удаляет неиспользуемые столбцы и исправляет дублирование
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;

const prisma = new PrismaClient();

/**
 * Генерация SQL миграции для оптимизации базы данных
 */
async function generateOptimizationMigration() {
  console.log('📝 Генерация SQL миграции для оптимизации базы данных...\n');

  const migrations = [];

  // 1. Удаление устаревшего столбца User.skills (после миграции данных)
  migrations.push(`
-- Миграция: Удаление устаревшего столбца User.skills
-- ПРИМЕЧАНИЕ: Перед выполнением убедитесь, что данные мигрированы в UserSkill

-- Шаг 1: Миграция данных из User.skills в UserSkill (выполнить вручную через скрипт)
-- Шаг 2: После миграции данных можно удалить столбец:
-- ALTER TABLE users DROP COLUMN skills;
`);

  // 2. Удаление неиспользуемых столбцов из Vacancy
  migrations.push(`
-- Миграция: Удаление неиспользуемых столбцов из Vacancy
-- ПРИМЕЧАНИЕ: Проверьте, что эти столбцы действительно не используются

-- ALTER TABLE vacancies DROP COLUMN hours_per_week;
-- ALTER TABLE vacancies DROP COLUMN contact_email;
-- ALTER TABLE vacancies DROP COLUMN telegram_username;
`);

  // 3. Объединение дублирующихся полей profileVisibility
  migrations.push(`
-- Миграция: Объединение дублирующихся полей profileVisibility
-- ПРИМЕЧАНИЕ: Решите, какая таблица будет основной (UserPrivacySettings или UserProfileSettings)

-- Вариант 1: Использовать UserPrivacySettings.profileVisibility
-- Скопировать данные из UserProfileSettings в UserPrivacySettings если нужно
-- UPDATE user_privacy_settings SET profile_visibility = 
--   (SELECT profile_visibility FROM user_profile_settings WHERE user_id = user_privacy_settings.user_id)
--   WHERE EXISTS (SELECT 1 FROM user_profile_settings WHERE user_id = user_privacy_settings.user_id);

-- Затем удалить дублирующееся поле:
-- ALTER TABLE user_profile_settings DROP COLUMN profile_visibility;
`);

  // 4. Удаление неиспользуемой таблицы UserSettings (после миграции данных)
  migrations.push(`
-- Миграция: Удаление неиспользуемой таблицы UserSettings
-- ПРИМЕЧАНИЕ: Данные уже мигрированы в специализированные таблицы

-- DROP TABLE IF EXISTS user_settings;
`);

  // 5. Оптимизация: использование только VacancySkill вместо skillsRequired
  migrations.push(`
-- Миграция: Миграция данных из Vacancy.skillsRequired в VacancySkill
-- ПРИМЕЧАНИЕ: Выполнить миграцию данных перед удалением столбца

-- После миграции данных:
-- ALTER TABLE vacancies DROP COLUMN skills_required;
`);

  const migrationSQL = migrations.join('\n');

  await fs.writeFile('database-optimization-migration.sql', migrationSQL, 'utf-8');
  console.log('✅ SQL миграция сохранена в файл: database-optimization-migration.sql');
  console.log('\n⚠️  ВНИМАНИЕ: Это только рекомендации. Проверьте SQL перед выполнением!');
}

/**
 * Анализ использования таблицы UserSettings
 */
async function analyzeUserSettings() {
  console.log('\n🔍 Анализ таблицы UserSettings...\n');

  try {
    // Проверяем, есть ли данные в UserSettings
    const userSettingsCount = await prisma.userSettings.count();
    
    if (userSettingsCount > 0) {
      console.log(`   ⚠️  В таблице UserSettings найдено ${userSettingsCount} записей`);
      console.log('   Рекомендуется мигрировать данные в специализированные таблицы перед удалением');
    } else {
      console.log('   ✅ Таблица UserSettings пуста, можно безопасно удалить');
    }

    // Проверяем использование в коде
    const routesFiles = await getAllFiles('./routes', ['.js']);
    const routesContent = await Promise.all(
      routesFiles.map(file => fs.readFile(file, 'utf-8'))
    );
    const routesText = routesContent.join('\n');

    if (routesText.includes('userSettings') || routesText.includes('UserSettings')) {
      console.log('   ⚠️  Таблица UserSettings используется в коде:');
      const matches = routesText.match(/userSettings|UserSettings/g);
      if (matches) {
        console.log(`   - Найдено ${matches.length} использований`);
      }
    } else {
      console.log('   ✅ Таблица UserSettings не используется в коде');
    }

  } catch (error) {
    console.error('   Ошибка при анализе UserSettings:', error.message);
  }
}

/**
 * Анализ дублирования Vacancy.type и Vacancy.vacancyTypeId
 */
async function analyzeVacancyTypeDuplication() {
  console.log('\n🔍 Анализ дублирования типа вакансии...\n');

  try {
    // Проверяем использование обоих полей
    const vacancies = await prisma.vacancy.findMany({
      select: {
        id: true,
        type: true,
        vacancyTypeId: true,
      },
      take: 10,
    });

    const withType = vacancies.filter(v => v.type).length;
    const withVacancyTypeId = vacancies.filter(v => v.vacancyTypeId).length;
    const withBoth = vacancies.filter(v => v.type && v.vacancyTypeId).length;

    console.log(`   📊 Статистика по первым 10 вакансиям:`);
    console.log(`   - С полем type: ${withType}`);
    console.log(`   - С полем vacancyTypeId: ${withVacancyTypeId}`);
    console.log(`   - С обоими полями: ${withBoth}`);

    if (withBoth > 0) {
      console.log(`   ⚠️  Найдено дублирование: некоторые вакансии имеют оба поля`);
      console.log('   Рекомендуется: мигрировать данные и использовать только vacancyTypeId');
    }

    // Проверяем использование в коде
    const routesFiles = await getAllFiles('./routes', ['.js']);
    const routesContent = await Promise.all(
      routesFiles.map(file => fs.readFile(file, 'utf-8'))
    );
    const routesText = routesContent.join('\n');

    const typeUsage = (routesText.match(/vacancy\.type|type:\s*vacancy|vacancyTypeId/g) || []).length;
    console.log(`   📝 Использований в коде: ${typeUsage}`);

    if (routesText.includes('vacancy.type') && routesText.includes('vacancyTypeId')) {
      console.log('   ⚠️  Оба поля используются в коде');
      console.log('   Рекомендуется: стандартизировать на использование только vacancyTypeId');
    }

  } catch (error) {
    console.error('   Ошибка при анализе:', error.message);
  }
}

/**
 * Рекурсивно получает все файлы в директории
 */
async function getAllFiles(dirPath, extensions = ['.js']) {
  const files = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await getAllFiles(fullPath, extensions);
        files.push(...subFiles);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Игнорируем ошибки доступа
  }
  return files;
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 Запуск оптимизации базы данных...\n');

  try {
    await analyzeUserSettings();
    await analyzeVacancyTypeDuplication();
    await generateOptimizationMigration();

    console.log('\n✅ Анализ завершен. Проверьте рекомендации выше.');

  } catch (error) {
    console.error('❌ Ошибка при выполнении анализа:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const path = require('path');

if (require.main === module) {
  main();
}

module.exports = {
  analyzeUserSettings,
  analyzeVacancyTypeDuplication,
  generateOptimizationMigration,
};

