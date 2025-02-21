// frontend/src/components/HRDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HRDashboard = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/resignations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, []);

  const handleDecision = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const finalWorkingDay =
        status === 'Approved'
          ? prompt('Enter final working day (YYYY-MM-DD):')
          : null;
      await axios.put(
        `/api/resignations/${id}`,
        { status, finalWorkingDay },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(requests.map(r => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">HR Dashboard</h1>
      {requests.map(req => (
        <div key={req._id} className="border p-4 mb-4">
          <p>Employee: {req.employee.username}</p>
          <p>Reason: {req.reason}</p>
          <p>
            Intended Last Working Day:{' '}
            {new Date(req.intendedLastWorkingDay).toLocaleDateString()}
          </p>
          <p>Status: {req.status}</p>
          {req.status === 'Pending' && (
            <div>
              <button
                onClick={() => handleDecision(req._id, 'Approved')}
                className="bg-green-500 text-white px-4 py-2 mr-2"
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision(req._id, 'Rejected')}
                className="bg-red-500 text-white px-4 py-2"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HRDashboard;
