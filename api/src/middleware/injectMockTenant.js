// api/middleware/injectMockTenant.js

export const injectMockTenant = (req, res, next) => {
  // Ensure req.auth and payload exist (safe for first-time calls)
  req.auth = req.auth || {};
  req.auth.payload = req.auth.payload || {};
  
  // Inject a mock tenant claim if missing
  if (!req.auth.payload['https://taskpilot-api/tenant']) {
    req.auth.payload['https://taskpilot-api/tenant'] = 'tenant-A';
  }
  
  // Optional: log for visibility
  console.log('🔍 After injecting tenant  - req.auth = ', JSON.stringify(req.auth, null, 2));

  
  next(); // continue down the chain
};
  