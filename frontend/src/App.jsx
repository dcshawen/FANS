import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home_page';
import RegisterService from './pages/register_service';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterService />} />
      </Routes>
    </Router>
  );
}

export default App;
