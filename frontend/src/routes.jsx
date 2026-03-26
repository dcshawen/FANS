require('dotenv').config();
// Unique getRoute function for specific directions, separate from the original line graph

const { VITE_GRAPH_API_KEY } = process.env;

const getRoute = async (startCoords, endCoords, vehicle = 'foot', routeName = '') => { // Uses foot as default method
    const [userLng, userLat] = startCoords;
    const [destLng, destLat] = endCoords;

    try {
        const url =
            `https://graphhopper.com/api/1/route?`+
            `point=${userLat},${userLng}&` +
            `point=${destLat},${destLng}&` +
            `vehicle=${vehicle}&` +
            `key=${VITE_GRAPH_API_KEY}&` +
            `locale=en&` +
            `points_encoded=false&` +
            `instructions=true`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`GraphHopper API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.paths && data.paths.length > 0) {
            return data.paths[0]; // Returns the route with instructions
        } 
        throw new Error('No route found');

    } catch (error) {
        console.error('Error fetching route:', error);
        alert('Unable to fetch route. Please try again later.');
        return null;
    }    
}
