const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../utils/database');
const FinancialCalculations = require('../utils/financialCalculations');

// Validation rules for financial metrics
const financialMetricsValidation = [
  body('company_id').isInt({ min: 1 }).withMessage('Valid company ID is required'),
  body('period_end_date').isISO8601().withMessage('Valid period end date is required'),
  body('revenue').isFloat({ min: 0 }).withMessage('Revenue must be a positive number'),
  body('ebitda').isFloat().withMessage('EBITDA must be a number'),
  body('ebit').optional().isFloat().withMessage('EBIT must be a number'),
  body('net_income').optional().isFloat().withMessage('Net income must be a number'),
  body('total_debt').isFloat({ min: 0 }).withMessage('Total debt must be non-negative'),
  body('cash_and_equivalents').isFloat({ min: 0 }).withMessage('Cash must be non-negative'),
  body('enterprise_value').optional().isFloat({ min: 0 }).withMessage('Enterprise value must be positive'),
  body('market_cap').optional().isFloat({ min: 0 }).withMessage('Market cap must be positive'),
  body('shares_outstanding').optional().isFloat({ min: 0 }).withMessage('Shares outstanding must be positive')
];

// GET /api/financial-metrics/:companyId - Get all financial metrics for a company
router.get('/:companyId', async (req, res) => {
  try {
    const companyId = req.params.companyId;
    
    const metrics = await db.all(
      `SELECT fm.*, cr.*
       FROM financial_metrics fm
       LEFT JOIN calculated_ratios cr ON fm.id = cr.financial_metrics_id
       WHERE fm.company_id = ?
       ORDER BY fm.period_end_date DESC`,
      [companyId]
    );

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching financial metrics:', error);
    res.status(500).json({ error: 'Failed to fetch financial metrics' });
  }
});

// POST /api/financial-metrics - Add new financial metrics and calculate ratios
router.post('/', financialMetricsValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company_id,
      period_end_date,
      revenue,
      gross_profit,
      ebitda,
      ebit,
      net_income,
      total_debt,
      net_debt,
      cash_and_equivalents,
      enterprise_value,
      market_cap,
      shares_outstanding
    } = req.body;

    // Validate that company exists
    const company = await db.get('SELECT id FROM companies WHERE id = ?', [company_id]);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Insert financial metrics
    const metricsResult = await db.run(
      `INSERT INTO financial_metrics 
       (company_id, period_end_date, revenue, gross_profit, ebitda, ebit, net_income, 
        total_debt, net_debt, cash_and_equivalents, enterprise_value, market_cap, shares_outstanding)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, period_end_date, revenue, gross_profit, ebitda, ebit, net_income,
       total_debt, net_debt, cash_and_equivalents, enterprise_value, market_cap, shares_outstanding]
    );

    // Calculate ratios
    const financialData = {
      revenue,
      ebitda,
      ebit,
      netIncome: net_income,
      totalDebt: total_debt,
      cashAndEquivalents: cash_and_equivalents,
      enterpriseValue: enterprise_value,
      marketCap: market_cap
    };

    const calculatedRatios = FinancialCalculations.calculateAllRatios(financialData);

    // Insert calculated ratios
    await db.run(
      `INSERT INTO calculated_ratios 
       (financial_metrics_id, company_id, total_debt_to_ebitda, net_debt_to_ebitda, 
        debt_to_equity, ebitda_margin, ebit_margin, net_margin, ev_to_ebitda, 
        ev_to_revenue, price_to_earnings, ebitda_to_interest)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        metricsResult.id, 
        company_id,
        calculatedRatios.total_debt_to_ebitda,
        calculatedRatios.net_debt_to_ebitda,
        calculatedRatios.debt_to_equity,
        calculatedRatios.ebitda_margin,
        calculatedRatios.ebit_margin,
        calculatedRatios.net_margin,
        calculatedRatios.ev_to_ebitda,
        calculatedRatios.ev_to_revenue,
        calculatedRatios.price_to_earnings,
        calculatedRatios.ebitda_to_interest
      ]
    );

    // Get the complete record with ratios
    const result = await db.get(
      `SELECT fm.*, cr.*
       FROM financial_metrics fm
       LEFT JOIN calculated_ratios cr ON fm.id = cr.financial_metrics_id
       WHERE fm.id = ?`,
      [metricsResult.id]
    );

    res.status(201).json({
      ...result,
      calculated_ratios_formatted: FinancialCalculations.formatRatios(calculatedRatios)
    });

  } catch (error) {
    console.error('Error creating financial metrics:', error);
    res.status(500).json({ error: 'Failed to create financial metrics' });
  }
});

// PUT /api/financial-metrics/:id - Update financial metrics and recalculate ratios
router.put('/:id', financialMetricsValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const metricsId = req.params.id;
    const {
      company_id,
      period_end_date,
      revenue,
      gross_profit,
      ebitda,
      ebit,
      net_income,
      total_debt,
      net_debt,
      cash_and_equivalents,
      enterprise_value,
      market_cap,
      shares_outstanding
    } = req.body;

    // Update financial metrics
    const result = await db.run(
      `UPDATE financial_metrics 
       SET company_id = ?, period_end_date = ?, revenue = ?, gross_profit = ?, 
           ebitda = ?, ebit = ?, net_income = ?, total_debt = ?, net_debt = ?,
           cash_and_equivalents = ?, enterprise_value = ?, market_cap = ?,
           shares_outstanding = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [company_id, period_end_date, revenue, gross_profit, ebitda, ebit, net_income,
       total_debt, net_debt, cash_and_equivalents, enterprise_value, market_cap, 
       shares_outstanding, metricsId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Financial metrics not found' });
    }

    // Recalculate ratios
    const financialData = {
      revenue,
      ebitda,
      ebit,
      netIncome: net_income,
      totalDebt: total_debt,
      cashAndEquivalents: cash_and_equivalents,
      enterpriseValue: enterprise_value,
      marketCap: market_cap
    };

    const calculatedRatios = FinancialCalculations.calculateAllRatios(financialData);

    // Update calculated ratios
    await db.run(
      `UPDATE calculated_ratios 
       SET total_debt_to_ebitda = ?, net_debt_to_ebitda = ?, debt_to_equity = ?,
           ebitda_margin = ?, ebit_margin = ?, net_margin = ?, ev_to_ebitda = ?,
           ev_to_revenue = ?, price_to_earnings = ?, ebitda_to_interest = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE financial_metrics_id = ?`,
      [
        calculatedRatios.total_debt_to_ebitda,
        calculatedRatios.net_debt_to_ebitda,
        calculatedRatios.debt_to_equity,
        calculatedRatios.ebitda_margin,
        calculatedRatios.ebit_margin,
        calculatedRatios.net_margin,
        calculatedRatios.ev_to_ebitda,
        calculatedRatios.ev_to_revenue,
        calculatedRatios.price_to_earnings,
        calculatedRatios.ebitda_to_interest,
        metricsId
      ]
    );

    // Get updated record
    const updatedRecord = await db.get(
      `SELECT fm.*, cr.*
       FROM financial_metrics fm
       LEFT JOIN calculated_ratios cr ON fm.id = cr.financial_metrics_id
       WHERE fm.id = ?`,
      [metricsId]
    );

    res.json({
      ...updatedRecord,
      calculated_ratios_formatted: FinancialCalculations.formatRatios(calculatedRatios)
    });

  } catch (error) {
    console.error('Error updating financial metrics:', error);
    res.status(500).json({ error: 'Failed to update financial metrics' });
  }
});

// DELETE /api/financial-metrics/:id - Delete financial metrics
router.delete('/:id', async (req, res) => {
  try {
    const metricsId = req.params.id;
    
    const result = await db.run('DELETE FROM financial_metrics WHERE id = ?', [metricsId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Financial metrics not found' });
    }

    res.json({ message: 'Financial metrics deleted successfully' });
  } catch (error) {
    console.error('Error deleting financial metrics:', error);
    res.status(500).json({ error: 'Failed to delete financial metrics' });
  }
});

// POST /api/financial-metrics/calculate - Calculate ratios for given financial data (without saving)
router.post('/calculate', async (req, res) => {
  try {
    const errors = FinancialCalculations.validateFinancialData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const calculatedRatios = FinancialCalculations.calculateAllRatios(req.body);
    const formattedRatios = FinancialCalculations.formatRatios(calculatedRatios);

    res.json({
      raw_ratios: calculatedRatios,
      formatted_ratios: formattedRatios
    });
  } catch (error) {
    console.error('Error calculating ratios:', error);
    res.status(500).json({ error: 'Failed to calculate ratios' });
  }
});

module.exports = router; 