import './config/telemetry.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './config/logger.js';

import healthRouter from './routes/health.js';
import privateRouter from './routes/private.js';
import publicRouter from './routes/public.js';
import { injectMockRoles } from './middleware/mockRoles.js';
import { checkRole } from './middleware/checkRole.js';
import { injectMockTenant } from './middleware/injectMockTenant.js';
import taskRoutes from './routes/taskRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { checkJwt } from './middleware/checkJwt.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();
connectDB();
const app = express();

import { setupSwagger } from './swagger.js';
setupSwagger(app);

// Helper wrappers to ensure mock middleware runs only in non-production or when explicitly allowed
const allowMocks = (process.env.NODE_ENV !== 'production') || (process.env.ALLOW_MOCK_AUTH === 'true');

const maybeInjectMockRoles = (req, res, next) => {
  if (allowMocks) {return injectMockRoles(req, res, next);}
  next();
};

const maybeInjectMockTenant = (req, res, next) => {
  if (allowMocks) {return injectMockTenant(req, res, next);}
  next();
};

// Core middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [
          'http://localhost:5173', // Allow local development
          'https://taskpilot-mcs.pages.dev',
          'https://ff45c2cf.taskpilot-mcs.pages.dev',
          /https:\/\/.*\.taskpilot-mcs\.pages\.dev$/, // Allow all Cloudflare preview URLs
        ]
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json());

// Consolidated logging: send morgan output to our logger
app.use(
  morgan('tiny', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/private', privateRouter);
app.use('/api/public', publicRouter);
app.use('/api/ai', aiRoutes);

// Root
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'taskpilot-api' });
});

// Global error handler for auth & other middleware
app.use((err, _req, res, _next) => {
  console.error('Error:', err.name, err.message);
  if (err.name === 'InvalidRequestError' || err.name === 'UnauthorizedError') {
    const message = err.message || 'Missing or invalid Authorization token';
    return res.status(401).json({ error: 'Unauthorized', details: message});
  }
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});
  
// User route (mocked roles)
app.get('/api/user', requireAuth, maybeInjectMockRoles, maybeInjectMockTenant, checkRole('user'), (req, res) => {
  res.json({
    ok: true,
    message: 'User route accessed successfully!',
    roles: req.auth.payload['https://taskpilot-api/roles'],
    tenant: req.auth.payload['https://taskpilot-api/tenant'],
  });
});
  
// Admin route (mocked roles)
app.get('/api/admin', requireAuth, maybeInjectMockRoles, maybeInjectMockTenant, checkRole('admin'), (req, res) => {
  res.json({
    ok: true,
    message: 'Admin route accessed successfully!',
    roles: req.auth.payload['https://taskpilot-api/roles'],
    tenant: req.auth.payload['https://taskpilot-api/tenant'],
  });
});

// =====================
// 🏢 Tenant Info Route
// =====================

app.get('/api/tenant-info', requireAuth, maybeInjectMockRoles, maybeInjectMockTenant, (req, res)=> {
  const payload = req.auth.payload;

  res.json({
    ok: true,
    tenant: payload['https://taskpilot-api/tenant'],
    roles: payload['https://taskpilot-api/roles'],
    sub: payload.sub,
    iss: payload.iss,
    aud: payload.aud,
    message: '🔍 Current tenant and identity context',
  });

});

// === Task Routes (Family Calendar) ===
app.use('/api/tasks', taskRoutes);

// Temporary test route — will remove later
app.get('/api/protected', checkJwt, (req, res) => {
  res.json({
    ok: true,
    sub: req.auth?.payload?.sub,
  });
});


// Startup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});



export default app;
