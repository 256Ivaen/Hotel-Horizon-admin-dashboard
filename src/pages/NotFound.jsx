import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiClock } from 'react-icons/fi';

const NotFound = () => {
  const [countdown, setCountdown] = useState(5);
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 500);
      return () => clearTimeout(timer);
    } else {
      window.history.back();
    }
  }, [countdown]);

  const handleManualRedirect = () => {
    window.history.back();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Big 404 Number */}
        <div className={`text-9xl font-bold tracking-tighter ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>
          404
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className={`text-xl font-light ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Page Not Found
          </h1>
          <p className={`text-xs font-light ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        {/* Countdown */}
        <div className={`flex items-center justify-center space-x-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <FiClock size={18} />
          <span className="text-xs font-light">
            Redirecting in <span className={`font-medium ${
              isDarkMode ? 'text-[#FF8A3D]' : 'text-[#FF6900]'
            }`}>{countdown}</span> seconds
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            onClick={handleManualRedirect}
            className={`flex items-center text-xs px-6 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-primary hover:bg-primary/90 text-white' 
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            Go Back Now
          </button>

          <Link
            to="/"
            className={`flex items-center px-6 text-xs py-3 rounded-lg font-medium border transition-colors ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Home Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;