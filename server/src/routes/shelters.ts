import { Router, type Request, type Response } from 'express';
import { getDb } from '../db';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

function parseShelter(row: Record<string, unknown>) {
  return {
    id:               row.id,
    name:             row.name,
    address:          row.address,
    city:             row.city,
    state:            row.state,
    lat:              row.lat,
    lng:              row.lng,
    phone:            row.phone,
    website:          row.website ?? null,
    tags:             JSON.parse(row.tags as string),
    capacity:         row.capacity,
    currentOccupancy: row.current_occupancy,
    rating:           row.rating,
    reviewCount:      row.review_count,
    services:         JSON.parse(row.services as string),
    hours:            row.hours,
    description:      row.description,
  };
}

// GET /api/shelters
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { city, tags, minRating, hasAvailability } = req.query;

  let sql = 'SELECT * FROM shelters WHERE 1=1';
  const params: (string | number)[] = [];

  if (city && typeof city === 'string') {
    sql += ' AND lower(city) LIKE ?';
    params.push(`%${city.toLowerCase()}%`);
  }
  if (minRating) {
    sql += ' AND rating >= ?';
    params.push(Number(minRating));
  }
  if (hasAvailability === 'true') {
    sql += ' AND current_occupancy < capacity';
  }

  sql += ' ORDER BY rating DESC';

  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  let shelters = rows.map(parseShelter);

  // Filter by tags (JSON array stored as text)
  if (tags && typeof tags === 'string') {
    const wanted = tags.split(',').map(t => t.trim()).filter(Boolean);
    shelters = shelters.filter(s =>
      wanted.every((t: string) => (s.tags as string[]).includes(t))
    );
  }

  res.json(shelters);
});

// GET /api/shelters/:id
router.get('/:id', (req: Request, res: Response) => {
  const db  = getDb();
  const row = db.prepare('SELECT * FROM shelters WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) return res.status(404).json({ error: 'Shelter not found' });
  return res.json(parseShelter(row));
});

// POST /api/shelters/:id/rate
router.post('/:id/rate', writeLimiter, (req: Request, res: Response) => {
  const { rating } = req.body as { rating?: unknown };
  const value = Number(rating);
  if (!value || value < 1 || value > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const db = getDb();
  const shelter = db
    .prepare('SELECT rating, review_count FROM shelters WHERE id = ?')
    .get(req.params.id) as { rating: number; review_count: number } | undefined;

  if (!shelter) return res.status(404).json({ error: 'Shelter not found' });

  const newCount  = shelter.review_count + 1;
  const newRating = ((shelter.rating * shelter.review_count) + value) / newCount;

  db.prepare('UPDATE shelters SET rating = ?, review_count = ? WHERE id = ?')
    .run(Math.round(newRating * 10) / 10, newCount, req.params.id);

  return res.json({ ok: true, rating: Math.round(newRating * 10) / 10 });
});

export default router;
