import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import AddCompany from './pages/AddCompany';
import AddFinancialData from './pages/AddFinancialData';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/add-company" element={<AddCompany />} />
          <Route path="/companies/:id/add-financial-data" element={<AddFinancialData />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 