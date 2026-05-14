import { Elysia } from 'elysia';

export const errorHandler = (app: Elysia) =>
  app.onError((ctx) => {
    const status = ctx.set.status || 500;
    const message = ctx.error?.message || 'Internal server error';

    if (status >= 500) {
      console.error(`[ERROR] ${ctx.request.method} ${ctx.path}: ${message}`);
    }

    return {
      error: true,
      status,
      message,
    };
  });
