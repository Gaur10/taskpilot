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
/**
 * @openapi
 * /protected:
 *   get:
 *     summary: Protected test endpoint
 *     description: Verifies if JWT validation is working via Auth0.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Valid token - returns user info
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireAuth, (req, res) => {
  res.json({
    ok: true,
    message: '🔒 Access granted to protected route!',
    user: req.auth, // decoded token claims
  });
});

export default router;
