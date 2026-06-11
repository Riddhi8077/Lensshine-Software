import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const lensOptions = [
  {
    id: 1,
    name: "Hard Coat Premium",
    price: 0,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Scratch resistant", "Basic protection", "Budget friendly"],
    power: "Supports: ±6/2"
  },
  {
    id: 2,
    name: "Blue Screen Lens",
    price: 700,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Blocks blue light", "Reduces eye strain", "Better sleep"],
    power: "Supports: ±6/2"
  },
  {
    id: 3,
    name: "Thin BSL",
    price: 1900,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Lightweight", "Better aesthetics", "Comfortable wear"],
    power: "Supports: ±10/2"
  },
  {
    id: 4,
    name: "Lensshine Premium Dual Coat",
    price: 1500,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Anti-glare", "Dust resistant", "Clear vision"],
    power: "Supports: ±8/2"
  },
  {
    id: 5,
    name: "Lensshine Policarbonate",
    price: 1800,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Unbreakable", "Lightweight", "Lifetime warranty"],
    power: "Supports: ±6/2"
  },
  {
    id: 6,
    name: "Night Drive Lens",
    price: 2500,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Reduces glare at night", "Safer driving", "Sharp clarity"],
    power: "Supports: ±6/2"
  },
  {
    id: 7,
    name: "PG + BC",
    price: 1500,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Dual coating", "UV protection", "Clear optics"],
    power: "Supports: ±6/2"
  },
  {
    id: 8,
    name: "Dual Coat PG + BC",
    price: 2200,
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    benefits: ["Premium clarity", "Scratch resistant", "Long life"],
    power: "Supports: ±6/2"
  }
];

const SingleVisionLens = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLens, setSelectedLens] = useState(lensOptions[0]);

  console.log("RECEIVED FRAME:", location.state);


  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row overflow-y-auto">

      {/* 🔹 LEFT SIDEBAR */}
      <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 max-h-[40vh] md:max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">Lens Options</h2>

        {lensOptions.map((lens) => (
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

        {/* Back */}
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

export default SingleVisionLens;
