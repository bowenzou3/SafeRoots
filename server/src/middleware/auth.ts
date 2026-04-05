import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: 'outreach' | 'admin';
  name: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'saferoots-dev-jwt-secret';

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

function parseToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = parseToken(req.header('authorization'));
  if (!token) return res.status(401).json({ error: 'Missing bearer token.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    (req as Request & { auth?: AuthTokenPayload }).auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireRole(roles: Array<'outreach' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = parseToken(req.header('authorization'));
    if (!token) return res.status(401).json({ error: 'Missing bearer token.' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions.' });
      }
      (req as Request & { auth?: AuthTokenPayload }).auth = decoded;
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  };
}
