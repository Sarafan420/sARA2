const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Данные карьерного пути из mockData
const workExperienceData = [
  // Александр Петров (id: 1)
  {
    userId: 1,
    company: "TechCorp",
    position: "Senior Frontend Developer",
    startDate: new Date("2022-01-01"),
    endDate: null, // текущая работа
    description: "Разработка пользовательских интерфейсов на React для продуктов TechCorp. Руководство командой из 5 разработчиков, архитектурные решения.",
    projectName: "TechCorp Platform"
  },
  {
    userId: 1,
    company: "WebStudio",
    position: "Frontend Developer",
    startDate: new Date("2019-06-01"),
    endDate: new Date("2021-12-31"),
    description: "Разработка веб-приложений на React и Vue.js. Работа с REST API, интеграция с бэкенд-сервисами.",
    projectName: "E-commerce Platform"
  },
  {
    userId: 1,
    company: "StartupCo",
    position: "Junior Frontend Developer",
    startDate: new Date("2018-03-01"),
    endDate: new Date("2019-05-31"),
    description: "Разработка компонентов интерфейса на JavaScript и CSS. Изучение современных фреймворков.",
    projectName: "Startup Dashboard"
  },

  // Мария Сидорова (id: 2)
  {
    userId: 2,
    company: "HR Solutions",
    position: "HR Manager",
    startDate: new Date("2022-01-01"),
    endDate: null, // текущая работа
    description: "Управление HR-процессами в IT-компании. Подбор персонала, адаптация новых сотрудников, развитие корпоративной культуры.",
    projectName: "HR Digital Transformation"
  },
  {
    userId: 2,
    company: "TechCorp",
    position: "HR Specialist",
    startDate: new Date("2020-05-01"),
    endDate: new Date("2021-12-31"),
    description: "Подбор технических специалистов, проведение интервью, работа с рекрутинговыми агентствами.",
    projectName: "Tech Talent Acquisition"
  },

  // Дмитрий Козлов (id: 3)
  {
    userId: 3,
    company: "AI Solutions",
    position: "Full-stack Developer",
    startDate: new Date("2021-09-01"),
    endDate: null, // текущая работа
    description: "Разработка полного стека приложений с использованием Python, React и PostgreSQL. Работа с машинным обучением.",
    projectName: "AI Analytics Platform"
  },
  {
    userId: 3,
    company: "DataCorp",
    position: "Backend Developer",
    startDate: new Date("2019-02-01"),
    endDate: new Date("2021-08-31"),
    description: "Разработка серверной части на Python и Django. Работа с базами данных, API интеграции.",
    projectName: "Data Processing Service"
  },

  // Анна Волкова (id: 4)
  {
    userId: 4,
    company: "Design Studio",
    position: "UX/UI Designer",
    startDate: new Date("2020-03-01"),
    endDate: null, // текущая работа
    description: "Создание пользовательских интерфейсов и опыта взаимодействия. Работа с Figma, проведение пользовательских исследований.",
    projectName: "Mobile Banking App"
  },
  {
    userId: 4,
    company: "Creative Agency",
    position: "UI Designer",
    startDate: new Date("2018-07-01"),
    endDate: new Date("2020-02-29"),
    description: "Дизайн веб-сайтов и мобильных приложений. Создание брендинга и визуальных концепций.",
    projectName: "Brand Identity System"
  },

  // Сергей Морозов (id: 5)
  {
    userId: 5,
    company: "CloudTech",
    position: "Lead DevOps Engineer",
    startDate: new Date("2020-04-01"),
    endDate: null, // текущая работа
    description: "Управление облачной инфраструктурой, автоматизация CI/CD, мониторинг и алертинг. Команда из 8 DevOps инженеров.",
    projectName: "Cloud Infrastructure Migration"
  },
  {
    userId: 5,
    company: "TechCorp",
    position: "DevOps Engineer",
    startDate: new Date("2018-09-01"),
    endDate: new Date("2020-03-31"),
    description: "Поддержка инфраструктуры веб-сервисов, работа с Kubernetes, настройка мониторинга и логирования.",
    projectName: "Microservices Platform"
  }
];

async function seedWorkExperience() {
  try {
    console.log('🌱 Начинаем заполнение базы данных карьерным путем...');

    // Очищаем существующие данные
    await prisma.workExperience.deleteMany({});
    console.log('✅ Очищены существующие данные карьерного пути');

    // Добавляем новые данные
    for (const work of workExperienceData) {
      await prisma.workExperience.create({
        data: work
      });
    }

    console.log(`✅ Добавлено ${workExperienceData.length} записей карьерного пути`);

    // Проверяем результат
    const count = await prisma.workExperience.count();
    console.log(`📊 Всего записей в базе данных: ${count}`);

    // Показываем примеры данных
    const sampleData = await prisma.workExperience.findMany({
      take: 3,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log('\n📋 Примеры добавленных данных:');
    sampleData.forEach((work, index) => {
      console.log(`${index + 1}. ${work.user.name} - ${work.position} в ${work.company}`);
      console.log(`   Период: ${work.startDate.toLocaleDateString('ru-RU')} - ${work.endDate ? work.endDate.toLocaleDateString('ru-RU') : 'настоящее время'}`);
      console.log(`   Проект: ${work.projectName || 'Не указан'}`);
      console.log('');
    });

    console.log('🎉 Заполнение базы данных завершено успешно!');

  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
seedWorkExperience();
