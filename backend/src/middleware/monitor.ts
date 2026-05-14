import { Elysia } from 'elysia';
import { getDb, schema } from '../db';

interface AlertBucket {
  errors: { time: number }[];
  slowRequests: { time: number }[];
}

const buckets = new Map<string, AlertBucket>();
const ERROR_THRESHOLD = 3;
const ERROR_WINDOW_MS = 5 * 60 * 1000;
const SLOW_THRESHOLD_MS = 2000;
const ALERT_COOLDOWN_MS = 60000;

const lastAlerts = new Map<string, number>();

function getBucket(key: string): AlertBucket {
  if (!buckets.has(key)) {
    buckets.set(key, { errors: [], slowRequests: [] });
  }
  return buckets.get(key)!;
}

function cleanupBucket(bucket: AlertBucket, now: number) {
  bucket.errors = bucket.errors.filter((e) => now - e.time < ERROR_WINDOW_MS);
  bucket.slowRequests = bucket.slowRequests.filter((s) => now - s.time < ERROR_WINDOW_MS);
}

function canAlert(key: string, now: number): boolean {
  const last = lastAlerts.get(key);
  return !last || now - last > ALERT_COOLDOWN_MS;
}

export const monitor = (app: Elysia) =>
  app.onAfterHandle(async (ctx) => {
    const startTime = (ctx as any).startTime;
    if (!startTime) return;

    const responseTime = performance.now() - startTime;
    const now = Date.now();
    const statusCode = ctx.set.status || 200;
    const bucket = getBucket('global');

    if (statusCode >= 500) {
      bucket.errors.push({ time: now });
      cleanupBucket(bucket, now);

      if (bucket.errors.length > ERROR_THRESHOLD && canAlert('high-error', now)) {
        lastAlerts.set('high-error', now);
        try {
          const db = await getDb();
          await db.insert(schema.logs).values({
            method: ctx.request.method,
            endpoint: ctx.path,
            statusCode: statusCode,
            responseTime: Math.round(responseTime * 100) / 100,
            level: 'warn',
            message: `ALERT: High error rate detected (${bucket.errors.length} errors in 5 min)`,
          });
        } catch {}
      }
    }

    if (responseTime > SLOW_THRESHOLD_MS) {
      bucket.slowRequests.push({ time: now });
      cleanupBucket(bucket, now);

      if (canAlert('slow-response', now)) {
        lastAlerts.set('slow-response', now);
        try {
          const db = await getDb();
          await db.insert(schema.logs).values({
            method: ctx.request.method,
            endpoint: ctx.path,
            statusCode: statusCode,
            responseTime: Math.round(responseTime * 100) / 100,
            level: 'warn',
            message: `ALERT: Slow response detected (${Math.round(responseTime)}ms)`,
          });
        } catch {}
      }
    }
  });
