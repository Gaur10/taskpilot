import pkg from "express-oauth2-jwt-bearer";
const { auth, requiredScopes, claimCheck, requireAuth } = pkg;
/**
 * Strict auth – blocks requests without valid Auth0 JWT.
 */
export const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
});

/**
 * Optional auth – lets requests pass even if token is missing/invalid.
 * Useful during early development.
 */
export const authOptional = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();

  const maybeAuth = requireAuth;
  maybeAuth(req, res, (err) => {
    if (err) return next(); // skip silently
    next();
  });
};
