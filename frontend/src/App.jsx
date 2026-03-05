import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/homePage';
import RegisterService from './pages/registerService';
import ResourcesList from './pages/resourcesList';
import MapResults from './pages/mapResults';
import { geocodeAddresses } from './utils/geocodeService';



function App() {
  // Run geocoding on non-coordinate filled address on app launch
  useEffect(() =>{
    console.log("Checking for addresses without coordinates...");
    geocodeAddresses();
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterService />} />
        <Route path="/resources" element={<ResourcesList />} />
        <Route path="/map" element={<MapResults />} />
      </Routes>
    </Router>
  );
}

export default App;
