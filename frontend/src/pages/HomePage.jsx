import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard } from "lucide-react";

const HERO_BG =
  "https://images.unsplash.com/photo-1761437855598-011cf89b2ad4?crop=entropy&cs=srgb&fm=jpg&q=85";

function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt="background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        
        <p className="text-xs tracking-[0.3em] uppercase text-[#d4af37] mb-6">
          Premium Optical Management
        </p>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-light mb-6"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Vision{" "}
          <span className="text-[#d4af37] font-medium">Redefined</span>
        </h1>

        <p className="text-base sm:text-lg text-white/60 mb-12 max-w-lg mx-auto">
          Streamline your optical shop operations. Manage customers, orders,
          and prescriptions in one place.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          <Link to="/new-customer">
            <button className="bg-[#d4af37] text-black px-8 py-3 flex items-center gap-2">
              New Customer
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>

          <Link to="/dashboard">
            <button className="border border-white/20 text-white px-8 py-3 flex items-center gap-2 hover:border-[#d4af37] hover:text-[#d4af37]">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
          </Link>

        </div>
      </div>

      <div className="bg-red-500 text-white p-6 text-2xl rounded-lg">
        Tailwind is working
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </div>
  );
}

export default HomePage;