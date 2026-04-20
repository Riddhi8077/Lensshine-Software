import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Glasses, Home, UserPlus, LayoutDashboard, History } from "lucide-react";

// simple replacement for cn()
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/new-customer", label: "New Customer", icon: UserPlus },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/history", label: "Customer History", icon: History },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav
      data-testid="navbar"
      className="fixed top-0 w-full bg-black/60 backdrop-blur-xl border-b border-white/10 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex items-center gap-2">
            <Glasses className="h-7 w-7 text-[#d4af37]" />
            <span
              className="text-xl font-semibold tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Lens<span className="text-[#d4af37]">shine</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  location.pathname === path
                    ? "text-[#d4af37] bg-[#d4af37]/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Button */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-sm transition-colors",
                location.pathname === path
                  ? "text-[#d4af37] bg-[#d4af37]/10"
                  : "text-white/70 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;