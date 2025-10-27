import { Router } from 'express';
import pkg from "express-oauth2-jwt-bearer";
const { auth } = pkg;
const router = Router();

// define middleware directly
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
});

// Protected route: only accessible with valid Auth0 token
router.get('/', requireAuth, (req, res) => {
  res.json({
    ok: true,
    message: '🔒 Access granted to protected route!',
    user: req.auth, // decoded token claims
  });
});

export default router;
