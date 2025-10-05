// Расширенные профили друзей Алексея Морозова для создания реалистичного опыта

export const friendsProfiles = [
  // IT специалисты (первые 25 друзей)
  {
    id: 2,
    name: "Анна Петрова",
    position: "UX/UI Дизайнер",
    company: "Дизайн Студия",
    location: "Санкт-Петербург, Россия",
    status: "Не ищет",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
    experience: "4+ года",
    connections: 128,
    vacancies: 2,
    views: 89,
    about: "UX/UI дизайнер с 4+ летним опытом создания интуитивных интерфейсов. Специализируюсь на исследовании пользователей и создании дизайн-систем.",
    workExperience: [
      {
        position: "Senior UX/UI Designer",
        company: "Дизайн Студия",
        period: "Январь 2022 - Настоящее время",
        duration: "3 года",
        description: "Создание дизайн-систем, проведение UX исследований, разработка интерфейсов для web и mobile приложений."
      },
      {
        position: "UX/UI Designer",
        company: "Студия веб-дизайна",
        period: "Май 2020 - Декабрь 2021",
        duration: "1 год 8 мес",
        description: "Дизайн лендингов, интернет-магазинов, корпоративных сайтов. Работа с клиентами, создание wireframes и прототипов."
      }
    ],
    education: [
      {
        university: "Санкт-Петербургский государственный университет",
        faculty: "Факультет искусств",
        period: "2016 - 2020",
        degree: "Дизайн"
      }
    ],
    contact: {
      email: "anna.petrova@designstudio.ru",
      phone: "+7 (921) 555-01-23",
      telegram: "@anna_ux_designer"
    }
  },
  {
    id: 3,
    name: "Петр Иванов",
    position: "Product Manager",
    company: "Сбер",
    location: "Москва, Россия",
    status: "Активно ищет",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    skills: ["Product Management", "Analytics", "Agile", "SQL"],
    experience: "5+ лет",
    connections: 95,
    vacancies: 1,
    views: 156,
    about: "Product Manager с опытом запуска цифровых продуктов в банковской сфере. Занимаюсь развитием мобильных приложений и веб-платформ.",
    workExperience: [
      {
        position: "Senior Product Manager",
        company: "Сбер",
        period: "Сентябрь 2022 - Настоящее время",
        duration: "2 года 4 мес",
        description: "Управление продуктом мобильного банкинга. Работа с командой из 15 человек, аналитика метрик, запуск новых фич."
      },
      {
        position: "Product Manager",
        company: "Тинькофф",
        period: "Март 2021 - Август 2022",
        duration: "1 год 6 мес",
        description: "Развитие платформы интернет-эквайринга. A/B тестирование, работа с данными, координация разработки."
      }
    ],
    education: [
      {
        university: "МГУ им. М.В. Ломоносова",
        faculty: "Экономический факультет",
        period: "2017 - 2021",
        degree: "Экономика и управление"
      }
    ],
    contact: {
      email: "petr.ivanov@sberbank.ru",
      phone: "+7 (495) 555-02-34",
      telegram: "@petr_pm"
    }
  },
  {
    id: 4,
    name: "Мария Соколова",
    position: "Backend Developer",
    company: "ВКонтакте",
    location: "Санкт-Петербург, Россия",
    status: "Открыт к предложениям",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    skills: ["Python", "Django", "PostgreSQL", "Redis", "Docker"],
    experience: "5+ лет",
    connections: 156,
    vacancies: 0,
    views: 201,
    about: "Backend разработчик с фокусом на высоконагруженные системы. Опыт работы с микросервисной архитектурой и API интеграциями.",
    workExperience: [
      {
        position: "Senior Backend Developer",
        company: "ВКонтакте",
        period: "Июнь 2021 - Настоящее время",
        duration: "3 года 7 мес",
        description: "Разработка API для соцсети, оптимизация производительности, работа с высокими нагрузками до 1M RPS."
      },
      {
        position: "Backend Developer",
        company: "Mail.ru Group",
        period: "Февраль 2019 - Май 2021",
        duration: "2 года 4 мес",
        description: "Создание микросервисов для почтовых сервисов, интеграция с внешними API, работа с очередями сообщений."
      }
    ],
    education: [
      {
        university: "СПбГУ",
        faculty: "Математико-механический факультет",
        period: "2015 - 2019",
        degree: "Прикладная математика и информатика"
      }
    ],
    contact: {
      email: "maria.sokolova@vk.team",
      phone: "+7 (812) 555-03-45",
      telegram: "@maria_backend"
    }
  },
  {
    id: 5,
    name: "Дмитрий Лебедев",
    position: "DevOps Engineer",
    company: "Тинькофф",
    location: "Москва, Россия",
    status: "Не ищет",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    skills: ["Kubernetes", "Docker", "AWS", "Terraform", "Jenkins"],
    experience: "6+ лет",
    connections: 134,
    vacancies: 0,
    views: 178,
    about: "DevOps инженер, специализирующийся на автоматизации процессов и облачных технологиях. Создаю надежную инфраструктуру для высоконагруженных сервисов.",
    workExperience: [
      {
        position: "Lead DevOps Engineer",
        company: "Тинькофф",
        period: "Апрель 2020 - Настоящее время",
        duration: "4 года 9 мес",
        description: "Управление инфраструктурой банка, автоматизация CI/CD, мониторинг и алертинг. Команда из 8 DevOps инженеров."
      },
      {
        position: "DevOps Engineer",
        company: "Яндекс",
        period: "Сентябрь 2018 - Март 2020",
        duration: "1 год 7 мес",
        description: "Поддержка инфраструктуры поисковых сервисов, работа с Kubernetes, настройка мониторинга и логирования."
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
      email: "dmitry.lebedev@tinkoff.ru",
      phone: "+7 (495) 555-04-56",
      telegram: "@dmitry_devops"
    }
  },
  {
    id: 6,
    name: "Екатерина Волкова",
    position: "QA Engineer",
    company: "Яндекс",
    location: "Москва, Россия",
    status: "Не ищет",
    avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
    skills: ["Selenium", "Postman", "Jest", "Cypress", "Python"],
    experience: "4+ года",
    connections: 87,
    vacancies: 0,
    views: 145,
    about: "QA Engineer с опытом тестирования веб-приложений и API. Специализируюсь на автоматизированном тестировании и непрерывной интеграции.",
    workExperience: [
      {
        position: "Senior QA Engineer",
        company: "Яндекс",
        period: "Октябрь 2021 - Настоящее время",
        duration: "3 года 3 мес",
        description: "Автоматизация тестирования поисковых алгоритмов, создание фреймворков для E2E тестирования, менторинг Junior QA."
      },
      {
        position: "QA Engineer",
        company: "Авито",
        period: "Июнь 2020 - Сентябрь 2021",
        duration: "1 год 4 мес",
        description: "Тестирование мобильного приложения и веб-платформы, написание автотестов, регрессионное тестирование."
      }
    ],
    education: [
      {
        university: "МГТУ им. Н.Э. Баумана",
        faculty: "Факультет информатики и систем управления",
        period: "2016 - 2020",
        degree: "Информатика и вычислительная техника"
      }
    ],
    contact: {
      email: "ekaterina.volkova@yandex.ru",
      phone: "+7 (495) 555-05-67",
      telegram: "@katya_qa"
    }
  },
  {
    id: 7,
    name: "Андрей Новиков",
    position: "Team Lead",
    company: "Сбер",
    location: "Москва, Россия",
    status: "Не ищет",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
    skills: ["Team Management", "JavaScript", "React", "Architecture", "Agile"],
    experience: "8+ лет",
    connections: 245,
    vacancies: 3,
    views: 312,
    about: "Team Lead с опытом управления командами разработки. Фокусируюсь на создании эффективных процессов и развитии технических специалистов.",
    workExperience: [
      {
        position: "Technical Team Lead",
        company: "Сбер",
        period: "Март 2021 - Настоящее время",
        duration: "3 года 10 мес",
        description: "Управление командой из 12 разработчиков, архитектурные решения, координация с продуктовыми командами."
      },
      {
        position: "Senior Frontend Developer",
        company: "Тинькофф",
        period: "Январь 2019 - Февраль 2021",
        duration: "2 года 2 мес",
        description: "Разработка клиентских приложений банка, создание компонентной библиотеки, менторинг разработчиков."
      }
    ],
    education: [
      {
        university: "МГУ им. М.В. Ломоносова",
        faculty: "Факультет вычислительной математики и кибернетики",
        period: "2013 - 2017",
        degree: "Прикладная математика и информатика"
      }
    ],
    contact: {
      email: "andrey.novikov@sberbank.ru",
      phone: "+7 (495) 555-06-78",
      telegram: "@andrey_teamlead"
    }
  },
  {
    id: 8,
    name: "София Кузнецова",
    position: "Data Scientist",
    company: "Yandex Research",
    location: "Москва, Россия",
    status: "Открыт к предложениям",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    skills: ["Python", "TensorFlow", "PyTorch", "SQL", "Machine Learning"],
    experience: "5+ лет",
    connections: 167,
    vacancies: 0,
    views: 234,
    about: "Data Scientist с фокусом на машинное обучение и анализ больших данных. Работаю над алгоритмами персонализации и рекомендательными системами.",
    workExperience: [
      {
        position: "Senior Data Scientist",
        company: "Yandex Research",
        period: "Август 2022 - Настоящее время",
        duration: "2 года 5 мес",
        description: "Исследование и разработка ML алгоритмов для поисковых систем, работа с NLP и компьютерным зрением."
      },
      {
        position: "Data Scientist",
        company: "VK",
        period: "Ноябрь 2020 - Июль 2022",
        duration: "1 год 9 мес",
        description: "Анализ пользовательского поведения, A/B тестирование, создание рекомендательных алгоритмов для ленты новостей."
      }
    ],
    education: [
      {
        university: "МФТИ",
        faculty: "Факультет управления и прикладной математики",
        period: "2017 - 2021",
        degree: "Прикладная математика и физика"
      }
    ],
    contact: {
      email: "sofia.kuznetsova@yandex.ru",
      phone: "+7 (495) 555-07-89",
      telegram: "@sofia_ds"
    }
  }
  // Добавим остальных друзей позже для экономии места
];

export default friendsProfiles;
