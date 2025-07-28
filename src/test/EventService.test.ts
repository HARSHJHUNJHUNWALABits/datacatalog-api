/**
 * EventService test suite
 * Demonstrates testing approach for the application
 */
import { EventService } from '../services/EventService';
import { EventRepository } from '../dal/repositories/EventRepository';
import { db } from '../database/connection';
import { CreateEventRequest } from '../types';

describe('EventService', () => {
  let eventRepository: EventRepository;
  let eventService: EventService;

  beforeEach(() => {
    eventRepository = new EventRepository(db);
    eventService = new EventService(eventRepository);
  });

  describe('createEvent', () => {
    it('should create a new event successfully', async () => {
      const eventData: CreateEventRequest = {
        name: 'Test Event',
        type: 'track',
        description: 'Test event description',
      };

      const result = await eventService.createEvent(eventData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe(eventData.name);
      expect(result.data?.type).toBe(eventData.type);
      expect(result.data?.description).toBe(eventData.description);
    });

    it('should return error for duplicate event', async () => {
      const eventData: CreateEventRequest = {
        name: 'Duplicate Event',
        type: 'track',
        description: 'Test event description',
      };

      // Create first event
      await eventService.createEvent(eventData);

      // Try to create duplicate
      const result = await eventService.createEvent(eventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Event with this name and type already exists');
    });

    it('should return error for invalid event type', async () => {
      const eventData = {
        name: 'Test Event',
        type: 'invalid_type',
        description: 'Test event description',
      };

      const result = await eventService.createEvent(eventData as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });
  });

  describe('getEventById', () => {
    it('should return event when it exists', async () => {
      // Create an event first
      const eventData: CreateEventRequest = {
        name: 'Test Event',
        type: 'track',
        description: 'Test event description',
      };

      const createdEvent = await eventService.createEvent(eventData);
      const eventId = createdEvent.data?.id;

      if (eventId) {
        const result = await eventService.getEventById(eventId);

        expect(result.success).toBe(true);
        expect(result.data?.id).toBe(eventId);
      }
    });

    it('should return error when event does not exist', async () => {
      const result = await eventService.getEventById(99999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Event not found');
    });
  });
}); 