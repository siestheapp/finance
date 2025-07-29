const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'seandavey', // Use system user as default
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'clo_analytics',
  password: process.env.DB_PASSWORD || '', // No password for local development
  port: process.env.DB_PORT || 5432,
});

class Database {
  constructor() {
    // Test the connection
    pool.connect((err, client, release) => {
      if (err) {
        console.error('Error connecting to PostgreSQL database:', err.message);
      } else {
        console.log('Connected to PostgreSQL database');
        release();
      }
    });
  }

  // Helper method to run queries with promises
  async run(sql, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return { 
        id: result.rows[0]?.id || null, 
        changes: result.rowCount,
        rows: result.rows 
      };
    } finally {
      client.release();
    }
  }

  // Helper method to get single row
  async get(sql, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Helper method to get all rows
  async all(sql, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Close database connection pool
  async close() {
    await pool.end();
  }
}

module.exports = new Database(); 