import Cookies from 'js-cookie';
import axios from 'axios';

// Check if user is authenticated
async function checkAuth() {
    const baseUrl = 'http://localhost:4000';

    try {
      const response = await axios.get(baseUrl + '/api/user/verify-token', {
        headers: {
          Authorization: `Bearer ${Cookies.get('auth')}`
        }
      });
  
      console.log('Token Verification Response:', response.data);
  
      if (response.data.code === 200) {
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

  export default checkAuth;