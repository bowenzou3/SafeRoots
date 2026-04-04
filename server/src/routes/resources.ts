import { Router, type Request, type Response } from 'express';
import { getDb } from '../db';

const router = Router();

function parseResource(row: Record<string, unknown>) {
  return {
    id:          row.id,
    name:        row.name,
    category:    row.category,
    description: row.description,
    address:     row.address,
    city:        row.city,
    state:       row.state,
    phone:       row.phone,
    website:     row.website ?? null,
    hours:       row.hours,
    tags:        JSON.parse(row.tags as string),
    lat:         row.lat,
    lng:         row.lng,
    isFree:      row.is_free === 1 || row.is_free === true,
  };
}

// GET /api/resources
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { category, city, freeOnly } = req.query;

  let sql    = 'SELECT * FROM resources WHERE 1=1';
  const params: (string | number)[] = [];

  if (category && typeof category === 'string') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (city && typeof city === 'string') {
    sql += ' AND lower(city) LIKE ?';
    params.push(`%${city.toLowerCase()}%`);
  }
  if (freeOnly === 'true') {
    sql += ' AND is_free = 1';
  }

  sql += ' ORDER BY name ASC';

  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  res.json(rows.map(parseResource));
});

// GET /api/resources/:id
router.get('/:id', (req: Request, res: Response) => {
  const db  = getDb();
  const row = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) return res.status(404).json({ error: 'Resource not found' });
  return res.json(parseResource(row));
});

export default router;
