import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Plus, 
  Calendar,
  Filter,
  ChevronRight,
  Industry
} from 'lucide-react';
import { companiesApi, handleApiError } from '../services/api';
import toast from 'react-hot-toast';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getAll();
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = useCallback(() => {
    let filtered = companies;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.sector?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Industry filter
    if (selectedIndustry) {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }

    // Sector filter
    if (selectedSector) {
      filtered = filtered.filter(company => company.sector === selectedSector);
    }

    setFilteredCompanies(filtered);
  }, [companies, searchQuery, selectedIndustry, selectedSector]);

  useEffect(() => {
    filterCompanies();
  }, [filterCompanies]);

  const getUniqueValues = (field) => {
    const values = companies
      .map(company => company[field])
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);
    return values.sort();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSelectedSector('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading companies...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">
            Manage and analyze your leveraged loan portfolio
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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Industries</option>
            {getUniqueValues('industry').map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>

          {/* Sector Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sectors</option>
            {getUniqueValues('sector').map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Results Count */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredCompanies.length} of {companies.length} companies
          </span>
          {(searchQuery || selectedIndustry || selectedSector) && (
            <span className="flex items-center">
              <Filter className="h-3 w-3 mr-1" />
              Filters active
            </span>
          )}
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {companies.length === 0 ? 'No companies yet' : 'No companies match your filters'}
          </h3>
          <p className="text-gray-500 mb-4">
            {companies.length === 0 
              ? 'Start by adding your first company to begin credit analysis'
              : 'Try adjusting your search criteria or clearing filters'
            }
          </p>
          {companies.length === 0 ? (
            <Link
              to="/add-company"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Company
            </Link>
          ) : (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Link
              key={company.id}
              to={`/companies/${company.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                    {company.name}
                  </h3>
                  <div className="space-y-1">
                                          {company.industry && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <Industry className="h-3 w-3 mr-1" />
                          {company.industry}
                        </p>
                      )}
                    {company.sector && (
                      <p className="text-sm text-gray-500">
                        {company.sector}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>

              {company.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {company.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                {company.presentation_date && (
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Presentation: {new Date(company.presentation_date).toLocaleDateString()}
                  </span>
                )}
                <span>
                  Added {new Date(company.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies; 