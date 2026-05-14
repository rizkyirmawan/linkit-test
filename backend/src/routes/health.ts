import { Elysia } from 'elysia';
import { getDb } from '../db';

const startTime = Date.now();

export const healthRoutes = new Elysia()
  .get('/health', async ({ set }) => {
    let dbStatus = 'ok';
    let dbError = null;
    try {
      const db = await getDb();
      await db.execute('SELECT 1');
    } catch (err: any) {
      dbStatus = 'error';
      dbError = err.message;
    }

    const status = dbStatus === 'ok' ? 200 : 503;
    set.status = status;

    return {
      status,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      database: dbStatus,
      dbError: dbError,
      timestamp: new Date().toISOString(),
    };
  });
