import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

function CustomLens() {
  const navigate = useNavigate();
  const location = useLocation();

  const [lensName, setLensName] = useState("");
  const [lensPrice, setLensPrice] = useState("");

  useEffect(() => {
    // optional: prefill if returning from summary; keep minimal to avoid UI changes
    if (location.state?.customLensName) setLensName(location.state.customLensName);
    if (location.state?.customLensPrice) setLensPrice(location.state.customLensPrice);
  }, [location.state]);

  const canSelect = useMemo(() => {
    const priceNum = Number(lensPrice);
    return lensName.trim().length > 0 && Number.isFinite(priceNum) && priceNum >= 0;
  }, [lensName, lensPrice]);

  const handleSelect = () => {
    if (!canSelect) {
      toast.error("Enter valid lens name and price");
      return;
    }

    const selectedLens = {
      name: lensName.trim(),
      price: Number(lensPrice),
    };

    navigate("/new-customer", {
      state: {
        selectedLens,
        customerName: location.state?.customerName,
        mobile: location.state?.mobile,
        address: location.state?.address,
        bookingDate: location.state?.bookingDate,
        rightEye: location.state?.rightEye,
        leftEye: location.state?.leftEye,
        prescriptionType: location.state?.prescriptionType,
        prescriptionImage: location.state?.prescriptionImage,
      },
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row overflow-y-auto">
      {/* 🔹 LEFT SIDEBAR */}
      <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 max-h-[40vh] md:max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">Custom Lens</h2>
        <div className="text-sm text-white/60">
          Create your own lens option.
        </div>

        <div className="mt-6 bg-[#111] border border-white/10 rounded-lg p-4">
          <p className="text-white/70 text-xs uppercase tracking-wider mb-3">
            Inputs
          </p>
          <p className="text-white/50 text-xs">
            Lens Name + Lens Price will be saved with your order.
          </p>
        </div>
      </div>

      {/* 🔹 RIGHT CONTENT */}
      <div className="w-full md:w-3/4 p-4 md:p-8 overflow-y-auto flex-1">
        <button
          onClick={() => navigate("/lens-selection")}
          className="mb-6 text-[#d4af37]"
        >
          ← Back
        </button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">Custom Lens</h1>

        <div className="max-w-xl space-y-5">
          <div>
            <Label className="text-white/60 text-xs tracking-wider uppercase mb-2 block">
              Lens Name
            </Label>
            <Input
              value={lensName}
              onChange={(e) => setLensName(e.target.value)}
              placeholder="e.g. Premium Custom Tinted"
              className="w-full h-12 px-4 rounded-md bg-[#0f0f0f] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] cursor-text"
            />
            
          </div>

          <div>
            <Label className="text-white/60 text-xs tracking-wider uppercase mb-2 block">
              Lens Price
            </Label>
            <Input
              type="number"
              value={lensPrice}
              onChange={(e) => setLensPrice(e.target.value)}
              placeholder="e.g. 2500"
              className="w-full h-12 px-4 rounded-md bg-[#0f0f0f] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Preview</span>
              <span className="text-[#d4af37] text-sm font-semibold">
                ₹{Number(lensPrice || 0).toLocaleString()}
              </span>
            </div>
            <p className="text-white mt-2 text-sm">
              {lensName.trim().length ? lensName.trim() : "—"}
            </p>
          </div>

          <Button
            onClick={handleSelect}
            disabled={!canSelect}
            className="w-full bg-[#d4af37] text-black py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            Select This Lens
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CustomLens;

