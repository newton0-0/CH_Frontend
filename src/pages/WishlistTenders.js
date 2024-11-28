import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import FavoriteIcon from '@mui/icons-material/Favorite';
import ClearIcon from '@mui/icons-material/Clear';

const WishlistModal = () => {
  const [showModal, setShowModal] = useState(false); // State to handle modal visibility
  const [userWishlist, setUserWishlist] = useState([null]);

  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://ch-backend.vercel.app/';
  
  // Load wishlist from api call
  useEffect(() => {
    axios
      .get(BASE_URL + '/user/user-wishlist', {
        headers: {
          Authorization: `${Cookies.get('auth')}`
        }
      })
      .then((response) => {
        console.log(response.data.data);
        setUserWishlist(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching wishlist:', error);
      });
  }, [BASE_URL]);

  // If no wishlist is found, display a message
  if (userWishlist.length === 0) {
    return (
      <div className="alert alert-info mt-4">
        Your wishlist is empty. No tenders found.
      </div>
    );
  };

  const removeTenderFromWishlist = async (tenderId) => {
    try {
      await axios.get(BASE_URL + '/user/remove-from-wishlist', {
        headers: {
          Authorization: `${Cookies.get('auth')}`
        },
        params: {
          tenderId
        }
      }).then((response) => {
        console.log(response.data.data);
        setUserWishlist(response.data.data.wishlist);
      });
    } catch (error) {
      console.error('Error removing tender from wishlist:', error);
    };
  }
  return (
    <div>
      {/* Button to Trigger Modal */}
      <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
        <FavoriteIcon />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Your Wishlist</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-striped table-hover table-bordered">
                    <thead className="thead-dark">
                      <tr>
                        <th className="text-center">Wishlisted Tenders</th>
                      </tr>
                    </thead>
                    <tbody>
                    {Object.entries(userWishlist).map(([index, tender]) => (
                          <tr
                            key={tender._id || index}
                            className="align-middle text-center text-wrap text-start"
                            title={`View details for ${tender.tender_title}`}
                          >
                            {tender.tender_title}
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => {
                                removeTenderFromWishlist(tender._id);
                              }}
                            >
                              <ClearIcon />
                            </button>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Background */}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default WishlistModal;