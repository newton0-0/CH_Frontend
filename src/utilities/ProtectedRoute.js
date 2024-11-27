import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

// Protected Route Component
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null); // null while loading
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/user/verify-token', {
          headers: {
            Authorization: `Bearer ${Cookies.get('auth')}`
          }
        });

        setIsAuthenticated(response.data.code === 200); // Set authentication status
      } catch (error) {
        console.error('Token Verification Error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loader while checking authentication
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;