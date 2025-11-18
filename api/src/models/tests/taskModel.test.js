import { describe, it, expect, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import Task from '../taskModel.js';

describe('Task Model (Family Calendar)', () => {
  beforeAll(async () => {
    // Mock mongoose connection - don't actually connect in unit tests
    if (!mongoose.connection.readyState) {
      mongoose.connect = () => Promise.resolve();
    }
  });

  it('should have required fields defined', () => {
    const schema = Task.schema.obj;
    
    expect(schema.ownerSub).toBeDefined();
    expect(schema.ownerSub.required).toBe(true);
    expect(schema.name).toBeDefined();
    expect(schema.name.required).toBe(true);
    expect(schema.tenantId).toBeDefined();
    expect(schema.tenantId.required).toBe(true);
    expect(schema.createdByEmail).toBeDefined();
    expect(schema.createdByEmail.required).toBe(true);
    expect(schema.createdByName).toBeDefined();
    expect(schema.createdByName.required).toBe(true);
  });

  it('should have family calendar assignment fields', () => {
    const schema = Task.schema.obj;
    
    expect(schema.assignedToEmail).toBeDefined();
    expect(schema.assignedToEmail.default).toBe(null);
    expect(schema.assignedToName).toBeDefined();
    expect(schema.assignedToName.default).toBe(null);
  });

  it('should have correct status enum values', () => {
    const schema = Task.schema.obj;
    
    expect(schema.status.default).toBe('todo');
    expect(schema.status.enum).toEqual(['todo', 'in-progress', 'done']);
  });

  it('should have correct default values', () => {
    const schema = Task.schema.obj;
    
    expect(schema.description.default).toBe('');
    expect(schema.tags.default).toEqual([]);
  });

  it('should trim string fields', () => {
    const schema = Task.schema.obj;
    
    expect(schema.name.trim).toBe(true);
    expect(schema.description.trim).toBe(true);
    expect(schema.assignedToEmail.trim).toBe(true);
    expect(schema.assignedToName.trim).toBe(true);
    expect(schema.createdByEmail.trim).toBe(true);
    expect(schema.createdByName.trim).toBe(true);
  });

  it('should have timestamps enabled', () => {
    const options = Task.schema.options;
    
    expect(options.timestamps).toBe(true);
  });

  it('should have family calendar indexes defined', () => {
    const indexes = Task.schema.indexes();
    
    // Check family calendar indexes
    const hasTenantOwnerIndex = indexes.some(
      (index) => index[0].tenantId === 1 && index[0].ownerSub === 1,
    );
    const hasTenantStatusIndex = indexes.some(
      (index) => index[0].tenantId === 1 && index[0].status === 1,
    );
    const hasTenantAssignedIndex = indexes.some(
      (index) => index[0].tenantId === 1 && index[0].assignedToEmail === 1,
    );
    const hasTenantDueDateIndex = indexes.some(
      (index) => index[0].tenantId === 1 && index[0].dueDate === 1,
    );
    
    expect(hasTenantOwnerIndex).toBe(true);
    expect(hasTenantStatusIndex).toBe(true);
    expect(hasTenantAssignedIndex).toBe(true);
    expect(hasTenantDueDateIndex).toBe(true);
  });

  it('should have activityLog array for task history', () => {
    const schema = Task.schema.obj;
    
    expect(schema.activityLog).toBeDefined();
    expect(Array.isArray(schema.activityLog)).toBe(true);
    
    // Check activityLog schema structure
    const activityLogSchema = schema.activityLog[0];
    expect(activityLogSchema.action).toBeDefined();
    expect(activityLogSchema.action.enum).toEqual([
      'created', 'assigned', 'reassigned', 'unassigned', 'status_changed', 'updated', 'completed',
    ]);
    expect(activityLogSchema.performedBy).toBeDefined();
    expect(activityLogSchema.performedByName).toBeDefined();
    expect(activityLogSchema.timestamp).toBeDefined();
  });

  it('should have isOverdue virtual property', () => {
    const virtuals = Task.schema.virtuals;
    
    expect(virtuals.isOverdue).toBeDefined();
  });
});
