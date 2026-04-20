import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProgressiveLens = () => {
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mb-12"
        >
          ← Back to Selection
        </button>
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-gold bg-clip-text text-transparent mb-8">
            Progressive Tinted Lens
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Seamless multifocal vision with advanced gradient tinting for superior clarity across all distances.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveLens;