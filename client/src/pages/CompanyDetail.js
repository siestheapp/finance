import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Plus, 
  Calendar,
  Industry,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { companiesApi, handleApiError, formatCurrency, formatRatio, formatPercentage } from '../services/api';
import toast from 'react-hot-toast';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [financialMetrics, setFinancialMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getById(id);
      setCompany(response.data.company);
      setFinancialMetrics(response.data.financialMetrics || []);
    } catch (error) {
      console.error('Error loading company:', error);
      toast.error(handleApiError(error));
      // If company not found, redirect to companies list
      if (error.response?.status === 404) {
        navigate('/companies');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading company details...</span>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Company not found</h2>
        <Link to="/companies" className="text-blue-600 hover:text-blue-700">
          Return to companies list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/companies"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Link>
        </div>
        
        <Link
          to={`/companies/${id}/add-financial-data`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Financial Data
        </Link>
      </div>

      {/* Company Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                                                 {company.industry && (
                  <span className="flex items-center">
                    <Industry className="h-4 w-4 mr-1" />
                    {company.industry}
                  </span>
                )}
                {company.sector && (
                  <span>• {company.sector}</span>
                )}
                {company.presentation_date && (
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(company.presentation_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {company.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{company.description}</p>
          </div>
        )}

        {company.analyst_notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyst Notes</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{company.analyst_notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Financial Metrics Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Financial Analysis</h2>
            <Link
              to={`/companies/${id}/add-financial-data`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Add Financial Data
            </Link>
          </div>
        </div>

        {financialMetrics.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No financial data yet</h3>
            <p className="text-gray-500 mb-4">
              Add financial metrics from lender presentations to start your credit analysis
            </p>
            <Link
              to={`/companies/${id}/add-financial-data`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Financial Data
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Key Metrics Cards */}
              {financialMetrics[0] && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Revenue</p>
                        <p className="text-xl font-bold text-blue-700">
                          {formatCurrency(financialMetrics[0].revenue)}
                        </p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">EBITDA</p>
                        <p className="text-xl font-bold text-green-700">
                          {formatCurrency(financialMetrics[0].ebitda)}
                        </p>
                      </div>
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Total Debt/EBITDA</p>
                        <p className="text-xl font-bold text-yellow-700">
                          {formatRatio(financialMetrics[0].total_debt_to_ebitda)}
                        </p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">EBITDA Margin</p>
                        <p className="text-xl font-bold text-purple-700">
                          {formatPercentage(financialMetrics[0].ebitda_margin)}
                        </p>
                      </div>
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Financial Metrics Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 font-medium text-gray-900">Period</th>
                    <th className="text-right py-3 font-medium text-gray-900">Revenue</th>
                    <th className="text-right py-3 font-medium text-gray-900">EBITDA</th>
                    <th className="text-right py-3 font-medium text-gray-900">Total Debt</th>
                    <th className="text-right py-3 font-medium text-gray-900">Leverage</th>
                    <th className="text-right py-3 font-medium text-gray-900">EV/EBITDA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {financialMetrics.slice(0, 5).map((metric, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-900">
                        {metric.period_end_date 
                          ? new Date(metric.period_end_date).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                      <td className="py-3 text-right text-gray-900">
                        {formatCurrency(metric.revenue)}
                      </td>
                      <td className="py-3 text-right text-gray-900">
                        {formatCurrency(metric.ebitda)}
                      </td>
                      <td className="py-3 text-right text-gray-900">
                        {formatCurrency(metric.total_debt)}
                      </td>
                      <td className="py-3 text-right text-gray-900">
                        {formatRatio(metric.total_debt_to_ebitda)}
                      </td>
                      <td className="py-3 text-right text-gray-900">
                        {formatRatio(metric.ev_to_ebitda)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail; 