import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CollaborationPage } from './pages/CollaborationPage';
import { DevvitClient, MockDevvitClient } from './lib/DevvitClient';

// Initialize the client (using mock for development)
const client: DevvitClient = new MockDevvitClient();

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/collaboration" 
          element={<CollaborationPage client={client} />} 
        />
        <Route 
          path="/" 
          element={<Navigate to="/collaboration" replace />} 
        />
      </Routes>
    </Router>
  );
};
