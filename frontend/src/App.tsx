import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { ClientsList } from './pages/ClientsList';
import { ClientDetails } from './pages/ClientDetails';
import { AddClient } from './pages/AddClient';
import { EditClient } from './pages/EditClient';
import { Documents } from './pages/Documents';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { ClientsTableView } from './pages/ClientsTableView';
import { Analytics } from './pages/Analytics';

function App() {
  return (
    <Router>
      <AuthProvider>
          
      <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clients" element={<ClientsList />} />
              <Route path="/clients/table" element={<ClientsTableView />} />
              <Route path="/clients/add" element={<AddClient />} />
              <Route path="/clients/:id" element={<ClientDetails />} />
              <Route path="/clients/:id/edit" element={<EditClient />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="analytics" element={<Analytics />} /> 
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;