import { Router, type Request, type Response } from 'express';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { writeLimiter } from '../middleware/rateLimiter';
import { requireAuth, signAuthToken } from '../middleware/auth';

const router = Router();

type Role = 'outreach' | 'admin';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(':');
  if (!salt || !storedHash) return false;
  const hash = scryptSync(password, salt, 64);
  const buffer = Buffer.from(storedHash, 'hex');
  if (buffer.length !== hash.length) return false;
  return timingSafeEqual(buffer, hash);
}

// POST /api/auth/register-outreach
router.post('/register-outreach', writeLimiter, (req: Request, res: Response) => {
  const inviteCode = process.env.OUTREACH_INVITE_CODE ?? 'saferoots-outreach';
  const { email, password, name, role, invite } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    role?: Role;
    invite?: string;
  };

  if (!email || !password || !name || !invite) {
    return res.status(400).json({ error: 'email, password, name and invite are required.' });
  }
  if (invite !== inviteCode) {
    return res.status(403).json({ error: 'Invalid invite code.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const db = getDb();
  const safeRole: Role = role === 'admin' ? 'admin' : 'outreach';
  try {
    db.prepare(`
      INSERT INTO outreach_users (id, email, password_hash, role, name)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), email.toLowerCase().trim(), hashPassword(password), safeRole, name.slice(0, 80));
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    throw err;
  }

  return res.status(201).json({ ok: true });
});

// POST /api/auth/login
router.post('/login', writeLimiter, (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  const db = getDb();
  const user = db.prepare(`
    SELECT id, email, password_hash, role, name
    FROM outreach_users
    WHERE email = ?
  `).get(email.toLowerCase().trim()) as {
    id: string;
    email: string;
    password_hash: string;
    role: Role;
    name: string;
  } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const auth = (req as Request & { auth?: { sub: string; email: string; role: Role; name: string } }).auth;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: { id: auth.sub, email: auth.email, role: auth.role, name: auth.name } });
});

export default router;
