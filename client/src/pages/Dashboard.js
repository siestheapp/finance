import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Plus,
  Calendar,
  Industry
} from 'lucide-react';
import { companiesApi, handleApiError, formatRatio, formatPercentage } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load overview stats and recent companies in parallel
      const [statsResponse, companiesResponse] = await Promise.all([
        companiesApi.getOverviewStats(),
        companiesApi.getAll({ limit: 5 })
      ]);

      setStats(statsResponse.data);
      setRecentCompanies(companiesResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Companies',
      value: stats?.total_companies || 0,
      icon: Building2,
      color: 'blue',
      href: '/companies'
    },
    {
      title: 'Industries',
      value: stats?.industries || 0,
      icon: Industry,
      color: 'green',
    },
    {
      title: 'Avg Leverage',
      value: formatRatio(stats?.avg_leverage),
      icon: TrendingUp,
      color: 'yellow',
      subtitle: 'Total Debt / EBITDA'
    },
    {
      title: 'Avg EBITDA Margin',
      value: formatPercentage(stats?.avg_ebitda_margin),
      icon: BarChart3,
      color: 'purple',
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your leveraged loan portfolio and credit analysis
          </p>
        </div>
        <Link
          to="/add-company"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          const CardWrapper = stat.href ? Link : 'div';
          const cardProps = stat.href ? { to: stat.href } : {};

          return (
            <CardWrapper
              key={index}
              {...cardProps}
              className={`bg-white rounded-lg p-6 border-2 ${colorClasses} ${
                stat.href ? 'hover:shadow-lg transition-all duration-200 cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs opacity-60 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <IconComponent className="h-8 w-8 opacity-60" />
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Recent Companies */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Companies</h2>
            <Link
              to="/companies"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
        {recentCompanies.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
            <p className="text-gray-500 mb-4">
              Start by adding your first company to begin credit analysis
            </p>
            <Link
              to="/add-company"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Company
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentCompanies.slice(0, 5).map((company) => (
              <Link
                key={company.id}
                to={`/companies/${company.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{company.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      {company.industry && (
                        <span>{company.industry}</span>
                      )}
                      {company.sector && (
                        <span>• {company.sector}</span>
                      )}
                      {company.presentation_date && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(company.presentation_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">
                      Added {new Date(company.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/add-company"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <Plus className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                Add New Company
              </h3>
              <p className="text-sm text-gray-500">
                Start analyzing a new leveraged loan opportunity
              </p>
            </div>
          </Link>
          
          <Link
            to="/companies"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <BarChart3 className="h-8 w-8 text-gray-400 group-hover:text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-green-900">
                View Portfolio
              </h3>
              <p className="text-sm text-gray-500">
                Browse and compare all companies in your portfolio
              </p>
            </div>
          </Link>
          
          <div className="flex items-center p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
            <DollarSign className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Export Reports</h3>
              <p className="text-sm text-gray-500">
                Generate detailed analysis reports (Coming Soon)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 