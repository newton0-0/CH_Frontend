import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';

import Cookies from 'js-cookie';
import axios from 'axios';

import './index.css';

import LandingPage from './pages/LandingPage'; // Import the LandingPage component
import EmployeeDashboard from './pages/EmployeeDashboard';
import UserPage from './pages/UserPage';
import ComparisonPage from './pages/ComparisonPage';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Check if user is authenticated
async function checkEmp() {
  try {
    const response = await axios.get(process.env.REACT_APP_BASE_URL + '/api/user/verify-token', {
      headers: {
        Authorization: `${Cookies.get('auth')}`
      }
    });

    console.log('Token Verification Response:', response.data);

    if (response.data.code === 200 && response.data.role === "emp") {
      // Redirect to EmployeeDashboard
      return true;
    } else {
      // Redirect to Login Page
      return false;
    }
  } catch (error) {
    console.error('Token Verification Error:', error);

    return false;
  }
}

// Error page component for non-existent URLs
const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>This URL doesn't exist. Please check the address or return to the homepage.</p>
    </div>
  );
};

root.render(
  <BrowserRouter>
    <Routes>
      {/* Landing page as the default route */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/employee-dashboard" element={checkEmp() ? <EmployeeDashboard /> : <UserPage />} />
      <Route path="/user-page" element={<UserPage />} />
      <Route path="/compare-tenders" element={<ComparisonPage />} />

      {/* Add a fallback route for unknown URLs */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();