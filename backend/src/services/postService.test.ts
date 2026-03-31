import * as postService from './postService';
import * as db from '../db';

jest.mock('../db');

const mockedQuery = db.query as jest.MockedFunction<typeof db.query>;

describe('postService', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  test('createPost rejects empty content', async () => {
    await expect(postService.createPost(1, '   ')).rejects.toMatchObject({ status: 400, message: 'empty_content' });
  });

  test('createPost rejects content > MAX_POST_LENGTH', async () => {
    const long = 'a'.repeat(postService.MAX_POST_LENGTH + 1);
    await expect(postService.createPost(1, long)).rejects.toMatchObject({ status: 400, message: 'content_too_long' });
  });

  test('createPost rejects reply to a reply', async () => {
    // parent exists and has parent_post_id not null
    mockedQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 10, parent_post_id: 5 }] } as any);
    await expect(postService.createPost(1, 'reply', 10)).rejects.toMatchObject({ status: 400, message: 'nested_replies_not_allowed' });
  });

  test('createPost success for top-level post', async () => {
    // when inserting, return created row
    mockedQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, user_id: 1, content: 'hi', parent_post_id: null, created_at: new Date() }] } as any);
    const res = await postService.createPost(1, 'hi');
    expect(res).toHaveProperty('id', 1);
    expect(res).toHaveProperty('content', 'hi');
  });

  test('likePost is idempotent and returns like count', async () => {
    // first call: insert ON CONFLICT DO NOTHING resolves (no result needed)
    mockedQuery.mockResolvedValueOnce({} as any);
    // then select count
    mockedQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ like_count: 3 }] } as any);
    const likeCount = await postService.likePost(2, 5);
    expect(likeCount).toBe(3);
    expect(mockedQuery).toHaveBeenCalledTimes(2);
  });
});
