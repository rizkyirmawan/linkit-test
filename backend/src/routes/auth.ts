import { Elysia } from 'elysia';
import bcrypt from 'bcryptjs';
import { getDb, schema } from '../db';
import { eq } from 'drizzle-orm';

export const authRoutes = new Elysia()
  .post('/api/auth/register', async ({ body, set, jwt }) => {
    const db = await getDb();
    const { username, password } = body as any;

    if (!username || !password) {
      set.status = 400;
      return { error: true, message: 'Username and password are required' };
    }

    if (username.length < 3) {
      set.status = 400;
      return { error: true, message: 'Username must be at least 3 characters' };
    }

    if (password.length < 6) {
      set.status = 400;
      return { error: true, message: 'Password must be at least 6 characters' };
    }

    const existing = await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });

    if (existing) {
      set.status = 409;
      return { error: true, message: 'Username already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.insert(schema.users).values({
      username,
      password: hashedPassword,
    });

    const token = await jwt.sign({ id: result.insertId, username });

    set.status = 201;
    return {
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, username },
    };
  })
  .post('/api/auth/login', async ({ body, set, jwt }) => {
    const db = await getDb();
    const { username, password } = body as any;

    if (!username || !password) {
      set.status = 400;
      return { error: true, message: 'Username and password are required' };
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });

    if (!user) {
      set.status = 401;
      return { error: true, message: 'Invalid username or password' };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      set.status = 401;
      return { error: true, message: 'Invalid username or password' };
    }

    const token = await jwt.sign({ id: user.id, username: user.username });

    return {
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username },
    };
  });
