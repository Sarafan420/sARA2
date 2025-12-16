// Моковые данные для приложения

const positions = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UX/UI Designer',
                  'Product Manager', 'QA Engineer', 'DevOps Engineer', 'Data Scientist', 'Project Manager',
                  'Business Analyst', 'Marketing Manager', 'Team Lead', 'Technical Writer', 'Graphic Designer'];

const skills = ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java',
               'PHP', 'C#', 'HTML/CSS', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Figma', 'Photoshop'];

// Вспомогательные функции для генерации данных
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomSample = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Существующие пользователи (только те, что есть в БД)
const existingUsers = [
  {
    id: 1,
    name: "Александр Петров",
    position: "Senior Frontend Developer",
    company: "TechCorp",
    location: "Москва",
    status: "Открыт к предложениям",
    avatar: null,
    skills: ["React", "JavaScript", "TypeScript", "Node.js", "AWS"],
    experience: "8 лет",
    connections: 42,
    vacancies: 5,
    views: 128,
    about: "Опытный фронтенд-разработчик с 6+ годами опыта в создании современных веб-приложений. Специализируюсь на React, TypeScript и архитектуре фронтенда.",
    friends: [
      // Только друзья из базы данных (пользователи с id 2-10)
      { id: 2, name: "Мария Сидорова", position: "HR Manager", company: "HR Solutions", avatar: null },
      { id: 3, name: "Дмитрий Козлов", position: "Full-stack Developer", company: "AI Solutions", avatar: null },
      { id: 4, name: "Анна Волкова", position: "UX/UI Designer", company: "Design Studio", avatar: null },
      { id: 5, name: "Сергей Морозов", position: "DevOps Engineer", company: "CloudTech", avatar: null },
      { id: 6, name: "Елена Новикова", position: "Marketing Manager", company: "Digital Agency", avatar: null },
      { id: 7, name: "Игорь Лебедев", position: "Mobile Developer", company: "MobileDev", avatar: null },
      { id: 8, name: "Ольга Соколова", position: "Data Analyst", company: "DataCorp", avatar: null },
      { id: 9, name: "Павел Кузнецов", position: "Backend Developer", company: "Backend Solutions", avatar: null },
      { id: 10, name: "Татьяна Попова", position: "QA Engineer", company: "Quality Assurance", avatar: null }
    ],
    workExperience: [
      {
        position: "Senior Frontend Developer",
        company: "Яндекс",
        period: "Март 2023 - Настоящее время",
        duration: "1 год 11 мес",
        description: "Разработка и поддержка фронтенда части поисковых сервисов. Работа с React, TypeScript, архитектурные решения."
      },
      {
        position: "Frontend Developer",
        company: "Сбер",
        period: "Июнь 2021 - Февраль 2023",
        duration: "1 год 8 мес",
        description: "Разработка клиентской части банковских приложений. Работа с микрофронтендами."
      }
    ]
  },
  {
    id: 2,
    name: "Мария Сидорова",
    position: "HR Manager", 
    company: "HR Solutions",
    location: "Санкт-Петербург",
    status: "Не ищет",
    avatar: null,
    skills: ["HR Management", "Recruitment", "Team Building", "Communication"],
    experience: "5 лет",
    connections: 128,
    vacancies: 2,
    views: 89,
    about: "Опытный HR-менеджер с 5-летним опытом работы в IT-компаниях. Специализируюсь на подборе технических специалистов и развитии корпоративной культуры.",
    workExperience: [
      {
        position: "HR Manager",
        company: "HR Solutions",
        period: "Январь 2022 - Настоящее время",
        duration: "3 года",
        description: "Управление HR-процессами в IT-компании. Подбор персонала, адаптация новых сотрудников, развитие корпоративной культуры."
      },
      {
        position: "HR Specialist",
        company: "TechCorp",
        period: "Май 2020 - Декабрь 2021",
        duration: "1 год 8 мес",
        description: "Подбор технических специалистов, проведение интервью, работа с рекрутинговыми агентствами."
      }
    ],
    education: [
      {
        university: "Санкт-Петербургский государственный университет",
        faculty: "Факультет психологии",
        period: "2016 - 2020",
        degree: "Психология"
      }
    ],
    contact: {
      email: "maria.sidorova@hrsolutions.ru",
      phone: "+7 (921) 555-01-23",
      telegram: "@maria_hr_manager"
    }
  },
  {
    id: 3,
    name: "Дмитрий Козлов",
    position: "Full-stack Developer",
    company: "AI Solutions",
    location: "Москва", 
    status: "Активно ищет",
    avatar: null,
    skills: ["JavaScript", "Python", "React", "Node.js", "PostgreSQL"],
    experience: "4 года",
    connections: 95,
    vacancies: 1,
    views: 156,
    about: "Full-stack разработчик с опытом создания веб-приложений и API. Специализируюсь на JavaScript, Python и работе с базами данных.",
    workExperience: [
      {
        position: "Full-stack Developer",
        company: "AI Solutions",
        period: "Сентябрь 2022 - Настоящее время",
        duration: "2 года 4 мес",
        description: "Разработка веб-приложений с использованием React и Node.js. Создание REST API, работа с базами данных PostgreSQL."
      },
      {
        position: "Frontend Developer",
        company: "WebStudio",
        period: "Март 2021 - Август 2022",
        duration: "1 год 6 мес",
        description: "Разработка пользовательских интерфейсов на React. Интеграция с backend API, оптимизация производительности."
      }
    ],
    education: [
      {
        university: "МГУ им. М.В. Ломоносова",
        faculty: "Факультет вычислительной математики и кибернетики",
        period: "2017 - 2021",
        degree: "Прикладная математика и информатика"
      }
    ],
    contact: {
      email: "dmitry.kozlov@aisolutions.ru",
      phone: "+7 (495) 555-02-34",
      telegram: "@dmitry_fullstack"
    }
  },
  {
    id: 4,
    name: "Анна Волкова",
    position: "UX/UI Designer",
    company: "Design Studio",
    location: "Санкт-Петербург",
    status: "Открыт к предложениям",
    avatar: null,
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
    experience: "4 года",
    connections: 156,
    vacancies: 0,
    views: 201,
    about: "UX/UI дизайнер с 4-летним опытом создания интуитивных интерфейсов. Специализируюсь на исследовании пользователей и создании дизайн-систем.",
    workExperience: [
      {
        position: "Senior UX/UI Designer",
        company: "Design Studio",
        period: "Июнь 2021 - Настоящее время",
        duration: "3 года 7 мес",
        description: "Создание дизайн-систем, проведение UX исследований, разработка интерфейсов для web и mobile приложений."
      },
      {
        position: "UX/UI Designer",
        company: "WebStudio",
        period: "Февраль 2019 - Май 2021",
        duration: "2 года 4 мес",
        description: "Дизайн лендингов, интернет-магазинов, корпоративных сайтов. Работа с клиентами, создание wireframes и прототипов."
      }
    ],
    education: [
      {
        university: "СПбГУ",
        faculty: "Факультет искусств",
        period: "2015 - 2019",
        degree: "Дизайн"
      }
    ],
    contact: {
      email: "anna.volkova@designstudio.ru",
      phone: "+7 (812) 555-03-45",
      telegram: "@anna_ux_designer"
    }
  },
  {
    id: 5,
    name: "Сергей Морозов",
    position: "DevOps Engineer",
    company: "CloudTech",
    location: "Москва",
    status: "Не ищет",
    avatar: null,
    skills: ["Kubernetes", "Docker", "AWS", "Terraform", "Jenkins"],
    experience: "6 лет",
    connections: 134,
    vacancies: 0,
    views: 178,
    about: "DevOps инженер, специализирующийся на автоматизации процессов и облачных технологиях. Создаю надежную инфраструктуру для высоконагруженных сервисов.",
    workExperience: [
      {
        position: "Lead DevOps Engineer",
        company: "CloudTech",
        period: "Апрель 2020 - Настоящее время",
        duration: "4 года 9 мес",
        description: "Управление облачной инфраструктурой, автоматизация CI/CD, мониторинг и алертинг. Команда из 8 DevOps инженеров."
      },
      {
        position: "DevOps Engineer",
        company: "TechCorp",
        period: "Сентябрь 2018 - Март 2020",
        duration: "1 год 7 мес",
        description: "Поддержка инфраструктуры веб-сервисов, работа с Kubernetes, настройка мониторинга и логирования."
      }
    ],
    education: [
      {
        university: "МФТИ",
        faculty: "Факультет управления и прикладной математики",
        period: "2014 - 2018",
        degree: "Прикладная математика и физика"
      }
    ],
    contact: {
      email: "sergey.morozov@cloudtech.ru",
      phone: "+7 (495) 555-04-56",
      telegram: "@sergey_devops"
    }
  }
];

// Генерируем дополнительных пользователей (только те, что есть в БД)
const generateAdditionalUsers = () => {
  // Добавляем пользователей с id 6-10 из базы данных
  const additionalUsers = [
    {
      id: 6,
      name: "Елена Новикова",
      position: "Marketing Manager",
      company: "Digital Agency",
      location: "Москва",
      status: "Активно ищет",
      avatar: null,
      skills: ["Marketing", "Analytics", "Social Media", "Content Creation"],
      experience: "3 года",
      connections: 89,
      vacancies: 1,
      views: 145,
      about: "Маркетинг-менеджер с опытом работы в digital-агентствах. Специализируюсь на SMM, контент-маркетинге и аналитике."
    },
    {
      id: 7,
      name: "Игорь Лебедев",
      position: "Mobile Developer",
      company: "MobileDev",
      location: "Санкт-Петербург",
      status: "Открыт к предложениям",
      avatar: null,
      skills: ["React Native", "Flutter", "iOS", "Android", "JavaScript"],
      experience: "5 лет",
      connections: 112,
      vacancies: 0,
      views: 198,
      about: "Мобильный разработчик с опытом создания приложений для iOS и Android. Работаю с React Native и Flutter."
    },
    {
      id: 8,
      name: "Ольга Соколова",
      position: "Data Analyst",
      company: "DataCorp",
      location: "Москва",
      status: "Не ищет",
      avatar: null,
      skills: ["Python", "SQL", "Tableau", "Machine Learning", "Statistics"],
      experience: "4 года",
      connections: 76,
      vacancies: 2,
      views: 167,
      about: "Аналитик данных с опытом работы с большими данными. Специализируюсь на машинном обучении и визуализации данных."
    },
    {
      id: 9,
      name: "Павел Кузнецов",
      position: "Backend Developer",
      company: "Backend Solutions",
      location: "Москва",
      status: "Активно ищет",
      avatar: null,
      skills: ["Java", "Spring", "PostgreSQL", "Redis", "Microservices"],
      experience: "6 лет",
      connections: 134,
      vacancies: 1,
      views: 223,
      about: "Backend разработчик с опытом создания высоконагруженных систем. Специализируюсь на Java и микросервисной архитектуре."
    },
    {
      id: 10,
      name: "Татьяна Попова",
      position: "QA Engineer",
      company: "Quality Assurance",
      location: "Санкт-Петербург",
      status: "Открыт к предложениям",
      avatar: null,
      skills: ["Testing", "Automation", "Selenium", "API Testing", "Bug Tracking"],
      experience: "3 года",
      connections: 98,
      vacancies: 0,
      views: 156,
      about: "QA инженер с опытом автоматизации тестирования. Специализируюсь на функциональном и интеграционном тестировании."
    }
  ];
  
  return additionalUsers;
};

// Объединяем всех пользователей (только те, что есть в БД)
export const mockUsers = [...existingUsers, ...generateAdditionalUsers()];

// Типы вакансий
const vacancyTypes = ['regular', 'freelance', 'internship', 'creative'];
const experienceLevels = ['Без опыта', '1-3 года', '3-6 лет', '6+ лет'];

// Генерируем вакансии для пользователей
const generateVacancies = () => {
  const vacancies = [];
  let vacancyId = 1;

  // Добавляем вакансии из базы данных
  const existingVacancies = [
    {
      id: vacancyId++,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop",
      salary: "180-220k ₽",
      location: "Москва",
      type: "Полный день",
      experience: "6+ лет",
      skills: ["React", "JavaScript", "TypeScript", "Node.js", "AWS"],
      description: "Разработка пользовательских интерфейсов на React для продуктов TechCorp.",
      postedAt: new Date().toISOString(),
      userId: 1,
      poster: {
        id: 1,
        name: "Александр Петров",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
      }
    },
    {
      id: vacancyId++,
      title: "HR Manager",
      company: "HR Solutions",
      companyLogo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop",
      salary: "120-160k ₽",
      location: "Санкт-Петербург",
      type: "Полный день",
      experience: "3-6 лет",
      skills: ["HR Management", "Recruitment", "Team Building", "Communication"],
      description: "Управление HR-процессами в IT-компании. Подбор персонала, адаптация новых сотрудников.",
      postedAt: new Date().toISOString(),
      userId: 2,
      poster: {
        id: 2,
        name: "Мария Сидорова",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
      }
    },
    {
      id: vacancyId++,
      title: "Full-stack Developer",
      company: "AI Solutions",
      companyLogo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
      salary: "160-200k ₽",
      location: "Москва",
      type: "Полный день",
      experience: "3-6 лет",
      skills: ["JavaScript", "Python", "React", "Node.js", "PostgreSQL"],
      description: "Разработка веб-приложений с использованием React и Node.js. Создание REST API.",
      postedAt: new Date().toISOString(),
      userId: 3,
      poster: {
        id: 3,
        name: "Дмитрий Козлов",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
      }
    },
    {
      id: vacancyId++,
      title: "UX/UI Designer",
      company: "Design Studio",
      companyLogo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop",
      salary: "100-140k ₽",
      location: "Санкт-Петербург",
      type: "Полный день",
      experience: "3-6 лет",
      skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
      description: "Создание дизайн-систем, проведение UX исследований, разработка интерфейсов.",
      postedAt: new Date().toISOString(),
      userId: 4,
      poster: {
        id: 4,
        name: "Анна Волкова",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
      }
    },
    {
      id: vacancyId++,
      title: "DevOps Engineer",
      company: "CloudTech",
      companyLogo: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=200&fit=crop",
      salary: "200-250k ₽",
      location: "Москва",
      type: "Полный день",
      experience: "6+ лет",
      skills: ["Kubernetes", "Docker", "AWS", "Terraform", "Jenkins"],
      description: "Управление облачной инфраструктурой, автоматизация CI/CD, мониторинг и алертинг.",
      postedAt: new Date().toISOString(),
      userId: 5,
      poster: {
        id: 5,
        name: "Сергей Морозов",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face"
      }
    }
  ];

  vacancies.push(...existingVacancies);

  // Генерируем вакансии для пользователей которые их размещают
  mockUsers.forEach(user => {
    if (user.vacancies > 0) {
      for (let i = 0; i < user.vacancies; i++) {
        const type = randomChoice(vacancyTypes);
        const salary = randomInt(30, 500);
        
        let title, description;
        switch (type) {
          case 'freelance':
            title = `Фриланс: ${randomChoice(['Веб-разработка', 'Дизайн логотипа', 'SMM', 'Контент-план', 'Реклама'])}`;
            description = `Требуется выполнить проект по ${randomChoice(['разработке сайта', 'созданию дизайна', 'продвижению в соцсетях'])}.`;
            break;
          case 'internship':
            title = `Стажировка: ${randomChoice(positions)}`;
            description = `Стажировка в компании ${user.company} с возможностью трудоустройства.`;
            break;
          case 'creative':
            title = randomChoice(['Создание логотипа', 'Дизайн упаковки', 'Иллюстрация', 'Видеомонтаж', 'Аранжировка музыки']);
            description = `Творческий проект для ${user.company}. Требуется креативный подход.`;
            break;
          default:
            title = `${randomChoice(positions)} в ${user.company}`;
            description = `Вакансия ${randomChoice(positions).toLowerCase()} в команде ${user.company}.`;
        }

        // Массив изображений офисов, зданий и торговых центров
        const companyImages = [
          // Современные офисные здания и небоскребы
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop",
          // Торговые центры и бизнес-центры
          "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
          // Крупные корпоративные здания
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop"
        ];

        vacancies.push({
          id: vacancyId++,
          title,
          company: user.company,
          companyLogo: randomChoice(companyImages),
          salary: type === 'freelance' ? `${salary}k ₽ за проект` : `${salary}k ₽`,
          location: randomChoice([user.location.split(',')[0], 'Удаленно']),
          type,
          experience: randomChoice(experienceLevels),
          skills: randomSample(user.skills || skills, randomInt(2, 5)),
          description,
          postedAt: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
          userId: user.id,
          poster: {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          }
        });
      }
    }
  });

  return vacancies;
};

export const mockVacancies = generateVacancies();

// Статистика для главной страницы
export const appStats = {
  users: mockUsers?.length || 0,
  vacancies: mockVacancies?.length || 0,
  spheres: mockUsers?.length ? [...new Set(mockUsers.map(u => u.position))].length : 0,
  geography: mockUsers?.length ? [...new Set(mockUsers.map(u => u.location.split(',')[0]))].length : 0,
  successfulHires: mockVacancies?.length ? Math.floor(mockVacancies.length * 0.15) : 0,
  activeCompanies: mockUsers?.length ? [...new Set(mockUsers.map(u => u.company))].length : 0,
  avgSalary: mockVacancies?.length ? 
    Math.floor(mockVacancies.reduce((sum, v) => {
      const match = v.salary.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0) / mockVacancies.length) + 'k ₽' : '0k ₽',
  responseRate: '85%'
};

// Связи между пользователями
export const mockConnections = [
  { from: 1, to: 2, strength: 0.8 },
  { from: 1, to: 3, strength: 0.6 },
  { from: 2, to: 3, strength: 0.9 },
  // ... можно добавить больше связей
];

export default mockUsers;