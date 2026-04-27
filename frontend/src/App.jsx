import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import NewCustomer from "./pages/NewCustomer";
import Dashboard from "./pages/Dashboard";
import CustomerHistory from "./pages/CustomerHistory";
import { Toaster } from "sonner";

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lens pages
import LensSelection from "./pages/LensSelection";
import SingleVisionLens from "./pages/SingleVisionLens";
import BifocalLens from "./pages/BifocalLens";
import ProgressiveLens from "./pages/ProgressiveLens";

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0a] text-white">

        <Navbar />

        <Routes>
          {/* Main App */}
          <Route path="/" element={<HomePage />} />
          <Route path="/new-customer" element={<NewCustomer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<CustomerHistory />} />

          {/* Lens Flow */}
          <Route path="/lens-selection" element={<LensSelection />} />
          <Route path="/lens/single-vision" element={<SingleVisionLens />} />
          <Route path="/lens/bifocal" element={<BifocalLens />} />
          <Route path="/lens/progressive" element={<ProgressiveLens />} />
        </Routes>

        <Toaster theme="dark" richColors position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;