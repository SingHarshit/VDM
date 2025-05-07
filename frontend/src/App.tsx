import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DealRoom from './components/Dealroom';

const App: React.FC = () => {
  let isAUthenticated = false;
  const token = localStorage.getItem('token') as string;
  if (token) {
    isAUthenticated = true
  }
  const deal_id = localStorage.getItem('id') as string;
  console.log(deal_id, typeof(deal_id))
  const userRole = localStorage.getItem('role') as 'Buyer' | 'Seller';
  

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={isAUthenticated ? <Dashboard deal_id={deal_id} /> : <Navigate to="/login" />} />
      <Route path="/dealroom/:dealId" element={<DealRoom dealId={deal_id} userRole={userRole || 'Buyer'} />} />
    </Routes>
  );
};

export default App;
