# RudderStack Data Catalog API

A comprehensive REST API for managing events, properties, and tracking plans with full Swagger/OpenAPI documentation, validation middleware, and automated database setup.

## 🚀 Features

- **📊 Events Management**: CRUD operations for events with comprehensive validation
- **🔧 Properties Management**: Manage event properties with type validation and custom rules
- **📋 Tracking Plans**: Create comprehensive tracking plans with automatic event/property creation
- **📚 Swagger Documentation**: Interactive API documentation with OpenAPI 3.0 specification
- **✅ Input Validation**: Comprehensive validation using Joi with detailed error messages
- **🏗️ Clean Architecture**: SOLID principles with separation of concerns
- **⚡ Performance Optimized**: Promise.all for parallel operations
- **🧪 Full Test Coverage**: Comprehensive unit tests with Jest
- **🐳 Docker Support**: Containerized application for easy deployment
- **📝 TypeScript**: Full TypeScript implementation with strict typing

## 🏗️ Architecture

The application follows clean architecture patterns with clear separation of concerns:

```
src/
├── controllers/     # HTTP request/response handling
├── services/       # Business logic layer
├── dal/           # Data Access Layer (repositories)
├── routes/        # Express route definitions
├── middleware/    # Custom middleware (validation, etc.)
├── utils/         # Utility functions (error handling, etc.)
├── types/         # TypeScript type definitions
├── constants/     # Application constants
└── database/      # Database configuration and migrations
```

## 📋 Prerequisites

- **Node.js 18+** 
- **npm or yarn**
- **PostgreSQL** (optional, SQLite is default)
- **Docker** (optional)

## 🛠️ Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd datacatalog-api

# Run the automated setup script
node scripts/setup-database.js

# Start the development server
npm run dev
```

### Option 2: Manual Setup

```bash
# Clone the repository
git clone <repository-url>
cd datacatalog-api

# Install dependencies
npm install

# Set up environment
cp env.example .env

# Run database migrations
npm run migrate

# Start the development server
npm run dev
```

### Option 3: Docker Setup

```bash
# Clone the repository
git clone <repository-url>
cd datacatalog-api

# Build and run with Docker Compose
docker-compose up --build
```

## 📚 API Documentation

### Swagger UI

Once the server is running, access the interactive API documentation at:

```
http://localhost:3000/docs
```

The Swagger UI provides:
- **Interactive API Explorer**: Test endpoints directly from the browser
- **Request/Response Examples**: See sample data for all endpoints
- **Authentication**: (Future feature)
- **Error Codes**: Complete list of possible responses
- **Schema Validation**: Real-time validation of request bodies

### API Base URL

```
http://localhost:3000/api/v1
```

## 🔧 Database Setup

### Automated Setup Script

The project includes a comprehensive setup script that handles:

```bash
# SQLite (default)
node scripts/setup-database.js

# PostgreSQL
node scripts/setup-database.js --postgres

# Custom environment
node scripts/setup-database.js --env production
```

### Manual Database Setup

#### SQLite (Default)
```bash
# Create data directory
mkdir -p data

# Run migrations
npm run migrate
```

#### PostgreSQL
```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb rudderstack_data_catalog

# Run migrations
npm run migrate
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm test -- EventService.test.ts
```

## 📖 API Endpoints

### Events

| Method | Endpoint | Description | Validation |
|--------|----------|-------------|------------|
| `GET` | `/events` | Get all events with pagination | Query params |
| `POST` | `/events` | Create a new event | Request body |
| `GET` | `/events/:id` | Get event by ID | Path param |
| `PUT` | `/events/:id` | Update an event | Path param + body |
| `DELETE` | `/events/:id` | Delete an event | Path param |

### Properties

| Method | Endpoint | Description | Validation |
|--------|----------|-------------|------------|
| `GET` | `/properties` | Get all properties with pagination | Query params |
| `POST` | `/properties` | Create a new property | Request body |
| `GET` | `/properties/:id` | Get property by ID | Path param |
| `PUT` | `/properties/:id` | Update a property | Path param + body |
| `DELETE` | `/properties/:id` | Delete a property | Path param |

### Tracking Plans

| Method | Endpoint | Description | Validation |
|--------|----------|-------------|------------|
| `GET` | `/tracking-plans` | Get all tracking plans with pagination | Query params |
| `POST` | `/tracking-plans` | Create a new tracking plan | Request body |
| `GET` | `/tracking-plans/:id` | Get tracking plan by ID | Path param |
| `PUT` | `/tracking-plans/:id` | Update a tracking plan | Path param + body |
| `DELETE` | `/tracking-plans/:id` | Delete a tracking plan | Path param |

## 🔍 Validation Rules

### Event Validation
```typescript
{
  name: string (required, max 100 chars),
  type: "track" | "identify" | "alias" | "screen" | "page" (required),
  description: string (required, max 500 chars)
}
```

### Property Validation
```typescript
{
  name: string (required, max 100 chars),
  type: "string" | "number" | "boolean" (required),
  description: string (required, max 500 chars),
  validation_rules: object (optional)
}
```

### Tracking Plan Validation
```typescript
{
  name: string (required, max 200 chars),
  description: string (required, max 500 chars),
  events: array (required, min 1 event)
}
```

## 🎯 Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "error": "ERROR_TYPE",
  "message": "Human readable error message",
  "details": [] // Optional validation errors
}
```

### Common Error Types
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `ALREADY_EXISTS`: Resource already exists
- `INTERNAL_ERROR`: Server error

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Database connection string | `./data/dev.sqlite3` |
| `LOG_LEVEL` | Logging level | `info` |
| `API_BASE_PATH` | API base path | `/api/v1` |

### Event Types
- `track` - User action tracking
- `identify` - User identification
- `alias` - User alias
- `screen` - Screen view
- `page` - Page view

### Property Types
- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values

## 🏛️ Design Decisions

### 1. Validation Strategy
- **Router Layer Validation**: Input validation happens at the router layer using middleware
- **Joi Schema Validation**: Comprehensive schema validation with detailed error messages
- **TypeScript Types**: Compile-time type checking for additional safety

### 2. Error Handling
- **Centralized Error Handler**: Consistent error response format across all endpoints
- **Detailed Error Messages**: User-friendly error messages with field-specific details
- **HTTP Status Codes**: Proper status code usage (400, 404, 409, 500)

### 3. Performance Optimization
- **Promise.all**: Parallel execution for independent operations
- **Efficient Queries**: Optimized database queries with proper indexing
- **Connection Pooling**: Database connection management

### 4. API Documentation
- **Swagger/OpenAPI 3.0**: Interactive API documentation
- **Comprehensive Schemas**: Complete request/response schemas
- **Example Data**: Real-world examples for all endpoints

## 🚀 Deployment

### Production Considerations

1. **Database**: Use PostgreSQL for production workloads
2. **Environment**: Configure proper environment variables
3. **Logging**: Implement structured logging (Winston/Pino)
4. **Monitoring**: Add health checks and metrics
5. **Security**: Enable HTTPS, rate limiting, and CORS
6. **Caching**: Consider Redis for performance optimization

### Docker Production

```bash
# Build production image
docker build -t datacatalog-api:prod .

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -v $(pwd)/data:/app/data \
  datacatalog-api:prod
```

## 🔮 Future Improvements

1. **Authentication & Authorization**: JWT-based authentication
2. **Rate Limiting**: API rate limiting with Redis
3. **Caching**: Redis caching for frequently accessed data
4. **Monitoring**: Prometheus metrics and Grafana dashboards
5. **Advanced Validation**: Custom validation rules for properties
6. **Webhooks**: Event-driven webhooks for integrations
7. **Bulk Operations**: Batch create/update operations
8. **Search**: Full-text search capabilities
9. **Audit Logging**: Track all changes with audit trail
10. **API Versioning**: Support for multiple API versions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- **Conventional Commits**: Use conventional commit messages
- **TypeScript**: Maintain strict typing
- **Testing**: Add tests for new features
- **Documentation**: Update README and API docs
- **Code Style**: Follow existing code patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Create an issue in the repository
- **Documentation**: Check the Swagger UI at `/docs`
- **Examples**: See the test files for usage examples

---

**Note**: This is a production-ready implementation with comprehensive validation, testing, and documentation. The architecture follows industry best practices and is designed for scalability and maintainability. 