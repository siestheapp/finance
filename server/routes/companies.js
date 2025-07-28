const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../utils/database');

// Validation rules for company data
const companyValidation = [
  body('name').notEmpty().withMessage('Company name is required'),
  body('industry').optional().isString(),
  body('sector').optional().isString(),
  body('description').optional().isString(),
  body('analyst_notes').optional().isString(),
  body('presentation_date').optional().isISO8601().withMessage('Invalid date format')
];

// GET /api/companies - Get all companies with optional search
router.get('/', async (req, res) => {
  try {
    const { search, industry, sector } = req.query;
    let sql = 'SELECT * FROM companies';
    let params = [];
    let conditions = [];

    if (search) {
      conditions.push('name LIKE ?');
      params.push(`%${search}%`);
    }

    if (industry) {
      conditions.push('industry = ?');
      params.push(industry);
    }

    if (sector) {
      conditions.push('sector = ?');
      params.push(sector);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY name ASC';

    const companies = await db.all(sql, params);
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET /api/companies/:id - Get specific company with financial data
router.get('/:id', async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Get company details
    const company = await db.get('SELECT * FROM companies WHERE id = ?', [companyId]);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get latest financial metrics
    const financialMetrics = await db.all(
      `SELECT fm.*, cr.* FROM financial_metrics fm
       LEFT JOIN calculated_ratios cr ON fm.id = cr.financial_metrics_id
       WHERE fm.company_id = ?
       ORDER BY fm.period_end_date DESC`,
      [companyId]
    );

    res.json({
      company,
      financialMetrics
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// POST /api/companies - Create new company
router.post('/', companyValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      industry,
      sector,
      description,
      analyst_notes,
      presentation_date
    } = req.body;

    const result = await db.run(
      `INSERT INTO companies (name, industry, sector, description, analyst_notes, presentation_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, industry, sector, description, analyst_notes, presentation_date]
    );

    // Get the created company
    const company = await db.get('SELECT * FROM companies WHERE id = ?', [result.id]);
    
    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Company with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create company' });
    }
  }
});

// PUT /api/companies/:id - Update company
router.put('/:id', companyValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const companyId = req.params.id;
    const {
      name,
      industry,
      sector, 
      description,
      analyst_notes,
      presentation_date
    } = req.body;

    const result = await db.run(
      `UPDATE companies 
       SET name = ?, industry = ?, sector = ?, description = ?, 
           analyst_notes = ?, presentation_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, industry, sector, description, analyst_notes, presentation_date, companyId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get the updated company
    const company = await db.get('SELECT * FROM companies WHERE id = ?', [companyId]);
    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Company with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update company' });
    }
  }
});

// DELETE /api/companies/:id - Delete company
router.delete('/:id', async (req, res) => {
  try {
    const companyId = req.params.id;
    
    const result = await db.run('DELETE FROM companies WHERE id = ?', [companyId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });  
  }
});

// GET /api/companies/stats/overview - Get portfolio overview stats
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_companies,
        COUNT(DISTINCT industry) as industries,
        COUNT(DISTINCT sector) as sectors
      FROM companies
    `);

    // Get average ratios across portfolio
    const avgRatios = await db.get(`
      SELECT 
        AVG(total_debt_to_ebitda) as avg_leverage,
        AVG(ebitda_margin) as avg_ebitda_margin,
        AVG(ev_to_ebitda) as avg_ev_ebitda
      FROM calculated_ratios
    `);

    res.json({
      ...stats,
      ...avgRatios
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
});

module.exports = router; 