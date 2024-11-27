import React, { useState } from 'react';
import axios from 'axios'; // For API calls
import 'bootstrap/dist/css/bootstrap.min.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
// import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';

import cookie from 'react-cookies';

const TenderDetailsModal = ({ tender, show, onClose }) => {
  const [isWishlisted, setIsWishlisted] = useState(
    cookie.load('user')?.wishlistedTenders?.includes(tender?.tender_id) || false
  );
  const [isCompared, setIsCompared] = useState(false);

  if (!tender) return null;

  // Base URL from environment
  const baseURL = process.env.REACT_APP_BASE_URL;

  // Function to convert keys to well-mannered English format
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize each word
      .replace(/(\bid\b|\bboq\b)/gi, (match) => match.toUpperCase()); // Keep specific abbreviations in uppercase
  };

  // Function to format dates in a localized, readable manner
  const formatDate = (value) => {
    if (!value || isNaN(new Date(value))) return value; // If not a valid date, return as-is
    return new Date(value).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Function to handle adding/removing from wishlist
  const toggleWishlist = async () => {
    try {
      const endpoint = isWishlisted ? '/user/remove-from-wishlist' : '/user/add-to-wishlist';
      const token = "Bearer" + cookie.load('auth')?.slice(6);
      console.log('Token:', token);
      await axios.get(`${baseURL}${endpoint}`, { 
        params: { tenderId: tender._id }, 
        headers: { 
          "Authorization": token
        }
      });

      setIsWishlisted(!isWishlisted);
      alert(`Tender "${tender.tender_title}" has been ${isWishlisted ? 'removed from' : 'added to'} the wishlist.`);
    } catch (err) {
      console.error('Error toggling wishlist:', err.message);
      alert('Failed to update wishlist. Please try again.');
    }
  };

  // Function to handle adding/removing from comparison
  const toggleComparison = async () => {
    try {
      const endpoint = isCompared ? '/user/remove-from-comparison' : '/user/add-to-comparison';
      const token = "Bearer" + cookie.load('auth')?.slice(6); // Extract token from cookies
      console.log('Token:', token);
      
      // Make the API request to either add or remove from comparison
      await axios.get(`${baseURL}${endpoint}`, { 
        params: { tender_id: tender.tender_id }, // Ensure tender_id is correct
        headers: { 
          "Authorization": token
        }
      });

      setIsCompared(!isCompared);
      alert(`Tender "${tender.tender_title}" has been ${isCompared ? 'removed from' : 'added to'} the comparison.`);
    } catch (err) {
      console.error('Error toggling comparison:', err.message);
      alert('Failed to update comparison. Please try again.');
    }
  };

  return (
    <div
      className={`modal fade ${show ? 'show d-block' : ''}`}
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: show ? 'rgba(0, 0, 0, 0.5)' : 'transparent' }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tender Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <table className="table table-striped">
              <tbody>
                {Object.entries(tender).map(([key, value]) => (
                  <tr key={key}>
                    <th style={{ width: '30%' }}>{formatKey(key)}</th>
                    <td style={{ width: '70%', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      {key.toLowerCase().includes('date') ? formatDate(value) : value || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            {/* Wishlisting Button */}
            <button
              className="btn btn-outline-danger"
              onClick={toggleWishlist}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />} Wishlist
            </button>

            {/* Comparison Button */}
            <button
              className="btn btn-outline-warning"
              onClick={toggleComparison}
              title={isCompared ? 'Remove from Comparison' : 'Add to Comparison'}
            >
              <CompareArrowsIcon /> {isCompared ? 'Remove from' : 'Add to'} Comparison
            </button>

            {/* Close Button */}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderDetailsModal;