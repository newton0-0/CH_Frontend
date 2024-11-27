import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import cookie from 'react-cookies';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

  const closeModal = () => {
    setSelectedTender(null);
    setShowModal(false);
  };

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

      {/* Controls for Setting Fetch Quantity, Page No., Sorting */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label>Fetch Quantity</label>
          <select 
            className="form-control" 
            value={fetchQuantity} 
            onChange={e => setFetchQuantity(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="col-md-3">
          <label>Page Number</label>
          <input 
            type="number" 
            className="form-control" 
            value={pageNo} 
            onChange={e => setPageNo(Number(e.target.value))}
          />
        </div>
        <div className="col-md-3">
          <label>Sort By</label>
          <select 
            className="form-control" 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="tender_value">Tender Value</option>
            <option value="bid_end_date">Bid End Date</option>
            <option value="tender_title">Tender Title</option>
          </select>
        </div>
        <div className="col-md-3">
          <label>Sorting</label>
          <select 
            className="form-control" 
            value={sorting} 
            onChange={e => setSorting(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="container">
        <h3>Highlights</h3>
        {/* Reaching Deadline Tenders */}
        {/* [existing highlights code] */}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeDashboard;