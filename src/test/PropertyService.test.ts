/**
 * PropertyService test suite
 * Demonstrates testing approach for the application
 */
import { PropertyService } from '../services/PropertyService';
import { IPropertyRepository } from '../dal/interfaces/IPropertyRepository';
import { Property, CreatePropertyRequest, UpdatePropertyRequest, PropertyQueryParams } from '../types';
import { ERROR_MESSAGES } from '../constants';

describe('PropertyService', () => {
  let propertyService: PropertyService;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;

  const mockProperty: Property = {
    id: 1,
    name: 'user_id',
    type: 'string',
    description: 'Unique identifier for the user',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockCreatePropertyRequest: CreatePropertyRequest = {
    name: 'user_id',
    type: 'string',
    description: 'Unique identifier for the user',
  };

  beforeEach(() => {
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

    propertyService = new PropertyService(mockPropertyRepository);
    jest.clearAllMocks();
  });

  describe('createProperty', () => {
    it('should create a property successfully', async () => {
      // Arrange
      mockPropertyRepository.findByNameAndType.mockResolvedValue(null);
      mockPropertyRepository.create.mockResolvedValue(mockProperty);

      // Act
      const result = await propertyService.createProperty(mockCreatePropertyRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProperty);
      expect(result.message).toBe('Property created successfully');
      expect(mockPropertyRepository.findByNameAndType).toHaveBeenCalledWith('user_id', 'string');
      expect(mockPropertyRepository.create).toHaveBeenCalledWith(mockCreatePropertyRequest);
    });

    it('should return error when property already exists', async () => {
      // Arrange
      mockPropertyRepository.findByNameAndType.mockResolvedValue(mockProperty);

      // Act
      const result = await propertyService.createProperty(mockCreatePropertyRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PROPERTY_ALREADY_EXISTS);
      expect(mockPropertyRepository.create).not.toHaveBeenCalled();
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockPropertyRepository.findByNameAndType.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await propertyService.createProperty(mockCreatePropertyRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('getPropertyById', () => {
    it('should return property when found', async () => {
      // Arrange
      mockPropertyRepository.findById.mockResolvedValue(mockProperty);

      // Act
      const result = await propertyService.getPropertyById(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProperty);
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return error when property not found', async () => {
      // Arrange
      mockPropertyRepository.findById.mockResolvedValue(null);

      // Act
      const result = await propertyService.getPropertyById(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PROPERTY_NOT_FOUND);
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockPropertyRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await propertyService.getPropertyById(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('getProperties', () => {
    it('should return paginated properties', async () => {
      // Arrange
      const mockPaginatedResponse = {
        success: true,
        data: [mockProperty],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
      mockPropertyRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await propertyService.getProperties({ page: 1, limit: 10 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPaginatedResponse);
      expect(mockPropertyRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockPropertyRepository.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await propertyService.getProperties({ page: 1, limit: 10 });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('updateProperty', () => {
    const updateData: UpdatePropertyRequest = {
      name: 'updated_user_id',
      description: 'Updated description',
    };

    const updatedProperty: Property = {
      ...mockProperty,
      name: 'updated_user_id',
      description: 'Updated description',
    };

    it('should update property successfully', async () => {
      // Arrange
      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockPropertyRepository.findByNameAndType.mockResolvedValue(null);
      mockPropertyRepository.update.mockResolvedValue(updatedProperty);

      // Act
      const result = await propertyService.updateProperty(1, updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedProperty);
      expect(result.message).toBe('Property updated successfully');
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(1);
      expect(mockPropertyRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return error when property not found', async () => {
      // Arrange
      mockPropertyRepository.findById.mockResolvedValue(null);

      // Act
      const result = await propertyService.updateProperty(1, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PROPERTY_NOT_FOUND);
      expect(mockPropertyRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when conflicting property exists', async () => {
      // Arrange
      const conflictingProperty = { ...mockProperty, id: 2 };
      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockPropertyRepository.findByNameAndType.mockResolvedValue(conflictingProperty);

      // Act
      const result = await propertyService.updateProperty(1, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PROPERTY_ALREADY_EXISTS);
      expect(mockPropertyRepository.update).not.toHaveBeenCalled();
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockPropertyRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await propertyService.updateProperty(1, updateData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('deleteProperty', () => {
    it('should delete property successfully', async () => {
      // Arrange
      mockPropertyRepository.findById.mockResolvedValue(mockProperty);
      mockPropertyRepository.delete.mockResolvedValue(true);

      // Act
      const result = await propertyService.deleteProperty(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Property deleted successfully');
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith(1);
      expect(mockPropertyRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return error when property not found', async () => {
      // Arrange
      mockPropertyRepository.findById.mockResolvedValue(null);

      // Act
      const result = await propertyService.deleteProperty(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PROPERTY_NOT_FOUND);
      expect(mockPropertyRepository.delete).not.toHaveBeenCalled();
    });

    it('should return internal error when repository throws', async () => {
      // Arrange
      mockPropertyRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await propertyService.deleteProperty(1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      expect(result.message).toBe('Database error');
    });
  });

  describe('propertyExists', () => {
    it('should return true when property exists', async () => {
      // Arrange
      mockPropertyRepository.existsByNameAndType.mockResolvedValue(true);

      // Act
      const result = await propertyService.propertyExists('user_id', 'string');

      // Assert
      expect(result).toBe(true);
      expect(mockPropertyRepository.existsByNameAndType).toHaveBeenCalledWith('user_id', 'string');
    });

    it('should return false when property does not exist', async () => {
      // Arrange
      mockPropertyRepository.existsByNameAndType.mockResolvedValue(false);

      // Act
      const result = await propertyService.propertyExists('user_id', 'string');

      // Assert
      expect(result).toBe(false);
      expect(mockPropertyRepository.existsByNameAndType).toHaveBeenCalledWith('user_id', 'string');
    });
  });

  describe('findPropertiesByNamesAndTypes', () => {
    it('should return properties when found', async () => {
      // Arrange
      const properties = [{ name: 'user_id', type: 'string' }];
      mockPropertyRepository.findByNamesAndTypes.mockResolvedValue([mockProperty]);

      // Act
      const result = await propertyService.findPropertiesByNamesAndTypes(properties);

      // Assert
      expect(result).toEqual([mockProperty]);
      expect(mockPropertyRepository.findByNamesAndTypes).toHaveBeenCalledWith(properties);
    });

    it('should return empty array when no properties found', async () => {
      // Arrange
      const properties = [{ name: 'user_id', type: 'string' }];
      mockPropertyRepository.findByNamesAndTypes.mockResolvedValue([]);

      // Act
      const result = await propertyService.findPropertiesByNamesAndTypes(properties);

      // Assert
      expect(result).toEqual([]);
      expect(mockPropertyRepository.findByNamesAndTypes).toHaveBeenCalledWith(properties);
    });
  });
}); 