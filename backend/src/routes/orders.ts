import { Elysia } from 'elysia';
import { eq, desc } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { authGuard } from '../middleware/auth';

export const orderRoutes = new Elysia()
  .guard(
    { beforeHandle: [authGuard.beforeHandle] },
    (app) => app
      .get('/api/orders', async ({ store }) => {
        const db = await getDb();
        const currentUser = (store as any).user;
        return db.query.orders.findMany({
          where: eq(schema.orders.userId, currentUser.id),
          with: { coffee: true, user: true },
          orderBy: [desc(schema.orders.orderedAt)],
        });
      })
      .get('/api/orders/:id', async ({ params, set, store }) => {
        const db = await getDb();
        const currentUser = (store as any).user;
        const id = parseInt((params as any).id);
        if (isNaN(id)) {
          set.status = 400;
          return { error: true, message: 'Invalid ID' };
        }
        const order = await db.query.orders.findFirst({
          where: eq(schema.orders.id, id),
          with: { coffee: true, user: true },
        });
        if (!order) {
          set.status = 404;
          return { error: true, message: 'Order not found' };
        }
        if (order.userId !== currentUser.id) {
          set.status = 403;
          return { error: true, message: 'Forbidden' };
        }
        return order;
      })
      .post('/api/orders', async ({ body, set, store }) => {
        const db = await getDb();
        const currentUser = (store as any).user;
        const { coffeeId, quantity, totalPrice } = body as any;

        if (!coffeeId || !quantity || !totalPrice) {
          set.status = 400;
          return { error: true, message: 'coffeeId, quantity, and totalPrice are required' };
        }

        if (quantity < 1) {
          set.status = 400;
          return { error: true, message: 'Quantity must be at least 1' };
        }

        if (totalPrice <= 0) {
          set.status = 400;
          return { error: true, message: 'Total price must be positive' };
        }

        const coffee = await db.query.coffees.findFirst({
          where: eq(schema.coffees.id, coffeeId),
        });
        if (!coffee) {
          set.status = 404;
          return { error: true, message: 'Coffee not found' };
        }

        const user = await db.query.users.findFirst({
          where: eq(schema.users.id, currentUser.id),
        });
        if (!user) {
          set.status = 404;
          return { error: true, message: 'User not found' };
        }

        const result = await db.insert(schema.orders).values({
          coffeeId,
          userId: currentUser.id,
          quantity,
          totalPrice: totalPrice.toString(),
          status: 'pending',
        });

        set.status = 201;
        return { message: 'Order created', id: result.insertId };
      })
      .put('/api/orders/:id', async ({ params, body, set, store }) => {
        const db = await getDb();
        const currentUser = (store as any).user;
        const id = parseInt((params as any).id);
        if (isNaN(id)) {
          set.status = 400;
          return { error: true, message: 'Invalid ID' };
        }

        const existing = await db.query.orders.findFirst({
          where: eq(schema.orders.id, id),
        });
        if (!existing) {
          set.status = 404;
          return { error: true, message: 'Order not found' };
        }
        if (existing.userId !== currentUser.id) {
          set.status = 403;
          return { error: true, message: 'Forbidden' };
        }

        const { quantity, totalPrice, status } = body as any;
        const updates: any = {};
        if (quantity !== undefined) {
          if (quantity < 1) {
            set.status = 400;
            return { error: true, message: 'Quantity must be at least 1' };
          }
          updates.quantity = quantity;
        }
        if (totalPrice !== undefined) {
          if (totalPrice <= 0) {
            set.status = 400;
            return { error: true, message: 'Total price must be positive' };
          }
          updates.totalPrice = totalPrice.toString();
        }
        if (status !== undefined) {
          if (!['pending', 'completed', 'cancelled'].includes(status)) {
            set.status = 400;
            return { error: true, message: 'Status must be pending, completed, or cancelled' };
          }
          updates.status = status;
        }

        await db.update(schema.orders)
          .set(updates)
          .where(eq(schema.orders.id, id));

        return { message: 'Order updated' };
      })
      .delete('/api/orders/:id', async ({ params, set, store }) => {
        const db = await getDb();
        const currentUser = (store as any).user;
        const id = parseInt((params as any).id);
        if (isNaN(id)) {
          set.status = 400;
          return { error: true, message: 'Invalid ID' };
        }

        const existing = await db.query.orders.findFirst({
          where: eq(schema.orders.id, id),
        });
        if (!existing) {
          set.status = 404;
          return { error: true, message: 'Order not found' };
        }
        if (existing.userId !== currentUser.id) {
          set.status = 403;
          return { error: true, message: 'Forbidden' };
        }

        await db.delete(schema.orders)
          .where(eq(schema.orders.id, id));

        return { message: 'Order deleted' };
      }),
  );
