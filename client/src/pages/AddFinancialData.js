import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Calculator, Eye, BarChart3 } from 'lucide-react';
import { companiesApi, financialMetricsApi, handleApiError, formatRatio, formatPercentage } from '../services/api';
import toast from 'react-hot-toast';

const AddFinancialData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewRatios, setPreviewRatios] = useState(null);
  const [calculatingPreview, setCalculatingPreview] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const watchedFields = watch();

  useEffect(() => {
    loadCompany();
  }, [id]);

  useEffect(() => {
    // Auto-calculate preview when key fields change
    const { revenue, ebitda, total_debt, cash_and_equivalents } = watchedFields;
    if (revenue && ebitda && total_debt !== undefined && cash_and_equivalents !== undefined) {
      calculatePreview();
    }
  }, [watchedFields.revenue, watchedFields.ebitda, watchedFields.total_debt, watchedFields.cash_and_equivalents, watchedFields.enterprise_value, watchedFields.market_cap]);

  const loadCompany = async () => {
    try {
      const response = await companiesApi.getById(id);
      setCompany(response.data.company);
    } catch (error) {
      console.error('Error loading company:', error);
      toast.error(handleApiError(error));
      navigate('/companies');
    }
  };

  const calculatePreview = async () => {
    try {
      if (!watchedFields.revenue || !watchedFields.ebitda) return;
      
      setCalculatingPreview(true);
      
      const data = {
        revenue: parseFloat(watchedFields.revenue) || 0,
        ebitda: parseFloat(watchedFields.ebitda) || 0,
        ebit: parseFloat(watchedFields.ebit) || 0,
        netIncome: parseFloat(watchedFields.net_income) || 0,
        totalDebt: parseFloat(watchedFields.total_debt) || 0,
        cashAndEquivalents: parseFloat(watchedFields.cash_and_equivalents) || 0,
        enterpriseValue: parseFloat(watchedFields.enterprise_value) || 0,
        marketCap: parseFloat(watchedFields.market_cap) || 0,
      };

      const response = await financialMetricsApi.calculateRatios(data);
      setPreviewRatios(response.data.formatted_ratios);
    } catch (error) {
      // Silently fail for preview calculations
      console.log('Preview calculation failed:', error);
    } finally {
      setCalculatingPreview(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Convert string values to numbers
      const financialData = {
        company_id: parseInt(id),
        period_end_date: data.period_end_date,
        revenue: parseFloat(data.revenue),
        gross_profit: parseFloat(data.gross_profit) || null,
        ebitda: parseFloat(data.ebitda),
        ebit: parseFloat(data.ebit) || null,
        net_income: parseFloat(data.net_income) || null,
        total_debt: parseFloat(data.total_debt),
        net_debt: parseFloat(data.net_debt) || null,
        cash_and_equivalents: parseFloat(data.cash_and_equivalents),
        enterprise_value: parseFloat(data.enterprise_value) || null,
        market_cap: parseFloat(data.market_cap) || null,
        shares_outstanding: parseFloat(data.shares_outstanding) || null,
      };

      await financialMetricsApi.create(financialData);
      
      toast.success('Financial data added successfully!');
      navigate(`/companies/${id}`);
      
    } catch (error) {
      console.error('Error adding financial data:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/companies/${id}`);
  };

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {company.name}
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Financial Data</h1>
            <p className="text-gray-600 mt-1">
              Enter financial metrics for {company.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Period Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period End Date *
                  </label>
                  <input
                    type="date"
                    {...register('period_end_date', { 
                      required: 'Period end date is required'
                    })}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.period_end_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.period_end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.period_end_date.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Income Statement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Income Statement</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('revenue', { 
                      required: 'Revenue is required',
                      min: { value: 0, message: 'Revenue must be positive' }
                    })}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.revenue ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.revenue && (
                    <p className="mt-1 text-sm text-red-600">{errors.revenue.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gross Profit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('gross_profit')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EBITDA *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('ebitda', { 
                      required: 'EBITDA is required'
                    })}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.ebitda ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.ebitda && (
                    <p className="mt-1 text-sm text-red-600">{errors.ebitda.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EBIT
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('ebit')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Net Income
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('net_income')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Balance Sheet */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Balance Sheet</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Debt *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('total_debt', { 
                      required: 'Total debt is required',
                      min: { value: 0, message: 'Total debt must be non-negative' }
                    })}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.total_debt ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.total_debt && (
                    <p className="mt-1 text-sm text-red-600">{errors.total_debt.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash & Equivalents *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('cash_and_equivalents', { 
                      required: 'Cash and equivalents is required',
                      min: { value: 0, message: 'Cash must be non-negative' }
                    })}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cash_and_equivalents ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.cash_and_equivalents && (
                    <p className="mt-1 text-sm text-red-600">{errors.cash_and_equivalents.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Net Debt
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('net_debt')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto-calculated if empty"
                  />
                </div>
              </div>
            </div>

            {/* Valuation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Valuation Metrics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enterprise Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('enterprise_value')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto-calculated if empty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market Cap
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('market_cap')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shares Outstanding
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('shares_outstanding')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Financial Data
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Ratios Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Calculated Ratios</h3>
            </div>
            
            {calculatingPreview ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner mr-2"></div>
                <span className="text-sm text-gray-600">Calculating...</span>
              </div>
            ) : previewRatios ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Leverage Ratios</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Debt/EBITDA:</span>
                      <span className="font-medium">{previewRatios.total_debt_to_ebitda}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Debt/EBITDA:</span>
                      <span className="font-medium">{previewRatios.net_debt_to_ebitda}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Profitability</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EBITDA Margin:</span>
                      <span className="font-medium">{previewRatios.ebitda_margin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">EBIT Margin:</span>
                      <span className="font-medium">{previewRatios.ebit_margin}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Valuation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EV/EBITDA:</span>
                      <span className="font-medium">{previewRatios.ev_to_ebitda}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">EV/Revenue:</span>
                      <span className="font-medium">{previewRatios.ev_to_revenue}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Enter financial data to see calculated ratios</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFinancialData; 