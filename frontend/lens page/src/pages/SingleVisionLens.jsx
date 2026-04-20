import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SingleVisionLens = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mb-12"
        >
          ← Back to Selection
        </button>

        {/* Content */}
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-gold bg-clip-text text-transparent mb-8">
            Single Vision Tinted Lens
          </h1>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Perfect for everyday use with customizable tint levels. 
                Provides excellent UV protection and reduces glare for comfortable all-day wear.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
                  <span className="text-gray-400">UV400 Protection</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Custom Tint Levels</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-gold/10 to-transparent rounded-3xl backdrop-blur-xl border border-gold/20 animate-glow-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleVisionLens;