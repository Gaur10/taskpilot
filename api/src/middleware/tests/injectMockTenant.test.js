import { describe, it, expect, vi, beforeEach } from 'vitest';
import { injectMockTenant } from '../injectMockTenant.js';

describe('injectMockTenant middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      auth: {
        payload: {},
      },
    };
    res = {};
    next = vi.fn();
    
    // Mock console.log to avoid test output noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should inject tenant-A when tenant claim is missing', () => {
    injectMockTenant(req, res, next);

    expect(req.auth.payload['https://taskpilot-api/tenant']).toBe('tenant-A');
    expect(next).toHaveBeenCalled();
  });

  it('should not override existing tenant', () => {
    req.auth.payload['https://taskpilot-api/tenant'] = 'tenant-B';

    injectMockTenant(req, res, next);

    expect(req.auth.payload['https://taskpilot-api/tenant']).toBe('tenant-B');
    expect(next).toHaveBeenCalled();
  });

  it('should initialize auth object if missing', () => {
    req = {};

    injectMockTenant(req, res, next);

    expect(req.auth).toBeDefined();
    expect(req.auth.payload).toBeDefined();
    expect(req.auth.payload['https://taskpilot-api/tenant']).toBe('tenant-A');
    expect(next).toHaveBeenCalled();
  });
});
