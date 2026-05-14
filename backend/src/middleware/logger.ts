import { Elysia } from 'elysia';
import { getDb, schema } from '../db';

export const requestLogger = (app: Elysia) =>
  app.onRequest((ctx) => {
    (ctx as any).startTime = performance.now();
  }).onAfterHandle(async (ctx) => {
    const startTime = (ctx as any).startTime;
    if (!startTime) return;
    const responseTime = performance.now() - startTime;
    try {
      const db = await getDb();
      await db.insert(schema.logs).values({
        method: ctx.request.method,
        endpoint: ctx.path,
        statusCode: ctx.set.status || 200,
        responseTime: Math.round(responseTime * 100) / 100,
        level: 'info',
        message: `${ctx.request.method} ${ctx.path} -> ${ctx.set.status || 200}`,
      });
    } catch {}
  }).onError(async (ctx) => {
    const startTime = (ctx as any).startTime;
    const responseTime = startTime ? performance.now() - startTime : 0;
    try {
      const db = await getDb();
      await db.insert(schema.logs).values({
        method: ctx.request.method,
        endpoint: ctx.path,
        statusCode: ctx.set.status || 500,
        responseTime: Math.round(responseTime * 100) / 100,
        level: 'error',
        message: ctx.error?.message || 'Unknown error',
      });
    } catch {}
  });
