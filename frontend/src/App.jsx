import React, { useEffect, useState } from "react";
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
  const [theme, setTheme] = useState(
    localStorage.getItem("lensshine-theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("lensshine-theme") || "dark";
      setTheme(savedTheme);
      document.documentElement.classList.toggle("light-mode", savedTheme === "light");
    };

    applyTheme();
    window.addEventListener("lensshine-theme-change", applyTheme);

    return () => {
      window.removeEventListener("lensshine-theme-change", applyTheme);
    };
  }, []);

  return (
    <BrowserRouter>
      <div
        className={
          theme === "light"
            ? "min-h-screen bg-[#f5f5f3] text-[#111]"
            : "min-h-screen bg-[#0a0a0a] text-white"
        }
      >

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

        <Toaster
          theme={theme === "light" ? "light" : "dark"}
          richColors
          position="top-right"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;