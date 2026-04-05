import { Router, type Request, type Response } from 'express';
import { getDb } from '../db';
import { writeLimiter } from '../middleware/rateLimiter';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/metrics/events
router.post('/events', writeLimiter, (req: Request, res: Response) => {
  const { eventType, metadata } = req.body as { eventType?: string; metadata?: Record<string, unknown> };
  if (!eventType || eventType.length > 64) {
    return res.status(400).json({ error: 'eventType is required and must be <= 64 chars' });
  }

  const db = getDb();
  db.prepare('INSERT INTO event_metrics (id, event_type, metadata) VALUES (?, ?, ?)')
    .run(uuidv4(), eventType, JSON.stringify(metadata ?? {}));

  res.status(201).json({ ok: true });
});

// GET /api/metrics/impact
router.get('/impact', (_req: Request, res: Response) => {
  const db = getDb();

  const totals = db.prepare(`
    SELECT
      SUM(CASE WHEN helped = 1 THEN 1 ELSE 0 END) AS successful,
      COUNT(*) AS totalCheckins
    FROM follow_through
  `).get() as { successful: number | null; totalCheckins: number | null };

  const eventRows = db.prepare(`
    SELECT event_type AS eventType, COUNT(*) AS count
    FROM event_metrics
    GROUP BY event_type
    ORDER BY count DESC
  `).all() as Array<{ eventType: string; count: number }>;

  const byChannel = db.prepare(`
    SELECT channel, COUNT(*) AS count
    FROM follow_through
    GROUP BY channel
  `).all() as Array<{ channel: string; count: number }>;

  const success = totals.successful ?? 0;
  const total = totals.totalCheckins ?? 0;
  res.json({
    successfulReferrals: success,
    totalCheckins: total,
    successRate: total > 0 ? Number(((success / total) * 100).toFixed(1)) : 0,
    byChannel,
    events: eventRows,
  });
});

export default router;
