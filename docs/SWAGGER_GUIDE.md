# Swagger/OpenAPI Documentation Guide

This guide explains the Swagger documentation implementation in the RudderStack Data Catalog API and how to effectively use it.

## 📚 Overview

The API uses **Swagger/OpenAPI 3.0** specification with the following components:

- **swagger-jsdoc**: Generates OpenAPI specification from JSDoc comments
- **swagger-ui-express**: Serves interactive API documentation
- **Comprehensive Schemas**: Complete request/response schemas for all endpoints
- **Real-time Validation**: Interactive testing with immediate feedback

## 🚀 Accessing the Documentation

### Development Server
```
http://localhost:3000/docs
```

### Production Server
```
https://your-domain.com/docs
```

## 📖 Documentation Structure

### 1. API Information
- **Title**: RudderStack Data Catalog API
- **Version**: 1.0.0
- **Description**: Comprehensive API for managing events, properties, and tracking plans
- **Base URL**: `/api/v1`

### 2. Endpoint Groups

#### Events (`/events`)
- `GET /events` - List all events with pagination and filtering
- `POST /events` - Create a new event
- `GET /events/{id}` - Get event by ID
- `PUT /events/{id}` - Update an event
- `DELETE /events/{id}` - Delete an event

#### Properties (`/properties`)
- `GET /properties` - List all properties with pagination and filtering
- `POST /properties` - Create a new property
- `GET /properties/{id}` - Get property by ID
- `PUT /properties/{id}` - Update a property
- `DELETE /properties/{id}` - Delete a property

#### Tracking Plans (`/tracking-plans`)
- `GET /tracking-plans` - List all tracking plans with pagination and filtering
- `POST /tracking-plans` - Create a new tracking plan
- `GET /tracking-plans/{id}` - Get tracking plan by ID
- `PUT /tracking-plans/{id}` - Update a tracking plan
- `DELETE /tracking-plans/{id}` - Delete a tracking plan

## 🔧 Schema Definitions

### Event Schema
```yaml
Event:
  type: object
  properties:
    id:
      type: integer
      description: Unique identifier
    name:
      type: string
      maxLength: 100
      description: Event name
    type:
      type: string
      enum: [track, identify, alias, screen, page]
      description: Event type
    description:
      type: string
      maxLength: 500
      description: Event description
    created_at:
      type: string
      format: date-time
    updated_at:
      type: string
      format: date-time
  required: [name, type, description]
```

### Property Schema
```yaml
Property:
  type: object
  properties:
    id:
      type: integer
      description: Unique identifier
    name:
      type: string
      maxLength: 100
      description: Property name
    type:
      type: string
      enum: [string, number, boolean]
      description: Property type
    description:
      type: string
      maxLength: 500
      description: Property description
    validation_rules:
      type: object
      description: Custom validation rules
    created_at:
      type: string
      format: date-time
    updated_at:
      type: string
      format: date-time
  required: [name, type, description]
```

### Tracking Plan Schema
```yaml
TrackingPlan:
  type: object
  properties:
    id:
      type: integer
      description: Unique identifier
    name:
      type: string
      maxLength: 200
      description: Tracking plan name
    description:
      type: string
      maxLength: 500
      description: Tracking plan description
    events:
      type: array
      items:
        $ref: '#/components/schemas/TrackingPlanEvent'
      minItems: 1
      description: List of events in the tracking plan
    created_at:
      type: string
      format: date-time
    updated_at:
      type: string
      format: date-time
  required: [name, description, events]
```

## 🎯 Using the Swagger UI

### 1. Interactive Testing

#### Step 1: Navigate to an Endpoint
1. Open `http://localhost:3000/docs`
2. Click on any endpoint (e.g., `POST /events`)
3. Click the "Try it out" button

#### Step 2: Fill in Parameters
```json
{
  "name": "Product Clicked",
  "type": "track",
  "description": "User clicked on a product"
}
```

#### Step 3: Execute Request
1. Click "Execute"
2. View the response in real-time
3. Check status code, response body, and headers

### 2. Response Examples

#### Successful Response (200/201)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Clicked",
    "type": "track",
    "description": "User clicked on a product",
    "created_at": "2023-12-01T10:00:00Z",
    "updated_at": "2023-12-01T10:00:00Z"
  },
  "message": "Event created successfully"
}
```

#### Error Response (400/404/409)
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "name: Name is required",
  "details": [
    {
      "field": "name",
      "message": "Name is required",
      "value": null
    }
  ]
}
```

### 3. Query Parameters

#### Pagination
```
GET /events?page=1&limit=10
```

#### Filtering
```
GET /events?type=track&search=product
```

#### Sorting
```
GET /events?sort=created_at&order=desc
```

## 🔍 Validation Features

### 1. Real-time Validation
- **Request Body**: Validates against schemas before sending
- **Query Parameters**: Validates parameter types and formats
- **Path Parameters**: Ensures proper ID format

### 2. Error Handling
- **400 Bad Request**: Validation errors with detailed messages
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server errors

### 3. Custom Validation Rules
```json
{
  "name": "user_id",
  "type": "string",
  "description": "User identifier",
  "validation_rules": {
    "pattern": "^[a-zA-Z0-9_-]+$",
    "minLength": 3,
    "maxLength": 50
  }
}
```

## 📝 Documentation Best Practices

### 1. JSDoc Comments
```javascript
/**
 * @openapi
 * /api/v1/events:
 *   post:
 *     summary: Create a new event
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEvent'
 */
```

### 2. Schema References
```javascript
/**
 * @openapi
 * components:
 *   schemas:
 *     CreateEventRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         type:
 *           type: string
 *           enum: [track, identify, alias, screen, page]
 *         description:
 *           type: string
 *           maxLength: 500
 *       required: [name, type, description]
 */
```

### 3. Response Examples
```javascript
/**
 * @openapi
 * components:
 *   examples:
 *     EventCreated:
 *       summary: Event created successfully
 *       value:
 *         success: true
 *         data:
 *           id: 1
 *           name: "Product Clicked"
 *           type: "track"
 *           description: "User clicked on a product"
 *         message: "Event created successfully"
 */
```

## 🚀 Advanced Features

### 1. Authentication (Future)
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 2. Rate Limiting Headers
```yaml
components:
  headers:
    X-RateLimit-Limit:
      schema:
        type: integer
      description: Request limit per hour
    X-RateLimit-Remaining:
      schema:
        type: integer
      description: Remaining requests for the hour
```

### 3. Webhook Documentation (Future)
```yaml
components:
  schemas:
    WebhookEvent:
      type: object
      properties:
        event:
          type: string
        timestamp:
          type: string
          format: date-time
        data:
          type: object
```

## 🔧 Configuration

### Swagger Configuration
```javascript
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'RudderStack Data Catalog API',
    version: '1.0.0',
    description: 'Comprehensive API for managing events, properties, and tracking plans',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server'
    }
  ],
  components: {
    schemas: {
      // Schema definitions
    },
    examples: {
      // Example responses
    }
  }
};
```

### JSDoc Options
```javascript
const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API docs
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true
  }
};
```

## 📊 Monitoring and Analytics

### 1. Usage Tracking
- Track which endpoints are most frequently accessed
- Monitor response times and error rates
- Identify popular API features

### 2. Documentation Metrics
- Page views and time spent on documentation
- Most tested endpoints
- Common error patterns

## 🔮 Future Enhancements

### 1. Authentication Integration
- OAuth 2.0 support
- API key authentication
- Role-based access control

### 2. Advanced Features
- Request/response recording
- Performance metrics
- Automated testing integration
- Code generation from schemas

### 3. Developer Experience
- SDK generation
- Postman collection export
- cURL command generation
- Interactive tutorials

## 🆘 Troubleshooting

### Common Issues

#### 1. Documentation Not Loading
```bash
# Check if server is running
curl http://localhost:3000/docs

# Check for CORS issues
# Ensure proper headers are set
```

#### 2. Schema Validation Errors
```bash
# Check JSDoc syntax
# Ensure proper schema references
# Verify OpenAPI 3.0 compliance
```

#### 3. Missing Endpoints
```bash
# Check route file paths
# Verify JSDoc comments
# Ensure proper file extensions
```

### Debug Commands
```bash
# Validate OpenAPI specification
npm install -g swagger-cli
swagger-cli validate swagger.json

# Test specific endpoint
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{"name":"test","type":"track","description":"test"}'
```

## 📚 Additional Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JSDoc Documentation](https://jsdoc.app/)
- [Express.js Documentation](https://expressjs.com/)

---

**Note**: This documentation is automatically generated from JSDoc comments in the route files. To update the API documentation, modify the JSDoc comments in the corresponding route files. 