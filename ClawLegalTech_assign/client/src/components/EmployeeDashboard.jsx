// frontend/src/components/EmployeeDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeDashboard = () => {
  const [resignation, setResignation] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/resignations/my-request', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResignation(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequest();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Employee Dashboard</h1>
      {resignation ? (
        <div>
          <p>Status: {resignation.status}</p>
          <p>
            Intended Last Working Day:{' '}
            {new Date(resignation.intendedLastWorkingDay).toLocaleDateString()}
          </p>
          {resignation.status === 'Approved' && !resignation.exitInterview && (
            <div>
              <h2 className="text-xl mt-4">Submit Exit Interview</h2>
              {/* Integrate ExitInterviewForm component here */}
            </div>
          )}
        </div>
      ) : (
        <p>No resignation request found.</p>
      )}
    </div>
  );
};

export default EmployeeDashboard;
