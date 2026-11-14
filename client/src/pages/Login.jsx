import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import api from '../api/axiosInstance';
import AuthStepIndicator from '../components/AuthStepIndicator';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validators';
import { PENDING_OTP_EMAIL_KEY } from './Signup';

const Login = () => {
  const { isAuthenticated, loginSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: location.state?.verifiedEmail || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const infoBanner = location.state?.message || '';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
    setUnverifiedEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setUnverifiedEmail('');

    if (!isValidEmail(formData.email) || !formData.password) {
      setErrorMsg('Please enter a valid email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      loginSession({ token: data.token, user: data.user });
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const payload = error.response?.data;
      setErrorMsg(payload?.message || 'Unable to log in. Please check your credentials.');
      if (payload?.code === 'ACCOUNT_NOT_VERIFIED' && payload?.email) {
        setUnverifiedEmail(payload.email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToVerify = () => {
    sessionStorage.setItem(PENDING_OTP_EMAIL_KEY, unverifiedEmail);
    navigate('/verify-otp', { state: { email: unverifiedEmail } });
  };

  return (
    <div className="relative bg-slate-50/60 py-14 sm:py-20">
      <div
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_65%_65%_at_50%_30%,#000_25%,transparent_100%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-md px-4 sm:px-6">
        <div className="animate-fade-up editorial-card p-6 shadow-elevated sm:p-8">
          {(infoBanner || location.state?.verifiedEmail) && <AuthStepIndicator currentStep={3} />}

          <div className="border-b border-slate-200 pb-5">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200/80 bg-blue-50 text-blue-600">
              <LogIn className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Sign in to Code-a-Nova
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Access your participant dashboard and manage your team entry.
            </p>
          </div>

          {infoBanner && !errorMsg && (
            <div
              role="status"
              className="animate-scale-in mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{infoBanner}</span>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="animate-scale-in mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {unverifiedEmail && (
                <button
                  type="button"
                  onClick={handleGoToVerify}
                  className="mt-2.5 inline-flex text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800"
                >
                  Verify email via OTP &rarr;
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-field pr-10"
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary group mt-2 w-full py-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
            New to Code-a-Nova?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

