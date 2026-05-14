import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const coffees = mysqlTable('coffees', {
  id: int('id').primaryKey().autoincrement(),
  externalId: int('external_id'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  ingredients: text('ingredients'),
  image: varchar('image', { length: 500 }),
  type: varchar('type', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const orders = mysqlTable('orders', {
  id: int('id').primaryKey().autoincrement(),
  coffeeId: int('coffee_id').notNull().references(() => coffees.id),
  userId: int('user_id').notNull().references(() => users.id),
  quantity: int('quantity').notNull().default(1),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  orderedAt: timestamp('ordered_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const logs = mysqlTable('logs', {
  id: int('id').primaryKey().autoincrement(),
  method: varchar('method', { length: 10 }),
  endpoint: varchar('endpoint', { length: 255 }),
  statusCode: int('status_code'),
  responseTime: decimal('response_time', { precision: 10, scale: 2 }),
  level: varchar('level', { length: 10 }).default('info'),
  message: text('message'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  coffee: one(coffees, {
    fields: [orders.coffeeId],
    references: [coffees.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));
