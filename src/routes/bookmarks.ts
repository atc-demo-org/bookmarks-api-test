
import { Router, Request, Response, NextFunction } from 'express';
import * as store from '../store';

// Simple in-memory rate limiter: { [ip]: { count, firstRequestTimestamp } }
const rateLimitMap: Record<string, { count: number; first: number }> = {};

// For test: allow clearing the rate limit map
export function _clearRateLimitMap() {
  Object.keys(rateLimitMap).forEach((k) => delete rateLimitMap[k]);
}
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap[ip];
  if (!entry || now - entry.first > WINDOW_MS) {
    rateLimitMap[ip] = { count: 1, first: now };
    return next();
  }
  if (entry.count >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  entry.count++;
  next();
}

export const bookmarksRouter = Router();

bookmarksRouter.post('/', rateLimit, (req, res) => {
  const { url, title, tags } = req.body ?? {};
  if (typeof url !== 'string' || typeof title !== 'string') {
    return res.status(400).json({ error: 'url and title are required' });
  }
  const bookmark = store.createBookmark({ url, title, tags });
  return res.status(201).json(bookmark);
});

bookmarksRouter.get('/', (_req, res) => {
  res.json(store.listBookmarks());
});

bookmarksRouter.get('/:id', (req, res) => {
  const bookmark = store.getBookmark(req.params.id);
  if (!bookmark) return res.status(404).json({ error: 'not found' });
  res.json(bookmark);
});

bookmarksRouter.delete('/:id', (req, res) => {
  const ok = store.deleteBookmark(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});
