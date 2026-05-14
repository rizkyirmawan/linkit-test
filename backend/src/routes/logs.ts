import { Elysia } from 'elysia';
import { desc } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { authGuard } from '../middleware/auth';

export const logRoutes = new Elysia()
  .guard(
    { beforeHandle: [authGuard.beforeHandle] },
    (app) => app
      .get('/api/logs', async () => {
        const db = await getDb();
        return db.query.logs.findMany({
          orderBy: [desc(schema.logs.timestamp)],
          limit: 100,
        });
      }),
  );
