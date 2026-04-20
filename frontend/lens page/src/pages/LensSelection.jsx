import { useEffect, useState } from 'react';
import LensCard from '../components/LensCard';
import { FaEye, FaGlasses, FaSearchPlus } from 'react-icons/fa';

const LensSelection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const lenses = [
    {
      title: "Single Vision Tinted Lens",
      description: "Perfect for everyday use with UV protection and customizable tint levels for optimal comfort.",
      icon: <FaEye className="text-gold/50 group-hover:text-gold" />,
      route: "/lens/single-vision"
    },
    {
      title: "Bifocal Tinted Lens",
      description: "Dual vision zones for near and distance with premium tinting for all-day protection.",
      icon: <FaGlasses className="text-gold/50 group-hover:text-gold" />,
      route: "/lens/bifocal"
    },
    {
      title: "Progressive Tinted Lens",
      description: "Seamless multifocal vision with advanced tint technology for superior clarity.",
      icon: <FaSearchPlus className="text-gold/50 group-hover:text-gold" />,
      route: "/lens/progressive"
    }
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
            <LensCard
              key={lens.title}
              {...lens}
              delay={index * 0.1}
            />
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