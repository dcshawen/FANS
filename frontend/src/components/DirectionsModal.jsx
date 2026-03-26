import { useState } from 'react';

export default function DirectionsModal({ 
    show, 
    onClose, 
    onGetDirections, 
    destination, 
    loading = false
 }) {
    const [selectedVehicle, setSelectedVehicle] = useState('foot');
    const [directions, setDirections] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);

    const vehicles = [
        { value: 'foot', label: 'Walking', icon: 'bi-person-walking' },
        { value: 'car', label: 'Driving', icon: 'bi-car-front' },
        { value: 'bike', label: 'Cycling', icon: 'bi-bicycle' }
    ];

    const handleGetDirections = async() => {
        const result = await onGetDirections(selectedVehicle);
        if (result) {
            setDirections(result.instructions);
            setRouteInfo({
                distance: (result.distance / 1000).toFixed(2), // Converts to km
                time: Math.ceil(result.time / 60000) // Converts to minutes
            });
        }
    };

    const formatInstruction = (instruction) => {
        // GraphHopper instruction format is: 
        // [text, sign, waypoints, distance, time, street_name]

        const text = instruction[0];
        const distance = instruction[3] ? (instruction[3] / 1000).toFixed(2) : '0';
        return { text, distance };
    };

    if (!show) return null;

    return (
        <div 
        className="modal show d-block" 
        tabIndex="-1" 
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
        >
        <div 
            className="modal-dialog modal-dialog-centered modal-lg" 
            onClick={(e) => e.stopPropagation()}
        >
            <div className="modal-content">
                <div className="modal-header" style={{ backgroundColor: '#6A7F5F' }}>
                    <h5 className="modal-title text-white">
                    <i className="bi bi-signpost-2 me-2"></i>
                    Directions to {destination?.name}
                    </h5>
                    <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={onClose}
                    ></button>
                </div>

                <div className="modal-body p-4">
                    {/* Vehicle Selection */}
                    <div className="mb-4">
                        <label className="fw-semibold mb-2">Select Travel Method:</label>
                        <div className="d-flex gap-2">
                            {vehicles.map(vehicle => (
                            <button
                                key={vehicle.value}
                                className={`btn btn-sm ${selectedVehicle === vehicle.value ? 'active' : 'btn-outline-secondary'}`}
                                style={selectedVehicle === vehicle.value ? { backgroundColor: '#6A7F5F', borderColor: '#6A7F5F' } : {}}
                                onClick={() => {
                                setSelectedVehicle(vehicle.value);
                                setDirections(null);
                                setRouteInfo(null);
                                }}
                                disabled={loading}
                            >
                                <i className={`bi ${vehicle.icon} me-1`}></i>
                                {vehicle.label}
                            </button>
                            ))}
                        </div>
                    </div>

                    {/* Get Directions Button */}
                    <div className="mb-4">
                    <button
                        className="btn w-100"
                        style={{ backgroundColor: '#6A7F5F', color: 'white' }}
                        onClick={handleGetDirections}
                        disabled={loading}
                    >
                        {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Loading...
                        </>
                        ) : (
                        <>
                            <i className="bi bi-arrow-left-right me-2"></i>
                            Get Directions
                        </>
                        )}
                    </button>
                    </div>

                    {/* Route Info */}
                    {routeInfo && (
                    <div className="alert alert-info mb-3">
                        <strong>Route Summary:</strong><br/>
                        Distance: {routeInfo.distance} km | Duration: {routeInfo.time} min
                    </div>
                    )}

                    {/* Turn-by-Turn Instructions */}
                    {directions && directions.length > 0 ? (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <h6 className="fw-semibold mb-3">Turn-by-Turn Directions:</h6>
                        {directions.map((instruction, index) => {
                        const { text, distance } = formatInstruction(instruction);
                        return (
                            <div 
                            key={index} 
                            className="d-flex gap-3 mb-3 pb-2" 
                            style={{ borderBottom: '1px solid #e0e0e0' }}
                            >
                            <div 
                                className="d-flex align-items-center justify-content-center fw-bold text-white rounded-circle"
                                style={{
                                backgroundColor: '#6A7F5F',
                                width: '32px',
                                height: '32px',
                                minWidth: '32px'
                                }}
                            >
                                {index + 1}
                            </div>
                            <div className="flex-grow-1">
                                <p className="mb-1 text-dark">{text}</p>
                                <small className="text-muted">{distance} km</small>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    ) : directions !== null && (
                    <div className="alert alert-warning mb-0">
                        No directions available for this route.
                    </div>
                    )}
                </div>

                <div className="modal-footer border-0">
                    <button 
                    type="button" 
                    className="btn"
                    style={{ backgroundColor: '#6A7F5F', color: 'white' }}
                    onClick={onClose}
                    >
                    Close
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
}