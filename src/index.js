import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import Cookies from 'js-cookie';
import axios from 'axios';

import './index.css';

import LandingPage from './pages/LandingPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import UserPage from './pages/UserPage';
import ComparisonPage from './pages/ComparisonPage';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Error page component for non-existent URLs
const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>This URL doesn't exist. Please check the address or return to the homepage.</p>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // State to hold authentication status

  // Check if user is authenticated
  useEffect(() => {
    const checkEmp = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_BASE_URL + '/api/user/verify-token', {
          headers: {
            Authorization: `Bearer ${Cookies.get('auth')}`
          }
        });

        console.log('Token Verification Response:', response.data);

        if (response.data.code === 200 && response.data.role === 'emp') {
          setIsAuthenticated(true); // User is authenticated as employee
        } else {
          setIsAuthenticated(false); // User is not authenticated as employee
        }
      } catch (error) {
        console.error('Token Verification Error:', error);
        setIsAuthenticated(false); // Set to false if token verification fails
      }
    };

    checkEmp();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Display loading state while authentication is being checked
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page as the default route */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected Routes */}
        <Route path="/employee-dashboard" element={isAuthenticated ? <EmployeeDashboard /> : <UserPage />} />
        <Route path="/user-page" element={<UserPage />} />
        <Route path="/compare-tenders" element={<ComparisonPage />} />

        {/* Fallback route for unknown URLs */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();