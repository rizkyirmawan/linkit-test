import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let dbConnection: mysql.Connection | null = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'linkit_test',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  dbInstance = drizzle(dbConnection, { schema, mode: 'default' });
  return dbInstance;
}

export async function getConnection() {
  if (dbConnection) return dbConnection;
  dbConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'linkit_test',
    port: parseInt(process.env.DB_PORT || '3306'),
  });
  return dbConnection;
}

export { schema };
