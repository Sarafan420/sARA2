#!/usr/bin/env node

/**
 * Скрипт для миграции данных из устаревших столбцов в новые структуры
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Миграция User.skills в UserSkill
 */
async function migrateUserSkills() {
  console.log('🔄 Миграция User.skills → UserSkill...\n');

  try {
    // Получаем всех пользователей с навыками
    const users = await prisma.user.findMany({
      where: {
        skills: { not: null }
      },
      select: {
        id: true,
        skills: true,
      },
    });

    console.log(`   Найдено ${users.length} пользователей с навыками в формате JSON`);

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        const skillsArray = JSON.parse(user.skills || '[]');
        
        if (!Array.isArray(skillsArray) || skillsArray.length === 0) {
          skipped++;
          continue;
        }

        // Для каждого навыка создаем или находим Skill и связываем с User
        for (const skillName of skillsArray) {
          if (typeof skillName !== 'string' || !skillName.trim()) {
            continue;
          }

          // Находим или создаем Skill
          let skill = await prisma.skill.findFirst({
            where: { name: skillName.trim() }
          });

          if (!skill) {
            skill = await prisma.skill.create({
              data: { name: skillName.trim() }
            });
          }

          // Проверяем, не существует ли уже связь
          const existingLink = await prisma.userSkill.findUnique({
            where: {
              userId_skillId: {
                userId: user.id,
                skillId: skill.id
              }
            }
          });

          if (!existingLink) {
            await prisma.userSkill.create({
              data: {
                userId: user.id,
                skillId: skill.id
              }
            });
          }
        }

        migrated++;
      } catch (error) {
        console.error(`   Ошибка при миграции пользователя ${user.id}:`, error.message);
        skipped++;
      }
    }

    console.log(`   ✅ Мигрировано: ${migrated} пользователей`);
    console.log(`   ⏭️  Пропущено: ${skipped} пользователей`);
    console.log('\n   ⚠️  ВАЖНО: После проверки можно удалить столбец User.skills');

  } catch (error) {
    console.error('   ❌ Ошибка при миграции:', error);
  }
}

/**
 * Миграция Vacancy.skillsRequired в VacancySkill
 */
async function migrateVacancySkills() {
  console.log('\n🔄 Миграция Vacancy.skillsRequired → VacancySkill...\n');

  try {
    const vacancies = await prisma.vacancy.findMany({
      where: {
        skillsRequired: { not: null }
      },
      select: {
        id: true,
        skillsRequired: true,
      },
    });

    console.log(`   Найдено ${vacancies.length} вакансий с навыками в формате JSON`);

    let migrated = 0;
    let skipped = 0;

    for (const vacancy of vacancies) {
      try {
        const skillsArray = JSON.parse(vacancy.skillsRequired || '[]');
        
        if (!Array.isArray(skillsArray) || skillsArray.length === 0) {
          skipped++;
          continue;
        }

        // Для каждого навыка создаем или находим Skill и связываем с Vacancy
        for (const skillName of skillsArray) {
          if (typeof skillName !== 'string' || !skillName.trim()) {
            continue;
          }

          // Находим или создаем Skill
          let skill = await prisma.skill.findFirst({
            where: { name: skillName.trim() }
          });

          if (!skill) {
            skill = await prisma.skill.create({
              data: { name: skillName.trim() }
            });
          }

          // Проверяем, не существует ли уже связь
          const existingLink = await prisma.vacancySkill.findUnique({
            where: {
              vacancyId_skillId: {
                vacancyId: vacancy.id,
                skillId: skill.id
              }
            }
          });

          if (!existingLink) {
            await prisma.vacancySkill.create({
              data: {
                vacancyId: vacancy.id,
                skillId: skill.id
              }
            });
          }
        }

        migrated++;
      } catch (error) {
        console.error(`   Ошибка при миграции вакансии ${vacancy.id}:`, error.message);
        skipped++;
      }
    }

    console.log(`   ✅ Мигрировано: ${migrated} вакансий`);
    console.log(`   ⏭️  Пропущено: ${skipped} вакансий`);
    console.log('\n   ⚠️  ВАЖНО: После проверки можно удалить столбец Vacancy.skillsRequired');

  } catch (error) {
    console.error('   ❌ Ошибка при миграции:', error);
  }
}

/**
 * Проверка миграции
 */
async function verifyMigration() {
  console.log('\n🔍 Проверка результатов миграции...\n');

  try {
    // Проверяем UserSkill
    const userSkillsCount = await prisma.userSkill.count();
    console.log(`   UserSkill записей: ${userSkillsCount}`);

    // Проверяем VacancySkill
    const vacancySkillsCount = await prisma.vacancySkill.count();
    console.log(`   VacancySkill записей: ${vacancySkillsCount}`);

    // Проверяем пользователей с навыками в JSON
    const usersWithJsonSkills = await prisma.user.count({
      where: {
        skills: { not: null }
      }
    });
    console.log(`   Пользователей с JSON навыками: ${usersWithJsonSkills}`);

    // Проверяем вакансии с навыками в JSON
    const vacanciesWithJsonSkills = await prisma.vacancy.count({
      where: {
        skillsRequired: { not: null }
      }
    });
    console.log(`   Вакансий с JSON навыками: ${vacanciesWithJsonSkills}`);

  } catch (error) {
    console.error('   Ошибка при проверке:', error);
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 Запуск миграции данных...\n');

  try {
    await migrateUserSkills();
    await migrateVacancySkills();
    await verifyMigration();

    console.log('\n✅ Миграция завершена!');
    console.log('\n📝 Следующие шаги:');
    console.log('   1. Проверьте результаты миграции');
    console.log('   2. Обновите код для использования новых структур');
    console.log('   3. После проверки выполните SQL из database-optimization-migration.sql');

  } catch (error) {
    console.error('❌ Ошибка при выполнении миграции:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  migrateUserSkills,
  migrateVacancySkills,
  verifyMigration,
};

