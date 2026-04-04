import { Router, type Request, type Response } from 'express';
import { getDb } from '../db';
import { writeLimiter } from '../middleware/rateLimiter';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/volunteers
router.post('/', writeLimiter, (req: Request, res: Response) => {
  const { name, email, city, phone, organization, skills, availability } = req.body as {
    name?: string; email?: string; city?: string; phone?: string;
    organization?: string; skills?: string[]; availability?: string;
  };

  // Validate required fields
  if (!name || !email || !city || !availability) {
    return res.status(400).json({ error: 'name, email, city, and availability are required.' });
  }

  // Basic email format check (not a substitute for real verification)
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Sanitise string fields
  const safeName  = String(name).slice(0, 120);
  const safeEmail = String(email).toLowerCase().trim().slice(0, 254);
  const safeCity  = String(city).slice(0, 100);
  const safeAvail = String(availability).slice(0, 50);
  const safeOrg   = organization ? String(organization).slice(0, 200) : null;
  const safePhone = phone         ? String(phone).slice(0, 30)        : null;
  const safeSkills = Array.isArray(skills)
    ? JSON.stringify(skills.map((s: string) => String(s).slice(0, 100)).slice(0, 20))
    : '[]';

  const db = getDb();
  const id = uuidv4();

  try {
    db.prepare(`
      INSERT INTO volunteers (id, name, email, city, phone, organization, skills, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, safeName, safeEmail, safeCity, safePhone, safeOrg, safeSkills, safeAvail);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'This email address is already registered.' });
    }
    throw err;
  }

  return res.status(201).json({ id });
});

export default router;
