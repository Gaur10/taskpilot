import './config/telemetry.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import logger from "./config/logger.js";

import healthRouter from './routes/health.js';
import privateRouter from './routes/private.js';
import publicRouter from './routes/public.js';
import { injectMockRoles } from "./middleware/mockRoles.js";
import { checkRole } from "./middleware/checkRole.js";
import { injectMockTenant } from "./middleware/injectMockTenant.js";
import projectRoutes from "./routes/projectRoutes.js";
import { checkJwt } from "./middleware/checkJwt.js";
import pkg from "express-oauth2-jwt-bearer";
const { auth } = pkg;

const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
});
// import pkg from "express-oauth2-jwt-bearer";
// const { auth, requiredScopes, claimCheck, requireAuth } = pkg;


dotenv.config();
connectDB();
const app = express();

import { setupSwagger } from "./swagger.js";
setupSwagger(app);

app.use(express.json()); // parse JSON bodies

// Core middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Log all incoming HTTP requests
app.use(
    morgan("tiny", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );

// Routes
app.use('/api/health', healthRouter);
app.use('/api/private', privateRouter);
app.use('/api/public', publicRouter);

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
  app.get("/api/user", requireAuth, injectMockRoles, injectMockTenant, checkRole("user"), (req, res) => {
    res.json({
      ok: true,
      message: "User route accessed successfully!",
      roles: req.auth.payload["https://taskpilot-api/roles"],
      tenant: req.auth.payload["https://taskpilot-api/tenant"]
    });
  });
  
  // Admin route (mocked roles)
  app.get("/api/admin", requireAuth, injectMockRoles, injectMockTenant, checkRole("admin"), (req, res) => {
    res.json({
      ok: true,
      message: "Admin route accessed successfully!",
      roles: req.auth.payload["https://taskpilot-api/roles"],
      tenant: req.auth.payload["https://taskpilot-api/tenant"],
    });
  });

  // =====================
// 🏢 Tenant Info Route
// =====================

app.get("/api/tenant-info",requireAuth, injectMockRoles, injectMockTenant, (req, res)=> {
    const payload = req.auth.payload;

    res.json({
      ok: true,
      tenant: payload["https://taskpilot-api/tenant"],
      roles: payload["https://taskpilot-api/roles"],
      sub: payload.sub,
      iss: payload.iss,
      aud: payload.aud,
      message: "🔍 Current tenant and identity context",
    })

});

// === New Project Routes ===
app.use("/api/projects", projectRoutes);

// Temporary test route — will remove later
app.get("/api/protected", checkJwt, (req, res) => {
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



export default app
