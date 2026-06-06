import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AUTH_KEY = "lensshine-auth";
const PASSWORD = "Riddhi@8077";

function PasswordLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => {
    // If auth gate sent us here, it may pass state.from
    const state = location.state;
    return state?.from || "/";
  }, [location.state]);

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = password ?? "";

    if (trimmed === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      setError("");
      navigate(redirectTo, { replace: true });
      return;
    }

    setError("Incorrect password");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Lensshine"
              className="h-14 w-auto object-contain"
            />
          </div>
          <h1
            className="text-2xl font-semibold mt-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Admin Access
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Enter password to continue
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/60">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-12 px-3 rounded-md bg-[#0f0f0f] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#d4af37] text-black h-12 font-semibold rounded-md hover:bg-[#f3e5ab] transition-colors"
          >
            Unlock
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-white/40">
          Password is protected locally in this browser.
        </div>
      </div>
    </div>
  );
}

export default PasswordLogin;

