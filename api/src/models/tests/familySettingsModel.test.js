import { describe, it, expect, beforeEach } from 'vitest';
import FamilySettings from '../../models/familySettingsModel.js';

describe('FamilySettings Model', () => {
  beforeEach(() => {
    // Model validation tests don't require DB connection
  });

  describe('Schema validation', () => {
    it('should create settings with valid data', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          groceryStores: ['Whole Foods', 'Trader Joes'],
          schools: [
            { name: 'Lincoln High', pickupTime: '3:15 PM', location: 'Downtown' },
          ],
          neighborhood: 'Seattle Downtown',
          routines: {
            groceryShopping: 'Usually shop on weekends',
            schoolPickup: 'Leave 10 mins early',
            other: 'Some other routine',
          },
        },
      });

      expect(settings.tenantId).toBe('test-tenant');
      expect(settings.preferences.groceryStores).toHaveLength(2);
      expect(settings.preferences.schools).toHaveLength(1);
      expect(settings.preferences.neighborhood).toBe('Seattle Downtown');
    });

    it('should have default empty values for preferences', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
      });

      expect(settings.preferences.groceryStores).toEqual([]);
      expect(settings.preferences.schools).toEqual([]);
      expect(settings.preferences.neighborhood).toBe('');
      expect(settings.preferences.routines.groceryShopping).toBe('');
      expect(settings.preferences.routines.schoolPickup).toBe('');
      expect(settings.preferences.routines.other).toBe('');
    });

    it('should require tenantId', () => {
      const settings = new FamilySettings({
        preferences: {
          groceryStores: ['Store 1'],
        },
      });

      const error = settings.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.tenantId).toBeDefined();
    });

    it('should validate max 10 grocery stores', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          groceryStores: Array(11).fill('Store'),
        },
      });

      const error = settings.validateSync();
      expect(error).toBeDefined();
      expect(error.errors['preferences.groceryStores']).toBeDefined();
    });

    it('should validate max 5 schools', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          schools: Array(6).fill({ name: 'School' }),
        },
      });

      const error = settings.validateSync();
      expect(error).toBeDefined();
      expect(error.errors['preferences.schools']).toBeDefined();
    });

    it('should enforce maxlength on neighborhood (200 chars)', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          neighborhood: 'a'.repeat(201),
        },
      });

      const error = settings.validateSync();
      expect(error).toBeDefined();
      expect(error.errors['preferences.neighborhood']).toBeDefined();
    });

    it('should enforce maxlength on routine fields', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          routines: {
            groceryShopping: 'a'.repeat(201),
            schoolPickup: 'b'.repeat(201),
            other: 'c'.repeat(501),
          },
        },
      });

      const error = settings.validateSync();
      expect(error).toBeDefined();
      expect(error.errors['preferences.routines.groceryShopping']).toBeDefined();
      expect(error.errors['preferences.routines.schoolPickup']).toBeDefined();
      expect(error.errors['preferences.routines.other']).toBeDefined();
    });
  });

  describe('getAIContext method', () => {
    it('should format empty preferences as empty string', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
      });

      const context = settings.getAIContext();
      expect(context).toBe('');
    });

    it('should format neighborhood only', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          neighborhood: 'Seattle Downtown',
        },
      });

      const context = settings.getAIContext();
      expect(context).toContain('Location: Seattle Downtown');
    });

    it('should format grocery stores', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          groceryStores: ['Whole Foods', 'Trader Joes', 'Safeway'],
        },
      });

      const context = settings.getAIContext();
      expect(context).toContain('Preferred stores: Whole Foods, Trader Joes, Safeway');
    });

    it('should format schools with all details', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          schools: [
            { name: 'Lincoln High', pickupTime: '3:15 PM', location: 'Downtown' },
            { name: 'Elementary School', pickupTime: '2:45 PM' },
          ],
        },
      });

      const context = settings.getAIContext();
      expect(context).toContain('Schools:');
      expect(context).toContain('Lincoln High pickup at 3:15 PM (Downtown)');
      expect(context).toContain('Elementary School pickup at 2:45 PM');
    });

    it('should format routines', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          routines: {
            groceryShopping: 'Shop on weekends',
            schoolPickup: 'Leave 10 mins early',
            other: 'Walk the dog daily',
          },
        },
      });

      const context = settings.getAIContext();
      expect(context).toContain('Shopping routine: Shop on weekends');
      expect(context).toContain('School pickup routine: Leave 10 mins early');
      expect(context).toContain('Other notes: Walk the dog daily');
    });

    it('should format complete settings into comprehensive context', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          neighborhood: 'Seattle Downtown near Pike Place',
          groceryStores: ['Whole Foods', 'Trader Joes'],
          schools: [
            { name: 'Lincoln High', pickupTime: '3:15 PM', location: 'Main St' },
          ],
          routines: {
            groceryShopping: 'Usually shop on weekends, prefer organic',
            schoolPickup: 'Leave 10 mins early for traffic',
            other: 'Avoid I-5 during rush hour',
          },
        },
      });

      const context = settings.getAIContext();
      
      expect(context).toContain('Location: Seattle Downtown near Pike Place');
      expect(context).toContain('Preferred stores: Whole Foods, Trader Joes');
      expect(context).toContain('Schools: Lincoln High pickup at 3:15 PM (Main St)');
      expect(context).toContain('Shopping routine: Usually shop on weekends, prefer organic');
      expect(context).toContain('School pickup routine: Leave 10 mins early for traffic');
      expect(context).toContain('Other notes: Avoid I-5 during rush hour');
      
      // Verify it's newline separated
      const lines = context.split('\n');
      expect(lines.length).toBe(6);
    });

    it('should handle schools with partial information', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
        preferences: {
          schools: [
            { name: 'School A' },
            { name: 'School B', pickupTime: '3:00 PM' },
            { name: 'School C', location: 'West Side' },
          ],
        },
      });

      const context = settings.getAIContext();
      expect(context).toContain('School A');
      expect(context).toContain('School B pickup at 3:00 PM');
      expect(context).toContain('School C (West Side)');
    });
  });

  describe('Schema fields', () => {
    it('should have timestamps enabled', () => {
      const settings = new FamilySettings({
        tenantId: 'test-tenant',
      });

      // Check that schema includes timestamps
      expect(settings.schema.options.timestamps).toBe(true);
    });

    it('should have tenantId indexed', () => {
      const indexes = FamilySettings.schema.indexes();
      const tenantIdIndex = indexes.find(idx => idx[0].tenantId);
      expect(tenantIdIndex).toBeDefined();
    });

    it('should enforce unique tenantId constraint', () => {
      const schema = FamilySettings.schema;
      expect(schema.path('tenantId').options.unique).toBe(true);
    });
  });
});
