/**
 * Financial Calculations Utility
 * Contains functions to calculate standard financial ratios and multiples
 * used in credit analysis for leveraged loans
 */

class FinancialCalculations {
  
  // Leverage Ratios
  static calculateTotalDebtToEbitda(totalDebt, ebitda) {
    if (!ebitda || ebitda <= 0) return null;
    return totalDebt / ebitda;
  }

  static calculateNetDebtToEbitda(netDebt, ebitda) {
    if (!ebitda || ebitda <= 0) return null;
    return netDebt / ebitda;
  }

  static calculateDebtToEquity(totalDebt, marketCap) {
    if (!marketCap || marketCap <= 0) return null;
    return totalDebt / marketCap;
  }

  // Profitability Margins
  static calculateEbitdaMargin(ebitda, revenue) {
    if (!revenue || revenue <= 0) return null;
    return (ebitda / revenue) * 100;
  }

  static calculateEbitMargin(ebit, revenue) {
    if (!revenue || revenue <= 0) return null;
    return (ebit / revenue) * 100;
  }

  static calculateNetMargin(netIncome, revenue) {
    if (!revenue || revenue <= 0) return null;
    return (netIncome / revenue) * 100;
  }

  // Valuation Multiples
  static calculateEvToEbitda(enterpriseValue, ebitda) {
    if (!ebitda || ebitda <= 0) return null;
    return enterpriseValue / ebitda;
  }

  static calculateEvToRevenue(enterpriseValue, revenue) {
    if (!revenue || revenue <= 0) return null;
    return enterpriseValue / revenue;
  }

  static calculatePriceToEarnings(marketCap, netIncome) {
    if (!netIncome || netIncome <= 0) return null;
    return marketCap / netIncome;
  }

  // Coverage Ratios
  static calculateEbitdaToInterest(ebitda, interestExpense) {
    if (!interestExpense || interestExpense <= 0) return null;
    return ebitda / interestExpense;
  }

  // Helper function to calculate net debt from total debt and cash
  static calculateNetDebt(totalDebt, cashAndEquivalents) {
    return Math.max(0, totalDebt - cashAndEquivalents);
  }

  // Helper function to calculate enterprise value
  static calculateEnterpriseValue(marketCap, totalDebt, cashAndEquivalents) {
    return marketCap + totalDebt - cashAndEquivalents;
  }

  // Main function to calculate all ratios at once
  static calculateAllRatios(financialData) {
    const {
      revenue,
      ebitda,
      ebit,
      netIncome,
      totalDebt,
      cashAndEquivalents,
      enterpriseValue,
      marketCap,
      interestExpense = null
    } = financialData;

    // Calculate net debt if not provided
    const netDebt = this.calculateNetDebt(totalDebt, cashAndEquivalents);

    // Calculate enterprise value if not provided
    const ev = enterpriseValue || this.calculateEnterpriseValue(marketCap, totalDebt, cashAndEquivalents);

    return {
      // Leverage ratios
      total_debt_to_ebitda: this.calculateTotalDebtToEbitda(totalDebt, ebitda),
      net_debt_to_ebitda: this.calculateNetDebtToEbitda(netDebt, ebitda),
      debt_to_equity: this.calculateDebtToEquity(totalDebt, marketCap),
      
      // Profitability ratios (as percentages)
      ebitda_margin: this.calculateEbitdaMargin(ebitda, revenue),
      ebit_margin: this.calculateEbitMargin(ebit, revenue),
      net_margin: this.calculateNetMargin(netIncome, revenue),
      
      // Valuation multiples
      ev_to_ebitda: this.calculateEvToEbitda(ev, ebitda),
      ev_to_revenue: this.calculateEvToRevenue(ev, revenue),
      price_to_earnings: this.calculatePriceToEarnings(marketCap, netIncome),
      
      // Coverage ratios
      ebitda_to_interest: interestExpense ? this.calculateEbitdaToInterest(ebitda, interestExpense) : null
    };
  }

  // Function to format ratios for display
  static formatRatios(ratios) {
    const formatted = {};
    
    for (const [key, value] of Object.entries(ratios)) {
      if (value === null || value === undefined) {
        formatted[key] = 'N/A';
      } else if (key.includes('margin')) {
        // Format margins as percentages with 1 decimal place
        formatted[key] = `${value.toFixed(1)}%`;
      } else {
        // Format other ratios with 2 decimal places
        formatted[key] = `${value.toFixed(2)}x`;
      }
    }
    
    return formatted;
  }

  // Function to validate input data
  static validateFinancialData(data) {
    const errors = [];
    
    if (!data.revenue || data.revenue <= 0) {
      errors.push('Revenue must be a positive number');
    }
    
    if (!data.ebitda) {
      errors.push('EBITDA is required');
    }
    
    if (!data.totalDebt || data.totalDebt < 0) {
      errors.push('Total debt must be a non-negative number');
    }
    
    if (data.cashAndEquivalents < 0) {
      errors.push('Cash and equivalents must be non-negative');
    }
    
    return errors;
  }
}

module.exports = FinancialCalculations; 