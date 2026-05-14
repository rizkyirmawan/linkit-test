import { eq, and } from 'drizzle-orm';
import { getDb, schema } from '../db';

interface CoffeeItem {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  image: string;
}

export async function syncExternalData() {
  const db = await getDb();

  const [hotData, icedData] = await Promise.all([
    fetch('https://api.sampleapis.com/coffee/hot').then((r) => {
      if (!r.ok) throw new Error(`Hot API: ${r.status}`);
      return r.json() as Promise<CoffeeItem[]>;
    }),
    fetch('https://api.sampleapis.com/coffee/iced').then((r) => {
      if (!r.ok) throw new Error(`Iced API: ${r.status}`);
      return r.json() as Promise<CoffeeItem[]>;
    }),
  ]);

  let hotCount = 0;
  let icedCount = 0;

  for (const item of hotData) {
    const existing = await db.query.coffees.findFirst({
      where: and(eq(schema.coffees.externalId, item.id), eq(schema.coffees.type, 'hot')),
    });

    const value = {
      externalId: item.id,
      title: item.title,
      description: item.description || null,
      ingredients: item.ingredients ? JSON.stringify(item.ingredients) : null,
      image: item.image || null,
      type: 'hot' as const,
    };

    if (existing) {
      await db.update(schema.coffees).set(value).where(
        eq(schema.coffees.id, existing.id),
      );
    } else {
      await db.insert(schema.coffees).values(value);
      hotCount++;
    }
  }

  for (const item of icedData) {
    const existing = await db.query.coffees.findFirst({
      where: and(eq(schema.coffees.externalId, item.id), eq(schema.coffees.type, 'iced')),
    });

    const value = {
      externalId: item.id,
      title: item.title,
      description: item.description || null,
      ingredients: item.ingredients ? JSON.stringify(item.ingredients) : null,
      image: item.image || null,
      type: 'iced' as const,
    };

    if (existing) {
      await db.update(schema.coffees).set(value).where(
        eq(schema.coffees.id, existing.id),
      );
    } else {
      await db.insert(schema.coffees).values(value);
      icedCount++;
    }
  }

  return { hot: hotData.length, iced: icedData.length };
}
