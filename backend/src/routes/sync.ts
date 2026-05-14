import { Elysia } from 'elysia';
import { getDb } from '../db';
import { authGuard } from '../middleware/auth';
import { syncExternalData } from '../services/syncService';

export const syncRoutes = new Elysia()
  .guard(
    { beforeHandle: [authGuard.beforeHandle] },
    (app) => app
      .post('/api/sync', async ({ set }) => {
        try {
          const result = await syncExternalData();
          return {
            message: 'Sync completed',
            hot: result.hot,
            iced: result.iced,
          };
        } catch (err: any) {
          set.status = 500;
          return { error: true, message: `Sync failed: ${err.message}` };
        }
      }),
  );
