import { Router } from 'express';
import * as store from '../store';

export const bookmarksRouter = Router();

bookmarksRouter.post('/', (req, res) => {
  const { url, title, tags } = req.body ?? {};
  if (typeof url !== 'string' || typeof title !== 'string') {
    return res.status(400).json({ error: 'url and title are required' });
  }
  const bookmark = store.createBookmark({ url, title, tags });
  return res.status(201).json(bookmark);
});

bookmarksRouter.get('/', (req, res) => {
  const { tag } = req.query;
  res.json(store.listBookmarks(typeof tag === 'string' ? tag : undefined));
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
