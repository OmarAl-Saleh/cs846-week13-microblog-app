// Jest setup: ensure tests have a DATABASE_URL to prevent import-time throws
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/testdb';

// Optional: shorten bcrypt rounds in tests if code uses env-controlled rounds
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '4';
