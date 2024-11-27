import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import cookie from 'react-cookies';
import { useNavigate } from 'react-router-dom';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

import TenderDetailsModal from '../utilities/TenderDetailsModal';
import ComparisonModal from './ComparisonPage';
import WishlistTenders from './WishlistTenders';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const EmployeeDashboard = () => {
  const [tenders, setTenders] = useState([]);
  const [highlightTenders, setHighlightTenders] = useState([]);
  const [errors, setErrors] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [fetchQuantity, setFetchQuantity] = useState(20);
  const [pageNo, setPageNo] = useState(1);
  const [sorting, setSorting] = useState('desc');
  const [sortBy, setSortBy] = useState('tender_value');

  const [selectedTender, setSelectedTender] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  // Load wishlist from cookies or initialize with an empty array
  const [wishlistedTenders, setWishlistedTenders] = useState(() => cookie.load('userWishlist') || []);

  function formatNumber(num) {
    if (num === null || num === undefined) return 'Invalid number';
  
    const units = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3); // Determine the unit tier
    const suffix = units[tier] || ''; // Get the appropriate suffix
    const scale = Math.pow(10, tier * 3); // Determine the scale
    const scaledNum = num / scale; // Scale the number down
  
    // Format the number with 2 decimal places if it has decimals, otherwise no decimals
    return scaledNum.toFixed(scaledNum % 1 !== 0 ? 2 : 0) + suffix;
  }

  const navigate = useNavigate();

  const closeModal = () => {
    setSelectedTender(null);
    setShowModal(false);
  };

  // Check if a tender is wishlisted
  const isWishlisted = (tenderId) => wishlistedTenders.includes(tenderId);

  // Fetch all tenders
  const fetchTenders = useCallback(async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_BASE_URL + `/dashboard/all-tenders`, {
        params: {
          page: pageNo,
          quantity: fetchQuantity,
          sorting,
          sortBy
        },
      });
      setTenders(res.data.data);
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setErrors(err);
    }
  }, [pageNo, fetchQuantity, sorting, sortBy]);

  // Fetch highlight tenders
  const fetchHighlightTenders = useCallback(async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_BASE_URL + `/dashboard/highlight-tenders`);
      setHighlightTenders(res.data.data);
    } catch (err) {
      console.error('Error fetching highlight tenders:', err);
      setErrors(err);
    }
  }, []);

  useEffect(() => {
    fetchTenders();
    fetchHighlightTenders();  // Fetch highlights
  }, [fetchTenders, fetchHighlightTenders]);

  // Search tenders based on search value
  const searchTenders = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_BASE_URL + `/search-tenders`, {
        params: {
          search: searchValue,
          page: pageNo,
          quantity: fetchQuantity,
          sorting,
          sortBy,
        },
      });
      setTenders(res.data);
    } catch (err) {
      setErrors(err);
      console.log(err);
    }
  };

    // Logout Functionality
    const handleLogout = () => {
      cookie.remove('auth', { path: '/' });
      cookie.remove('userWishlist', { path: '/' });
      cookie.remove('userIncomparison', { path: '/' });
  
      navigate('/user-page');
    };

  return (
    <div className="container">
      {/* Header */}
      <h1>Welcome to the Tender Dashboard</h1>
      <button className="btn btn-danger" onClick={handleLogout}>
        <ExitToAppIcon />
      </button>

      {errors && <div className="alert alert-danger">Error fetching tenders: {errors.message}</div>}

      <ComparisonModal show={showComparisonModal} onClose={() => setShowComparisonModal(false)} />
      <WishlistTenders show={showWishlistModal} onClose={() => setShowWishlistModal(false)} />
      <TenderDetailsModal tender={selectedTender} show={showModal} onClose={closeModal} />

      {/* Search Bar */}
      <div className="row mb-3">
        <input
          className="col-md form-control d-inline-block mb-2 w-75"
          placeholder="Search"
          onChange={e => setSearchValue(e.target.value)}
        />
        <button className="col btn btn-primary d-inline-block mb-1" onClick={searchTenders}>Search</button>
      </div>

      {/* Highlights Section */}
      <div className="container">
        <h3>Highlights</h3>

        {/* Reaching Deadline Tenders */}
        <div className="row mb-4">
          <div className="col-6">
            <h5>Reaching Deadline Tenders</h5>
            <ul className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {highlightTenders.reachingDeadlineTenders?.map((tender, index) => (
                <li className="list-group-item" key={index}>
                  <span
                    className="d-inline-block text-truncate w-75"
                    title={tender.tender_title}
                    onClick={() => { setSelectedTender(tender); setShowModal(true); }}
                  >
                    {tender.tender_title}
                  </span>
                  <span className="float-right">{new Date(tender.bid_end_date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Best Valued Tenders */}
          <div className="col-6">
            <h5>Best Valued Tenders</h5>
            <ul className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {highlightTenders.bestValuedTenders?.map((tender, index) => (
                <li className="list-group-item" key={index}>
                  <span
                    className="d-inline-block text-truncate w-75"
                    title={tender.tender_title}
                    onClick={() => { setSelectedTender(tender); setShowModal(true); }}
                  >
                    {tender.tender_title}
                  </span>
                  <span className="float-right">{formatNumber(tender.tender_value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Other Tender Sections */}
        <div className="row">
          <h5>Tenders By Works</h5>
          {highlightTenders.tendersByWorks?.map((tender, index) => (
            <div className="col" key={index}>
              <h6>{tender._id} - {tender.count} tenders</h6>
              <ul className="list-group mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {tender.docs.map((doc, i) => (
                  <li className="list-group-item" key={i}>
                    <span
                      className="d-inline-block text-truncate"
                      style={{ maxWidth: '300px' }}
                      title={doc.tender_title}
                      onClick={() => { setSelectedTender(doc); setShowModal(true); }}
                    >
                      {doc.tender_title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tenders Table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Tender Title</th>
            <th>Tender Reference Number</th>
            <th>Tender ID</th>
            <th>Bid Submission End Date</th>
            <th>Tender Value</th>
            <th>Tender URL</th>
          </tr>
        </thead>
        <tbody>
          {tenders.map((tender) => (
            <tr key={tender._id}>
              <td>
                <span
                  className="text-truncate d-inline-block"
                  style={{ maxWidth: '250px' }}
                  title={tender.tender_title}
                  onClick={() => { setSelectedTender(tender); setShowModal(true); }}
                >
                  {tender.tender_title}
                </span>
              </td>
              <td>{tender.tender_reference_number}</td>
              <td>{tender.tender_id}</td>
              <td>{new Date(tender.bid_end_date).toLocaleDateString()}</td>
              <td>{formatNumber(tender.tender_value)}</td>
              <td>
                <a href={tender.tender_url} target="_blank" rel="noopener noreferrer">View Tender</a>
              </td>
              <td>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeDashboard;