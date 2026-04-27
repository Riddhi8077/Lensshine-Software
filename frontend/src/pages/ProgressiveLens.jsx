import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const progressiveOptions = [
  {
    id: 1,
    name: "Hard Coat Corridor Progressive",
    price: 1200,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Basic progressive", "Affordable", "Smooth transition"],
    power: "Supports: ±2.00"
  },
  {
    id: 2,
    name: "Blue Screen Progressive",
    price: 1500,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Blue light protection", "Reduced strain", "Clear digital vision"],
    power: "Supports: ±4.00"
  },
  {
    id: 3,
    name: "Digital Progressive",
    price: 1850,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Sharper vision", "Modern design", "Better focus"],
    power: "Supports: ±5.00"
  },
  {
    id: 4,
    name: "Wide Corridor Digital Progressive",
    price: 4500,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Wider view", "Less distortion", "Premium comfort"],
    power: "Supports: ±6.00"
  },
  {
    id: 5,
    name: "Ultra Wide Corridor Progressive",
    price: 7500,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Maximum clarity", "Ultra wide view", "Luxury lens"],
    power: "Supports: ±8.00"
  },
  {
    id: 6,
    name: "Polycarbonate Normal Corridor",
    price: 1500,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Impact resistant", "Lightweight", "Durable"],
    power: "Supports: ±6.00"
  },
  {
    id: 7,
    name: "PG Progressive",
    price: 2400,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Anti-glare", "Clear optics", "Daily comfort"],
    power: "Supports: ±6.00"
  },
  {
    id: 8,
    name: "PG + BC Progressive",
    price: 2990,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Premium coating", "Scratch resistant", "Long-lasting"],
    power: "Supports: ±6.00"
  }
];

const ProgressiveLens = () => {
  const navigate = useNavigate();
  const [selectedLens, setSelectedLens] = useState(progressiveOptions[0]);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* 🔹 LEFT SIDEBAR */}
      <div className="w-1/4 border-r border-white/10 p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">Progressive Options</h2>

        {progressiveOptions.map((lens) => (
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
      <div className="w-3/4 p-8 overflow-y-auto">

        {/* Back */}
        <button
          onClick={() => navigate("/new-customer")}
          className="mb-6 text-[#d4af37]"
        >
          ← Back
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">
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
        selectedLens: {
          name: selectedLens.name,
          price: selectedLens.price,
          framePrice: location.state?.framePrice
        }
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

export default ProgressiveLens;