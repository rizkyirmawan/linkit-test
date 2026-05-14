import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth';
import { coffeeRoutes } from './routes/coffees';
import { orderRoutes } from './routes/orders';
import { syncRoutes } from './routes/sync';
import { logRoutes } from './routes/logs';
import { healthRoutes } from './routes/health';
import { requestLogger } from './middleware/logger';
import { monitor } from './middleware/monitor';
import { errorHandler } from './middleware/errorHandler';

const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'coffee-app-jwt-secret-key-2024',
    }),
  )
  .use(errorHandler)
  .use(requestLogger)
  .use(monitor)
  .use(authRoutes)
  .use(coffeeRoutes)
  .use(orderRoutes)
  .use(syncRoutes)
  .use(logRoutes)
  .use(healthRoutes)
  .all('*', ({ set }) => {
    set.status = 404;
    return { error: true, status: 404, message: 'Route not found' };
  })
  .listen(process.env.PORT || 3000);

console.log(`☕ Coffee API running at http://localhost:${process.env.PORT || 3000}`);
console.log(`   Health: http://localhost:${process.env.PORT || 3000}/health`);

export type App = typeof app;
