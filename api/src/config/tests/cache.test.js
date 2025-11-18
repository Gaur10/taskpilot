import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getCachedTasks, setCachedTasks, invalidateCache, getCacheKey } from '../../config/cache.js';

describe('Cache Service', () => {
  const testTenantA = 'tenant-test-a';
  const testTenantB = 'tenant-test-b';
  const mockTasks = [
    { _id: '1', name: 'Task 1', tenantId: testTenantA },
    { _id: '2', name: 'Task 2', tenantId: testTenantA },
    { _id: '3', name: 'Task 3', tenantId: testTenantA },
  ];

  // Clear cache before each test
  beforeEach(() => {
    invalidateCache(testTenantA);
    invalidateCache(testTenantB);
  });

  describe('getCacheKey', () => {
    it('should generate correct cache key format', () => {
      const key = getCacheKey(testTenantA);
      expect(key).toBe('tasks:tenant-test-a');
    });

    it('should generate unique keys for different tenants', () => {
      const keyA = getCacheKey(testTenantA);
      const keyB = getCacheKey(testTenantB);
      expect(keyA).not.toBe(keyB);
    });
  });

  describe('setCachedTasks and getCachedTasks', () => {
    it('should cache and retrieve tasks for a tenant', () => {
      // Set cache
      setCachedTasks(testTenantA, mockTasks);

      // Get from cache
      const cached = getCachedTasks(testTenantA);

      expect(cached).toBeDefined();
      expect(cached).toHaveLength(3);
      expect(cached[0].name).toBe('Task 1');
    });

    it('should return undefined for cache miss', () => {
      const cached = getCachedTasks('non-existent-tenant');
      expect(cached).toBeUndefined();
    });

    it('should return cloned data to prevent mutation', () => {
      setCachedTasks(testTenantA, mockTasks);
      
      const cached1 = getCachedTasks(testTenantA);
      const cached2 = getCachedTasks(testTenantA);

      // Modify first cached result
      cached1[0].name = 'Modified Task';

      // Second cached result should be unchanged (due to cloning)
      expect(cached2[0].name).toBe('Task 1');
    });

    it('should handle empty task arrays', () => {
      setCachedTasks(testTenantA, []);
      const cached = getCachedTasks(testTenantA);

      expect(cached).toBeDefined();
      expect(cached).toHaveLength(0);
    });
  });

  describe('invalidateCache', () => {
    it('should remove cached tasks for a tenant', () => {
      // Cache tasks
      setCachedTasks(testTenantA, mockTasks);
      
      // Verify cached
      let cached = getCachedTasks(testTenantA);
      expect(cached).toBeDefined();

      // Invalidate
      invalidateCache(testTenantA);

      // Verify cache miss
      cached = getCachedTasks(testTenantA);
      expect(cached).toBeUndefined();
    });

    it('should not affect other tenants when invalidating', () => {
      const tasksA = [{ _id: '1', name: 'Task A', tenantId: testTenantA }];
      const tasksB = [{ _id: '2', name: 'Task B', tenantId: testTenantB }];

      // Cache for both tenants
      setCachedTasks(testTenantA, tasksA);
      setCachedTasks(testTenantB, tasksB);

      // Invalidate only tenant A
      invalidateCache(testTenantA);

      // Tenant A should be cleared
      expect(getCachedTasks(testTenantA)).toBeUndefined();

      // Tenant B should still be cached
      const cachedB = getCachedTasks(testTenantB);
      expect(cachedB).toBeDefined();
      expect(cachedB[0].name).toBe('Task B');
    });
  });

  describe('Multi-tenant isolation', () => {
    it('should maintain separate caches for different tenants', () => {
      const tasksA = [
        { _id: '1', name: 'Family A Task 1', tenantId: testTenantA },
        { _id: '2', name: 'Family A Task 2', tenantId: testTenantA },
      ];
      const tasksB = [
        { _id: '3', name: 'Family B Task 1', tenantId: testTenantB },
      ];

      // Cache for both tenants
      setCachedTasks(testTenantA, tasksA);
      setCachedTasks(testTenantB, tasksB);

      // Retrieve and verify separation
      const cachedA = getCachedTasks(testTenantA);
      const cachedB = getCachedTasks(testTenantB);

      expect(cachedA).toHaveLength(2);
      expect(cachedB).toHaveLength(1);
      expect(cachedA[0].name).toBe('Family A Task 1');
      expect(cachedB[0].name).toBe('Family B Task 1');
    });

    it('should handle multiple tenants with same task IDs', () => {
      const tasksA = [{ _id: 'task-1', name: 'Family A Version', tenantId: testTenantA }];
      const tasksB = [{ _id: 'task-1', name: 'Family B Version', tenantId: testTenantB }];

      setCachedTasks(testTenantA, tasksA);
      setCachedTasks(testTenantB, tasksB);

      const cachedA = getCachedTasks(testTenantA);
      const cachedB = getCachedTasks(testTenantB);

      expect(cachedA[0].name).toBe('Family A Version');
      expect(cachedB[0].name).toBe('Family B Version');
    });
  });

  describe('Cache behavior', () => {
    it('should overwrite existing cache when setting new data', () => {
      const initialTasks = [{ _id: '1', name: 'Initial Task' }];
      const updatedTasks = [
        { _id: '1', name: 'Updated Task' },
        { _id: '2', name: 'New Task' },
      ];

      setCachedTasks(testTenantA, initialTasks);
      setCachedTasks(testTenantA, updatedTasks);

      const cached = getCachedTasks(testTenantA);
      expect(cached).toHaveLength(2);
      expect(cached[0].name).toBe('Updated Task');
    });

    it('should handle rapid cache operations', () => {
      // Simulate rapid create/update/invalidate cycle
      setCachedTasks(testTenantA, mockTasks);
      expect(getCachedTasks(testTenantA)).toBeDefined();

      invalidateCache(testTenantA);
      expect(getCachedTasks(testTenantA)).toBeUndefined();

      setCachedTasks(testTenantA, mockTasks);
      expect(getCachedTasks(testTenantA)).toBeDefined();

      invalidateCache(testTenantA);
      expect(getCachedTasks(testTenantA)).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in tenant ID', () => {
      const specialTenant = 'tenant-with-special-chars_123@test';
      const tasks = [{ _id: '1', name: 'Task' }];

      setCachedTasks(specialTenant, tasks);
      const cached = getCachedTasks(specialTenant);

      expect(cached).toBeDefined();
      expect(cached).toHaveLength(1);
    });

    it('should handle large task arrays', () => {
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        _id: `task-${i}`,
        name: `Task ${i}`,
        tenantId: testTenantA,
      }));

      setCachedTasks(testTenantA, largeTasks);
      const cached = getCachedTasks(testTenantA);

      expect(cached).toBeDefined();
      expect(cached).toHaveLength(1000);
    });

    it('should handle tasks with complex nested data', () => {
      const complexTasks = [
        {
          _id: '1',
          name: 'Complex Task',
          activityLog: [
            { action: 'created', timestamp: new Date() },
            { action: 'updated', timestamp: new Date() },
          ],
          assignedToEmail: 'user@example.com',
          tags: ['urgent', 'important'],
        },
      ];

      setCachedTasks(testTenantA, complexTasks);
      const cached = getCachedTasks(testTenantA);

      expect(cached).toBeDefined();
      expect(cached[0].activityLog).toHaveLength(2);
      expect(cached[0].tags).toContain('urgent');
    });
  });
});
