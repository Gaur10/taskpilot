import { describe, it, expect, vi, beforeEach } from 'vitest';
import { injectMockRoles } from '../mockRoles.js';

describe('injectMockRoles middleware', () => {
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

  it('should inject admin role when roles claim is missing', () => {
    injectMockRoles(req, res, next);

    expect(req.auth.payload['https://taskpilot-api/roles']).toEqual(['admin']);
    expect(next).toHaveBeenCalled();
  });

  it('should not override existing roles', () => {
    req.auth.payload['https://taskpilot-api/roles'] = ['user'];

    injectMockRoles(req, res, next);

    expect(req.auth.payload['https://taskpilot-api/roles']).toEqual(['user']);
    expect(next).toHaveBeenCalled();
  });

  it('should initialize auth object if missing', () => {
    req = {};

    injectMockRoles(req, res, next);

    expect(req.auth).toBeDefined();
    expect(req.auth.payload).toBeDefined();
    expect(req.auth.payload['https://taskpilot-api/roles']).toEqual(['admin']);
    expect(next).toHaveBeenCalled();
  });
});
