import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

import TenderDetailsModal from '../utilities/TenderDetailsModal';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Brightness4Icon from '@mui/icons-material/Brightness4';

const AdminDashboard = () => {
  const [tenders, setTenders] = useState([]);
  const [errors, setErrors] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [fetchQuantity, setFetchQuantity] = useState(20);
  const [pageNo, setPageNo] = useState(1);
  const [sorting, setSorting] = useState('desc');
  const [sortBy, setSortBy] = useState('tender_value');
  const [selectedTender, setSelectedTender] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAllTenders, setShowAllTenders] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const navigate = useNavigate();

  // Constants
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // Utility Function: Format Numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'Invalid number';
    const units = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    const suffix = units[tier] || '';
    const scale = Math.pow(10, tier * 3);
    const scaledNum = num / scale;
    return scaledNum.toFixed(scaledNum % 1 !== 0 ? 2 : 0) + suffix;
  };

  // Fetch All Tenders
  const fetchTenders = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/all-tenders`, {
        params: { page: pageNo, quantity: fetchQuantity, sorting, sortBy },
      });
      setTenders(res.data.data);
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setErrors(err);
    }
  }, [pageNo, fetchQuantity, sorting, sortBy, BASE_URL]);

  // Fetch Pending Users
  const fetchUnapprovedUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/pending-users`, {
        headers: { Authorization: `${Cookies.get('auth')}` },
      });
      setPendingUsers(res.data);
    } catch (err) {
      console.error('Error fetching unapproved users:', err);
      setErrors(err);
    }
  }, [BASE_URL]);

  // Approve User
  const approveUser = async (userId, role) => {
    try {
      await axios.post(
        `${BASE_URL}/admin/approve-user`,
        { id: userId, role },
        { headers: { Authorization: `${Cookies.get('auth')}` } }
      );
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      console.log(`User ${userId} approved as ${role}`);
    } catch (err) {
      console.error('Error approving user:', err);
      setErrors(err);
    }
  };

  // Handle Search for Users
  const handleUserSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${BASE_URL}/admin/search-user`, {
        params: { search: searchTerm },
        headers: { Authorization: `${Cookies.get('auth')}` },
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Error searching users:', err);
      setErrors(err);
    }
  };

  // Hide Tender
  const handleHideTender = async (tenderId) => {
    try {
      await axios.get(`${BASE_URL}/admin/hide-tender`, {
        params: { tenderId },
        headers: { Authorization: `${Cookies.get('auth')}` },
      });
      alert('Tender hidden successfully!');
      fetchTenders();
    } catch (err) {
      console.error('Error hiding tender:', err);
      setErrors(err);
    }
  };

  // Search Tenders
  const searchTenders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/search-tenders`, {
        params: { search: searchValue, page: pageNo, quantity: fetchQuantity, sorting, sortBy },
      });
      setTenders(res.data);
    } catch (err) {
      console.error('Error searching tenders:', err);
      setErrors(err);
    }
  };

  const removeUser = async (userId) => {
    try {
      await axios.get(
        `${BASE_URL}/admin/reject-user`,
        { 
          headers: { Authorization: `${Cookies.get('auth')}` },
          params: { id: userId } 
        }
      );
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      console.log(`User ${userId} rejected`);
    } catch (err) {
      console.error('Error rejecting user:', err);
      setErrors(err);
    }
  };

  // Logout Functionality
  const handleLogout = () => {
    Cookies.remove('auth', { path: '/' });
    Cookies.remove('userWishlist', { path: '/' });
    Cookies.remove('userIncomparison', { path: '/' });
    navigate('/user-page');
  };

  // Close Modal
  const closeModal = () => {
    setSelectedTender(null);
    setShowModal(false);
  };

  // UseEffect Hooks
  useEffect(() => {
    fetchTenders();
    fetchUnapprovedUsers();
  }, [fetchTenders, fetchUnapprovedUsers]);

  return (
    <div className="container" style={{ backgroundColor: isDarkMode ? '#808080' : '#fff', padding: '20px' }}>
      {/* Header */}
      <div className="container">
  <div className="d-flex justify-content-between align-items-center py-3">
    {/* Left-Aligned Welcome Title */}
    <h1 className="text-start" style={{ color: isDarkMode ? '#fff' : '#333' }}>Welcome to the Tender Dashboard</h1>

    {/* Right-Aligned Buttons */}
    <div className="d-flex gap-3">
      {/* Modals */}
      <button
        className="btn btn-primary"
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        <Brightness4Icon />
      </button>
      <TenderDetailsModal
        tender={selectedTender}
        show={showModal}
        onClose={closeModal}
      />

      {/* Logout Button */}
      <button className="btn btn-danger h-50" onClick={handleLogout}>
        <ExitToAppIcon /> Logout
      </button>
    </div>
  </div>

  {/* Error Alert */}
  {errors && (
    <div className="alert alert-danger">
      Error fetching tenders: {errors.message}
    </div>
  )}
</div>
      {/* Search Bar */}
      <div className="row mb-3">
        <input
          className="col-md form-control d-inline-block mb-2 w-75"
          placeholder="Search"
          onChange={e => setSearchValue(e.target.value)}
        />
        <button className="col btn btn-primary d-inline-block mb-1" style={{ maxWidth: '100px' }} onClick={searchTenders}>Search</button>
      </div>

      <h2 className="text-center">Admin User Management</h2>

      {/* Row for Pending Users */}
      <div className="row mt-4">
        <h4>Pending User Approvals</h4>
        {!pendingUsers? (<div className="alert alert-info">No pending users to approve.</div>):null}
        {pendingUsers && Object.values(pendingUsers).map((user) => (
          <div className="row mb-2 align-items-center" key={user.id}>
            <div className="col-4">
              <strong>{user.name}</strong> ({user.email})
            </div>
            <div className="col-8 d-flex justify-content-between">
              <button
                className="btn btn-success"
                onClick={() => approveUser(user.id, "emp")}
              >
                Approve as Employee
              </button>
              <button
                className="btn btn-primary"
                onClick={() => approveUser(user.id, "admin")}
              >
                Approve as Admin
              </button>
            </div>
          </div>
        ))}
        {pendingUsers.length === 0 && (
          <div className="alert alert-info">No pending users to approve.</div>
        )}
      </div>

      {/* Row for Searching Users */}
      <div className="row mt-4">
        <h4>Search Users</h4>
        <form onSubmit={(e) => handleUserSearch(e)} className="d-flex mb-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            {searchResults.map((user) => (
              <div className="row mb-2 align-items-center" key={user.id}>
                <div className="col-8">
                  <strong>{user.name}</strong> ({user.email})
                  <button
                    className="btn btn-primary"
                    onClick={() => removeUser(user.id)}
                  >
                    Remove User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {searchResults.length === 0 && searchTerm && (
          <div className="alert alert-warning">
            No users found for "{searchTerm}".
          </div>
        )}
      </div>

      {/* Tenders Table */}
      <button className="btn btn-primary" onClick={() => setShowAllTenders(!showAllTenders)}>{showAllTenders ? 'Hide All Tenders' : 'Show All Tenders'}</button>
      {showAllTenders && <table className="table table-striped">
        <tr>
<div className="row mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px', border: '1px solid #ccc' }}>
  <div className="col">
    <input
      type="number"
      className="form-control"
      placeholder="Fetch Quantity"
      onChange={(e) => setFetchQuantity(e.target.value)}
    />
  </div>
  <div className="col">
    <select
      className="form-control"
      onChange={(e) => setSortBy(e.target.value)}
    >
      <option value="">Sort By</option>
      <option value="tender_title">Tender Title</option>
      <option value="tender_reference_number">Tender Reference Number</option>
      <option value="tender_id">Tender ID</option>
      <option value="bid_end_date">Bid Submission End Date</option>
      <option value="tender_value">Tender Value</option>
      <option value="tender_url">Tender URL</option>
    </select>
  </div>
  <div className="col">
    <select
      className="form-control"
      onChange={(e) => setSorting(e.target.value)}
    >
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>
  </div>
  <div className="col">
    <input
      type="number"
      className="form-control"
      placeholder="Page Number"
      onChange={(e) => setPageNo(e.target.value)}
    />
  </div>
</div>
        </tr>
        <thead>
          <tr>
            <th>Tender Title</th>
            <th>Tender Reference Number</th>
            <th>Tender ID</th>
            <th>Bid Submission End Date</th>
            <th>Tender Value</th>
            <th>Tender URL</th>
            <th>Actions</th>
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
                <button className="btn btn-danger" onClick={() => handleHideTender(tender._id)}>Hide</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
};
export default AdminDashboard;