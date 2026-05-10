import express from 'express';
import { bookmarksRouter } from './routes/bookmarks';
import { previewRouter } from './routes/preview';

export const app = express();

app.use(express.json());
app.use('/bookmarks', bookmarksRouter);
app.use('/preview', previewRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`bookmarks-api listening on :${port}`);
  });
}
