import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/FANSlogo.png';

export default function RegisterService() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    // Handle form submission here
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="vh-100 d-flex flex-column overflow-hidden" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Header */}
      <header className="text-white p-3 p-md-4 shadow-sm" style={{ backgroundColor: '#6A7F5F' }}>
        <div className="d-flex align-items-center">
          <button 
            onClick={handleBack}
            className="btn p-2 rounded d-flex align-items-center gap-2"
            style={{ backgroundColor: '#576653', border: 'none' }}
          >
            <span className="text-white fs-4">←</span>
            <span className="text-white">Home</span>
          </button>
        </div>
      </header>

      <div className="flex-grow-1 overflow-auto p-3 p-md-4">
        <div className="mx-auto" style={{ maxWidth: '800px' }}>
          {/* Logo */}
          <div className="d-flex justify-content-center mb-4">
            <div className="bg-white rounded-3 p-3 shadow-lg">
              <img src={logo} alt="FANS" style={{ height: '200px', display: 'block' }} />
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-4 p-3 border-start border-4 rounded" style={{ backgroundColor: '#fff0e8', borderColor: '#FFB88C' }}>
            <p className="mb-0" style={{ color: '#3A3F47' }}>
              Are you a small business or organization offering free food services? Register here to appear on the FANS map and help people in need.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Organization Name */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Organization Name *
              </label>
              <input
                {...register('organizationName', { required: 'Organization name is required' })}
                type="text"
                className={`form-control form-control-lg ${errors.organizationName ? 'is-invalid' : ''}`}
                placeholder="Enter your organization name"
                style={{ borderWidth: '2px' }}
              />
              {errors.organizationName && (
                <div className="invalid-feedback">{errors.organizationName.message}</div>
              )}
            </div>

            {/* Service Type */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Service Type *
              </label>
              <select 
                {...register('serviceType', { required: 'Service type is required' })}
                className={`form-select form-select-lg ${errors.serviceType ? 'is-invalid' : ''}`}
                style={{ borderWidth: '2px' }}
              >
                <option value="">Select a service type</option>
                <option value="food-bank">Food Bank</option>
                <option value="community-fridge">Community Fridge</option>
                <option value="meal-program">Meal Program</option>
                <option value="soup-kitchen">Soup Kitchen</option>
              </select>
              {errors.serviceType && (
                <div className="invalid-feedback">{errors.serviceType.message}</div>
              )}
            </div>

            {/* Address */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Address *
              </label>
              <input
                {...register('street', { required: 'Street address is required' })}
                type="text"
                className={`form-control form-control-lg mb-2 ${errors.street ? 'is-invalid' : ''}`}
                placeholder="Street address"
                style={{ borderWidth: '2px' }}
              />
              {errors.street && (
                <div className="invalid-feedback d-block mb-2">{errors.street.message}</div>
              )}
              <div className="row g-2">
                <div className="col-6">
                  <input
                    {...register('city', { required: 'City is required' })}
                    type="text"
                    className={`form-control form-control-lg ${errors.city ? 'is-invalid' : ''}`}
                    placeholder="City"
                    style={{ borderWidth: '2px' }}
                  />
                  {errors.city && (
                    <div className="invalid-feedback">{errors.city.message}</div>
                  )}
                </div>
                <div className="col-6">
                  <input
                    {...register('postalCode', { required: 'Postal code is required' })}
                    type="text"
                    className={`form-control form-control-lg ${errors.postalCode ? 'is-invalid' : ''}`}
                    placeholder="Postal Code"
                    style={{ borderWidth: '2px' }}
                  />
                  {errors.postalCode && (
                    <div className="invalid-feedback">{errors.postalCode.message}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Hours of Operation *
              </label>
              <input
                {...register('hours', { required: 'Hours of operation are required' })}
                type="text"
                className={`form-control form-control-lg ${errors.hours ? 'is-invalid' : ''}`}
                placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM"
                style={{ borderWidth: '2px' }}
              />
              {errors.hours && (
                <div className="invalid-feedback">{errors.hours.message}</div>
              )}
            </div>

            {/* Contact Phone */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Contact Phone
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="form-control form-control-lg"
                placeholder="(902) 123-4567"
                style={{ borderWidth: '2px' }}
              />
            </div>

            {/* Contact Email */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Contact Email *
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                placeholder="your@email.com"
                style={{ borderWidth: '2px' }}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className={`form-control form-control-lg ${errors.description ? 'is-invalid' : ''}`}
                placeholder="Describe your service and who it serves..."
                style={{ borderWidth: '2px', resize: 'none' }}
              />
              {errors.description && (
                <div className="invalid-feedback">{errors.description.message}</div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="d-flex gap-3 pt-3">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-outline-secondary btn-lg flex-fill"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-lg flex-fill text-white"
                style={{ backgroundColor: '#6A7F5F', border: 'none' }}
              >
                Submit for Review
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-4 p-3 border rounded" style={{ backgroundColor: '#fef9e8', borderColor: '#F4D06F' }}>
            <p className="small mb-0" style={{ color: '#3A3F47' }}>
              All submissions will be reviewed before appearing on the map. You will receive a confirmation email once approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}