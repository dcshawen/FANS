require('dotenv').config();

const { GRAPH_API_KEY } = process.env;

const getRoute = async (destination) => {
    const [userLng, userLat] = userLocation;
    const [destLng, destLat] = destination;

    const response = await fetch(
        `https://graphhopper.com/api/1/route?`+
        `point=${userLat},${userLng}&` +
        `point=${destLat},${destLng}&` +
        `vehicle=foot&` +
        `locale=en&` +
        `key=${GRAPH_API_KEY}`
    );

    return await response.json();
}
