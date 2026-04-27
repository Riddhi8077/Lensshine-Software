import { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

const LensCard = ({ title, description, icon, route, delay = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      navigate(route);
      document.body.style.overflow = 'auto';
    }, 300);
  };

  return (
    <div 
      className="group relative"
      style={{ animationDelay: `${delay}s` }}
    >
      <div 
        className="card bg-gradient-to-br from-gray-900/80 to-black/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/20 hover:border-gold/50 transform-gpu"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gold/20 to-gold/10 rounded-2xl flex items-center justify-center group-hover:bg-gold/30 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
          <div className="text-3xl group-hover:text-gold transition-all duration-500">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gold/80 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
            {title}
          </h3>
          <p className="text-gray-400 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl ${isHovered ? 'animate-glow-pulse' : ''}`} />

        {/* Selection Indicator */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gold/20 backdrop-blur-sm rounded-full border-2 border-gold/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />
      </div>
    </div>
  );
};

export default LensCard;