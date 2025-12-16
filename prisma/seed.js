const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.application.deleteMany({});
  await prisma.vacancy.deleteMany({});
  await prisma.connection.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.userSettings.deleteMany({});
  await prisma.workExperience.deleteMany({});
  await prisma.user.deleteMany({});

  // Clear reference data
  await prisma.vacancyField.deleteMany({});
  await prisma.vacancySkill.deleteMany({});
  await prisma.vacancyOffer.deleteMany({});
  await prisma.vacancyParticipant.deleteMany({});
  await prisma.vacancyPhoto.deleteMany({});
  await prisma.field.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.participantReceive.deleteMany({});
  await prisma.workFormat.deleteMany({});
  await prisma.workingStyle.deleteMany({});
  await prisma.vacancyType.deleteMany({});
  // Create reference data
  // Vacancy Types
  const vacancyTypes = await Promise.all([
    prisma.vacancyType.create({
      data: {
        name: 'Обычная вакансия',
        description: 'Постоянная работа в компании'
      }
    }),
    prisma.vacancyType.create({
      data: {
        name: 'Фриланс',
        description: 'Проектная работа на удаленке'
      }
    }),
    prisma.vacancyType.create({
      data: {
        name: 'Стажировка',
        description: 'Обучение и получение опыта'
      }
    }),
    prisma.vacancyType.create({
      data: {
        name: 'Креативный проект',
        description: 'Творческие и креативные проекты'
      }
    })
  ]);

  // Fields
  const fields = await Promise.all([
    prisma.field.create({
      data: {
        name: 'IT и программирование',
        description: 'Разработка программного обеспечения'
      }
    }),
    prisma.field.create({
      data: {
        name: 'Дизайн',
        description: 'Графический и веб-дизайн'
      }
    }),
    prisma.field.create({
      data: {
        name: 'Маркетинг',
        description: 'Продвижение продуктов и услуг'
      }
    }),
    prisma.field.create({
      data: {
        name: 'Продажи',
        description: 'Работа с клиентами и продажи'
      }
    }),
    prisma.field.create({
      data: {
        name: 'Управление',
        description: 'Руководящие позиции'
      }
    }),
    prisma.field.create({
      data: {
        name: 'Финансы',
        description: 'Финансовый анализ и планирование'
      }
    }),
    prisma.field.create({
      data: {
        name: 'HR',
        description: 'Управление персоналом'
      }
    }),
    prisma.field.create({
      data: {
        name: 'Образование',
        description: 'Обучение и развитие'
      }
    })
  ]);

  // Skills
  const skills = await Promise.all([
    prisma.skill.create({
      data: {
        name: 'JavaScript',
        description: 'Язык программирования для веб-разработки'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'React',
        description: 'Библиотека для создания пользовательских интерфейсов'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Node.js',
        description: 'Среда выполнения JavaScript на сервере'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Python',
        description: 'Универсальный язык программирования'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'SQL',
        description: 'Язык запросов к базам данных'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Git',
        description: 'Система контроля версий'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Figma',
        description: 'Инструмент для дизайна интерфейсов'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Photoshop',
        description: 'Редактор растровой графики'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Английский язык',
        description: 'Иностранный язык для международного общения'
      }
    }),
    prisma.skill.create({
      data: {
        name: 'Командная работа',
        description: 'Навыки работы в команде'
      }
    })
  ]);

  // Work Formats
  const workFormats = await Promise.all([
    prisma.workFormat.create({
      data: {
        name: 'Офис',
        description: 'Работа в офисе компании'
      }
    }),
    prisma.workFormat.create({
      data: {
        name: 'Удаленно',
        description: 'Работа из дома или любого места'
      }
    }),
    prisma.workFormat.create({
      data: {
        name: 'Гибрид',
        description: 'Сочетание офисной и удаленной работы'
      }
    })
  ]);

  // Working Styles
  const workingStyles = await Promise.all([
    prisma.workingStyle.create({
      data: {
        name: 'Полный день',
        description: '8 часов в день, 5 дней в неделю'
      }
    }),
    prisma.workingStyle.create({
      data: {
        name: 'Неполный день',
        description: 'Менее 8 часов в день'
      }
    }),
    prisma.workingStyle.create({
      data: {
        name: 'Фиксированные часы',
        description: 'Определенное время работы'
      }
    })
  ]);

  // Offers
  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        name: 'Медицинская страховка',
        description: 'Полное медицинское обслуживание'
      }
    }),
    prisma.offer.create({
      data: {
        name: 'Гибкий график',
        description: 'Возможность выбрать удобное время работы'
      }
    }),
    prisma.offer.create({
      data: {
        name: 'Удаленная работа',
        description: 'Возможность работать из дома'
      }
    }),
    prisma.offer.create({
      data: {
        name: 'Обучение и развитие',
        description: 'Курсы, конференции, книги'
      }
    }),
    prisma.offer.create({
      data: {
        name: 'Спортзал',
        description: 'Бесплатный доступ к фитнес-центру'
      }
    }),
    prisma.offer.create({
      data: {
        name: 'Премии',
        description: 'Дополнительные выплаты за результаты'
      }
    }),
    prisma.offer.create({
      data: {
        name: 'Отпуск',
        description: 'Дополнительные дни отпуска'
      }
    }),
    prisma.offer.create({
      data: {
        name: 'Компенсация питания',
        description: 'Оплата обедов в офисе'
      }
    })
  ]);

  // Participant Receives
  const participantReceives = await Promise.all([
    prisma.participantReceive.create({
      data: {
        name: 'Портфолио кейс',
        description: 'Готовый проект для портфолио'
      }
    }),
    prisma.participantReceive.create({
      data: {
        name: 'Нетворкинг',
        description: 'Знакомства с профессионалами индустрии'
      }
    }),
    prisma.participantReceive.create({
      data: {
        name: 'Рекомендация',
        description: 'Рекомендательное письмо от компании'
      }
    }),
    prisma.participantReceive.create({
      data: {
        name: 'Долгосрочное сотрудничество',
        description: 'Возможность продолжить работу'
      }
    }),
    prisma.participantReceive.create({
      data: {
        name: 'Вознаграждение за участие',
        description: 'Денежная компенсация за участие'
      }
    })
  ]);
  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Основные пользователи
    prisma.user.create({
      data: {
        email: 'alex@example.com',
        name: 'Александр Иванов',
        passwordHash: hashedPassword,
        position: 'Senior Frontend Developer',
        company: 'TechCorp',
        bio: 'Опытный разработчик React с 5+ летним стажем. Специализируюсь на создании современных веб-приложений.',
        location: 'Москва',
        phone: '+7 (999) 123-45-67',
        skills: JSON.stringify(['React', 'JavaScript', 'TypeScript', 'Node.js']),
        interests: JSON.stringify(['Программирование', 'Спорт', 'Путешествия']),
        experienceYears: 5
      }
    }),
    prisma.user.create({
      data: {
        email: 'maria@example.com',
        name: 'Мария Петрова',
        passwordHash: hashedPassword,
        position: 'Backend Developer',
        company: 'DataSoft',
        bio: 'Специалист по Node.js и Python. Разрабатываю масштабируемые серверные решения.',
        location: 'Санкт-Петербург',
        phone: '+7 (999) 234-56-78',
        skills: JSON.stringify(['Node.js', 'Python', 'PostgreSQL', 'Docker']),
        interests: JSON.stringify(['Backend', 'Базы данных', 'DevOps']),
        experienceYears: 3
      }
    }),
    prisma.user.create({
      data: {
        email: 'dmitry@example.com',
        name: 'Дмитрий Сидоров',
        passwordHash: hashedPassword,
        position: 'Full Stack Developer',
        company: 'WebStudio',
        bio: 'Универсальный разработчик. Создаю полноценные веб-приложения от дизайна до деплоя.',
        location: 'Екатеринбург',
        phone: '+7 (999) 345-67-89',
        skills: JSON.stringify(['React', 'Node.js', 'MongoDB', 'AWS']),
        interests: JSON.stringify(['Full Stack', 'DevOps', 'Cloud']),
        experienceYears: 4
      }
    }),
    prisma.user.create({
      data: {
        email: 'anna@example.com',
        name: 'Анна Козлова',
        passwordHash: hashedPassword,
        position: 'UX/UI Designer',
        company: 'DesignStudio',
        bio: 'Создаю интуитивные и красивые интерфейсы. Опыт работы с крупными брендами.',
        location: 'Казань',
        phone: '+7 (999) 456-78-90',
        skills: JSON.stringify(['Figma', 'Photoshop', 'Sketch', 'Prototyping']),
        interests: JSON.stringify(['Дизайн', 'UX', 'Искусство']),
        experienceYears: 2
      }
    }),
    prisma.user.create({
      data: {
        email: 'sergey@example.com',
        name: 'Сергей Волков',
        passwordHash: hashedPassword,
        position: 'DevOps Engineer',
        company: 'CloudTech',
        bio: 'Настраиваю инфраструктуру и автоматизирую процессы разработки.',
        location: 'Новосибирск',
        phone: '+7 (999) 567-89-01',
        skills: JSON.stringify(['Docker', 'Kubernetes', 'AWS', 'Terraform']),
        interests: JSON.stringify(['DevOps', 'Cloud', 'Автоматизация']),
        experienceYears: 6
      }
    }),
    prisma.user.create({
      data: {
        email: 'elena@example.com',
        name: 'Елена Морозова',
        passwordHash: hashedPassword,
        position: 'Product Manager',
        company: 'StartupInc',
        bio: 'Управляю продуктами и командами разработки. Опыт в IT и финтехе.',
        location: 'Ростов-на-Дону',
        phone: '+7 (999) 678-90-12',
        skills: JSON.stringify(['Product Management', 'Agile', 'Analytics', 'Leadership']),
        interests: JSON.stringify(['Продукты', 'Стартапы', 'Инновации']),
        experienceYears: 7
      }
    }),
    
    // Дополнительные пользователи для тестирования связей
    prisma.user.create({
      data: {
        email: 'user1@example.com',
        name: 'Иван Петров',
        passwordHash: hashedPassword,
        position: 'Frontend Developer',
        company: 'WebDev',
        bio: 'Младший разработчик, изучаю React и современные технологии.',
        location: 'Москва',
        phone: '+7 (999) 111-11-11',
        skills: JSON.stringify(['React', 'JavaScript', 'HTML', 'CSS']),
        interests: JSON.stringify(['Программирование', 'Игры']),
        experienceYears: 1
      }
    }),
    prisma.user.create({
      data: {
        email: 'user2@example.com',
        name: 'Ольга Сидорова',
        passwordHash: hashedPassword,
        position: 'QA Engineer',
        company: 'TestCorp',
        bio: 'Тестирую программное обеспечение и обеспечиваю качество продуктов.',
        location: 'Санкт-Петербург',
        phone: '+7 (999) 222-22-22',
        skills: JSON.stringify(['Testing', 'Selenium', 'Jest', 'Cypress']),
        interests: JSON.stringify(['Тестирование', 'Качество', 'Автоматизация']),
        experienceYears: 3
      }
    }),
    prisma.user.create({
      data: {
        email: 'user3@example.com',
        name: 'Михаил Козлов',
        passwordHash: hashedPassword,
        position: 'Data Scientist',
        company: 'DataLab',
        bio: 'Анализирую данные и строю модели машинного обучения.',
        location: 'Екатеринбург',
        phone: '+7 (999) 333-33-33',
        skills: JSON.stringify(['Python', 'Machine Learning', 'SQL', 'TensorFlow']),
        interests: JSON.stringify(['Data Science', 'AI', 'Статистика']),
        experienceYears: 4
      }
    }),
    prisma.user.create({
      data: {
        email: 'user4@example.com',
        name: 'Екатерина Волкова',
        passwordHash: hashedPassword,
        position: 'Marketing Manager',
        company: 'MarketingPro',
        bio: 'Развиваю бренды и продвигаю продукты на рынке.',
        location: 'Казань',
        phone: '+7 (999) 444-44-44',
        skills: JSON.stringify(['Marketing', 'Analytics', 'SEO', 'Content Marketing']),
        interests: JSON.stringify(['Маркетинг', 'Брендинг', 'Аналитика']),
        experienceYears: 5
      }
    }),
    prisma.user.create({
      data: {
        email: 'user5@example.com',
        name: 'Андрей Морозов',
        passwordHash: hashedPassword,
        position: 'System Administrator',
        company: 'ITSupport',
        bio: 'Поддерживаю IT-инфраструктуру и обеспечиваю стабильную работу систем.',
        location: 'Новосибирск',
        phone: '+7 (999) 555-55-55',
        skills: JSON.stringify(['Linux', 'Windows Server', 'Networking', 'Virtualization']),
        interests: JSON.stringify(['Системное администрирование', 'Сети', 'Безопасность']),
        experienceYears: 6
      }
    }),
    prisma.user.create({
      data: {
        email: 'user6@example.com',
        name: 'Наталья Петрова',
        passwordHash: hashedPassword,
        position: 'HR Manager',
        company: 'HRConsulting',
        bio: 'Управляю персоналом и развиваю корпоративную культуру.',
        location: 'Ростов-на-Дону',
        phone: '+7 (999) 666-66-66',
        skills: JSON.stringify(['HR Management', 'Recruitment', 'Training', 'Psychology']),
        interests: JSON.stringify(['HR', 'Психология', 'Развитие персонала']),
        experienceYears: 8
      }
    }),
    prisma.user.create({
      data: {
        email: 'user7@example.com',
        name: 'Павел Сидоров',
        passwordHash: hashedPassword,
        position: 'Mobile Developer',
        company: 'MobileDev',
        bio: 'Разрабатываю мобильные приложения для iOS и Android.',
        location: 'Самара',
        phone: '+7 (999) 777-77-77',
        skills: JSON.stringify(['React Native', 'Swift', 'Kotlin', 'Flutter']),
        interests: JSON.stringify(['Мобильная разработка', 'UI/UX', 'Новые технологии']),
        experienceYears: 3
      }
    }),
    prisma.user.create({
      data: {
        email: 'user8@example.com',
        name: 'Светлана Козлова',
        passwordHash: hashedPassword,
        position: 'Business Analyst',
        company: 'BusinessAnalytics',
        bio: 'Анализирую бизнес-процессы и предлагаю решения для их оптимизации.',
        location: 'Воронеж',
        phone: '+7 (999) 888-88-88',
        skills: JSON.stringify(['Business Analysis', 'Process Modeling', 'Requirements', 'UML']),
        interests: JSON.stringify(['Бизнес-анализ', 'Процессы', 'Оптимизация']),
        experienceYears: 4
      }
    }),
    prisma.user.create({
      data: {
        email: 'user9@example.com',
        name: 'Денис Волков',
        passwordHash: hashedPassword,
        position: 'Security Engineer',
        company: 'CyberSec',
        bio: 'Обеспечиваю информационную безопасность и защищаю от кибератак.',
        location: 'Краснодар',
        phone: '+7 (999) 999-99-99',
        skills: JSON.stringify(['Cybersecurity', 'Penetration Testing', 'SIEM', 'Compliance']),
        interests: JSON.stringify(['Кибербезопасность', 'Этичный хакинг', 'Защита данных']),
        experienceYears: 5
      }
    }),
    prisma.user.create({
      data: {
        email: 'user10@example.com',
        name: 'Татьяна Морозова',
        passwordHash: hashedPassword,
        position: 'Content Manager',
        company: 'ContentStudio',
        bio: 'Создаю контент и управляю социальными сетями для брендов.',
        location: 'Тюмень',
        phone: '+7 (999) 000-00-00',
        skills: JSON.stringify(['Content Creation', 'SMM', 'Copywriting', 'Analytics']),
        interests: JSON.stringify(['Контент', 'Социальные сети', 'Копирайтинг']),
        experienceYears: 2
      }
    }),
    prisma.user.create({
      data: {
        email: 'user11@example.com',
        name: 'Алексей Петров',
        passwordHash: hashedPassword,
        position: 'Database Administrator',
        company: 'DataBasePro',
        bio: 'Управляю базами данных и обеспечиваю их производительность.',
        location: 'Омск',
        phone: '+7 (999) 101-01-01',
        skills: JSON.stringify(['PostgreSQL', 'MySQL', 'MongoDB', 'Redis']),
        interests: JSON.stringify(['Базы данных', 'Производительность', 'Оптимизация']),
        experienceYears: 7
      }
    }),
    prisma.user.create({
      data: {
        email: 'user12@example.com',
        name: 'Марина Сидорова',
        passwordHash: hashedPassword,
        position: 'Project Manager',
        company: 'ProjectManagement',
        bio: 'Управляю проектами и координирую работу команд разработки.',
        location: 'Челябинск',
        phone: '+7 (999) 121-21-21',
        skills: JSON.stringify(['Project Management', 'Agile', 'Scrum', 'Risk Management']),
        interests: JSON.stringify(['Управление проектами', 'Методологии', 'Команды']),
        experienceYears: 6
      }
    }),
    prisma.user.create({
      data: {
        email: 'user13@example.com',
        name: 'Роман Козлов',
        passwordHash: hashedPassword,
        position: 'Technical Writer',
        company: 'TechDocs',
        bio: 'Создаю техническую документацию и руководства пользователя.',
        location: 'Уфа',
        phone: '+7 (999) 131-31-31',
        skills: JSON.stringify(['Technical Writing', 'Documentation', 'API Docs', 'Markdown']),
        interests: JSON.stringify(['Документация', 'Письмо', 'Техническая коммуникация']),
        experienceYears: 3
      }
    }),
    prisma.user.create({
      data: {
        email: 'user14@example.com',
        name: 'Юлия Волкова',
        passwordHash: hashedPassword,
        position: 'Sales Manager',
        company: 'SalesForce',
        bio: 'Развиваю продажи и строю отношения с клиентами.',
        location: 'Пермь',
        phone: '+7 (999) 141-41-41',
        skills: JSON.stringify(['Sales', 'CRM', 'Negotiation', 'Customer Relations']),
        interests: JSON.stringify(['Продажи', 'Клиенты', 'Переговоры']),
        experienceYears: 4
      }
    }),
    prisma.user.create({
      data: {
        email: 'user15@example.com',
        name: 'Владимир Морозов',
        passwordHash: hashedPassword,
        position: 'Game Developer',
        company: 'GameStudio',
        bio: 'Создаю видеоигры и интерактивные развлекательные приложения.',
        location: 'Красноярск',
        phone: '+7 (999) 151-51-51',
        skills: JSON.stringify(['Unity', 'C#', 'Game Design', '3D Modeling']),
        interests: JSON.stringify(['Геймдев', 'Игровой дизайн', '3D графика']),
        experienceYears: 5
      }
    }),
    prisma.user.create({
      data: {
        email: 'user16@example.com',
        name: 'Ангелина Петрова',
        passwordHash: hashedPassword,
        position: 'Digital Marketing Specialist',
        company: 'DigitalAgency',
        bio: 'Продвигаю бренды в цифровой среде через различные каналы маркетинга.',
        location: 'Иркутск',
        phone: '+7 (999) 161-61-61',
        skills: JSON.stringify(['Digital Marketing', 'PPC', 'Social Media', 'Email Marketing']),
        interests: JSON.stringify(['Цифровой маркетинг', 'Реклама', 'Аналитика']),
        experienceYears: 3
      }
    }),
    prisma.user.create({
      data: {
        email: 'user17@example.com',
        name: 'Григорий Сидоров',
        passwordHash: hashedPassword,
        position: 'Blockchain Developer',
        company: 'CryptoTech',
        bio: 'Разрабатываю блокчейн-решения и смарт-контракты.',
        location: 'Томск',
        phone: '+7 (999) 171-71-71',
        skills: JSON.stringify(['Solidity', 'Ethereum', 'Web3', 'Smart Contracts']),
        interests: JSON.stringify(['Блокчейн', 'Криптовалюты', 'DeFi']),
        experienceYears: 2
      }
    }),
    prisma.user.create({
      data: {
        email: 'user18@example.com',
        name: 'Евгения Козлова',
        passwordHash: hashedPassword,
        position: 'UI/UX Designer',
        company: 'DesignAgency',
        bio: 'Создаю пользовательские интерфейсы с фокусом на удобство использования.',
        location: 'Барнаул',
        phone: '+7 (999) 181-81-81',
        skills: JSON.stringify(['Figma', 'Adobe XD', 'User Research', 'Prototyping']),
        interests: JSON.stringify(['UX/UI', 'Исследования пользователей', 'Дизайн-системы']),
        experienceYears: 4
      }
    }),
    prisma.user.create({
      data: {
        email: 'user19@example.com',
        name: 'Артем Волков',
        passwordHash: hashedPassword,
        position: 'Cloud Architect',
        company: 'CloudSolutions',
        bio: 'Проектирую облачную инфраструктуру и мигрирую приложения в облако.',
        location: 'Владивосток',
        phone: '+7 (999) 191-91-91',
        skills: JSON.stringify(['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes']),
        interests: JSON.stringify(['Облачные технологии', 'Архитектура', 'Миграция']),
        experienceYears: 8
      }
    }),
    prisma.user.create({
      data: {
        email: 'user20@example.com',
        name: 'Кристина Морозова',
        passwordHash: hashedPassword,
        position: 'Data Engineer',
        company: 'DataPipeline',
        bio: 'Строю пайплайны данных и обеспечиваю их качество и доступность.',
        location: 'Хабаровск',
        phone: '+7 (999) 202-02-02',
        skills: JSON.stringify(['Apache Spark', 'Kafka', 'Airflow', 'Python', 'SQL']),
        interests: JSON.stringify(['Data Engineering', 'Big Data', 'ETL']),
        experienceYears: 5
      }
    })
  ]);
  // Create connections
  await prisma.connection.createMany({
    data: [
      // Основные связи между первыми 6 пользователями
      { userId: users[0].id, connectedUserId: users[1].id, status: 'accepted' },
      { userId: users[1].id, connectedUserId: users[0].id, status: 'accepted' },
      { userId: users[0].id, connectedUserId: users[2].id, status: 'accepted' },
      { userId: users[2].id, connectedUserId: users[0].id, status: 'accepted' },
      { userId: users[1].id, connectedUserId: users[3].id, status: 'accepted' },
      { userId: users[3].id, connectedUserId: users[1].id, status: 'accepted' },
      { userId: users[2].id, connectedUserId: users[4].id, status: 'accepted' },
      { userId: users[4].id, connectedUserId: users[2].id, status: 'accepted' },
      { userId: users[3].id, connectedUserId: users[5].id, status: 'accepted' },
      { userId: users[5].id, connectedUserId: users[3].id, status: 'accepted' },
      { userId: users[4].id, connectedUserId: users[5].id, status: 'accepted' },
      { userId: users[5].id, connectedUserId: users[4].id, status: 'accepted' },
      
      // Дополнительные связи для тестирования "друзей друзей"
      { userId: users[6].id, connectedUserId: users[0].id, status: 'accepted' }, // Иван дружит с Александром
      { userId: users[0].id, connectedUserId: users[6].id, status: 'accepted' },
      { userId: users[6].id, connectedUserId: users[7].id, status: 'accepted' }, // Иван дружит с Ольгой
      { userId: users[7].id, connectedUserId: users[6].id, status: 'accepted' },
      
      { userId: users[7].id, connectedUserId: users[8].id, status: 'accepted' }, // Ольга дружит с Михаилом
      { userId: users[8].id, connectedUserId: users[7].id, status: 'accepted' },
      { userId: users[8].id, connectedUserId: users[9].id, status: 'accepted' }, // Михаил дружит с Екатериной
      { userId: users[9].id, connectedUserId: users[8].id, status: 'accepted' },
      
      { userId: users[9].id, connectedUserId: users[10].id, status: 'accepted' }, // Екатерина дружит с Андреем
      { userId: users[10].id, connectedUserId: users[9].id, status: 'accepted' },
      { userId: users[10].id, connectedUserId: users[11].id, status: 'accepted' }, // Андрей дружит с Натальей
      { userId: users[11].id, connectedUserId: users[10].id, status: 'accepted' },
      
      { userId: users[11].id, connectedUserId: users[12].id, status: 'accepted' }, // Наталья дружит с Павлом
      { userId: users[12].id, connectedUserId: users[11].id, status: 'accepted' },
      { userId: users[12].id, connectedUserId: users[13].id, status: 'accepted' }, // Павел дружит со Светланой
      { userId: users[13].id, connectedUserId: users[12].id, status: 'accepted' },
      
      { userId: users[13].id, connectedUserId: users[14].id, status: 'accepted' }, // Светлана дружит с Денисом
      { userId: users[14].id, connectedUserId: users[13].id, status: 'accepted' },
      { userId: users[14].id, connectedUserId: users[15].id, status: 'accepted' }, // Денис дружит с Татьяной
      { userId: users[15].id, connectedUserId: users[14].id, status: 'accepted' },
      
      { userId: users[15].id, connectedUserId: users[16].id, status: 'accepted' }, // Татьяна дружит с Алексеем
      { userId: users[16].id, connectedUserId: users[15].id, status: 'accepted' },
      { userId: users[16].id, connectedUserId: users[17].id, status: 'accepted' }, // Алексей дружит с Мариной
      { userId: users[17].id, connectedUserId: users[16].id, status: 'accepted' },
      
      { userId: users[17].id, connectedUserId: users[18].id, status: 'accepted' }, // Марина дружит с Романом
      { userId: users[18].id, connectedUserId: users[17].id, status: 'accepted' },
      { userId: users[18].id, connectedUserId: users[19].id, status: 'accepted' }, // Роман дружит с Юлией
      { userId: users[19].id, connectedUserId: users[18].id, status: 'accepted' },
      
      { userId: users[19].id, connectedUserId: users[20].id, status: 'accepted' }, // Юлия дружит с Владимиром
      { userId: users[20].id, connectedUserId: users[19].id, status: 'accepted' },
      { userId: users[20].id, connectedUserId: users[21].id, status: 'accepted' }, // Владимир дружит с Ангелиной
      { userId: users[21].id, connectedUserId: users[20].id, status: 'accepted' },
      
      { userId: users[21].id, connectedUserId: users[22].id, status: 'accepted' }, // Ангелина дружит с Григорием
      { userId: users[22].id, connectedUserId: users[21].id, status: 'accepted' },
      { userId: users[22].id, connectedUserId: users[23].id, status: 'accepted' }, // Григорий дружит с Евгенией
      { userId: users[23].id, connectedUserId: users[22].id, status: 'accepted' },
      
      { userId: users[23].id, connectedUserId: users[24].id, status: 'accepted' }, // Евгения дружит с Артемом
      { userId: users[24].id, connectedUserId: users[23].id, status: 'accepted' },
      { userId: users[24].id, connectedUserId: users[25].id, status: 'accepted' }, // Артем дружит с Кристиной
      { userId: users[25].id, connectedUserId: users[24].id, status: 'accepted' },
      
      // Кросс-связи для более сложной сети
      { userId: users[1].id, connectedUserId: users[6].id, status: 'accepted' }, // Мария дружит с Иваном
      { userId: users[6].id, connectedUserId: users[1].id, status: 'accepted' },
      { userId: users[2].id, connectedUserId: users[7].id, status: 'accepted' }, // Дмитрий дружит с Ольгой
      { userId: users[7].id, connectedUserId: users[2].id, status: 'accepted' },
      { userId: users[3].id, connectedUserId: users[8].id, status: 'accepted' }, // Анна дружит с Михаилом
      { userId: users[8].id, connectedUserId: users[3].id, status: 'accepted' },
      { userId: users[4].id, connectedUserId: users[9].id, status: 'accepted' }, // Сергей дружит с Екатериной
      { userId: users[9].id, connectedUserId: users[4].id, status: 'accepted' },
      { userId: users[5].id, connectedUserId: users[10].id, status: 'accepted' }, // Елена дружит с Андреем
      { userId: users[10].id, connectedUserId: users[5].id, status: 'accepted' }
    ]
  });
  // Create work experience
  await prisma.workExperience.createMany({
    data: [
      {
        userId: users[0].id,
        company: 'TechCorp',
        position: 'Senior Frontend Developer',
        startDate: new Date('2020-01-01'),
        endDate: null,
        description: 'Разработка современных веб-приложений на React и TypeScript'
      },
      {
        userId: users[0].id,
        company: 'WebDev Studio',
        position: 'Frontend Developer',
        startDate: new Date('2018-06-01'),
        endDate: new Date('2019-12-31'),
        description: 'Создание пользовательских интерфейсов для клиентских проектов'
      },
      {
        userId: users[1].id,
        company: 'DataSoft',
        position: 'Backend Developer',
        startDate: new Date('2021-03-01'),
        endDate: null,
        description: 'Разработка API и микросервисов на Node.js и Python'
      },
      {
        userId: users[2].id,
        company: 'WebStudio',
        position: 'Full Stack Developer',
        startDate: new Date('2019-09-01'),
        endDate: null,
        description: 'Полноценная разработка веб-приложений от фронтенда до бэкенда'
      }
    ]
  });
  // Create vacancies
  const vacancies = await Promise.all([
    // Основные вакансии от первых 6 пользователей
    prisma.vacancy.create({
      data: {
        title: 'Senior React Developer',
        description: 'Ищем опытного React разработчика для работы над крупным проектом. Требуется знание TypeScript, Redux и современных подходов к разработке.',
        company: 'TechCorp',
        location: 'Москва',
        salaryMin: 150000,
        salaryMax: 250000,
        salaryCurrency: 'RUB',
        type: 'Full-time',
        experienceLevel: 'Senior',
        skillsRequired: JSON.stringify(['React', 'TypeScript', 'Redux', 'Node.js']),
        requirements: 'Опыт работы с React от 3 лет, знание TypeScript, опыт работы с Redux',
        userId: users[0].id,
        vacancyTypeId: vacancyTypes[0].id,
        workFormatId: workFormats[0].id,
        workingStyleId: workingStyles[0].id,
        hoursPerWeek: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        contactEmail: 'hr@techcorp.com',
        acquiredSkills: JSON.stringify(['Профессиональный опыт', 'Работа в команде', 'Менторство'])
      }
    }),
    prisma.vacancy.create({
      data: {
        title: 'Node.js Backend Developer',
        description: 'Разработка серверной части веб-приложений. Работа с базами данных, API, микросервисами.',
        company: 'DataSoft',
        location: 'Санкт-Петербург',
        salaryMin: 120000,
        salaryMax: 200000,
        salaryCurrency: 'RUB',
        type: 'Full-time',
        experienceLevel: 'Middle',
        skillsRequired: JSON.stringify(['Node.js', 'Express', 'MongoDB', 'Docker']),
        requirements: 'Опыт работы с Node.js от 2 лет, знание баз данных',
        userId: users[1].id,
        vacancyTypeId: vacancyTypes[0].id,
        workFormatId: workFormats[1].id,
        workingStyleId: workingStyles[0].id,
        hoursPerWeek: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        contactEmail: 'jobs@datasoft.com',
        acquiredSkills: JSON.stringify(['Backend разработка', 'Базы данных', 'Микросервисы'])
      }
    }),
    prisma.vacancy.create({
      data: {
        title: 'UX/UI Designer',
        description: 'Создание пользовательских интерфейсов для мобильных и веб-приложений. Работа с дизайн-системами.',
        company: 'DesignStudio',
        location: 'Казань',
        salaryMin: 80000,
        salaryMax: 150000,
        salaryCurrency: 'RUB',
        type: 'Full-time',
        experienceLevel: 'Middle',
        skillsRequired: JSON.stringify(['Figma', 'Photoshop', 'Sketch', 'Prototyping']),
        requirements: 'Опыт в UX/UI дизайне от 2 лет, портфолио с примерами работ',
        userId: users[3].id,
        vacancyTypeId: vacancyTypes[0].id,
        workFormatId: workFormats[2].id,
        workingStyleId: workingStyles[0].id,
        hoursPerWeek: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        contactEmail: 'design@designstudio.com',
        acquiredSkills: JSON.stringify(['UX/UI дизайн', 'Дизайн-системы', 'Прототипирование'])
      }
    }),
    prisma.vacancy.create({
      data: {
        title: 'DevOps Engineer',
        description: 'Настройка и поддержка инфраструктуры. Автоматизация процессов разработки и деплоя.',
        company: 'CloudTech',
        location: 'Новосибирск',
        salaryMin: 180000,
        salaryMax: 300000,
        salaryCurrency: 'RUB',
        type: 'Full-time',
        experienceLevel: 'Senior',
        skillsRequired: JSON.stringify(['Docker', 'Kubernetes', 'AWS', 'Terraform']),
        requirements: 'Опыт работы с облачными платформами от 3 лет',
        userId: users[4].id,
        vacancyTypeId: vacancyTypes[0].id,
        workFormatId: workFormats[1].id,
        workingStyleId: workingStyles[0].id,
        hoursPerWeek: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        contactEmail: 'devops@cloudtech.com',
        acquiredSkills: JSON.stringify(['DevOps', 'Облачные технологии', 'Автоматизация'])
      }
    }),
    prisma.vacancy.create({
      data: {
        title: 'Product Manager',
        description: 'Управление продуктом от идеи до запуска. Работа с командами разработки и аналитика.',
        company: 'StartupInc',
        location: 'Ростов-на-Дону',
        salaryMin: 200000,
        salaryMax: 350000,
        salaryCurrency: 'RUB',
        type: 'Full-time',
        experienceLevel: 'Senior',
        skillsRequired: JSON.stringify(['Product Management', 'Agile', 'Analytics', 'Leadership']),
        requirements: 'Опыт управления продуктами от 4 лет, знание Agile методологий',
        userId: users[5].id,
        vacancyTypeId: vacancyTypes[0].id,
        workFormatId: workFormats[2].id,
        workingStyleId: workingStyles[0].id,
        hoursPerWeek: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        contactEmail: 'pm@startupinc.com',
        acquiredSkills: JSON.stringify(['Управление продуктом', 'Лидерство', 'Стратегия'])
      }
    }),
    
    // Дополнительные вакансии от других пользователей
    prisma.vacancy.create({
      data: {
        title: 'Junior Frontend Developer',
        description: 'Стажировка для начинающего разработчика. Изучение React, JavaScript и современных инструментов разработки.',
        company: 'WebDev',
        location: 'Москва',
        salaryMin: 60000,
        salaryMax: 100000,
        salaryCurrency: 'RUB',
        type: 'Full-time',
        experienceLevel: 'Junior',
        skillsRequired: JSON.stringify(['React', 'JavaScript', 'HTML', 'CSS']),
        requirements: 'Базовые знания HTML, CSS, JavaScript. Желание изучать React',
        userId: users[6].id,
        vacancyTypeId: vacancyTypes[2].id, // Стажировка
        workFormatId: workFormats[0].id,
        workingStyleId: workingStyles[0].id,
        hoursPerWeek: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 месяцев
        contactEmail: 'internship@webdev.com',
        acquiredSkills: JSON.stringify(['React', 'JavaScript', 'Работа в команде', 'Git'])
      }
    }),
    prisma.vacancy.create({
      data: {
        title: 'QA Engineer',
        description: 'Тестирование веб-приложений и мобильных приложений. Автоматизация тестирования.',
        company: 'TestCorp',
        location: 'Санкт-Петербург',
        salaryMin: 90000,
        salaryMax: 150000,
        salaryCurrency: 'RUB',
        type: 'Full-time',
        experienceLevel: 'Middle',
        skillsRequired: JSON.stringify(['Testing', 'Selenium', 'Jest', 'Cypress']),
        requirements: 'Опыт тестирования от 2 лет, знание инструментов автоматизации',
        userId: users[7].id,
        vacancyTypeId: vacancyTypes[0].id,
        workFormatId: workFormats[1].id,
        workingStyleId: workingStyles[0].id,
        hoursPerWeek: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        contactEmail: 'qa@testcorp.com',
        acquiredSkills: JSON.stringify(['Автоматизация тестирования', 'Качество ПО', 'CI/CD'])
      }
    }),
    prisma.vacancy.create({
      data: {
        title: 'Data Scientist',
        description: 'Анализ больших данных, построение моделей машинного обучения, создание дашбордов.',
        company: 'DataLab',
        location: 'Екатеринбург',
        salaryMin: 150000,
        salaryMax: 250000,
        salaryCurrency: 'RUB',
        type: 'Full-time',
        experienceLevel: 'Middle',
        skillsRequired: JSON.stringify(['Python', 'Machine Learning', 'SQL', 'TensorFlow']),
        requirements: 'Опыт работы с данными от 3 лет, знание Python и ML библиотек',
        userId: users[8].id,
        vacancyTypeId: vacancyTypes[0].id,
        workFormatId: workFormats[2].id,
        workingStyleId: workingStyles[0].id,
        hoursPerWeek: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        contactEmail: 'data@datalab.com',
        acquiredSkills: JSON.stringify(['Машинное обучение', 'Анализ данных', 'Статистика'])
      }
    }),
    prisma.vacancy.create({
      data: {
        title: 'Freelance Web Designer',
        description: 'Удаленная работа над дизайном веб-сайтов для различных клиентов. Гибкий график.',
        company: 'FreelanceHub',
        location: 'Удаленно',
        salaryMin: 50000,
        salaryMax: 120000,
        salaryCurrency: 'RUB',
        type: 'Part-time',
        experienceLevel: 'Middle',
        skillsRequired: JSON.stringify(['Figma', 'Photoshop', 'Web Design', 'HTML/CSS']),
        requirements: 'Опыт веб-дизайна от 2 лет, портфолио работ',
        userId: users[9].id,
        vacancyTypeId: vacancyTypes[1].id, // Фриланс
        workFormatId: workFormats[1].id,
        workingStyleId: workingStyles[1].id,
        hoursPerWeek: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        contactEmail: 'freelance@freelancehub.com',
        acquiredSkills: JSON.stringify(['Веб-дизайн', 'Работа с клиентами', 'Тайм-менеджмент'])
      }
    }),
    prisma.vacancy.create({
      data: {
        title: 'Creative Project: Mobile App Design',
        description: 'Креативный проект по дизайну мобильного приложения для стартапа. Возможность проявить творческие способности.',
        company: 'CreativeStudio',
        location: 'Москва',
        salaryMin: 80000,
        salaryMax: 150000,
        salaryCurrency: 'RUB',
        type: 'Project',
        experienceLevel: 'Middle',
        skillsRequired: JSON.stringify(['Figma', 'Adobe XD', 'Mobile Design', 'Prototyping']),
        requirements: 'Опыт дизайна мобильных приложений, креативное мышление',
        userId: users[10].id,
        vacancyTypeId: vacancyTypes[3].id, // Креативный проект
        workFormatId: workFormats[2].id,
        workingStyleId: workingStyles[0].id,
        hoursPerWeek: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 месяца
        contactEmail: 'creative@creativestudio.com',
        acquiredSkills: JSON.stringify(['Мобильный дизайн', 'Креативность', 'Прототипирование'])
      }
    })
  ]);
  // Create vacancy relationships
  // Add fields to vacancies
  const itField = fields.find(f => f.name === 'IT и программирование');
  const designField = fields.find(f => f.name === 'Дизайн');
  const managementField = fields.find(f => f.name === 'Управление');

  if (itField) {
    await prisma.vacancyField.createMany({
      data: [
        { vacancyId: vacancies[0].id, fieldId: itField.id },
        { vacancyId: vacancies[1].id, fieldId: itField.id },
        { vacancyId: vacancies[3].id, fieldId: itField.id }
      ]
    });
  }

  if (designField) {
    await prisma.vacancyField.create({
      data: {
        vacancyId: vacancies[2].id,
        fieldId: designField.id
      }
    });
  }

  if (managementField) {
    await prisma.vacancyField.create({
      data: {
        vacancyId: vacancies[4].id,
        fieldId: managementField.id
      }
    });
  }

  // Add skills to vacancies
  const reactSkill = skills.find(s => s.name === 'React');
  const nodeSkill = skills.find(s => s.name === 'Node.js');
  const figmaSkill = skills.find(s => s.name === 'Figma');
  const dockerSkill = skills.find(s => s.name === 'Git');

  if (reactSkill) {
    await prisma.vacancySkill.create({
      data: {
        vacancyId: vacancies[0].id,
        skillId: reactSkill.id
      }
    });
  }

  if (nodeSkill) {
    await prisma.vacancySkill.createMany({
      data: [
        { vacancyId: vacancies[0].id, skillId: nodeSkill.id },
        { vacancyId: vacancies[1].id, skillId: nodeSkill.id }
      ]
    });
  }

  if (figmaSkill) {
    await prisma.vacancySkill.create({
      data: {
        vacancyId: vacancies[2].id,
        skillId: figmaSkill.id
      }
    });
  }

  if (dockerSkill) {
    await prisma.vacancySkill.create({
      data: {
        vacancyId: vacancies[3].id,
        skillId: dockerSkill.id
      }
    });
  }

  // Add offers to vacancies
  const medicalOffer = offers.find(o => o.name === 'Медицинская страховка');
  const learningOffer = offers.find(o => o.name === 'Обучение и развитие');
  const remoteOffer = offers.find(o => o.name === 'Удаленная работа');

  if (medicalOffer && learningOffer) {
    await prisma.vacancyOffer.createMany({
      data: [
        { vacancyId: vacancies[0].id, offerId: medicalOffer.id },
        { vacancyId: vacancies[0].id, offerId: learningOffer.id },
        { vacancyId: vacancies[1].id, offerId: medicalOffer.id },
        { vacancyId: vacancies[2].id, offerId: learningOffer.id },
        { vacancyId: vacancies[3].id, offerId: remoteOffer.id },
        { vacancyId: vacancies[4].id, offerId: medicalOffer.id }
      ]
    });
  }
  // Create vacancy photos
  await prisma.vacancyPhoto.createMany({
    data: [
      {
        vacancyId: vacancies[0].id,
        url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
        alt: 'Офис TechCorp',
        order: 1
      },
      {
        vacancyId: vacancies[0].id,
        url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
        alt: 'Команда разработчиков',
        order: 2
      },
      {
        vacancyId: vacancies[0].id,
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
        alt: 'Рабочее место',
        order: 3
      },
      {
        vacancyId: vacancies[0].id,
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        alt: 'Современные технологии',
        order: 4
      },
      {
        vacancyId: vacancies[1].id,
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
        alt: 'Серверная комната DataSoft',
        order: 1
      },
      {
        vacancyId: vacancies[1].id,
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
        alt: 'Базы данных',
        order: 2
      },
      {
        vacancyId: vacancies[2].id,
        url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
        alt: 'Дизайн-студия',
        order: 1
      },
      {
        vacancyId: vacancies[2].id,
        url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
        alt: 'Рабочее место дизайнера',
        order: 2
      },
      {
        vacancyId: vacancies[3].id,
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
        alt: 'Облачная инфраструктура',
        order: 1
      },
      {
        vacancyId: vacancies[4].id,
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
        alt: 'Офис StartupInc',
        order: 1
      }
    ]
  });
  // Create user settings
  await prisma.userSettings.createMany({
    data: users.map(user => ({
      userId: user.id,
      emailNotifications: true,
      pushNotifications: true,
      profileVisibility: 'public',
      jobAlerts: true
    }))
  });
  // Create some notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: users[0].id,
        title: 'Добро пожаловать!',
        message: 'Добро пожаловать в sARA2! Начните создавать свою профессиональную сеть.',
        type: 'info'
      },
      {
        userId: users[1].id,
        title: 'Новое приглашение в друзья',
        message: 'Александр Иванов хочет добавить вас в друзья',
        type: 'info'
      },
      {
        userId: users[2].id,
        title: 'Новая вакансия',
        message: 'Появилась новая вакансия, которая может вас заинтересовать',
        type: 'success'
      }
    ]
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
