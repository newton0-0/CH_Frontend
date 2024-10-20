import React, { useEffect, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const App = () => {
  const [tenders, setTenders] = useState([]);
  const [errors, setErrors] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [fetchQuantity, setFetchQuantity] = useState(20);
  const [pageNo, setPageNo] = useState(1);
  const [sorting, setSorting] = useState('desc');
  const [sortBy, setSortBy] = useState('tender_value');

  const fetchTenders = useCallback(async () => {
    try {
      const res = await fetch(`/api/all-tenders?page=${pageNo}&quantity=${fetchQuantity}&sorting=${sorting}&sortBy=${sortBy}`);

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const allTenders = await res.json(); 
      setTenders(allTenders); 
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setErrors(err);
    }
  }, [pageNo, fetchQuantity, sorting, sortBy]);

  useEffect(() => {
    fetchTenders(); 
  }, [fetchTenders]);

  const searchTenders = async () => {
    try {
      const res = await fetch(`/api/search-tenders?search=${searchValue}&page=${pageNo}&quantity=${fetchQuantity}&sorting=${sorting}&sortBy=${sortBy}`);
      
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const fetchSearchRes = await res.json(); 
      setTenders(fetchSearchRes); 
    } catch (err) {
      setErrors(err);
      console.log(err);
    }
  }

  return (
    <div className="container">
      {/* Header */}
      <h1>Tender Details</h1>
      {errors && <div className="alert alert-danger">Error fetching tenders: {errors.message}</div>}

      {/* Search Bar */}
      <div className="row mb-3">
        <input
          className="col-md form-control d-inline-block mb-2 w-75"
          placeholder="Search"
          onChange={e => setSearchValue(e.target.value)}
        />
        <button className="col btn btn-primary d-inline-block mb-1 w-25" onClick={searchTenders}>Search</button>
      </div>

      {/* Page and Fetch Quantity Details */}
      <div className="row mb-3 justify-content-around">
        <p className='w-25'>Page No:</p>
        <input
          className="w-25 form-control d-inline-block"
          type="number"
          min="1"
          value={pageNo}
          onChange={e => setPageNo(Math.max(1, parseInt(e.target.value) || 1))}
        />
        
        <p className='w-25'>Quantity:</p>
        <input
          className="w-25 form-control d-inline-block"
          type="number"
          min="1"
          value={fetchQuantity}
          onChange={e => setFetchQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      {/* Sorting Options */}
      <div className="row mb-3 justify-content-around">
        <h5 className='col'>Sort By:</h5>
        <select
          className="w-25 form-control d-inline-block"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="tender_title">Title</option>
          <option value="tender_value">Value</option>
          <option value="bid_submission_end_date">Closing Date</option>
        </select>
        <select
          className="w-25 form-control d-inline-block"
          value={sorting}
          onChange={e => setSorting(e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-secondary" onClick={() => setPageNo(pageNo - 1)} disabled={pageNo === 1}>
          Previous
        </button>
        <button className="btn btn-secondary" onClick={() => setPageNo(pageNo + 1)}>
          Next
        </button>
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
          {tenders.map(tender => (
            <tr key={tender._id}>
              <td>{tender.tender_title}</td>
              <td>{tender.tender_reference_number}</td>
              <td>{tender.tender_id}</td>
              <td>{new Date(tender.bid_submission_end_date).toLocaleDateString()}</td>
              <td>{tender.tender_value}</td>
              <td>
                <button className="btn btn-primary" onClick={() => window.location.replace(tender.tender_url)}>Go To</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;