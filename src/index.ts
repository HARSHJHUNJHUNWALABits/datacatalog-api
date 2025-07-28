/**
 * Main application entry point
 * RudderStack Data Catalog API
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

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

// API documentation endpoint
app.get('/docs', (req: express.Request, res: express.Response) => {
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