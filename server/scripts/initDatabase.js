const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'seandavey',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'clo_analytics',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Initializing PostgreSQL database...');

    // Companies table - basic company information
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        industry VARCHAR(100),
        sector VARCHAR(100),
        description TEXT,
        analyst_notes TEXT,
        presentation_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Financial metrics table - raw financial data
    await client.query(`
      CREATE TABLE IF NOT EXISTS financial_metrics (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        period_end_date DATE,
        revenue DECIMAL(15,2),
        gross_profit DECIMAL(15,2),
        ebitda DECIMAL(15,2),
        ebit DECIMAL(15,2),
        net_income DECIMAL(15,2),
        total_debt DECIMAL(15,2),
        net_debt DECIMAL(15,2),
        cash_and_equivalents DECIMAL(15,2),
        enterprise_value DECIMAL(15,2),
        market_cap DECIMAL(15,2),
        shares_outstanding DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
      )
    `);

    // Calculated ratios table - computed financial ratios
    await client.query(`
      CREATE TABLE IF NOT EXISTS calculated_ratios (
        id SERIAL PRIMARY KEY,
        financial_metrics_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        
        -- Leverage ratios
        total_debt_to_ebitda DECIMAL(10,4),
        net_debt_to_ebitda DECIMAL(10,4),
        debt_to_equity DECIMAL(10,4),
        
        -- Profitability ratios
        ebitda_margin DECIMAL(10,4),
        ebit_margin DECIMAL(10,4),
        net_margin DECIMAL(10,4),
        
        -- Valuation multiples
        ev_to_ebitda DECIMAL(10,4),
        ev_to_revenue DECIMAL(10,4),
        price_to_earnings DECIMAL(10,4),
        
        -- Coverage ratios
        ebitda_to_interest DECIMAL(10,4),
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (financial_metrics_id) REFERENCES financial_metrics (id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (name)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_financial_metrics_company ON financial_metrics (company_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calculated_ratios_company ON calculated_ratios (company_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_financial_metrics_date ON financial_metrics (period_end_date)`);

    console.log('✅ Database initialized successfully!');
    console.log('✅ Tables created: companies, financial_metrics, calculated_ratios');
    console.log('✅ Indexes created for optimized queries');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initializeDatabase().catch(console.error); 