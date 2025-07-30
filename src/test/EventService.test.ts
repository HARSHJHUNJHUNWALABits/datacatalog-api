/**
 * EventService test suite
 * Demonstrates testing approach for the application
 */
import { EventService } from '../services/EventService';
import { IEventRepository } from '../dal/interfaces/IEventRepository';
import { Event, CreateEventRequest, UpdateEventRequest, EventQueryParams } from '../types';
import { ERROR_MESSAGES } from '../constants';

describe('EventService', () => {
  let eventService: EventService;
  let mockEventRepository: jest.Mocked<IEventRepository>;

  const mockEvent: Event = {
    id: 1,
    name: 'User Signed Up',
    type: 'track',
    description: 'Triggered when a user signs up',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockCreateEventRequest: CreateEventRequest = {
    name: 'User Signed Up',
    type: 'track',
    description: 'Triggered when a user signs up',
  };

  beforeEach(() => {
    mockEventRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByNameAndType: jest.fn(),
      existsByNameAndType: jest.fn(),
    } as jest.Mocked<IEventRepository>;

    eventService = new EventService(mockEventRepository);
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      // Arrange
      mockEventRepository.findByNameAndType.mockResolvedValue(null);
      mockEventRepository.create.mockResolvedValue(mockEvent);

      // Act
      const result = await eventService.createEvent(mockCreateEventRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEvent);
      expect(result.message).toBe('Event created successfully');
      expect(mockEventRepository.findByNameAndType).toHaveBeenCalledWith('User Signed Up', 'track');
      expect(mockEventRepository.create).toHaveBeenCalledWith(mockCreateEventRequest);
    });

    it('should return error when event already exists', async () => {
      // Arrange
      mockEventRepository.findByNameAndType.mockResolvedValue(mockEvent);

      // Act
      const result = await eventService.createEvent(mockCreateEventRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.EVENT_ALREADY_EXISTS);
      expect(mockEventRepository.create).not.toHaveBeenCalled();
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockEventRepository.findByNameAndType.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await eventService.createEvent(mockCreateEventRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('getEventById', () => {
    it('should return event when found', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValue(mockEvent);

      // Act
      const result = await eventService.getEventById(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEvent);
      expect(mockEventRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return error when event not found', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValue(null);

      // Act
      const result = await eventService.getEventById(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.EVENT_NOT_FOUND);
      expect(mockEventRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockEventRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await eventService.getEventById(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('getEvents', () => {
    it('should return paginated events', async () => {
      // Arrange
      const mockPaginatedResponse = {
        success: true,
        data: [mockEvent],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
      mockEventRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await eventService.getEvents({ page: 1, limit: 10 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPaginatedResponse);
      expect(mockEventRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockEventRepository.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await eventService.getEvents({ page: 1, limit: 10 });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('updateEvent', () => {
    const updateData: UpdateEventRequest = {
      name: 'Updated Event Name',
      description: 'Updated description',
    };

    const updatedEvent: Event = {
      ...mockEvent,
      name: 'Updated Event Name',
      description: 'Updated description',
    };

    it('should update event successfully', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findByNameAndType.mockResolvedValue(null);
      mockEventRepository.update.mockResolvedValue(updatedEvent);

      // Act
      const result = await eventService.updateEvent(1, updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedEvent);
      expect(result.message).toBe('Event updated successfully');
      expect(mockEventRepository.findById).toHaveBeenCalledWith(1);
      expect(mockEventRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return error when event not found', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValue(null);

      // Act
      const result = await eventService.updateEvent(1, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.EVENT_NOT_FOUND);
      expect(mockEventRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when conflicting event exists', async () => {
      // Arrange
      const conflictingEvent = { ...mockEvent, id: 2 };
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findByNameAndType.mockResolvedValue(conflictingEvent);

      // Act
      const result = await eventService.updateEvent(1, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.EVENT_ALREADY_EXISTS);
      expect(mockEventRepository.update).not.toHaveBeenCalled();
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockEventRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await eventService.updateEvent(1, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.delete.mockResolvedValue(true);

      // Act
      const result = await eventService.deleteEvent(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Event deleted successfully');
      expect(mockEventRepository.findById).toHaveBeenCalledWith(1);
      expect(mockEventRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return error when event not found', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValue(null);

      // Act
      const result = await eventService.deleteEvent(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.EVENT_NOT_FOUND);
      expect(mockEventRepository.delete).not.toHaveBeenCalled();
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockEventRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await eventService.deleteEvent(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('eventExists', () => {
    it('should return true when event exists', async () => {
      // Arrange
      mockEventRepository.existsByNameAndType.mockResolvedValue(true);

      // Act
      const result = await eventService.eventExists('User Signed Up', 'track');

      // Assert
      expect(result).toBe(true);
      expect(mockEventRepository.existsByNameAndType).toHaveBeenCalledWith('User Signed Up', 'track');
    });

    it('should return false when event does not exist', async () => {
      // Arrange
      mockEventRepository.existsByNameAndType.mockResolvedValue(false);

      // Act
      const result = await eventService.eventExists('User Signed Up', 'track');

      // Assert
      expect(result).toBe(false);
      expect(mockEventRepository.existsByNameAndType).toHaveBeenCalledWith('User Signed Up', 'track');
    });
  });
}); 