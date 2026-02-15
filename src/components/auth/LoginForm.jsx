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
    <main className="min-h-screen w-full grid lg:grid-cols-2">
      <div className="hidden lg:block relative h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${assets.LoginImg})`,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
          <div>
            <img className="h-32 w-auto mb-4" src={assets.logo} alt="Logo" />
          </div>
          <blockquote className="space-y-2 max-w-md">
            <p className="text-sm italic text-white/90">
              "Experience the perfect blend of luxury and comfort at Hotel Horizon. Where every stay becomes a memory."
            </p>
            <footer className="text-sm text-white/70">- Hotel Horizon Management</footer>
          </blockquote>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-12 bg-white min-h-screen">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <img className="h-8 w-auto" src={assets.logo} alt="Logo" />
            <p className="text-xl font-semibold">Hotel Horizon</p>
          </div>

          <div >
            <div className="text-start mb-4">
              <h1 className="text-2xl font-light text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-black">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-3 py-2.5 text-xs border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900 placeholder:text-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-black">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-black placeholder:text-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

            <p className="text-xs text-gray-500 text-center mt-6">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginForm;