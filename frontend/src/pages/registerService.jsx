import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/FANSlogo.png';
import { geocodeSingleAddress } from '../utils/geocodeService';

const API_BASE_URL = 'http://localhost:8000';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export default function RegisterService() {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      schedules: [{ day_of_week: 'Monday', open_time: '09:00', close_time: '17:00' }]
    }
  });
  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control,
    name: 'schedules'
  });
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // 1. Create Organization (matches OrganizationCreate model)
      const organizationData = {
        name: data.name,
        description: data.description || null,
        street_address: data.street_address || null,
        city: data.city || null,
        postal_code: data.postal_code || null
      };

      const orgResponse = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organizationData),
      });

      if (!orgResponse.ok) {
        const errorData = await orgResponse.json();
        throw new Error(errorData.detail || 'Failed to create organization');
      }

      const createdOrg = await orgResponse.json();
      const locationId = createdOrg.location_id;
      console.log('Organization created:', createdOrg);

      // 1.5 Geocode the address to get coordinates
      if (data.street_address && data.city && data.postal_code) {
        console.log('Geocoding new organization address...')
        const coords = await geocodeSingleAddress(
          locationId, 
          data.street_address, 
          data.city, 
          data.postal_code);
          if (coords) {
            console.log(`Geocoding successful: (${coords.lat}, ${coords.lng})`);
          } else {
            console.warn('Geocoding failed for the provided address.');
          }
      }

      // 2. Create Contact (matches ContactCreate model)
      if (data.phone_number || data.website_url) {
        const contactData = {
          location_id: locationId,
          phone_number: data.phone_number || null,
          websit_url: data.website_url || null  // Note: API has typo "websit_url"
        };

        const contactResponse = await fetch(`${API_BASE_URL}/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData),
        });

        if (!contactResponse.ok) {
          console.error('Failed to create contact');
        }
      }

      // 3. Create Schedules (matches ScheduleCreate model)
      for (const schedule of data.schedules || []) {
        if (schedule.day_of_week && schedule.open_time && schedule.close_time) {
          const scheduleData = {
            location_id: locationId,
            day_of_week: schedule.day_of_week,
            open_time: schedule.open_time,
            close_time: schedule.close_time
          };

          const scheduleResponse = await fetch(`${API_BASE_URL}/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleData),
          });

          if (!scheduleResponse.ok) {
            console.error('Failed to create schedule');
          }
        }
      }

      // 4. Create FoodOffered (matches FoodOfferedCreate model)
      if (data.offering_description || data.days_available || data.time_available || data.notes) {
        const foodData = {
          location_id: locationId,
          offering_description: data.offering_description || null,
          days_available: data.days_available || null,
          time_available: data.time_available || null,
          notes: data.notes || null
        };

        const foodResponse = await fetch(`${API_BASE_URL}/food-offerings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(foodData),
        });

        if (!foodResponse.ok) {
          console.error('Failed to create food offering');
        }
      }

      setSubmitSuccess(true);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            {/* Success Message */}
            {submitSuccess && (
              <div className="alert alert-success mb-4" role="alert">
                <strong>Success!</strong> Your organization has been registered. Redirecting...
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="alert alert-danger mb-4" role="alert">
                <strong>Error:</strong> {submitError}
              </div>
            )}

            {/* Organization Name */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Organization Name *
              </label>
              <input
                {...register('name', { required: 'Organization name is required', maxLength: 255 })}
                type="text"
                className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Enter your organization name"
                style={{ borderWidth: '2px' }}
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name.message}</div>
              )}
            </div>

            {/* Address */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Address *
              </label>
              <input
                {...register('street_address', { required: 'Street address is required', maxLength: 255 })}
                type="text"
                className={`form-control form-control-lg mb-2 ${errors.street_address ? 'is-invalid' : ''}`}
                placeholder="Street address"
                style={{ borderWidth: '2px' }}
              />
              {errors.street_address && (
                <div className="invalid-feedback d-block mb-2">{errors.street_address.message}</div>
              )}
              <div className="row g-2">
                <div className="col-6">
                  <select
                    {...register('city', { required: 'City is required' })}
                    className={`form-select form-select-lg ${errors.city ? 'is-invalid' : ''}`}
                    style={{ borderWidth: '2px' }}
                  >
                    <option value="">Select City</option>
                    <option value="Halifax">Halifax, NS</option>
                    <option value="Dartmouth">Dartmouth, NS</option>
                    <option value="Cole Harbour">Cole Harbour, NS</option>
                  </select>
                  {errors.city && (
                    <div className="invalid-feedback">{errors.city.message}</div>
                  )}
                </div>
                <div className="col-6">
                  <input
                    {...register('postal_code', { required: 'Postal code is required', maxLength: 20 })}
                    type="text"
                    className={`form-control form-control-lg ${errors.postal_code ? 'is-invalid' : ''}`}
                    placeholder="Postal Code"
                    style={{ borderWidth: '2px' }}
                  />
                  {errors.postal_code && (
                    <div className="invalid-feedback">{errors.postal_code.message}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Hours of Operation *
              </label>
              {scheduleFields.map((field, index) => (
                <div key={field.id} className="row g-2 mb-2 align-items-center">
                  <div className="col-4">
                    <select
                      {...register(`schedules.${index}.day_of_week`, { required: 'Day is required' })}
                      className="form-select"
                      style={{ borderWidth: '2px' }}
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-3">
                    <input
                      {...register(`schedules.${index}.open_time`, { required: 'Open time is required' })}
                      type="time"
                      className="form-control"
                      style={{ borderWidth: '2px' }}
                    />
                  </div>
                  <div className="col-3">
                    <input
                      {...register(`schedules.${index}.close_time`, { required: 'Close time is required' })}
                      type="time"
                      className="form-control"
                      style={{ borderWidth: '2px' }}
                    />
                  </div>
                  <div className="col-2">
                    {scheduleFields.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeSchedule(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm mt-2"
                onClick={() => appendSchedule({ day_of_week: 'Monday', open_time: '09:00', close_time: '17:00' })}
              >
                + Add Schedule
              </button>
            </div>

            {/* Contact Phone */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Contact Phone
              </label>
              <input
                {...register('phone_number', { maxLength: 20 })}
                type="tel"
                className="form-control form-control-lg"
                placeholder="(902) 123-4567"
                style={{ borderWidth: '2px' }}
              />
            </div>

            {/* Website URL */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Website URL
              </label>
              <input
                {...register('website_url')}
                type="url"
                className="form-control form-control-lg"
                placeholder="https://yourwebsite.com"
                style={{ borderWidth: '2px' }}
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#3A3F47' }}>
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="form-control form-control-lg"
                placeholder="Describe your organization..."
                style={{ borderWidth: '2px', resize: 'none' }}
              />
            </div>

            {/* Food Offered Section */}
            <div className="mb-3 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="fw-medium mb-3" style={{ color: '#3A3F47' }}>Food Offerings</h6>
              
              <div className="mb-2">
                <label className="form-label small" style={{ color: '#3A3F47' }}>
                  What food do you offer?
                </label>
                <textarea
                  {...register('offering_description')}
                  rows={2}
                  className="form-control"
                  placeholder="e.g., Fresh produce, canned goods, prepared meals..."
                  style={{ borderWidth: '2px', resize: 'none' }}
                />
              </div>

              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small" style={{ color: '#3A3F47' }}>
                    Days Available
                  </label>
                  <input
                    {...register('days_available')}
                    type="text"
                    className="form-control"
                    placeholder="e.g., Mon, Wed, Fri"
                    style={{ borderWidth: '2px' }}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small" style={{ color: '#3A3F47' }}>
                    Time Available
                  </label>
                  <input
                    {...register('time_available')}
                    type="text"
                    className="form-control"
                    placeholder="e.g., 9am - 5pm"
                    style={{ borderWidth: '2px' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label small" style={{ color: '#3A3F47' }}>
                  Additional Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="form-control"
                  placeholder="Any additional information about your food services..."
                  style={{ borderWidth: '2px', resize: 'none' }}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex gap-3 pt-3">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-outline-secondary btn-lg flex-fill"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-lg flex-fill text-white"
                style={{ backgroundColor: '#6A7F5F', border: 'none' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit for Review'
                )}
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