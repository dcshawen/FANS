import { useState, useEffect } from 'react';

export default function DirectionsModal({ 
    show, 
    onClose, 
    destination, 
    routeData = null
 }) {
    // const [selectedVehicle, setSelectedVehicle] = useState('foot');
    const [directions, setDirections] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);

    // Currently causing issues with fetching directions
    const vehicles = [
        { value: 'foot', label: 'Walking', icon: 'bi-person-walking' },
        { value: 'car', label: 'Driving', icon: 'bi-car-front' },
        { value: 'bike', label: 'Cycling', icon: 'bi-bicycle' }
    ];

    // const handleGetDirections = async() => {
    //     const result = await onGetDirections();
    //     if (result) {
    //         setDirections(result.instructions);
    //         setRouteInfo({
    //             distance: (result.distance / 1000).toFixed(2), // Converts to km
    //             time: Math.ceil(result.time / 60000) // Converts to minutes
    //         });
    //     }
    // };

    useEffect(() => {
        if (routeData) {
            setDirections(routeData.instructions);
            setRouteInfo({
                distance: (routeData.distance / 1000).toFixed(2), // Converts to km
                time: Math.ceil(routeData.time / 60000) // Converts to minutes
             });
         }
    }, [routeData]);

    const formatInstruction = (instruction) => {
        // GraphHopper instruction format is: 
        // [text, sign, waypoints, distance, time, street_name]

        return {
            text: instruction.text || 'Continue',
            distance: instruction.distance ? (instruction.distance / 1000).toFixed(2) : '0',
            time: instruction.time ? Math.ceil(instruction.time / 1000) : 0,
            street: instruction.street_name || instruction.street_ref || '',
            heading: instruction.heading || null
        };
    };

    const getCardinalDirection = (heading) => {
        if (heading === null || heading === undefined) return null;

        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(heading / 22.5) % 16;
        return directions[index];
    }

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
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="fw-semibold mb-0">Select Travel Method:</label>
                                <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>Coming Soon</span>
                            </div>
                            <div className="d-flex gap-2">
                                {vehicles.map(vehicle => (
                                    <button
                                        key={vehicle.value}
                                        className="btn btn-sm btn-outline-secondary"
                                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                        disabled
                                    >
                                        <i className={`bi ${vehicle.icon} me-1`}></i>
                                        {vehicle.label}
                                    </button>
                                ))}
                            </div>
                            <small className="text-muted d-block mt-2">
                                Multiple vehicle options will be available in a future update. Currently showing driving directions.
                            </small>
                        </div>

                    {/* Get Directions Button */}
                    {/* <div className="mb-4">
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
                    </div> */}

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
                        const { text, distance, heading } = formatInstruction(instruction);
                        const cardinal = getCardinalDirection(heading);
                        
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
                                <div className="d-flex align-items-center gap-2 mb-1">
                                <p className="mb-0 text-dark">{text}</p>
                                {cardinal && (
                                    <span 
                                    className="badge text-white"
                                    style={{ backgroundColor: '#FFB88C', color: '#3A3F47', fontSize: '0.75rem' }}
                                    >
                                    {cardinal}
                                    </span>
                                )}
                                </div>
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