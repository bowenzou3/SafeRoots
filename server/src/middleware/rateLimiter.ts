import rateLimit from 'express-rate-limit';

/** General API rate limiter — 120 requests per minute per IP */
export const apiLimiter = rateLimit({
  windowMs:         60 * 1000,
  max:              120,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many requests. Please try again in a minute.' },
});

/** Stricter limiter for write endpoints (volunteers, ratings) */
export const writeLimiter = rateLimit({
  windowMs:         60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many submissions. Please slow down.' },
});
