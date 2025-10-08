import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, CheckCircle } from 'lucide-react';

const RegisterRecycler = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'buyer',
    location: '',
    company_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  React.useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  React.useEffect(() => {
    if (!error) {
      setFieldErrors({});
      return;
    }
    if (typeof error === 'string') {
      setFieldErrors({ non_field_errors: [error] });
    } else if (typeof error === 'object') {
      setFieldErrors(error);
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const result = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(result)) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.payload || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-700 to-sky-600 text-white p-8 rounded-lg shadow-md">
          <h2 className="flex items-center justify-center gap-2 text-center text-2xl md:text-3xl font-extrabold text-white mb-2">
            <CheckCircle className="h-6 w-6 text-white/90" aria-hidden="true" />
            <span>Create Buyer/Recycler account</span>
          </h2>
          <p className="text-center text-sm text-white/90 mb-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-white underline">
              Sign in here
            </Link>
          </p>

          <form className="space-y-6" onSubmit={handleSubmit} aria-describedby={error ? 'register-error' : undefined}>
            {error && (
              <div id="register-error" role="alert" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {typeof error === 'string' ? error : 'Registration failed. Please try again.'}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-white/90"> 
                  <User className="h-4 w-4 text-white/90" aria-hidden="true" />
                  <span>Username</span>
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="input-field bg-white/90 text-sky-900 w-full rounded-md font-medium text-base"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    aria-label="username"
                    aria-required="true"
                  />
                    {fieldErrors.username && (
                      <p className="text-red-200 text-sm mt-1">{Array.isArray(fieldErrors.username) ? fieldErrors.username[0] : fieldErrors.username}</p>
                    )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <Mail className="h-4 w-4 text-white/90" aria-hidden="true" />
                  <span>Email Address</span>
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input-field bg-white/90 text-sky-900 w-full rounded-md font-medium text-base"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    aria-label="email"
                    aria-required="true"
                  />
                  {fieldErrors.email && (
                    <p className="text-red-200 text-sm mt-1">{Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      className="input-field bg-white/90 text-sky-900 w-full rounded-md"
                      placeholder="First name"
                      value={formData.first_name}
                      onChange={handleChange}
                      aria-label="first name"
                    />
                  {fieldErrors.first_name && (
                    <p className="text-red-200 text-sm mt-1">{Array.isArray(fieldErrors.first_name) ? fieldErrors.first_name[0] : fieldErrors.first_name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      className="input-field bg-white/90 text-sky-900 w-full rounded-md"
                      placeholder="Last name"
                      value={formData.last_name}
                      onChange={handleChange}
                      aria-label="last name"
                    />
                    {fieldErrors.last_name && (
                      <p className="text-red-200 text-sm mt-1">{Array.isArray(fieldErrors.last_name) ? fieldErrors.last_name[0] : fieldErrors.last_name}</p>
                    )}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <Phone className="h-4 w-4 text-white/90" aria-hidden="true" />
                  <span>Phone Number</span>
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="input-field bg-white/90 text-sky-900 w-full rounded-md font-medium text-base"
                    placeholder="+254 700 000 000"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-label="phone number"
                  />
                {fieldErrors.phone && (
                  <p className="text-red-200 text-sm mt-1">{Array.isArray(fieldErrors.phone) ? fieldErrors.phone[0] : fieldErrors.phone}</p>
                )}
                </div>
              </div>

              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-white/90">Company Name (optional)</label>
                <p className="text-xs text-white/80 mb-1">Provide a company or organization name to appear on purchase requests.</p>
                <input id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} className="input-field bg-white/90 text-sky-900 w-full rounded-md" placeholder="Company / Organization name" />
                {fieldErrors.company_name && (
                  <p className="text-red-200 text-sm mt-1">{Array.isArray(fieldErrors.company_name) ? fieldErrors.company_name[0] : fieldErrors.company_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <MapPin className="h-4 w-4 text-white/90" aria-hidden="true" />
                  <span>Location</span>
                </label>
                <div className="mt-1">
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    className="input-field bg-white/90 text-sky-900 w-full rounded-md font-medium text-base"
                    placeholder="e.g., Nairobi, Kenya"
                    value={formData.location}
                    onChange={handleChange}
                    aria-label="location"
                  />
                {fieldErrors.location && (
                  <p className="text-red-200 text-sm mt-1">{Array.isArray(fieldErrors.location) ? fieldErrors.location[0] : fieldErrors.location}</p>
                )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <Lock className="h-4 w-4 text-white/90" aria-hidden="true" />
                  <span>Password</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-10 bg-white/90 text-sky-900 w-full rounded-md font-medium text-base"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-label="password"
                    aria-required="true"
                  />
                    {fieldErrors.password && (
                      <p className="text-red-200 text-sm mt-1">{Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}</p>
                    )}
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm_password" className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <Lock className="h-4 w-4 text-white/90" aria-hidden="true" />
                  <span>Confirm Password</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="input-field pr-10 bg-white/90 text-sky-900 w-full rounded-md font-medium text-base"
                    placeholder="Confirm password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    aria-label="confirm password"
                    aria-required="true"
                  />
                    {fieldErrors.confirm_password && (
                      <p className="text-red-200 text-sm mt-1">{Array.isArray(fieldErrors.confirm_password) ? fieldErrors.confirm_password[0] : fieldErrors.confirm_password}</p>
                    )}
                  <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} aria-pressed={showConfirmPassword}>
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                <label htmlFor="terms" className="ml-2 block text-sm text-white/90">I agree to the{' '}<Link to="/terms" className="underline">Terms of Service</Link>{' '}and{' '}<Link to="/privacy" className="underline">Privacy Policy</Link></label>
              </div>

              <div>
                <button type="submit" disabled={loading} aria-busy={loading} aria-disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-sky-900 bg-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <div className="loading-spinner" aria-hidden="true" /> : 'Create Account'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterRecycler;
