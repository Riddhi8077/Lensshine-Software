import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import NewCustomer from "./pages/NewCustomer";
import Dashboard from "./pages/Dashboard";
import CustomerHistory from "./pages/CustomerHistory";
import { Toaster } from "sonner";

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import PasswordLogin from "./pages/PasswordLogin";

// Lens pages
import LensSelection from "./pages/LensSelection";
import SingleVisionLens from "./pages/SingleVisionLens";
import BifocalLens from "./pages/BifocalLens";
import ProgressiveLens from "./pages/ProgressiveLens";
import CustomLens from "./pages/CustomLens";

const AUTH_KEY = "lensshine-auth";

function RequireAuth({ children }) {
  const location = useLocation();
  const isAuthed = localStorage.getItem(AUTH_KEY) === "1";

  if (!isAuthed) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname || "/" }}
      />
    );
  }

  return children;
}

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
          <Route path="/login" element={<PasswordLogin />} />

          {/* Main App (protected) */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route
            path="/new-customer"
            element={
              <RequireAuth>
                <NewCustomer />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <CustomerHistory />
              </RequireAuth>
            }
          />

          {/* Lens Flow (protected) */}
          <Route
            path="/lens-selection"
            element={
              <RequireAuth>
                <LensSelection />
              </RequireAuth>
            }
          />
          <Route
            path="/lens/single-vision"
            element={
              <RequireAuth>
                <SingleVisionLens />
              </RequireAuth>
            }
          />
          <Route
            path="/lens/bifocal"
            element={
              <RequireAuth>
                <BifocalLens />
              </RequireAuth>
            }
          />
          <Route
            path="/lens/progressive"
            element={
              <RequireAuth>
                <ProgressiveLens />
              </RequireAuth>
            }
          />

          <Route
            path="/lens/custom"
            element={
              <RequireAuth>
                <CustomLens />
              </RequireAuth>
            }
          />
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