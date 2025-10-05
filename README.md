# sARA2 Network App - Modern Professional Networking Platform

A full-stack professional networking application built with modern technologies, featuring user profiles, job postings, connections, and real-time notifications.

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js
- **Prisma ORM** with SQLite database
- **JWT** authentication with bcrypt password hashing
- **Express Rate Limiting** for API protection
- **Helmet** for security headers
- **Morgan** for request logging

### Frontend
- **React 18** with modern hooks
- **Axios** for API communication
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Heroicons** for UI icons

### DevOps & Deployment
- **Docker** containerization
- **GitHub Actions** CI/CD pipeline
- **Nginx** reverse proxy (optional)

## 📋 Features

### Core Functionality
- ✅ User registration and authentication
- ✅ User profiles with skills and experience
- ✅ Job vacancy posting and management
- ✅ Professional connections (friends/colleagues)
- ✅ Job applications and status tracking
- ✅ Real-time notifications system
- ✅ User settings and preferences

### Security Features
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on API endpoints
- ✅ CORS protection
- ✅ Security headers with Helmet
- ✅ Input validation and sanitization

### API Features
- ✅ RESTful API design
- ✅ Comprehensive error handling
- ✅ Request/response logging
- ✅ Health check endpoints
- ✅ Pagination support
- ✅ Search and filtering

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm 8+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sara2-network-app
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo 'DATABASE_URL="file:./dev.db"' > .env
   echo 'JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"' >> .env
   ```

4. **Initialize database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Create database schema
   npx prisma db push
   
   # Seed with sample data
   node prisma/seed.js
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Access the application**
   - API: http://localhost:3002/api
   - Health Check: http://localhost:3002/health

### Development Mode

```bash
# Start with auto-reload
npm run server:dev

# Or start both backend and frontend
npm run dev
```

## 📊 Database Schema

The application uses SQLite with Prisma ORM. Key tables include:

- **users** - User profiles and authentication
- **vacancies** - Job postings
- **connections** - Professional relationships
- **applications** - Job applications
- **notifications** - User notifications
- **user_settings** - User preferences

### Sample Data

The database is seeded with 5 demo users:
- **Александр Петров** (alexander.petrov@example.com / demo123)
- **Мария Сидорова** (maria.sidorova@example.com / demo123)
- **Дмитрий Козлов** (dmitry.kozlov@example.com / demo123)
- **Анна Волкова** (anna.volkova@example.com / demo123)
- **Сергей Морозов** (sergey.morozov@example.com / demo123)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (with pagination/filtering)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/connections` - Get user connections
- `GET /api/users/:id/vacancies` - Get user's vacancies

### Vacancies
- `GET /api/vacancies` - Get all vacancies
- `GET /api/vacancies/:id` - Get vacancy by ID
- `POST /api/vacancies` - Create new vacancy
- `PUT /api/vacancies/:id` - Update vacancy
- `DELETE /api/vacancies/:id` - Delete vacancy

### Connections
- `GET /api/connections` - Get user's connections
- `POST /api/connections/send` - Send connection request
- `POST /api/connections/accept/:id` - Accept connection
- `POST /api/connections/reject/:id` - Reject connection
- `DELETE /api/connections/:id` - Remove connection

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/my` - Get my applications
- `GET /api/applications/received` - Get received applications
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Delete application

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/count` - Get unread count

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t sara2-network-app .

# Run container
docker run -p 3002:3002 -e DATABASE_URL="file:/app/data/dev.db" sara2-network-app
```

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflow for:
- Automated testing
- Code linting
- Docker image building
- Deployment to production

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📈 Performance & Monitoring

- **Health Check**: `/health` endpoint for monitoring
- **Request Logging**: Morgan middleware for request tracking
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Comprehensive error responses
- **Database Indexing**: Optimized queries with Prisma

## 🔒 Security Considerations

- JWT tokens with expiration
- Password hashing with bcrypt
- Rate limiting on all endpoints
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization
- SQL injection protection via Prisma

## 🚀 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=file:/app/data/prod.db
JWT_SECRET=your-production-secret-key
PORT=3002
CORS_ORIGIN=https://yourdomain.com
```

### Database Migration
```bash
# For production, use migrations instead of db push
npx prisma migrate deploy
```

## 📝 API Documentation

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token and user data
3. Client stores token in localStorage
4. All subsequent requests include `Authorization: Bearer <token>` header
5. Server validates token on protected routes

### Error Handling
All API responses follow this format:
```json
{
  "success": boolean,
  "error": "Error message",
  "message": "User-friendly message",
  "details": [] // Validation errors
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the API documentation
- Review the health check endpoint for server status

---

**Built with ❤️ using modern web technologies**