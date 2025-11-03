import { Request, Response, NextFunction } from 'express';

// Simple RBAC middleware: require one or more roles to access a route
export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request & any, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user && req.user.role;

      if (!userRole) {
        return res.status(401).json({ message: 'Role information missing from token', code: 'ROLE_MISSING' });
      }

      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role', code: 'INSUFFICIENT_ROLE' });
      }

      next();
    } catch (err: any) {
      console.error('requireRole middleware error:', err);
      res.status(500).json({ message: 'Server error in role check' });
    }
  };
};
