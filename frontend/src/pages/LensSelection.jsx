import { useEffect, useState } from 'react';
import LensCard from '../components/LensCard';
import { FaEye, FaGlasses, FaSearchPlus } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import singleVisionImg from "../assets/singlevision.jpg";
import bifocalImg from "../assets/bifocal.jpg";
import progressiveImg from "../assets/progressive.jpg";

const LensSelection = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const lenses = [
  {
    title: "Single Vision Tinted Lens",
    description:
      "Perfect for everyday use with UV protection and customizable tint levels for optimal comfort.",
    icon: <FaEye className="text-gold/50 group-hover:text-gold" />,
    route: "/lens/single-vision",
    image: singleVisionImg,
  },
  {
    title: "Bifocal Tinted Lens",
    description:
      "Dual vision zones for near and distance with premium tinting for all-day protection.",
    icon: <FaGlasses className="text-gold/50 group-hover:text-gold" />,
    route: "/lens/bifocal",
    image: bifocalImg,
  },
  {
    title: "Progressive Tinted Lens",
    description:
      "Seamless multifocal vision with advanced tint technology for superior clarity.",
    icon: <FaSearchPlus className="text-gold/50 group-hover:text-gold" />,
    route: "/lens/progressive",
    image: progressiveImg,
  },
  {
    title: "Custom Lens",
    description:
      "Create a custom lens option by entering lens name and price.",
    icon: <FaSearchPlus className="text-gold/50 group-hover:text-gold" />,
    route: "/lens/custom",
    image: progressiveImg,
  },
];


  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-24 animate-slide-up">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-white via-gold to-yellow-400 bg-clip-text text-transparent mb-6 leading-tight">
          Premium Tinted Lenses
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Select the perfect tinted lens for your vision needs. 
          Crafted with precision for unmatched clarity and style.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lenses.map((lens, index) => (
           <div
  key={lens.title}
  onClick={() =>
  navigate(lens.route, {
    state: {
      framePrice: location.state?.framePrice,

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
  className="group cursor-pointer rounded-2xl overflow-hidden bg-[#111] border border-white/10 hover:border-[#d4af37]/40 hover:scale-[1.03] transition-all duration-300"
>
  {/* Image */}

  <div className="h-52 overflow-hidden">

    <img

      src={lens.image}

      alt={lens.title}

      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"

    />

  </div>

  {/* Content */}

  <div className="p-6">

    <div className="text-3xl mb-4 text-[#d4af37]">

      {lens.icon}

    </div>

    <h2 className="text-white text-xl font-semibold mb-3">

      {lens.title}

    </h2>

    <p className="text-gray-400 text-sm leading-relaxed">

      {lens.description}

    </p>

    <div className="mt-5 text-[#d4af37] text-sm font-medium">

      Explore Lens →

    </div>

  </div>

</div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-24 pt-16 border-t border-gray-800">
        <p className="text-gray-500 text-lg">
          Ready to enhance your vision? Select your lens type above.
        </p>
      </div>
    </div>
  );
};

export default LensSelection;
