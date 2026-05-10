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

  it('filters by tag (case-insensitive match)', async () => {
    await request(app)
      .post('/bookmarks')
      .send({ url: 'https://a.com', title: 'A', tags: ['TypeScript'] });
    await request(app)
      .post('/bookmarks')
      .send({ url: 'https://b.com', title: 'B', tags: ['javascript'] });
    const res = await request(app).get('/bookmarks?tag=typescript');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('A');
  });

  it('returns empty array when no bookmark matches the tag', async () => {
    await request(app)
      .post('/bookmarks')
      .send({ url: 'https://a.com', title: 'A', tags: ['go'] });
    const res = await request(app).get('/bookmarks?tag=rust');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('returns all bookmarks when tag param is omitted', async () => {
    await request(app)
      .post('/bookmarks')
      .send({ url: 'https://a.com', title: 'A', tags: ['foo'] });
    await request(app)
      .post('/bookmarks')
      .send({ url: 'https://b.com', title: 'B', tags: ['bar'] });
    const res = await request(app).get('/bookmarks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
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
