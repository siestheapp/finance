const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in data directory
const dbPath = path.join(__dirname, '../data/clo_analytics.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Companies table - basic company information
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      industry TEXT,
      sector TEXT,
      description TEXT,
      analyst_notes TEXT,
      presentation_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Financial metrics table - raw financial data
  db.run(`
    CREATE TABLE IF NOT EXISTS financial_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    )
  `);

  // Calculated ratios table - computed financial ratios
  db.run(`
    CREATE TABLE IF NOT EXISTS calculated_ratios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (financial_metrics_id) REFERENCES financial_metrics (id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_financial_metrics_company ON financial_metrics (company_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_calculated_ratios_company ON calculated_ratios (company_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_financial_metrics_date ON financial_metrics (period_end_date)`);

  console.log('Database initialized successfully!');
  console.log('Tables created: companies, financial_metrics, calculated_ratios');
});

db.close(); 