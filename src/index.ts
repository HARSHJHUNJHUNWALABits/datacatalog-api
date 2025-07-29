/**
 * Main application entry point
 * RudderStack Data Catalog API
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import database connection
import { db } from './database/connection';

// Import repositories
import { EventRepository } from './dal/repositories/EventRepository';
import { PropertyRepository } from './dal/repositories/PropertyRepository';
import { TrackingPlanRepository } from './dal/repositories/TrackingPlanRepository';

// Import services
import { EventService } from './services/EventService';
import { PropertyService } from './services/PropertyService';
import { TrackingPlanService } from './services/TrackingPlanService';

// Import controllers
import { EventController } from './controllers/EventController';
import { PropertyController } from './controllers/PropertyController';
import { TrackingPlanController } from './controllers/TrackingPlanController';

// Import routes
import { createEventRoutes } from './routes/eventRoutes';
import { createPropertyRoutes } from './routes/propertyRoutes';
import { createTrackingPlanRoutes } from './routes/trackingPlanRoutes';

// Import constants
import { API_ENDPOINTS, HTTP_STATUS_CODES } from './constants';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({
    success: true,
    message: 'RudderStack Data Catalog API is running',
    timestamp: new Date().toISOString(),
  });
});

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'RudderStack Data Catalog API',
    version: '1.0.0',
    description: 'API documentation for the RudderStack Data Catalog',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      Event: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['track', 'identify', 'alias', 'screen', 'page'] },
          description: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'type', 'description', 'created_at', 'updated_at'],
      },
      CreateEventRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['track', 'identify', 'alias', 'screen', 'page'] },
          description: { type: 'string' },
        },
        required: ['name', 'type', 'description'],
      },
      UpdateEventRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['track', 'identify', 'alias', 'screen', 'page'] },
          description: { type: 'string' },
        },
      },
      ApiResponseEvent: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/Event' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      PaginatedEventResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Event' },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      Property: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['string', 'number', 'boolean'] },
          description: { type: 'string' },
          validation_rules: { type: 'object', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'type', 'description', 'created_at', 'updated_at'],
      },
      CreatePropertyRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['string', 'number', 'boolean'] },
          description: { type: 'string' },
          validation_rules: { type: 'object' },
        },
        required: ['name', 'type', 'description'],
      },
      UpdatePropertyRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['string', 'number', 'boolean'] },
          description: { type: 'string' },
          validation_rules: { type: 'object' },
        },
      },
      ApiResponseProperty: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/Property' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      PaginatedPropertyResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Property' },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      TrackingPlan: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                properties: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string', enum: ['string', 'number', 'boolean'] },
                      required: { type: 'boolean' },
                      description: { type: 'string' },
                    },
                    required: ['name', 'type', 'required', 'description'],
                  },
                },
                additionalProperties: { type: 'boolean' },
              },
              required: ['name', 'description', 'properties', 'additionalProperties'],
            },
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'description', 'events', 'created_at', 'updated_at'],
      },
      CreateTrackingPlanRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                properties: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string', enum: ['string', 'number', 'boolean'] },
                      required: { type: 'boolean' },
                      description: { type: 'string' },
                    },
                    required: ['name', 'type', 'required', 'description'],
                  },
                },
                additionalProperties: { type: 'boolean' },
              },
              required: ['name', 'description', 'properties', 'additionalProperties'],
            },
          },
        },
        required: ['name', 'description', 'events'],
      },
      UpdateTrackingPlanRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                properties: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string', enum: ['string', 'number', 'boolean'] },
                      required: { type: 'boolean' },
                      description: { type: 'string' },
                    },
                    required: ['name', 'type', 'required', 'description'],
                  },
                },
                additionalProperties: { type: 'boolean' },
              },
              required: ['name', 'description', 'properties', 'additionalProperties'],
            },
          },
        },
      },
      ApiResponseTrackingPlan: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/TrackingPlan' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      PaginatedTrackingPlanResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/TrackingPlan' },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
    },
  },
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // You can add more files for endpoint docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// (Optional) Move previous JSON docs to /docs/json
app.get('/docs/json', (req: express.Request, res: express.Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      events: {
        'GET /api/v1/events': 'Get all events with pagination and filtering',
        'POST /api/v1/events': 'Create a new event',
        'GET /api/v1/events/:id': 'Get event by ID',
        'PUT /api/v1/events/:id': 'Update an existing event',
        'DELETE /api/v1/events/:id': 'Delete an event',
      },
      properties: {
        'GET /api/v1/properties': 'Get all properties with pagination and filtering',
        'POST /api/v1/properties': 'Create a new property',
        'GET /api/v1/properties/:id': 'Get property by ID',
        'PUT /api/v1/properties/:id': 'Update an existing property',
        'DELETE /api/v1/properties/:id': 'Delete a property',
      },
      trackingPlans: {
        'GET /api/v1/tracking-plans': 'Get all tracking plans with pagination and filtering',
        'POST /api/v1/tracking-plans': 'Create a new tracking plan',
        'GET /api/v1/tracking-plans/:id': 'Get tracking plan by ID',
        'PUT /api/v1/tracking-plans/:id': 'Update an existing tracking plan',
        'DELETE /api/v1/tracking-plans/:id': 'Delete a tracking plan',
      },
    },
  });
});

// Initialize repositories
const eventRepository = new EventRepository(db);
const propertyRepository = new PropertyRepository(db);
const trackingPlanRepository = new TrackingPlanRepository(db);

// Initialize services
const eventService = new EventService(eventRepository);
const propertyService = new PropertyService(propertyRepository);
const trackingPlanService = new TrackingPlanService(
  trackingPlanRepository,
  eventRepository,
  propertyRepository
);

// Initialize controllers
const eventController = new EventController(eventService);
const propertyController = new PropertyController(propertyService);
const trackingPlanController = new TrackingPlanController(trackingPlanService);

// Setup routes
app.use('/api/v1', createEventRoutes(eventController));
app.use('/api/v1', createPropertyRoutes(propertyController));
app.use('/api/v1', createTrackingPlanRoutes(trackingPlanController));

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
    success: false,
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RudderStack Data Catalog API server is running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/docs`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});

export default app; 