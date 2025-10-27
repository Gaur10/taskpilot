// api/middleware/checkJwt.js
import { auth } from "express-oauth2-jwt-bearer";

// ✅ Auth0 middleware to verify JWT access tokens
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
});
