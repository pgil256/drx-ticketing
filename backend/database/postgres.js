const { Pool } = require('pg');

let pool;

const initializeDatabase = async () => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database');
    await createTables();
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    throw err;
  }
};

const createTables = async () => {
  const createIssuesTable = `
    CREATE TABLE IF NOT EXISTS issues (
      id SERIAL PRIMARY KEY,
      user_name VARCHAR(255) NOT NULL,
      issue_date DATE NOT NULL,
      issue_description TEXT NOT NULL,
      preceding_events TEXT,
      resolution_steps TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      technician_name VARCHAR(255),
      technician_notes TEXT,
      is_resolved BOOLEAN DEFAULT FALSE
    )
  `;

  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_issues_date ON issues(issue_date)',
    'CREATE INDEX IF NOT EXISTS idx_issues_resolved ON issues(is_resolved)',
    'CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at)'
  ];

  try {
    await pool.query(createIssuesTable);
    console.log('Issues table ready');
    
    // Create indexes
    for (const indexQuery of createIndexes) {
      await pool.query(indexQuery);
    }
    console.log('Database indexes created');
  } catch (err) {
    console.error('Error creating tables:', err.message);
    throw err;
  }
};

const getDatabase = () => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
};

const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    console.log('Database connection closed');
  }
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};