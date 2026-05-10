import request from 'supertest';
import { app } from '../src/server';
import { clearAll } from '../src/store';

beforeEach(() => clearAll());

describe('Bookmarks API', () => {
  it('creates a bookmark', async () => {
    const res = await request(app)
      .post('/bookmarks')
      .send({ url: 'https://example.com', title: 'Example', tags: ['demo'] });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.url).toBe('https://example.com');
    expect(res.body.tags).toEqual(['demo']);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/bookmarks').send({ url: 'x' });
    expect(res.status).toBe(400);
  });

  it('lists bookmarks newest first', async () => {
    await request(app).post('/bookmarks').send({ url: 'a', title: 'A' });
    await new Promise((r) => setTimeout(r, 5));
    await request(app).post('/bookmarks').send({ url: 'b', title: 'B' });
    const res = await request(app).get('/bookmarks');
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('B');
  });

  it('fetches a bookmark by id', async () => {
    const created = await request(app)
      .post('/bookmarks')
      .send({ url: 'https://example.com', title: 'Example' });
    const res = await request(app).get(`/bookmarks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/bookmarks/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('deletes a bookmark', async () => {
    const created = await request(app)
      .post('/bookmarks')
      .send({ url: 'https://example.com', title: 'Example' });
    const del = await request(app).delete(`/bookmarks/${created.body.id}`);
    expect(del.status).toBe(204);
    const fetched = await request(app).get(`/bookmarks/${created.body.id}`);
    expect(fetched.status).toBe(404);
  });
});
