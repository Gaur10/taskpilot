import { describe, it, expect, vi } from 'vitest';
import { checkRole } from '../checkRole.js';

describe('checkRole middleware', () => {
  it('should allow access when user has required role', () => {
    const req = {
      auth: {
        payload: {
          'https://taskpilot-api/roles': ['admin', 'user'],
        },
      },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = checkRole('user');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should deny access when user lacks required role', () => {
    const req = {
      auth: {
        payload: {
          'https://taskpilot-api/roles': ['user'],
        },
      },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = checkRole('admin');
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: 'Forbidden',
        requiredRole: 'admin',
      }),
    );
  });

  it('should deny access when roles claim is missing', () => {
    const req = {
      auth: {
        payload: {},
      },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = checkRole('user');
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
