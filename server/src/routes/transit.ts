import { Router, type Request, type Response } from 'express';
import { getTransitProvider } from '../services/transit';

const router = Router();

function asNumber(input: unknown): number {
  const n = Number(input);
  return Number.isFinite(n) ? n : NaN;
}

// GET /api/transit/eta
router.get('/eta', async (req: Request, res: Response) => {
  const fromLat = asNumber(req.query.fromLat);
  const fromLng = asNumber(req.query.fromLng);
  const toLat = asNumber(req.query.toLat);
  const toLng = asNumber(req.query.toLng);
  const safeRoute = req.query.safeRoute === 'true';

  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) {
    return res.status(400).json({ error: 'fromLat, fromLng, toLat, toLng are required numeric values' });
  }

  try {
    const provider = getTransitProvider();
    const eta = await provider.getEta({ fromLat, fromLng, toLat, toLng, safeRoute });
    return res.json(eta);
  } catch (err) {
    console.error('[transit]', err);
    return res.status(500).json({ error: 'Failed to fetch transit ETA' });
  }
});

export default router;
