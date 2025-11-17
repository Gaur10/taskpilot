// api/middleware/checkJwt.js
import { auth } from 'express-oauth2-jwt-bearer';

// Build issuer base URL consistently
const issuerBaseURL = process.env.AUTH0_ISSUER
  ? process.env.AUTH0_ISSUER
  : process.env.AUTH0_DOMAIN
    ? (process.env.AUTH0_DOMAIN.startsWith('http') ? process.env.AUTH0_DOMAIN : `https://${process.env.AUTH0_DOMAIN}`)
    : undefined;

// ✅ Auth0 middleware to verify JWT access tokens
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL,
});
