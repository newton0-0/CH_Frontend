import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';

import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

const ComparisonModal = () => {
  const [showModal, setShowModal] = useState(false); // State to handle modal visibility
  let remarks = {}; // Object to store remarks for each row

  const [tenders, setTenders] = useState([null]);

  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://ch-backend.vercel.app/api';

  async function removeTenderFromComparison(tenderId) {
    try {
      const response = await axios.get(BASE_URL + `/user/remove-from-comparison`, {
        params: {
          tenderId: tenderId
        },
        headers: {
          Authorization: `${Cookies.get('auth')}`
        }
      });
      console.log(response.data);
      setTenders((prevTenders) => prevTenders.filter((tender) => tender._id !== tenderId));
    } catch (error) {
      console.error('Error removing tender from comparison:', error);
    }
  }

  async function removeAllTendersFromComparison() {
    try {
      const response = await axios.get(BASE_URL + '/user/remove-all-from-comparison', {
        headers: {
          Authorization: `${Cookies.get('auth')}`
        }
      });
      console.log(response.data);
      setTenders([]);
    } catch (error) {
      console.error('Error removing all tenders from comparison:', error);
    }
  }
  
  // Load wishlist from api call
  useEffect(() => {
    axios
      .get(BASE_URL + '/user/user-comparison', {
        headers: {
          Authorization: `${Cookies.get('auth')}`
        }
      })
      .then((response) => {
        console.log(response.data.data);
        setTenders(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching in comparison tenders:', error);
      });
  }, [BASE_URL]);

  if (!tenders || tenders.length === 0) {
    return <div className="alert alert-info">No tenders available for comparison.</div>;
  }

  // Dynamically extract aspects (keys) to display
  const aspects = Object.keys(tenders[0] || {}).filter(
    (key) => key !== 'tender_title' && key !== '_id'
  );

  // Calculate column widths
  const totalColumns = tenders.length + 2; // Number of tender columns + Aspect + Remarks
  const columnWidth = `${100 / totalColumns}%`; // Divide total width equally

  // Function to generate PDF
  const generatePDF = () => {
    const tableElement = document.getElementById('comparison-table'); // Get table by ID
    html2canvas(tableElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Tender_Comparison.pdf');
    });
  };

  return (
    <div>
      {/* Button to Trigger Modal */}
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        <CompareArrowsIcon />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tender Comparison</h5>
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
                  <table
                    id="comparison-table"
                    className="table table-striped table-hover table-bordered"
                    style={{ tableLayout: 'auto', width: '100%' }}
                  >
                    <thead className="thead-dark sticky-top">
                      <tr>
                        <th
                          className="align-middle text-wrap"
                          style={{ width: columnWidth }}
                        >
                          Aspect
                        </th>
                        {Object.entries(tenders).map(([index, tender]) => (
                          <th
                            key={tender._id || index}
                            className="align-middle text-center text-wrap"
                            style={{ width: columnWidth }}
                            title={`View details for ${tender.tender_title}`}
                          >
                            {tender.tender_title}
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={async () => {
                                await removeTenderFromComparison(tender._id);
                              }}
                            >
                              <RemoveCircleOutlineIcon />
                            </button>
                          </th>
                        ))}
                        <th
                          className="align-middle text-center"
                          style={{ width: columnWidth }}
                        >
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {aspects.map((aspect) => (
                        <tr key={aspect}>
                          <td
                            className="font-weight-bold align-middle text-wrap"
                            style={{ width: columnWidth }}
                          >
                            {aspect.replace(/_/g, ' ')} {/* Improve readability */}
                          </td>
                          {Object.entries(tenders).map(([index, tender]) => (
                            <td
                              key={index}
                              className="text-center align-middle text-wrap"
                              style={{ width: columnWidth }}
                            >
                              {tender[aspect] || <span className="text-muted">N/A</span>}
                            </td>
                          ))}
                          <td
                            className="align-middle"
                            style={{ width: columnWidth }}
                          >
                            <textarea
                              className="form-control"
                              rows="3"
                              placeholder={`Remark for ${aspect}`}
                              onChange={(e) => {
                                remarks[aspect] = e.target.value;
                              }}
                              style={{ resize: 'both', width: '100%' }}
                            ></textarea>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer w-100">
              <button
                  className="btn btn-outline-danger"
                  style={{ borderRadius: '1rem', float: 'left' }}
                  onClick={async () => {
                    await removeAllTendersFromComparison();
                  }}
                >
                  <RemoveCircleOutlineIcon /> Clear All
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    console.log('Remarks saved:', remarks);
                    setShowModal(false);
                  }}
                >
                  Save Remarks
                </button>
                <button className="btn btn-success" onClick={generatePDF}>
                  Download PDF
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

export default ComparisonModal;