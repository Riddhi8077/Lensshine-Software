import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const bifocalOptions = [
  {
    id: 1,
    name: "Hard Coat Bifocal",
    price: 550,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Scratch resistant", "Basic bifocal support", "Affordable"],
    power: "Supports: ±2.00"
  },
  {
    id: 2,
    name: "Blue Screen Bifocal",
    price: 850,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Blue light protection", "Reduces strain", "Clear vision"],
    power: "Supports: ±4.00"
  },
  {
    id: 3,
    name: "Lensshine Policarbonate",
    price: 1800,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Unbreakable", "Lightweight", "Lifetime warranty"],
    power: "Supports: ±8.00"
  },
  {
    id: 4,
    name: "Photochromic Bifocal",
    price: 850,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Auto light adjust", "UV protection", "Indoor/outdoor"],
    power: "Supports: ±5.00"
  },
  {
    id: 5,
    name: "Night Drive Bifocal Lens",
    price: 3000,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Night glare reduction", "Safer driving", "Sharper clarity"],
    power: "Supports: ±4.00"
  },
  {
    id: 6,
    name: "PG + BC Bifocal",
    price: 2500,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Dual coating", "Better clarity", "Durable"],
    power: "Supports: ±6.00"
  }
];

const BifocalLens = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLens, setSelectedLens] = useState(bifocalOptions[0]);


  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row overflow-y-auto">

      {/* 🔹 LEFT SIDEBAR */}
      <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 max-h-[40vh] md:max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">Bifocal Options</h2>

        {bifocalOptions.map((lens) => (
          <div
            key={lens.id}
            onClick={() => setSelectedLens(lens)}
            className={`cursor-pointer p-4 mb-3 rounded-lg border transition 
              ${selectedLens.id === lens.id 
                ? "border-[#d4af37] bg-[#1a1a1a]" 
                : "border-white/10 hover:bg-[#111]"
              }`}
          >
            <div className="flex justify-between items-center">
              <span>{lens.name}</span>
              <span className="text-[#d4af37] text-sm">{lens.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 RIGHT CONTENT */}
      <div className="w-full md:w-3/4 p-4 md:p-8 overflow-y-auto flex-1">

        {/* Back Button */}
        <button
          onClick={() => navigate("/new-customer")}
          className="mb-6 text-[#d4af37]"
        >
          ← Back
        </button>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          {selectedLens.name}
        </h1>

        {/* Video + Benefits */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Video */}
          <div>
            <video
              src={selectedLens.video}
              controls
              className="w-full rounded-xl border border-white/10"
            />
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-xl mb-4">Benefits</h3>
            <ul className="space-y-3">
              {selectedLens.benefits.map((b, i) => (
                <li key={i} className="bg-[#111] p-3 rounded-lg">
                  ✔ {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Supported Power */}
        <div className="mt-8 bg-[#111] p-5 rounded-xl">
          <h3 className="text-lg mb-2">Supported Power</h3>
          <p className="text-gray-400">{selectedLens.power}</p>
        </div>
       <button
  onClick={() =>
    navigate("/new-customer", {
      state: {
        selectedLens: selectedLens,
        orderItems: location.state?.orderItems,
        activeItemIndex: location.state?.activeItemIndex,

        customerName: location.state?.customerName,
        mobile: location.state?.mobile,
        address: location.state?.address,
        bookingDate: location.state?.bookingDate,

        rightEye: location.state?.rightEye,
        leftEye: location.state?.leftEye,
        prescriptionType: location.state?.prescriptionType,
        prescriptionImage: location.state?.prescriptionImage,
      }
    })
  }
  className="mt-6 w-full bg-[#d4af37] text-black py-3 rounded-lg font-semibold hover:opacity-90 transition"
>
  Select This Lens
</button>

      </div>
    </div>
  );
};

export default BifocalLens;
