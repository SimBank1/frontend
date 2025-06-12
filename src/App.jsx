import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { ThemeProvider } from './ThemeContext';

import Login from './components/login/Login';
import Dashboard from './components/dashboard/Dashboard';
import Terminal from './components/terminal/terminal';

function App() {
  return (
    <CookiesProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/terminal" element={<Terminal />} />
            {/* Catch-all fallback to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </CookiesProvider>
  );
}

export default App;
