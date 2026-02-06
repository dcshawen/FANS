import logo from '../assets/FANSlogo.png';

export default function HomePage({ onGetStarted }) {
  const getLogoSize = () => {
    if (window.innerWidth < 576) return '160px'; // Mobile
    if (window.innerWidth < 768) return '200px'; // Tablet
    return '240px'; // Desktop
  };

  return (
    <div 
      className="vh-100 d-flex flex-column overflow-hidden" 
      style={{ background: 'linear-gradient(to bottom, #6A7F5F, #576653)' }}
    >
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center px-3 px-md-4">
       
        <div className="bg-white rounded-3 p-2 mb-2 mb-md-3 shadow-lg">
          <img 
            src={logo} 
            alt="FANS Logo" 
            className="img-fluid"
            style={{ width: getLogoSize(), maxWidth: '100%' }}
          />
        </div>
        
        
        <p className="text-white fs-6 fs-md-5 mb-2 mb-md-3 text-center px-2" style={{ maxWidth: '600px', opacity: 0.9 }}>
          Find food banks, community fridges, meal programs, and other food resources near you!
        </p>

       
        <div className="bg-white rounded-3 p-3 p-md-4 shadow-lg mb-2 mb-md-3 w-100" style={{ maxWidth: '500px' }}>
          <label className="form-label fw-medium mb-2" style={{ color: '#3A3F47' }}>
            Your Location
          </label>
          <input
            type="text"
            className="form-control form-control-lg mb-2 mb-md-3"
            placeholder="Enter address or postal code"
            style={{ borderColor: '#e0e0e0', borderWidth: '2px' }}
            onFocus={(e) => e.target.style.borderColor = '#FFB88C'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <button 
            className="btn btn-link w-100 text-decoration-underline p-0 small" 
            style={{ color: '#6A7F5F' }}
          >
            Use my current location
          </button>
        </div>

    
        <button
          onClick={onGetStarted}
          className="btn btn-md btn-lg-lg fw-semibold shadow-lg px-4 px-md-5 py-2 py-md-3"
          style={{ backgroundColor: '#FFB88C', color: 'white', border: 'none' }}
          onMouseOver={(e) => e.target.style.opacity = '0.9'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          Find Food Resources
        </button>
      </div>

    </div>
  );
}