// API сервис для работы с локальной базой данных
const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  // Базовый метод для HTTP запросов
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET запрос
  async get(endpoint) {
    return this.request(endpoint);
  }

  // POST запрос
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT запрос
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE запрос
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Пользователи
  async getUsers() {
    return this.get('/users');
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  // Вакансии
  async getVacancies() {
    return this.get('/vacancies');
  }

  async getVacancy(id) {
    return this.get(`/vacancies/${id}`);
  }

  async createVacancy(vacancyData) {
    return this.post('/vacancies', vacancyData);
  }

  async updateVacancy(id, vacancyData) {
    return this.put(`/vacancies/${id}`, vacancyData);
  }

  async deleteVacancy(id) {
    return this.delete(`/vacancies/${id}`);
  }

  // Мои вакансии
  async getMyVacancies(userId) {
    return this.get(`/myVacancies?userId=${userId}`);
  }

  async createMyVacancy(vacancyData) {
    return this.post('/myVacancies', vacancyData);
  }

  async updateMyVacancy(id, vacancyData) {
    return this.put(`/myVacancies/${id}`, vacancyData);
  }

  // Связи
  async getConnections(userId) {
    return this.get(`/connections?userId=${userId}`);
  }

  async createConnection(connectionData) {
    return this.post('/connections', connectionData);
  }

  async deleteConnection(id) {
    return this.delete(`/connections/${id}`);
  }

  // Уведомления
  async getNotifications(userId) {
    return this.get(`/notifications?userId=${userId}`);
  }

  async markNotificationAsRead(id) {
    return this.put(`/notifications/${id}`, { read: true });
  }

  async createNotification(notificationData) {
    return this.post('/notifications', notificationData);
  }

  // Отклики
  async getResponses(userId) {
    return this.get(`/responses?userId=${userId}`);
  }

  async createResponse(responseData) {
    return this.post('/responses', responseData);
  }

  async updateResponse(id, responseData) {
    return this.put(`/responses/${id}`, responseData);
  }

  // Поиск
  async searchUsers(query) {
    return this.get(`/users?q=${encodeURIComponent(query)}`);
  }

  async searchVacancies(query) {
    return this.get(`/vacancies?q=${encodeURIComponent(query)}`);
  }
}

// Создаем единственный экземпляр сервиса
const apiService = new ApiService();

export default apiService;
