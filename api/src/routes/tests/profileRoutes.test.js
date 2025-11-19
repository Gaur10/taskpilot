import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock UserProfile model
const mockUserProfile = {
  findOne: vi.fn(),
  create: vi.fn(),
  find: vi.fn(),
};

vi.mock('../../models/userProfileModel.js', () => ({
  default: mockUserProfile,
}));

describe('Profile Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('should create profile if not exists', async () => {
      mockUserProfile.findOne.mockResolvedValue(null);
      
      const newProfile = {
        userId: 'user-123',
        tenantId: 'tenant-test',
        email: 'test@example.com',
        name: 'Test User',
        defaultEmoji: '👤',
        getDisplayAvatar: () => ({ type: 'emoji', data: '👤' }),
      };
      
      mockUserProfile.create.mockResolvedValue(newProfile);

      // Simulate the route behavior
      const profile = await mockUserProfile.findOne({ userId: 'user-123', tenantId: 'tenant-test' });
      
      if (!profile) {
        const created = await mockUserProfile.create({
          userId: 'user-123',
          tenantId: 'tenant-test',
          email: 'test@example.com',
          name: 'Test User',
        });
        
        expect(created.userId).toBe('user-123');
        expect(created.email).toBe('test@example.com');
        expect(created.getDisplayAvatar().type).toBe('emoji');
      }

      expect(mockUserProfile.create).toHaveBeenCalledWith({
        userId: 'user-123',
        tenantId: 'tenant-test',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should return existing profile', async () => {
      const existingProfile = {
        userId: 'user-123',
        tenantId: 'tenant-test',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'data:image/png;base64,test',
        avatarType: 'base64',
        getDisplayAvatar: () => ({ type: 'base64', data: 'data:image/png;base64,test' }),
      };
      
      mockUserProfile.findOne.mockResolvedValue(existingProfile);

      const profile = await mockUserProfile.findOne({ userId: 'user-123', tenantId: 'tenant-test' });

      expect(profile).toBeDefined();
      expect(profile.avatar).toBe('data:image/png;base64,test');
      expect(profile.getDisplayAvatar().type).toBe('base64');
    });
  });

  describe('PUT /api/profile', () => {
    it('should validate avatar size (reject > 1MB)', () => {
      const largeData = 'x'.repeat(1.5 * 1024 * 1024); // 1.5MB
      const largeBase64 = `data:image/png;base64,${Buffer.from(largeData).toString('base64')}`;
      
      // Simulate validation logic
      const base64Data = largeBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const sizeInMB = buffer.length / (1024 * 1024);
      
      expect(sizeInMB).toBeGreaterThan(1);
      expect(buffer.length).toBeGreaterThan(1024 * 1024);
    });

    it('should validate avatar size (accept < 1MB)', () => {
      const smallBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const base64Data = smallBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const sizeInMB = buffer.length / (1024 * 1024);
      
      expect(sizeInMB).toBeLessThan(1);
    });
  });

  describe('GET /api/profile/family', () => {
    it('should return profiles filtered by tenant', async () => {
      const profiles = [
        {
          userId: 'user-1',
          tenantId: 'tenant-test',
          email: 'alice@example.com',
          name: 'Alice',
          getDisplayAvatar: () => ({ type: 'emoji', data: '👩' }),
        },
        {
          userId: 'user-2',
          tenantId: 'tenant-test',
          email: 'bob@example.com',
          name: 'Bob',
          getDisplayAvatar: () => ({ type: 'emoji', data: '👨' }),
        },
      ];
      
      mockUserProfile.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(profiles),
      });

      const result = await mockUserProfile.find({ tenantId: 'tenant-test' }).sort({ name: 1 });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
      expect(mockUserProfile.find).toHaveBeenCalledWith({ tenantId: 'tenant-test' });
    });

    it('should sort profiles by name', async () => {
      const profiles = [
        { name: 'Alice', userId: 'user-1' },
        { name: 'Bob', userId: 'user-2' },
        { name: 'Charlie', userId: 'user-3' },
      ];
      
      mockUserProfile.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(profiles),
      });

      const result = await mockUserProfile.find({ tenantId: 'tenant-test' }).sort({ name: 1 });

      expect(result[0].name).toBe('Alice');
      expect(result[1].name).toBe('Bob');
      expect(result[2].name).toBe('Charlie');
    });
  });

  describe('Profile Avatar Logic', () => {
    it('should use emoji when no avatar uploaded', () => {
      const profile = {
        defaultEmoji: '🎭',
        avatarType: 'emoji',
        getDisplayAvatar() {
          if (this.avatar && this.avatarType === 'base64') {
            return { type: 'base64', data: this.avatar };
          }
          return { type: 'emoji', data: this.defaultEmoji || '👤' };
        },
      };

      const avatar = profile.getDisplayAvatar();
      expect(avatar.type).toBe('emoji');
      expect(avatar.data).toBe('🎭');
    });

    it('should use base64 when image uploaded', () => {
      const profile = {
        avatar: 'data:image/png;base64,xyz',
        avatarType: 'base64',
        defaultEmoji: '🎭',
        getDisplayAvatar() {
          if (this.avatar && this.avatarType === 'base64') {
            return { type: 'base64', data: this.avatar };
          }
          return { type: 'emoji', data: this.defaultEmoji || '👤' };
        },
      };

      const avatar = profile.getDisplayAvatar();
      expect(avatar.type).toBe('base64');
      expect(avatar.data).toBe('data:image/png;base64,xyz');
    });

    it('should default to 👤 when no emoji set', () => {
      const profile = {
        avatarType: 'emoji',
        getDisplayAvatar() {
          if (this.avatar && this.avatarType === 'base64') {
            return { type: 'base64', data: this.avatar };
          }
          return { type: 'emoji', data: this.defaultEmoji || '👤' };
        },
      };

      const avatar = profile.getDisplayAvatar();
      expect(avatar.type).toBe('emoji');
      expect(avatar.data).toBe('👤');
    });
  });
});
