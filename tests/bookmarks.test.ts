import request from 'supertest';
import { app } from '../src/server';
import { clearAll } from '../src/store';
import { _clearRateLimitMap } from '../src/routes/bookmarks';


beforeEach(() => {
  clearAll();
  _clearRateLimitMap();
});

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

  it('rate limits POST /bookmarks after 10 requests per minute per IP', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/bookmarks')
        .send({ url: `https://example.com/${i}`, title: `Example ${i}` });
      expect(res.status).toBe(201);
    }
    // 11th request should be rate limited
    const res = await request(app)
      .post('/bookmarks')
      .send({ url: 'https://example.com/11', title: 'Example 11' });
    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/too many/i);
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

  describe('PATCH /bookmarks/:id', () => {
    it('updates title and tags', async () => {
      const created = await request(app)
        .post('/bookmarks')
        .send({ url: 'https://example.com', title: 'Original', tags: ['a'] });
      const res = await request(app)
        .patch(`/bookmarks/${created.body.id}`)
        .send({ title: 'Updated', tags: ['b', 'c'] });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated');
      expect(res.body.tags).toEqual(['b', 'c']);
      expect(res.body.url).toBe('https://example.com');
      expect(res.body.id).toBe(created.body.id);
      expect(res.body.createdAt).toBe(created.body.createdAt);
    });

    it('partially updates only title', async () => {
      const created = await request(app)
        .post('/bookmarks')
        .send({ url: 'https://example.com', title: 'Original', tags: ['keep'] });
      const res = await request(app)
        .patch(`/bookmarks/${created.body.id}`)
        .send({ title: 'New Title' });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New Title');
      expect(res.body.tags).toEqual(['keep']);
    });

    it('partially updates only tags', async () => {
      const created = await request(app)
        .post('/bookmarks')
        .send({ url: 'https://example.com', title: 'Keep Title', tags: ['old'] });
      const res = await request(app)
        .patch(`/bookmarks/${created.body.id}`)
        .send({ tags: ['new'] });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Keep Title');
      expect(res.body.tags).toEqual(['new']);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app)
        .patch('/bookmarks/does-not-exist')
        .send({ title: 'x' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('not found');
    });

    it('returns 400 when title is not a string', async () => {
      const created = await request(app)
        .post('/bookmarks')
        .send({ url: 'https://example.com', title: 'Original' });
      const res = await request(app)
        .patch(`/bookmarks/${created.body.id}`)
        .send({ title: 123 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when tags is not an array', async () => {
      const created = await request(app)
        .post('/bookmarks')
        .send({ url: 'https://example.com', title: 'Original' });
      const res = await request(app)
        .patch(`/bookmarks/${created.body.id}`)
        .send({ tags: 'not-an-array' });
      expect(res.status).toBe(400);
    });
  });
});
