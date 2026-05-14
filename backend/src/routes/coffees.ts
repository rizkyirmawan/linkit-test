import { Elysia } from 'elysia';
import { eq, asc } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { authGuard } from '../middleware/auth';

export const coffeeRoutes = new Elysia()
  .guard(
    { beforeHandle: [authGuard.beforeHandle] },
    (app) => app
      .get('/api/coffees', async () => {
        const db = await getDb();
        return db.query.coffees.findMany({
          orderBy: [asc(schema.coffees.title)],
        });
      })
      .get('/api/coffees/:id', async ({ params, set }) => {
        const db = await getDb();
        const id = parseInt((params as any).id);
        if (isNaN(id)) {
          set.status = 400;
          return { error: true, message: 'Invalid ID' };
        }
        const coffee = await db.query.coffees.findFirst({
          where: eq(schema.coffees.id, id),
        });
        if (!coffee) {
          set.status = 404;
          return { error: true, message: 'Coffee not found' };
        }
        return coffee;
      })
      .post('/api/coffees', async ({ body, set }) => {
        const db = await getDb();
        const { title, description, ingredients, image, type } = body as any;

        if (!title || !type) {
          set.status = 400;
          return { error: true, message: 'Title and type are required' };
        }

        if (!['hot', 'iced'].includes(type)) {
          set.status = 400;
          return { error: true, message: 'Type must be "hot" or "iced"' };
        }

        const result = await db.insert(schema.coffees).values({
          title,
          description: description || null,
          ingredients: ingredients ? JSON.stringify(ingredients) : null,
          image: image || null,
          type,
        });

        set.status = 201;
        return { message: 'Coffee created', id: result.insertId };
      })
      .put('/api/coffees/:id', async ({ params, body, set }) => {
        const db = await getDb();
        const id = parseInt((params as any).id);
        if (isNaN(id)) {
          set.status = 400;
          return { error: true, message: 'Invalid ID' };
        }

        const existing = await db.query.coffees.findFirst({
          where: eq(schema.coffees.id, id),
        });
        if (!existing) {
          set.status = 404;
          return { error: true, message: 'Coffee not found' };
        }

        const { title, description, ingredients, image, type } = body as any;
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (ingredients !== undefined) updates.ingredients = JSON.stringify(ingredients);
        if (image !== undefined) updates.image = image;
        if (type !== undefined) {
          if (!['hot', 'iced'].includes(type)) {
            set.status = 400;
            return { error: true, message: 'Type must be "hot" or "iced"' };
          }
          updates.type = type;
        }

        await db.update(schema.coffees)
          .set(updates)
          .where(eq(schema.coffees.id, id));

        return { message: 'Coffee updated' };
      })
      .delete('/api/coffees/:id', async ({ params, set }) => {
        const db = await getDb();
        const id = parseInt((params as any).id);
        if (isNaN(id)) {
          set.status = 400;
          return { error: true, message: 'Invalid ID' };
        }

        const existing = await db.query.coffees.findFirst({
          where: eq(schema.coffees.id, id),
        });
        if (!existing) {
          set.status = 404;
          return { error: true, message: 'Coffee not found' };
        }

        await db.delete(schema.coffees)
          .where(eq(schema.coffees.id, id));

        return { message: 'Coffee deleted' };
      }),
  );
