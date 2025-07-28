# RudderStack Data Catalog API

A simplified version of RudderStack's Data Catalog API service that manages events, properties, and tracking plans for data governance and quality assurance.

## 🚀 Features

- **Events Management**: Create, read, update, and delete events with validation
- **Properties Management**: Manage event properties with type validation
- **Tracking Plans**: Create comprehensive tracking plans with automatic event/property creation
- **RESTful API**: Clean, well-documented REST endpoints
- **Data Validation**: Comprehensive input validation using Joi
- **Database Integration**: SQLite with Knex.js query builder
- **Docker Support**: Containerized application for easy deployment
- **TypeScript**: Full TypeScript implementation with strict typing

## 🏗️ Architecture

The application follows SOLID principles and clean architecture patterns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and validation
- **Repositories**: Data access layer with Knex.js
- **Types**: TypeScript interfaces and type definitions
- **Utils**: Validation and helper functions
- **Constants**: Application constants and configuration

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd datacatalog-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Or build and run individually**
   ```bash
   docker build -t datacatalog-api .
   docker run -p 3000:3000 datacatalog-api
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Events

#### Create Event
```http
POST /events
Content-Type: application/json

{
  "name": "Product Clicked",
  "type": "track",
  "description": "User clicked on a product"
}
```

#### Get All Events
```http
GET /events?page=1&limit=10&type=track&search=product
```

#### Get Event by ID
```http
GET /events/:id
```

#### Update Event
```http
PUT /events/:id
Content-Type: application/json

{
  "name": "Product Clicked",
  "type": "track",
  "description": "Updated description"
}
```

#### Delete Event
```http
DELETE /events/:id
```

### Properties

#### Create Property
```http
POST /properties
Content-Type: application/json

{
  "name": "price",
  "type": "number",
  "description": "Product price",
  "validation_rules": {
    "minimum": 0
  }
}
```

#### Get All Properties
```http
GET /properties?page=1&limit=10&type=number&search=price
```

#### Get Property by ID
```http
GET /properties/:id
```

#### Update Property
```http
PUT /properties/:id
Content-Type: application/json

{
  "name": "price",
  "type": "number",
  "description": "Updated description"
}
```

#### Delete Property
```http
DELETE /properties/:id
```

### Tracking Plans

#### Create Tracking Plan
```http
POST /tracking-plans
Content-Type: application/json

{
  "name": "Purchase Flow",
  "description": "Events related to the purchase funnel",
  "events": [
    {
      "name": "Product Viewed",
      "description": "User viewed a product detail page",
      "properties": [
        {
          "name": "product_id",
          "type": "string",
          "required": true,
          "description": "Unique identifier for the product"
        },
        {
          "name": "price",
          "type": "number",
          "required": true,
          "description": "Product price"
        }
      ],
      "additionalProperties": true
    }
  ]
}
```

#### Get All Tracking Plans
```http
GET /tracking-plans?page=1&limit=10&search=purchase
```

#### Get Tracking Plan by ID
```http
GET /tracking-plans/:id
```

#### Update Tracking Plan
```http
PUT /tracking-plans/:id
Content-Type: application/json

{
  "name": "Updated Purchase Flow",
  "description": "Updated description"
}
```

#### Delete Tracking Plan
```http
DELETE /tracking-plans/:id
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Database connection string | `./data/dev.sqlite3` |
| `LOG_LEVEL` | Logging level | `info` |

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

### 1. Architecture Pattern
- **Clean Architecture**: Separation of concerns with clear boundaries
- **SOLID Principles**: Single responsibility, dependency inversion, etc.
- **Repository Pattern**: Abstract data access layer

### 2. Database Choice
- **SQLite**: Lightweight, file-based database for simplicity
- **Knex.js**: Query builder for type safety and flexibility
- **Migrations**: Version-controlled database schema changes

### 3. Validation Strategy
- **Joi**: Comprehensive schema validation
- **TypeScript**: Compile-time type checking
- **Runtime Validation**: Input sanitization and business rule enforcement

### 4. Error Handling
- **Consistent Response Format**: Standardized API responses
- **HTTP Status Codes**: Proper status code usage
- **Error Logging**: Structured error logging

### 5. Security
- **Helmet**: Security headers
- **Rate Limiting**: Protection against abuse
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Prevent injection attacks

## 🚀 Deployment

### Production Considerations

1. **Database**: Consider PostgreSQL for production
2. **Environment**: Use proper environment variables
3. **Logging**: Implement structured logging
4. **Monitoring**: Add health checks and metrics
5. **Security**: Enable HTTPS and additional security measures

### Docker Production

```bash
# Build production image
docker build -t datacatalog-api:prod .

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=/app/data/prod.sqlite3 \
  -v $(pwd)/data:/app/data \
  datacatalog-api:prod
```

## 🔮 Future Improvements

1. **Advanced Validation**: Custom validation rules for properties
2. **API Documentation**: OpenAPI/Swagger integration
3. **Authentication**: JWT-based authentication
4. **Caching**: Redis for performance optimization
5. **Monitoring**: Prometheus metrics and Grafana dashboards
6. **Testing**: More comprehensive test coverage
7. **CI/CD**: GitHub Actions for automated testing and deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues, please create an issue in the repository.

---

**Note**: This is a simplified implementation for demonstration purposes. Production use would require additional security, monitoring, and scalability considerations. 