const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
let db;

const initializeDatabase = () => {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
      createTables();
    }
  });
};

const createTables = () => {
  const createIssuesTable = `
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      issue_description TEXT NOT NULL,
      preceding_events TEXT,
      resolution_steps TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      technician_name TEXT,
      technician_notes TEXT,
      is_resolved BOOLEAN DEFAULT 0
    )
  `;

  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_issues_date ON issues(issue_date)',
    'CREATE INDEX IF NOT EXISTS idx_issues_resolved ON issues(is_resolved)',
    'CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at)'
  ];

  db.run(createIssuesTable, (err) => {
    if (err) {
      console.error('Error creating issues table:', err.message);
    } else {
      console.log('Issues table ready');
      
      // Create indexes
      createIndexes.forEach(indexQuery => {
        db.run(indexQuery, (err) => {
          if (err) {
            console.error('Error creating index:', err.message);
          }
        });
      });
    }
  });
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};