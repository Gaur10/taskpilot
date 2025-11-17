import { describe, it, expect, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import Project from '../projectModel.js';

describe('Project Model', () => {
  beforeAll(async () => {
    // Mock mongoose connection - don't actually connect in unit tests
    if (!mongoose.connection.readyState) {
      mongoose.connect = () => Promise.resolve();
    }
  });

  it('should have required fields defined', () => {
    const schema = Project.schema.obj;
    
    expect(schema.ownerSub).toBeDefined();
    expect(schema.ownerSub.required).toBe(true);
    expect(schema.name).toBeDefined();
    expect(schema.name.required).toBe(true);
    expect(schema.tenantId).toBeDefined();
    expect(schema.tenantId.required).toBe(true);
  });

  it('should have correct default values', () => {
    const schema = Project.schema.obj;
    
    expect(schema.status.default).toBe('active');
    expect(schema.status.enum).toEqual(['active', 'completed', 'archived']);
    expect(schema.description.default).toBe('');
  });

  it('should trim name and description fields', () => {
    const schema = Project.schema.obj;
    
    expect(schema.name.trim).toBe(true);
    expect(schema.description.trim).toBe(true);
  });

  it('should have timestamps enabled', () => {
    const options = Project.schema.options;
    
    expect(options.timestamps).toBe(true);
  });

  it('should have indexes defined', () => {
    const indexes = Project.schema.indexes();
    
    // Check if tenantId and ownerSub indexes exist
    const hasTenantOwnerIndex = indexes.some(
      (index) => index[0].tenantId === 1 && index[0].ownerSub === 1,
    );
    const hasTenantStatusIndex = indexes.some(
      (index) => index[0].tenantId === 1 && index[0].status === 1,
    );
    
    expect(hasTenantOwnerIndex).toBe(true);
    expect(hasTenantStatusIndex).toBe(true);
  });
});
