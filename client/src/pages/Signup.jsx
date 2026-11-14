import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import api from '../api/axiosInstance';
import AuthStepIndicator from '../components/AuthStepIndicator';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidFullName } from '../utils/validators';

export const PENDING_OTP_EMAIL_KEY = 'codeanova_pending_otp_email';

const Signup = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errors = {};
    if (!isValidFullName(formData.fullName)) {
      errors.fullName = 'Full name must be at least 3 characters and contain letters only.';
    }
    if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }
    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');
    try {
      const { data } = await api.post('/auth/signup', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const targetEmail = data.email || formData.email.trim().toLowerCase();
      sessionStorage.setItem(PENDING_OTP_EMAIL_KEY, targetEmail);
      navigate('/verify-otp', {
        state: {
          email: targetEmail,
          devOtp: data.devOtp,
          message: data.message,
        },
      });
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Unable to create your account. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-slate-50/60 py-14 sm:py-20">
      <div
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_65%_65%_at_50%_30%,#000_25%,transparent_100%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-md px-4 sm:px-6">
        <div className="animate-fade-up editorial-card p-6 shadow-elevated sm:p-8">
          <AuthStepIndicator currentStep={1} />

          <div className="border-b border-slate-200 pb-5">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200/80 bg-blue-50 text-blue-600">
              <UserPlus className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Create your Code-a-Nova account
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              We will email a 6-digit OTP to verify your identity before login.
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="animate-scale-in mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Ananya Sharma"
                className={`input-field mt-1.5 ${fieldErrors.fullName ? 'input-error' : ''}`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                className={`input-field mt-1.5 ${fieldErrors.email ? 'input-error' : ''}`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                {formData.password && (
                  <span
                    className={`font-mono text-[11px] font-medium ${
                      formData.password.length >= 6 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {formData.password.length >= 6 ? 'Valid length' : `${formData.password.length}/6 chars`}
                  </span>
                )}
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className={`input-field pr-10 ${fieldErrors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={`input-field mt-1.5 ${
                  fieldErrors.confirmPassword ? 'input-error' : ''
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary group mt-2 w-full py-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Verification OTP...
                </>
              ) : (
                <>
                  Sign Up &amp; Send OTP
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
            Already have a verified account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

