import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'sonner';
import { assets } from '../../assets/assets';
import { post, saveAuthData, isLoggedIn } from '../../utils/service';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const handleUnauthorized = () => {
      toast.error('Session expired. Please log in again.');
      navigate('/login');
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await post('/auth/login', { 
        email: email.trim(),
        password 
      });

      if (response.success && response.data) {
        saveAuthData(response.data.token, response.data.user, response);
        toast.success('Login successful! Redirecting...');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        if (response.success === false && response.error) {
          setError(response.error);
          toast.error(response.error);
        } else {
          const errorMessage = response.message || 'Login failed. Please try again.';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.success === false && errorData.error) {
          setError(errorData.error);
          toast.error(errorData.error);
        } else if (errorData.message) {
          setError(errorData.message);
          toast.error(errorData.message);
        } else {
          const defaultError = 'An error occurred. Please try again.';
          setError(defaultError);
          toast.error(defaultError);
        }
      } else if (err.message === 'Network Error') {
        const networkError = 'Network error. Please check your connection.';
        setError(networkError);
        toast.error(networkError);
      } else {
        const defaultError = 'An error occurred. Please try again.';
        setError(defaultError);
        toast.error(defaultError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <img 
            className="h-12 w-auto" 
            src={assets.logo}
            alt="Logo" 
          />
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="email"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 bg-white text-gray-900 placeholder:text-gray-400"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full pl-9 pr-10 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 bg-white text-gray-900 placeholder:text-gray-400"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-white text-xs font-normal uppercase tracking-wide rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;