// api/middleware/mockRoles.js

export const injectMockRoles = (req, res, next) => {
  // Injects mock roles if missing (local-only)
  if (!req.auth?.payload?.['https://taskpilot-api/roles']) {
    req.auth = req.auth || {};
    req.auth.payload = req.auth.payload || {};
  
    // You can toggle "admin" or "user" here
    req.auth.payload['https://taskpilot-api/roles'] = ['admin'];
  }
  console.log('🔍 After injecting roles  - req.auth = ', JSON.stringify(req.auth, null, 2));
  next();
};