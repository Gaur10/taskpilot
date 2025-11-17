import pkg from 'express-oauth2-jwt-bearer';
const { auth } = pkg;

// Build issuer base URL consistently
const issuerBaseURL = process.env.AUTH0_ISSUER
  ? process.env.AUTH0_ISSUER
  : process.env.AUTH0_DOMAIN
    ? (process.env.AUTH0_DOMAIN.startsWith('http') ? process.env.AUTH0_DOMAIN : `https://${process.env.AUTH0_DOMAIN}`)
    : undefined;

/**
 * Strict auth – blocks requests without valid Auth0 JWT.
 */
export const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL,
  tokenSigningAlg: 'RS256',
});

/**
 * Optional auth – lets requests pass even if token is missing/invalid.
 * Useful during early development.
 */
export const authOptional = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {return next();}

  requireAuth(req, res, (err) => {
    if (err) {return next();} // skip silently
    next();
  });
};
