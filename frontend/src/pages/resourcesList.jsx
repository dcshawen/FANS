import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListCard from '../components/listcard';

const API_BASE_URL = 'http://localhost:8000';

export default function ResourcesList() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/organizations`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      
      const organizations = await response.json();
      setOrganizations(organizations);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Header */}
      <header className="text-white p-3 p-md-4 shadow-sm" style={{ backgroundColor: '#6A7F5F' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div className="d-flex align-items-center justify-content-between">
            <button 
              onClick={handleBack}
              className="btn btn-sm d-flex align-items-center gap-2"
              style={{ backgroundColor: '#576653', border: 'none', color: 'white' }}
            >
              <span>←</span>
              <span>Home</span>
            </button>
            <h1 className="h4 mb-0 fw-bold">Food Resources</h1>
            <div style={{ width: '80px' }}></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 p-3 p-md-4">
        <div className="container">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading resources...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
              <button 
                className="btn btn-outline-danger btn-sm ms-3"
                onClick={fetchOrganizations}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && organizations.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No food resources available at this time.</p>
            </div>
          )}

          {/* Organizations Grid */}
          {!loading && !error && organizations.length > 0 && (
            <div className="row g-4">
              {organizations.map((org) => (
                <div key={org.location_id} className="col-12 col-md-6">
                  <ListCard organization={org} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
