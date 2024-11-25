import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import DataManagement from "./components/DataManagement";


const App = () => {
  return (
    <Router>
      <div>
        {/* Include the Navbar */}
        <Navbar />

        {/* Define Routes for each page */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data-management" element={<DataManagement />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;