import { getConnection } from './index';

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coffees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  external_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients TEXT,
  image VARCHAR(500),
  type VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coffee_id INT NOT NULL,
  user_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coffee_id) REFERENCES coffees(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  method VARCHAR(10),
  endpoint VARCHAR(255),
  status_code INT,
  response_time DECIMAL(10,2),
  level VARCHAR(10) DEFAULT 'info',
  message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function migrate() {
  console.log('Running migration...');
  const conn = await getConnection();
  const statements = createTablesSQL.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    await conn.execute(stmt);
  }
  await conn.end();
  console.log('Migration completed successfully.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
