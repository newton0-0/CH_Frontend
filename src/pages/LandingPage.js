import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  // Navigate to the user page when the button is clicked
  const handleRedirect = () => {
    navigate('/user-page');
  };

  // Inline styles
  const landingPageStyle = {
    background: 'linear-gradient(to bottom, #00c6ff, #0072ff)', // Blue gradient background
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
    fontFamily: "'Arial', sans-serif"
  };

  const landingContentStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background for text
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    maxWidth: '400px',
    margin: '0 20px'
  };

  const btnLandingStyle = {
    backgroundColor: '#0072ff',
    color: 'white',
    fontSize: '1.2rem',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  };

  const btnLandingHoverStyle = {
    backgroundColor: '#005bb5' // Darker blue on hover
  };

  return (
    <div style={landingPageStyle}>
      <div style={landingContentStyle}>
        <h1>Welcome to Our Tender Dashboard</h1>
        <p>Your gateway to the latest tenders and opportunities.</p>
        <button
          style={btnLandingStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = btnLandingHoverStyle.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = btnLandingStyle.backgroundColor}
          onClick={handleRedirect}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;