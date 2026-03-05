import axios from 'axios';

const GEOCODIO_API_KEY = import.meta.env.VITE_GEOCODIO_API_KEY;
const API_BASE_URL = 'http://localhost:8000';
const BATCH_SIZE = 10;

export async function geocodeAddresses() {
  try {
    // Get all organizations from existing endpoint
    const response = await fetch(`${API_BASE_URL}/organizations`);
    const orgs = await response.json();

    // Filter only organizations missing coordinates
    const ungeocoded = orgs.filter(org => !org.latitude || !org.longitude);

    if (ungeocoded.length === 0) {
      console.log('✓ All addresses already geocoded!');
      return;
    }

    console.log(`Found ${ungeocoded.length} addresses to geocode...`);

    // Process in batches
    for (let i = 0; i < ungeocoded.length; i += BATCH_SIZE) {
      const batch = ungeocoded.slice(i, i + BATCH_SIZE);
      await geocodeBatch(batch);
    }

    console.log('✓ Geocoding complete!');
  } catch (error) {
    console.error('Geocoding error:', error);
  }
}

// Format: 2107 Brunswick St, Halifax, NS, B3K, Canada
async function geocodeBatch(addresses) {
  const queries = addresses.map(addr => 
    `${addr.street_address}, ${addr.city}, ${addr.postal_code}, Canada`
  );

  try {
    const response = await axios.post(
      `https://api.geocodio.com/v1.7/geocode?api_key=${GEOCODIO_API_KEY}`,
      { addresses: queries }
    );

    // Update backend with coordinates
    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      const result = response.data.results[i];

      if (result.best_match) {
        const { lat, lng } = result.best_match.location;

        // Uses geocode endpoint
        await fetch(`${API_BASE_URL}/organizations/${addr.location_id}/geocode?lat=${lat}&lng=${lng}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: lat, longitude: lng })
        });
        
        console.log(`✓ ${addr.street_address}: (${lat}, ${lng})`);
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
  }
}

export async function geocodeSingleAddress(locationId, streetAddress, city, postalCode) {
  const query = `${streetAddress}, ${city}, ${postalCode}, Canada`;

  try {
    const response = await axios.post(
      `https://api.geocodio.com/v1.7/geocode?api_key=${GEOCODIO_API_KEY}`,
      { addresses: [query] }
    );

    const result = response.data.results[0];

    if (result.best_match) {
      const { lat, lng } = result.best_match.location;

      await fetch(`${API_BASE_URL}/organizations/${locationId}/geocode?lat=${lat}&lng=${lng}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });

      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}