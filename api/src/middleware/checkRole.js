// api/middleware/checkRole.js

export const checkRole = (requiredRole) => {
  return (req, res, next) => {
    const roles = req.auth?.payload?.['https://taskpilot-api/roles'] || [];
    console.log('The role : '+ roles);
    if (roles.includes(requiredRole)) {
      return next();
    }
  
    return res.status(403).json({
      ok: false,
      error: 'Forbidden',
      requiredRole,
      rolesPresent: roles,
    });
  };
};
  