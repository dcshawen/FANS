import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListCard from '../components/listcard';

const API_BASE_URL = 'http://localhost:8000';

export default function ResourcesList() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Filter organizations based on search query (matches name or tags)
  const filteredOrganizations = organizations.filter((org) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    // Check organization name
    const nameMatch = org.name?.toLowerCase().includes(query);
    
    // Check tags
    const tagsMatch = org.tags?.some(tag => 
      tag.toLowerCase().includes(query)
    );
    
    return nameMatch || tagsMatch;
  });

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
          {/* Search Bar */}
          <div className="mb-4">
            <div className="input-group" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <span 
                className="input-group-text bg-white border-end-0" 
                style={{ borderColor: '#6A7F5F' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#6A7F5F" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by Name or Type"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderColor: '#6A7F5F' }}
              />
              {searchQuery && (
                <button 
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ borderColor: '#6A7F5F' }}
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-center text-muted small mt-2">
                {filteredOrganizations.length} result{filteredOrganizations.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

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
          {!loading && !error && filteredOrganizations.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">
                {searchQuery 
                  ? `No resources found matching "${searchQuery}".` 
                  : 'No food resources available at this time.'}
              </p>
              {searchQuery && (
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Organizations Grid */}
          {!loading && !error && filteredOrganizations.length > 0 && (
            <div className="row g-4">
              {filteredOrganizations.map((org) => (
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
