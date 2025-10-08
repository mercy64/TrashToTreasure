import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(result)) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.payload || 'Login failed');
      }
    } catch (err) {
      toast.error('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-700 to-sky-600 text-white p-8 rounded-lg shadow-md">
          <h2 className="flex items-center justify-center gap-2 text-center text-2xl md:text-3xl font-extrabold text-white mb-2">
            <UserIcon className="h-6 w-6 text-white/90" aria-hidden="true" />
            <span>Sign in</span>
          </h2>
          <p className="text-center text-sm text-white/90 mb-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-white underline"
              onMouseEnter={(e) => (e.target.style.color = '#e6f7ff')}
              onMouseLeave={(e) => (e.target.style.color = 'white')}
            >
              Create one
            </Link>
          </p>

          <form className="space-y-6" onSubmit={handleSubmit} aria-describedby={error ? 'login-error' : undefined}>
            {error && (
              <div id="login-error" role="alert" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {typeof error === 'string' ? error : 'Login failed. Please try again.'}
                <div className="mt-2 text-sm">
                  If you don't have an account yet, <Link to="/register" className="font-medium text-green-600 hover:text-green-500">create one</Link> first.
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/90">Username or Email</label>
                <div className="mt-1 relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                      className="input-field pl-14 bg-white/90 text-sky-900 w-full rounded-md"
                    placeholder="Enter your username or email"
                    aria-label="username or email"
                    aria-required="true"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90">Password</label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                      className="input-field pl-14 pr-10 bg-white/90 text-sky-900 w-full rounded-md"
                    placeholder="Enter your password"
                    aria-label="password"
                    aria-required="true"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white/90">Remember me</label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-white/90 hover:text-white">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                aria-disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-sky-900 bg-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <div className="loading-spinner" aria-hidden="true" /> : 'Sign in'}
              </button>
            </div>

            <div className="text-center mt-2">
              <p className="text-xs text-white/80">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="underline">Terms</Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline">Privacy Policy</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;