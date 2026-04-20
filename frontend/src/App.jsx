import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import NewCustomer from "./pages/NewCustomer";
import Dashboard from "./pages/Dashboard";
import CustomerHistory from "./pages/CustomerHistory";
import { Toaster } from "sonner";

export const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new-customer" element={<NewCustomer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<CustomerHistory />} />
        </Routes>
        <Toaster theme="dark" richColors position="top-right" />
      </BrowserRouter>
    </div>
  );
}
export default App;
