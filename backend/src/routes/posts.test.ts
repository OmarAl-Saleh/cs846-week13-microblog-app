import request from 'supertest';
import app from '../app';
import * as postService from '../services/postService';

jest.mock('../services/postService');

// mock auth middleware to inject a user
jest.mock('../middleware/auth', () => {
  return (_req: any, _res: any, next: any) => {
    _req.user = { id: 1, username: 'tester' };
    return next();
  };
});

const mockedPostService = postService as jest.Mocked<typeof postService>;

describe('POST /api/posts', () => {
  beforeEach(() => jest.resetAllMocks());

  test('creates a post and returns 201', async () => {
    mockedPostService.createPost.mockResolvedValueOnce({ id: 1, content: 'hello', user_id: 1 });
    const res = await request(app).post('/api/posts').send({ content: 'hello' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
  });

  test('like endpoint returns likeCount', async () => {
    mockedPostService.likePost.mockResolvedValueOnce(5 as any);
    const res = await request(app).post('/api/posts/1/like');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('likeCount', 5);
  });
});
