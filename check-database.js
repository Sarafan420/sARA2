#!/usr/bin/env node

/**
 * Скрипт для проверки базы данных на лишние таблицы и неиспользуемые столбцы
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

const results = {
  unusedTables: [],
  unusedColumns: [],
  duplicateColumns: [],
  deprecatedColumns: [],
  summary: {
    unusedTables: 0,
    unusedColumns: 0,
    duplicateColumns: 0,
    deprecatedColumns: 0,
  },
};

/**
 * Анализ использования таблиц в коде
 */
async function analyzeTableUsage() {
  console.log('\n🔍 Анализ использования таблиц...\n');

  const tables = {
    'User': 'users',
    'Vacancy': 'vacancies',
    'Connection': 'connections',
    'Application': 'applications',
    'Notification': 'notifications',
    'WorkExperience': 'work_experience',
    'UserSettings': 'user_settings',
    'UserNotificationSettings': 'user_notification_settings',
    'UserPrivacySettings': 'user_privacy_settings',
    'UserProfileSettings': 'user_profile_settings',
    'UserSkill': 'user_skills',
    'VacancyType': 'vacancy_types',
    'Field': 'fields',
    'Skill': 'skills',
    'WorkFormat': 'work_formats',
    'WorkingStyle': 'working_styles',
    'Offer': 'offers',
    'ParticipantReceive': 'participant_receives',
    'VacancyField': 'vacancy_fields',
    'VacancySkill': 'vacancy_skills',
    'VacancyOffer': 'vacancy_offers',
    'VacancyParticipant': 'vacancy_participants',
    'VacancyPhoto': 'vacancy_photos',
    'UserLog': 'user_logs',
    'SecurityLog': 'security_logs',
    'SystemLog': 'system_logs',
    'FriendPrivacySettings': 'friend_privacy_settings',
    'SchemaMigration': 'schema_migrations',
  };

  // Проверяем использование в routes
  const routesFiles = await getAllFiles('./routes', ['.js']);
  const routesContent = await Promise.all(
    routesFiles.map(file => fs.readFile(file, 'utf-8'))
  );
  const routesText = routesContent.join('\n');

  // Проверяем использование в utils
  const utilsFiles = await getAllFiles('./utils', ['.js']);
  const utilsContent = await Promise.all(
    utilsFiles.map(file => fs.readFile(file, 'utf-8').catch(() => ''))
  );
  const utilsText = utilsContent.join('\n');

  const allCode = routesText + utilsText;

  for (const [modelName, tableName] of Object.entries(tables)) {
    // Исключаем системные таблицы
    if (tableName === 'schema_migrations') {
      continue;
    }

    // Проверяем использование модели (включая relations через include)
    const camelCaseName = modelName.charAt(0).toLowerCase() + modelName.slice(1).replace(/([A-Z])/g, '_$1').toLowerCase();
    const pascalCaseName = modelName;
    
    const patterns = [
      new RegExp(`prisma\\.${camelCaseName}`, 'i'),
      new RegExp(`prisma\\.${tableName.replace(/_/g, '')}`, 'i'),
      new RegExp(`model\\s+${modelName}`, 'i'),
      new RegExp(`@map\\(["']${tableName}["']\\)`, 'i'),
      new RegExp(`include.*${camelCaseName}`, 'i'), // Relations через include
      new RegExp(`${camelCaseName}:`, 'i'), // Relations в include
      new RegExp(`vacancyFields|vacancySkills|vacancyOffers|vacancyParticipants|vacancyPhotos`, 'i'), // Специфичные relations
    ];

    const isUsed = patterns.some(pattern => pattern.test(allCode));

    if (!isUsed) {
      results.unusedTables.push({
        model: modelName,
        table: tableName,
      });
      results.summary.unusedTables++;
    }
  }

  if (results.unusedTables.length > 0) {
    console.log(`   ⚠️  Найдено ${results.unusedTables.length} потенциально неиспользуемых таблиц:`);
    results.unusedTables.forEach(({ model, table }) => {
      console.log(`   - ${model} (${table})`);
    });
  } else {
    console.log('   ✅ Все таблицы используются');
  }
}

/**
 * Анализ использования столбцов
 */
async function analyzeColumnUsage() {
  console.log('\n🔍 Анализ использования столбцов...\n');

  const columnIssues = [];

  // User.skills - deprecated, но все еще используется
  const routesFiles = await getAllFiles('./routes', ['.js']);
  const routesContent = await Promise.all(
    routesFiles.map(file => fs.readFile(file, 'utf-8'))
  );
  const routesText = routesContent.join('\n');

  // Проверяем использование User.skills
  if (routesText.includes('user.skills') || routesText.includes('skills: JSON')) {
    columnIssues.push({
      table: 'User',
      column: 'skills',
      issue: 'deprecated',
      reason: 'Помечен как deprecated, но все еще используется. Рекомендуется мигрировать на UserSkill',
      usage: (routesText.match(/user\.skills|skills:.*JSON/g) || []).length,
    });
    results.deprecatedColumns.push({
      table: 'User',
      column: 'skills',
    });
    results.summary.deprecatedColumns++;
  }

  // Проверяем дублирование Vacancy.type и Vacancy.vacancyTypeId
  if (routesText.includes('vacancy.type') && routesText.includes('vacancyTypeId')) {
    columnIssues.push({
      table: 'Vacancy',
      columns: ['type', 'vacancyTypeId'],
      issue: 'duplicate',
      reason: 'Оба поля используются для определения типа вакансии. Рекомендуется использовать только vacancyTypeId',
    });
    results.duplicateColumns.push({
      table: 'Vacancy',
      columns: ['type', 'vacancyTypeId'],
    });
    results.summary.duplicateColumns++;
  }

  // Проверяем дублирование Vacancy.skillsRequired и VacancySkill
  if (routesText.includes('skillsRequired') && routesText.includes('vacancySkills')) {
    columnIssues.push({
      table: 'Vacancy',
      columns: ['skillsRequired', 'vacancySkills (relation)'],
      issue: 'duplicate',
      reason: 'Оба способа используются для хранения навыков. Рекомендуется использовать только VacancySkill',
    });
    results.duplicateColumns.push({
      table: 'Vacancy',
      columns: ['skillsRequired', 'vacancySkills'],
    });
    results.summary.duplicateColumns++;
  }

  // Проверяем дублирование настроек
  if (routesText.includes('UserSettings') && routesText.includes('UserNotificationSettings')) {
    columnIssues.push({
      table: 'UserSettings',
      columns: ['emailNotifications', 'pushNotifications'],
      issue: 'duplicate',
      reason: 'Дублируются с UserNotificationSettings. Рекомендуется использовать только UserNotificationSettings',
    });
    results.duplicateColumns.push({
      table: 'UserSettings',
      columns: ['emailNotifications', 'pushNotifications'],
    });
    results.summary.duplicateColumns++;
  }

  // Проверяем дублирование profileVisibility
  const profileVisibilityTables = [
    'UserSettings',
    'UserPrivacySettings',
    'UserProfileSettings',
  ];
  const profileVisibilityCount = profileVisibilityTables.filter(table =>
    routesText.includes(table) && routesText.includes('profileVisibility')
  ).length;

  if (profileVisibilityCount > 1) {
    columnIssues.push({
      tables: profileVisibilityTables,
      column: 'profileVisibility',
      issue: 'duplicate',
      reason: 'Поле profileVisibility дублируется в нескольких таблицах настроек. Рекомендуется использовать только одну таблицу',
    });
    results.duplicateColumns.push({
      tables: profileVisibilityTables,
      column: 'profileVisibility',
    });
    results.summary.duplicateColumns++;
  }

  if (columnIssues.length > 0) {
    console.log(`   ⚠️  Найдено ${columnIssues.length} проблем со столбцами:`);
    columnIssues.forEach(issue => {
      if (issue.issue === 'deprecated') {
        console.log(`   - [DEPRECATED] ${issue.table}.${issue.column}`);
        console.log(`     Причина: ${issue.reason}`);
        console.log(`     Использований в коде: ${issue.usage}`);
      } else if (issue.issue === 'duplicate') {
        if (issue.columns) {
          console.log(`   - [ДУБЛИКАТ] ${issue.table}: ${issue.columns.join(', ')}`);
        } else if (issue.tables) {
          console.log(`   - [ДУБЛИКАТ] ${issue.column} в таблицах: ${issue.tables.join(', ')}`);
        }
        console.log(`     Причина: ${issue.reason}`);
      }
    });
  } else {
    console.log('   ✅ Проблем со столбцами не найдено');
  }
}

/**
 * Проверка на неиспользуемые столбцы
 */
async function analyzeUnusedColumns() {
  console.log('\n🔍 Анализ неиспользуемых столбцов...\n');

  const routesFiles = await getAllFiles('./routes', ['.js']);
  const routesContent = await Promise.all(
    routesFiles.map(file => fs.readFile(file, 'utf-8'))
  );
  const routesText = routesContent.join('\n');

  // Проверяем конкретные столбцы
  const columnChecks = [
    {
      table: 'User',
      column: 'status',
      pattern: /user\.status|status.*user/i,
    },
    {
      table: 'Vacancy',
      column: 'companyLogo',
      pattern: /companyLogo|company_logo/i,
    },
    {
      table: 'Vacancy',
      column: 'acquiredSkills',
      pattern: /acquiredSkills|acquired_skills/i,
    },
    {
      table: 'Vacancy',
      column: 'hoursPerWeek',
      pattern: /hoursPerWeek|hours_per_week/i,
    },
    {
      table: 'Vacancy',
      column: 'startDate',
      pattern: /startDate|start_date/i,
    },
    {
      table: 'Vacancy',
      column: 'endDate',
      pattern: /endDate|end_date/i,
    },
    {
      table: 'Vacancy',
      column: 'contactEmail',
      pattern: /contactEmail|contact_email/i,
    },
    {
      table: 'Vacancy',
      column: 'telegramUsername',
      pattern: /telegramUsername|telegram_username/i,
    },
    {
      table: 'Vacancy',
      column: 'requirements',
      pattern: /requirements/i,
    },
    {
      table: 'Application',
      column: 'coverLetter',
      pattern: /coverLetter|cover_letter/i,
    },
    {
      table: 'WorkExperience',
      column: 'projectName',
      pattern: /projectName|project_name/i,
    },
  ];

  const unusedColumns = [];

  for (const check of columnChecks) {
    if (!check.pattern.test(routesText)) {
      unusedColumns.push({
        table: check.table,
        column: check.column,
      });
      results.unusedColumns.push({
        table: check.table,
        column: check.column,
      });
      results.summary.unusedColumns++;
    }
  }

  if (unusedColumns.length > 0) {
    console.log(`   ⚠️  Найдено ${unusedColumns.length} потенциально неиспользуемых столбцов:`);
    unusedColumns.forEach(({ table, column }) => {
      console.log(`   - ${table}.${column}`);
    });
  } else {
    console.log('   ✅ Неиспользуемых столбцов не найдено');
  }
}

/**
 * Проверка на задвоенные таблицы настроек
 */
async function analyzeDuplicateSettingsTables() {
  console.log('\n🔍 Анализ задвоенных таблиц настроек...\n');

  const routesFiles = await getAllFiles('./routes', ['.js']);
  const routesContent = await Promise.all(
    routesFiles.map(file => fs.readFile(file, 'utf-8'))
  );
  const routesText = routesContent.join('\n');

  const settingsTables = {
    'UserSettings': { file: 'user_settings', used: false },
    'UserNotificationSettings': { file: 'user_notification_settings', used: false },
    'UserPrivacySettings': { file: 'user_privacy_settings', used: false },
    'UserProfileSettings': { file: 'user_profile_settings', used: false },
  };

  // Проверяем использование каждой таблицы
  for (const [table, info] of Object.entries(settingsTables)) {
    const pattern = new RegExp(`prisma\\.${info.file.replace(/_/g, '')}|${table}`, 'i');
    if (pattern.test(routesText)) {
      info.used = true;
    }
  }

  // UserSettings не используется, но другие таблицы используются
  if (!settingsTables.UserSettings.used && 
      (settingsTables.UserNotificationSettings.used || 
       settingsTables.UserPrivacySettings.used || 
       settingsTables.UserProfileSettings.used)) {
    console.log(`   ⚠️  Таблица UserSettings не используется:`);
    console.log(`   - UserSettings (user_settings) - устаревшая таблица`);
    console.log(`   - Вместо нее используются: UserNotificationSettings, UserPrivacySettings, UserProfileSettings`);
    console.log(`   - Рекомендуется: удалить таблицу UserSettings после миграции данных`);
    
    results.unusedTables.push({
      model: 'UserSettings',
      table: 'user_settings',
      reason: 'Заменена на специализированные таблицы настроек',
    });
    results.summary.unusedTables++;
  }

  // Проверяем дублирование полей
  const duplicateFields = [];
  
  // profileVisibility дублируется
  if (settingsTables.UserPrivacySettings.used && settingsTables.UserProfileSettings.used) {
    duplicateFields.push({
      field: 'profileVisibility',
      tables: ['UserPrivacySettings', 'UserProfileSettings'],
      reason: 'Дублируется в двух таблицах. Рекомендуется использовать только одну',
    });
  }

  if (duplicateFields.length > 0) {
    console.log(`   ⚠️  Найдено ${duplicateFields.length} дублирующихся полей:`);
    duplicateFields.forEach(({ field, tables, reason }) => {
      console.log(`   - ${field} в таблицах: ${tables.join(', ')}`);
      console.log(`     ${reason}`);
    });
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
 * Генерация отчета
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 ОТЧЕТ О ПРОВЕРКЕ БАЗЫ ДАННЫХ');
  console.log('='.repeat(80));

  console.log(`\n📁 Неиспользуемые таблицы: ${results.summary.unusedTables}`);
  console.log(`📄 Неиспользуемые столбцы: ${results.summary.unusedColumns}`);
  console.log(`🔄 Дублирующиеся столбцы: ${results.summary.duplicateColumns}`);
  console.log(`⚠️  Устаревшие столбцы: ${results.summary.deprecatedColumns}`);

  const totalIssues = Object.values(results.summary).reduce((sum, val) => sum + val, 0);
  console.log(`\n📊 Всего найдено проблем: ${totalIssues}`);

  if (totalIssues > 0) {
    console.log('\n💡 Рекомендации:');
    
    if (results.unusedTables.length > 0) {
      console.log('\n   1. Неиспользуемые таблицы:');
      results.unusedTables.forEach(({ model, table, reason }) => {
        console.log(`      - ${model} (${table})${reason ? ` - ${reason}` : ''}`);
      });
    }

    if (results.deprecatedColumns.length > 0) {
      console.log('\n   2. Устаревшие столбцы:');
      results.deprecatedColumns.forEach(({ table, column }) => {
        console.log(`      - ${table}.${column} - требуется миграция данных`);
      });
    }

    if (results.duplicateColumns.length > 0) {
      console.log('\n   3. Дублирующиеся столбцы:');
      results.duplicateColumns.forEach(({ table, columns, tables: tablesList, column }) => {
        if (columns) {
          console.log(`      - ${table}: ${columns.join(', ')}`);
        } else if (tablesList) {
          console.log(`      - ${column} в таблицах: ${tablesList.join(', ')}`);
        }
      });
    }

    if (results.unusedColumns.length > 0) {
      console.log('\n   4. Неиспользуемые столбцы:');
      results.unusedColumns.forEach(({ table, column }) => {
        console.log(`      - ${table}.${column}`);
      });
    }
  } else {
    console.log('\n✅ База данных в отличном состоянии!');
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 Запуск проверки базы данных...\n');

  try {
    await analyzeTableUsage();
    await analyzeColumnUsage();
    await analyzeUnusedColumns();
    await analyzeDuplicateSettingsTables();

    generateReport();

  } catch (error) {
    console.error('❌ Ошибка при выполнении проверки:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeTableUsage,
  analyzeColumnUsage,
  analyzeUnusedColumns,
  analyzeDuplicateSettingsTables,
  results,
};

