import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../map';
import ResourceCard from '../components/resourceCard';

const API_BASE_URL = 'http://localhost:8000';

export default function MapResults() {
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

  // Get first 3 organizations for display
  const displayedOrganizations = organizations.slice(0, 3);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Header */}
      <header className="text-white p-3 shadow-sm" style={{ backgroundColor: '#6A7F5F' }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <button 
              onClick={handleBack}
              className="btn btn-sm d-flex align-items-center gap-2"
              style={{ backgroundColor: '#576653', border: 'none', color: 'white' }}
            >
              <span>←</span>
              <span>Home</span>
            </button>
            <h1 className="h4 mb-0 fw-bold">Find Food Resources</h1>
            <div style={{ width: '80px' }}></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 d-flex flex-column">
        {/* Map Section */}
        <div className="w-100">
          <MapComponent 
        center={[-63.5923, 44.6509]} 
        zoom={12} 
        width="100%"
        height="400px"
        maxBounds={[
    [-66.25, 43.38],  // Southwest corner [longitude, latitude]
    [-59.70, 47.64]   // Northeast corner [longitude, latitude]
]}
        />
        </div>

        {/* Resource Cards Section */}
        <div className="container py-4">
          <h2 className="h5 fw-bold mb-3 text-center" style={{ color: '#3A3F47' }}>
            Nearby Resources
          </h2>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ color: '#6A7F5F' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading resources...</p>
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
          {!loading && !error && displayedOrganizations.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No food resources available at this time.</p>
            </div>
          )}

          {/* Resource Cards Column - 3 cards */}
          {!loading && !error && displayedOrganizations.length > 0 && (
            <div className="d-flex flex-column gap-3">
              {displayedOrganizations.map((org) => (
                <div key={org.location_id}>
                  <ResourceCard organization={org} />
                </div>
              ))}
            </div>
          )}

          {/* View All Link */}
          {!loading && organizations.length > 3 && (
            <div className="text-center mt-4">
              <button 
                onClick={() => navigate('/resources')}
                className="btn"
                style={{ backgroundColor: '#6A7F5F', color: 'white' }}
              >
                View All Resources
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
