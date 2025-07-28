# CLO Analytics Platform

A comprehensive web application designed for credit analysts at CLO (Collateralized Loan Obligation) asset management firms to streamline the analysis of leveraged loans. The platform automates financial ratio calculations and standardizes data collection from lender presentations.

## Features

### 🏢 Company Management
- Add and manage companies issuing leveraged loans
- Track industry, sector, and presentation dates
- Store analyst notes and company descriptions
- Search and filter companies by various criteria

### 📊 Financial Analysis
- Input financial metrics from lender presentations
- **Automated ratio calculations** including:
  - Leverage multiples (Total Debt/EBITDA, Net Debt/EBITDA)
  - Profitability margins (EBITDA margin, EBIT margin, Net margin)
  - Valuation multiples (EV/EBITDA, EV/Revenue, P/E)
  - Coverage ratios (EBITDA/Interest)
- Real-time preview of calculated ratios as you enter data
- Historical tracking of financial metrics over time

### 📈 Portfolio Dashboard
- Overview of portfolio metrics and key statistics
- Average leverage and profitability metrics across companies
- Recent activity and quick actions
- Visual summary of portfolio composition

### 🎯 Built for Credit Analysts
- Industry-specific terminology and metrics
- Workflow optimized for lender presentation analysis
- Data validation to ensure accuracy
- Export capabilities for reporting (coming soon)

## Technology Stack

- **Frontend**: React 18 with modern hooks and routing
- **Backend**: Node.js with Express.js
- **Database**: SQLite (easily upgradeable to PostgreSQL)
- **UI**: Custom CSS with Tailwind-inspired styling
- **Forms**: React Hook Form with validation
- **HTTP Client**: Axios for API communication

## Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project** to your desired directory

2. **Install dependencies** for all components:
   ```bash
   npm run install-deps
   ```

3. **Initialize the database**:
   ```bash
   cd server
   npm run init-db
   cd ..
   ```

4. **Start the development servers**:
   ```bash
   npm run dev
   ```

This will start both the backend API server (port 5000) and the frontend development server (port 3000). The application will automatically open in your browser at `http://localhost:3000`.

## API Endpoints

### Companies
- `GET /api/companies` - List all companies with optional search/filtering
- `POST /api/companies` - Create new company
- `GET /api/companies/:id` - Get company details with financial data
- `PUT /api/companies/:id` - Update company information
- `DELETE /api/companies/:id` - Delete company

### Financial Metrics
- `POST /api/financial-metrics` - Add financial data (auto-calculates ratios)
- `GET /api/financial-metrics/:companyId` - Get financial data for company
- `PUT /api/financial-metrics/:id` - Update financial data
- `DELETE /api/financial-metrics/:id` - Delete financial data
- `POST /api/financial-metrics/calculate` - Preview ratio calculations

## Database Schema

The application uses three main tables:

### Companies
- Basic company information (name, industry, sector)
- Presentation dates and analyst notes
- Created/updated timestamps

### Financial Metrics
- Income statement data (revenue, EBITDA, EBIT, net income)
- Balance sheet data (debt, cash, enterprise value)
- Valuation metrics (market cap, shares outstanding)

### Calculated Ratios
- Automatically computed ratios and multiples
- Linked to specific financial metric records
- Formatted for display and analysis

## Usage Guide

### Adding a New Company

1. Navigate to the **Dashboard** or **Companies** page
2. Click **"Add Company"**
3. Fill in the company information:
   - Company name (required)
   - Industry and sector
   - Presentation date
   - Description and analyst notes
4. Click **"Create Company"**

### Adding Financial Data

1. Go to a company's detail page
2. Click **"Add Financial Data"**
3. Enter the financial metrics from the lender presentation:
   - **Required**: Period end date, Revenue, EBITDA, Total debt, Cash & equivalents
   - **Optional**: Other income statement and balance sheet items
4. Watch the **live preview** of calculated ratios on the right
5. Click **"Save Financial Data"**

### Key Ratios Calculated

The platform automatically calculates these essential credit analysis ratios:

- **Total Debt/EBITDA**: Primary leverage metric
- **Net Debt/EBITDA**: Leverage after considering cash
- **EBITDA Margin**: Profitability as % of revenue
- **EV/EBITDA**: Valuation multiple
- **EV/Revenue**: Revenue multiple
- **Debt/Equity**: Capital structure ratio

## Customization

### Adding New Ratios

To add new financial ratios:

1. Update `server/utils/financialCalculations.js` with new calculation functions
2. Add new fields to the `calculated_ratios` database table
3. Update the API routes in `server/routes/financialMetrics.js`
4. Modify the frontend forms and display components

### Changing Database

To switch from SQLite to PostgreSQL:

1. Install PostgreSQL dependencies: `npm install pg`
2. Update the database connection in `server/utils/database.js`
3. Modify the initialization script for PostgreSQL syntax
4. Update environment variables for database connection

## Production Deployment

### Environment Variables

Create a `.env` file in the server directory:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
```

### Build and Deploy

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Deploy the server** with the built frontend files
3. **Initialize the production database**:
   ```bash
   cd server
   npm run init-db
   ```

## Contributing

This application is designed to be easily extensible. Common enhancements include:

- PDF parsing for automatic data extraction from presentations
- Additional financial ratios and metrics
- Peer comparison and benchmarking features
- Advanced reporting and data visualization
- Integration with external financial data providers

## Support

For questions or issues with setup and usage, the codebase includes comprehensive error handling and logging to help diagnose problems. Check the browser console for frontend issues and server logs for backend problems.

---

**Built for credit analysts, by understanding the leveraged loan analysis workflow.** This platform eliminates manual calculations and standardizes data collection, allowing analysts to focus on credit decisions rather than data entry. 