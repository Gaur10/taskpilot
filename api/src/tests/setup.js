// Test setup file
import { beforeAll, afterAll } from 'vitest';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
process.env.AUTH0_ISSUER = 'https://test-tenant.auth0.com/';
process.env.AUTH0_AUDIENCE = 'https://taskpilot-api-test';
process.env.MONGO_URI = 'mongodb://localhost:27017/taskpilot-test';
process.env.ALLOW_MOCK_AUTH = 'true';

beforeAll(() => {
  console.log('🧪 Test environment initialized');
});

afterAll(() => {
  console.log('🧪 Test suite completed');
});
