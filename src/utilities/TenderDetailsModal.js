import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For API calls
import 'bootstrap/dist/css/bootstrap.min.css';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import cookie from 'react-cookies';

const TenderDetailsModal = ({ tender, show, onClose }) => {
  const [wishlistedTenders, setWishlistedTenders] = useState([]);
  const [userInComparison, setUserInComparison] = useState([]);

  const baseURL = process.env.REACT_APP_BASE_URL;
  const token = `Bearer${cookie.load('auth')?.slice(6)}`;

  // Fetch wishlist and comparison data on load
  useEffect(() => {
    const fetchWishlistAndComparison = async () => {
      try {
        const [wishlistResponse, comparisonResponse] = await Promise.all([
          axios.get(`${baseURL}/user/user-wishlist`, {
            headers: { Authorization: token },
          }),
          axios.get(`${baseURL}/user/user-comparison`, {
            headers: { Authorization: token },
          }),
        ]);
        console.log("wl : ", wishlistResponse.data.data);
        console.log("cmp : ", comparisonResponse.data.data);
        setWishlistedTenders(wishlistResponse.data.data || []);
        setUserInComparison(comparisonResponse.data.data || []);
      } catch (err) {
        console.error('Error fetching wishlist or comparison:', err.message);
      }
    };

    fetchWishlistAndComparison();
  }, [baseURL, token]);

  // Helper functions
  const isWishlisted = Object.values(wishlistedTenders).some((wlTender) => wlTender.tender_id === tender?.tender_id);
  const isCompared = Object.values(userInComparison).some((cmpTender) => cmpTender.tender_id === tender?.tender_id);

  const formatKey = (key) =>
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .replace(/(\bid\b|\bboq\b)/gi, (match) => match.toUpperCase());

  const formatDate = (value) =>
    !value || isNaN(new Date(value))
      ? value
      : new Date(value).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

  // Wishlist toggle
  const toggleWishlist = async () => {
    const endpoint = isWishlisted
      ? '/user/remove-from-wishlist'
      : '/user/add-to-wishlist';

    try {
      await axios.get(`${baseURL}${endpoint}`, {
        params: { tenderId: tender._id },
        headers: { Authorization: token },
      });

      alert(`Tender "${tender.tender_title}" has been ${isWishlisted ? 'removed from' : 'added to'} the wishlist.`);
      setWishlistedTenders((prev) =>
        isWishlisted
          ? prev.filter((wlTender) => wlTender.tender_id !== tender.tender_id)
          : [...prev, tender]
      );
    } catch (err) {
      console.error('Error toggling wishlist:', err.message);
      alert('Failed to update wishlist. Please try again.');
    }
  };

  // Comparison toggle
  const toggleComparison = async () => {
    const endpoint = isCompared
      ? '/user/remove-from-comparison'
      : '/user/add-to-comparison';
  
    try {
      await axios.get(`${baseURL}${endpoint}`, {
        params: { tenderId: tender._id },
        headers: { Authorization: token },
      });
  
      alert(`Tender "${tender.tender_title}" has been ${isCompared ? 'removed from' : 'added to'} the comparison.`);
  
      // Update the comparison state safely
      setUserInComparison((prev = []) => {
        if (!Array.isArray(prev)) prev = []; // Ensure `prev` is an array
        return isCompared
          ? prev.filter((cmpTender) => cmpTender.tender_id !== tender.tender_id)
          : [...prev, tender];
      });
    } catch (err) {
      console.error('Error toggling comparison:', err.message);
      alert('Failed to update comparison. Please try again.');
    }
  };  

  if (!tender) return null;

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
                    <th style={{ width: '30%' }}>{( key ==='_id' || key ==='bid_submission_end_date')? '' : formatKey(key)}</th>
                    <td style={{ width: '70%', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      {(key ==='_id' || key ==='bid_end_date')? "" : (key.toLowerCase().includes('date') ? formatDate(value) : value || 'N/A')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-outline-danger"
              onClick={toggleWishlist}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />} Wishlist
            </button>
            <button
              className="btn btn-outline-warning"
              onClick={toggleComparison}
              title={isCompared ? 'Remove from Comparison' : 'Add to Comparison'}
            >
              <CompareArrowsIcon /> {isCompared ? 'Remove from' : 'Add to'} Comparison
            </button>
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
