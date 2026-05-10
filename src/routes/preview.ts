import { Router } from 'express';

export const previewRouter = Router();

previewRouter.get('/', async (req, res) => {
  const target = String(req.query.url ?? '');
  if (!target) {
    return res.status(400).json({ error: 'url query param required' });
  }

  const response = await fetch(target);
  const text = await response.text();

  return res.json({
    status: response.status,
    snippet: text.slice(0, 200),
  });
});
