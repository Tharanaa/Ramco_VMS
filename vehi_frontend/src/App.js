/*import React from 'react';
import VehicleForm from './components/VehicleForm.js';

function App() {
  return (
    <div className="App">
      <VehicleForm />
    </div>
  );
}

export default App;*/
/*import VehicleForm from './components/VehicleForm';
import VehicleReport from './components/VehicleReport';
import React, {useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/vehicles').then(res => setVehicles(res.data));
    axios.get('http://localhost:5000/api/drivers').then(res => setDrivers(res.data));
  }, []);

  return (
    <>
      <VehicleForm />
      <VehicleReport vehicles={vehicles} drivers={drivers} />
    </>
  );
}

export default App;*/

/*import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VehicleForm from './components/VehicleForm.js';
import VehicleReport from './components/VehicleReport.js';
import MailAutomation from './components/MailAutomation.js';
import './App.css';

function App() {
  return (
    <Router>
      
      <nav style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
        <Link to="/form" style={{ marginRight: '20px' }}>🚗 Vehicle Form</Link>
        <Link to="/report" style={{ marginRight: '20px' }}>📊 Vehicle Report</Link>
        <Link to="/automation">📧 Mail Automation</Link>
      </nav>

     
      <Routes>
        <Route path="/form" element={<VehicleForm />} />
        <Route path="/report" element={<VehicleReport />} />
        <Route path="/automation" element={<MailAutomation />} />
      </Routes>
    </Router>
  );
}

export default App;*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VehicleForm from './components/VehicleForm.js';
import VehicleReport from './components/VehicleReport.js';
import VehicleDutyForm from './components/VehicleDutyForm.js'; // ✅ import the new page
import VehicleDetails from "./components/VehicleDetails";
import DriverDetails from './components/DriverDetails.js';

import './App.css';

function App() {
  return (
    <Router>
      {/* Simple Navigation Menu */}
      <nav style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
        <Link to="/form" style={{ marginRight: '20px' }}>🚗 Vehicle Form</Link>
        <Link to="/report" style={{ marginRight: '20px' }}>📊 Vehicle Report</Link>
        {/* <Link to="/automation" style={{ marginRight: '20px' }}>📧 Mail Automation</Link> */}
        <Link to="/duty" style={{ marginRight: '20px' }}>📝 Vehicle Duty</Link> {/* ✅ add link to VehicleDutyForm */}
        <Link to="/vehicle-details">Vehicle Details</Link>
        <Link to="/driver-details" style={{ marginLeft: '20px' }}>Driver Details</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/form" element={<VehicleForm />} />
        <Route path="/report" element={<VehicleReport />} />
        {/* <Route path="/automation" element={<MailAutomation />} /> */}
        <Route path="/duty" element={<VehicleDutyForm />} /> {/* ✅ route for VehicleDutyForm */}
        <Route path="/vehicle-details" element={<VehicleDetails />} />
        <Route path="/driver-details" element={<DriverDetails />} />
      </Routes>
    </Router>
  );
}

export default App;

