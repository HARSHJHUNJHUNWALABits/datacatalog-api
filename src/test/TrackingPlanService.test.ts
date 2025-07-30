/**
 * TrackingPlanService test suite
 * Demonstrates testing approach for the application
 */
import { TrackingPlanService } from '../services/TrackingPlanService';
import { ITrackingPlanRepository } from '../dal/interfaces/ITrackingPlanRepository';
import { IEventRepository } from '../dal/interfaces/IEventRepository';
import { IPropertyRepository } from '../dal/interfaces/IPropertyRepository';
import { 
  TrackingPlan, 
  CreateTrackingPlanRequest, 
  UpdateTrackingPlanRequest, 
  TrackingPlanEvent,
  TrackingPlanProperty,
  Event,
  Property
} from '../types';
import { ERROR_MESSAGES } from '../constants';

describe('TrackingPlanService', () => {
  let trackingPlanService: TrackingPlanService;
  let mockTrackingPlanRepository: jest.Mocked<ITrackingPlanRepository>;
  let mockEventRepository: jest.Mocked<IEventRepository>;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;

  const mockEvent: Event = {
    id: 1,
    name: 'User Signed Up',
    type: 'track',
    description: 'Triggered when a user signs up',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockProperty: Property = {
    id: 1,
    name: 'user_id',
    type: 'string',
    description: 'Unique identifier for the user',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockTrackingPlanEvent: TrackingPlanEvent = {
    name: 'User Signed Up',
    description: 'Triggered when a user signs up',
    properties: [
      {
        name: 'user_id',
        type: 'string',
        description: 'Unique identifier for the user',
        required: true,
      },
    ],
    additionalProperties: false,
  };

  const mockTrackingPlan: TrackingPlan = {
    id: 1,
    name: 'User Onboarding',
    description: 'Tracking plan for user onboarding events',
    events: [mockTrackingPlanEvent],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockCreateTrackingPlanRequest: CreateTrackingPlanRequest = {
    name: 'User Onboarding',
    description: 'Tracking plan for user onboarding events',
    events: [mockTrackingPlanEvent],
  };

  beforeEach(() => {
    mockTrackingPlanRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByName: jest.fn(),
      existsByName: jest.fn(),
    } as jest.Mocked<ITrackingPlanRepository>;

    mockEventRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByNameAndType: jest.fn(),
      existsByNameAndType: jest.fn(),
    } as jest.Mocked<IEventRepository>;

    mockPropertyRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByNameAndType: jest.fn(),
      existsByNameAndType: jest.fn(),
      findByNamesAndTypes: jest.fn(),
    } as jest.Mocked<IPropertyRepository>;

    trackingPlanService = new TrackingPlanService(
      mockTrackingPlanRepository,
      mockEventRepository,
      mockPropertyRepository
    );
    jest.clearAllMocks();
  });

  describe('createTrackingPlan', () => {
    it('should create a tracking plan successfully', async () => {
      // Arrange
      mockTrackingPlanRepository.findByName.mockResolvedValue(null);
      mockEventRepository.findByNameAndType.mockResolvedValue(null);
      mockEventRepository.create.mockResolvedValue(mockEvent);
      mockPropertyRepository.findByNameAndType.mockResolvedValue(null);
      mockPropertyRepository.create.mockResolvedValue(mockProperty);
      mockTrackingPlanRepository.create.mockResolvedValue(mockTrackingPlan);

      // Act
      const result = await trackingPlanService.createTrackingPlan(mockCreateTrackingPlanRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrackingPlan);
      expect(result.message).toBe('Tracking plan created successfully');
      expect(mockTrackingPlanRepository.findByName).toHaveBeenCalledWith('User Onboarding');
      expect(mockTrackingPlanRepository.create).toHaveBeenCalledWith({
        ...mockCreateTrackingPlanRequest,
        events: [mockTrackingPlanEvent],
      });
    });

    it('should return error when tracking plan already exists', async () => {
      // Arrange
      mockTrackingPlanRepository.findByName.mockResolvedValue(mockTrackingPlan);

      // Act
      const result = await trackingPlanService.createTrackingPlan(mockCreateTrackingPlanRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.TRACKING_PLAN_ALREADY_EXISTS);
      expect(mockTrackingPlanRepository.create).not.toHaveBeenCalled();
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockTrackingPlanRepository.findByName.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await trackingPlanService.createTrackingPlan(mockCreateTrackingPlanRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('getTrackingPlanById', () => {
    it('should return tracking plan when found', async () => {
      // Arrange
      mockTrackingPlanRepository.findById.mockResolvedValue(mockTrackingPlan);

      // Act
      const result = await trackingPlanService.getTrackingPlanById(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrackingPlan);
      expect(mockTrackingPlanRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return error when tracking plan not found', async () => {
      // Arrange
      mockTrackingPlanRepository.findById.mockResolvedValue(null);

      // Act
      const result = await trackingPlanService.getTrackingPlanById(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND);
      expect(mockTrackingPlanRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockTrackingPlanRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await trackingPlanService.getTrackingPlanById(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('getTrackingPlans', () => {
    it('should return paginated tracking plans', async () => {
      // Arrange
      const mockPaginatedResponse = {
        success: true,
        data: [mockTrackingPlan],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
      mockTrackingPlanRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await trackingPlanService.getTrackingPlans({ page: 1, limit: 10 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPaginatedResponse);
      expect(mockTrackingPlanRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockTrackingPlanRepository.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await trackingPlanService.getTrackingPlans({ page: 1, limit: 10 });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('updateTrackingPlan', () => {
    const updateData: UpdateTrackingPlanRequest = {
      name: 'Updated Tracking Plan',
      description: 'Updated description',
    };

    const updatedTrackingPlan: TrackingPlan = {
      ...mockTrackingPlan,
      name: 'Updated Tracking Plan',
      description: 'Updated description',
    };

    it('should update tracking plan successfully', async () => {
      // Arrange
      mockTrackingPlanRepository.findById.mockResolvedValue(mockTrackingPlan);
      mockTrackingPlanRepository.findByName.mockResolvedValue(null);
      mockTrackingPlanRepository.update.mockResolvedValue(updatedTrackingPlan);

      // Act
      const result = await trackingPlanService.updateTrackingPlan(1, updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedTrackingPlan);
      expect(result.message).toBe('Tracking plan updated successfully');
      expect(mockTrackingPlanRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTrackingPlanRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return error when tracking plan not found', async () => {
      // Arrange
      mockTrackingPlanRepository.findById.mockResolvedValue(null);

      // Act
      const result = await trackingPlanService.updateTrackingPlan(1, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND);
      expect(mockTrackingPlanRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when conflicting tracking plan exists', async () => {
      // Arrange
      const conflictingTrackingPlan = { ...mockTrackingPlan, id: 2 };
      mockTrackingPlanRepository.findById.mockResolvedValue(mockTrackingPlan);
      mockTrackingPlanRepository.findByName.mockResolvedValue(conflictingTrackingPlan);

      // Act
      const result = await trackingPlanService.updateTrackingPlan(1, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.TRACKING_PLAN_ALREADY_EXISTS);
      expect(mockTrackingPlanRepository.update).not.toHaveBeenCalled();
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockTrackingPlanRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await trackingPlanService.updateTrackingPlan(1, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('deleteTrackingPlan', () => {
    it('should delete tracking plan successfully', async () => {
      // Arrange
      mockTrackingPlanRepository.findById.mockResolvedValue(mockTrackingPlan);
      mockTrackingPlanRepository.delete.mockResolvedValue(true);

      // Act
      const result = await trackingPlanService.deleteTrackingPlan(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Tracking plan deleted successfully');
      expect(mockTrackingPlanRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTrackingPlanRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return error when tracking plan not found', async () => {
      // Arrange
      mockTrackingPlanRepository.findById.mockResolvedValue(null);

      // Act
      const result = await trackingPlanService.deleteTrackingPlan(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.TRACKING_PLAN_NOT_FOUND);
      expect(mockTrackingPlanRepository.delete).not.toHaveBeenCalled();
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockTrackingPlanRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await trackingPlanService.deleteTrackingPlan(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('processTrackingPlanEvents (private method)', () => {
    it('should process events successfully when events and properties exist', async () => {
      // Arrange
      mockEventRepository.findByNameAndType.mockResolvedValue(mockEvent);
      mockPropertyRepository.findByNameAndType.mockResolvedValue(mockProperty);

      // Act
      const result = await (trackingPlanService as any).processTrackingPlanEvents([mockTrackingPlanEvent]);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockTrackingPlanEvent]);
    });

    it('should create events and properties when they do not exist', async () => {
      // Arrange
      mockEventRepository.findByNameAndType.mockResolvedValue(null);
      mockEventRepository.create.mockResolvedValue(mockEvent);
      mockPropertyRepository.findByNameAndType.mockResolvedValue(null);
      mockPropertyRepository.create.mockResolvedValue(mockProperty);

      // Act
      const result = await (trackingPlanService as any).processTrackingPlanEvents([mockTrackingPlanEvent]);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockTrackingPlanEvent]);
      expect(mockEventRepository.create).toHaveBeenCalledWith({
        name: 'User Signed Up',
        type: 'track',
        description: 'Triggered when a user signs up',
      });
      expect(mockPropertyRepository.create).toHaveBeenCalledWith({
        name: 'user_id',
        type: 'string',
        description: 'Unique identifier for the user',
      });
    });

    it('should return error when event description conflicts', async () => {
      // Arrange
      const conflictingEvent = { ...mockEvent, description: 'Different description' };
      mockEventRepository.findByNameAndType.mockResolvedValue(conflictingEvent);

      // Act
      const result = await (trackingPlanService as any).processTrackingPlanEvents([mockTrackingPlanEvent]);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.EVENT_ALREADY_EXISTS);
      expect(result.message).toContain('already exists with a different description');
    });

    it('should return error when property description conflicts', async () => {
      // Arrange
      mockEventRepository.findByNameAndType.mockResolvedValue(mockEvent);
      const conflictingProperty = { ...mockProperty, description: 'Different description' };
      mockPropertyRepository.findByNameAndType.mockResolvedValue(conflictingProperty);

      // Act
      const result = await (trackingPlanService as any).processTrackingPlanEvents([mockTrackingPlanEvent]);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PROPERTY_ALREADY_EXISTS);
      expect(result.message).toContain('already exists with a different description');
    });
  });
}); 