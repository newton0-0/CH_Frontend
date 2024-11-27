import {BrowserRouter, Routes, Route} from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';

import Cookies from 'js-cookie';
import axios from 'axios';

import './index.css';

import EmployeeDashboard from './pages/EmployeeDashboard';
import UserPage from './pages/UserPage';
import ComparisonPage from './pages/ComparisonPage';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Check if user is authenticated
async function checkEmp() {
  try {
    const response = await axios.get( process.env.REACT_APP_BASE_URL + '/api/user/verify-token', {
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

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/employee-dashboard" element={checkEmp()? <EmployeeDashboard/> : <UserPage />}></Route>
      <Route path="/user-page" element={<UserPage />}></Route>
      <Route path='/compare-tenders' element={<ComparisonPage />}></Route>
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
