import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import api from '../api/axiosInstance';
import AuthStepIndicator from '../components/AuthStepIndicator';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validators';
import { PENDING_OTP_EMAIL_KEY } from './Signup';

const OTP_LENGTH = 6;
const OTP_VALIDITY_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 30;

const OtpVerify = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail =
    location.state?.email || sessionStorage.getItem(PENDING_OTP_EMAIL_KEY) || '';

  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || '');
  const [expiryRemaining, setExpiryRemaining] = useState(OTP_VALIDITY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState(location.state?.message || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [shakeTick, setShakeTick] = useState(0);

  const inputRefs = useRef([]);

  const handleAutoFillOtp = (otpToFill) => {
    const val = String(otpToFill || devOtp).trim();
    if (val.length === OTP_LENGTH) {
      setDigits(val.split(''));
      setErrorMsg('');
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  useEffect(() => {
    if (expiryRemaining <= 0) return undefined;
    const timer = setInterval(() => {
      setExpiryRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryRemaining]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDigitChange = (index, rawValue) => {
    const cleaned = rawValue.replace(/\D/g, '');
    setErrorMsg('');

    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // Handle multi-digit input or paste
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      pasted.forEach((char, idx) => {
        next[idx] = char;
      });
      setDigits(next);
      const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, idx) => {
      next[idx] = char;
    });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    if (!isValidEmail(email)) {
      setErrorMsg('Please enter the email address you registered with.');
      setShakeTick((prev) => prev + 1);
      return;
    }

    const otpCode = digits.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setErrorMsg('Please enter all 6 digits of your OTP.');
      setShakeTick((prev) => prev + 1);
      return;
    }

    setIsVerifying(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: otpCode,
      });

      sessionStorage.removeItem(PENDING_OTP_EMAIL_KEY);
      navigate('/login', {
        state: {
          verifiedEmail: email.trim().toLowerCase(),
          message: data.message || 'Email verified successfully. You can now log in.',
        },
      });
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'OTP verification failed. Please try again.');
      setShakeTick((prev) => prev + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setStatusMsg('');

    if (!isValidEmail(email)) {
      setErrorMsg('Enter a valid email address before requesting a new OTP.');
      return;
    }

    setIsResending(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { email: email.trim() });
      setStatusMsg(data.message || 'A new 6-digit OTP has been sent to your email.');
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setDigits(Array(OTP_LENGTH).fill(''));
      setExpiryRemaining(OTP_VALIDITY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      inputRefs.current[0]?.focus();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Could not resend OTP right now.');
    } finally {
      setIsResending(false);
    }
  };

  const timerPercentage = Math.max(0, (expiryRemaining / OTP_VALIDITY_SECONDS) * 100);

  return (
    <div className="relative bg-slate-50/60 py-14 sm:py-20">
      <div
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_65%_65%_at_50%_30%,#000_25%,transparent_100%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-md px-4 sm:px-6">
        <div className="animate-fade-up editorial-card p-6 shadow-elevated sm:p-8">
          <AuthStepIndicator currentStep={2} />

          <div className="border-b border-slate-200 pb-5">
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200/80 bg-blue-50 text-blue-600">
              <KeyRound className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Verify your email via OTP
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Enter the 6-digit verification code sent from{' '}
              <span className="font-medium text-slate-800">Code-a-Nova</span>.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="animate-scale-in mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {statusMsg && (
            <div
              role="status"
              className="animate-scale-in mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {devOtp && (
            <div
              role="region"
              aria-label="Evaluation OTP helper"
              className="animate-scale-in mt-5 rounded-lg border border-amber-300 bg-amber-50/90 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Cloud Sandbox OTP Notice
                </span>
                <button
                  type="button"
                  onClick={() => handleAutoFillOtp(devOtp)}
                  className="rounded-md border border-amber-300 bg-amber-200/90 px-2.5 py-1 text-xs font-semibold text-amber-950 transition hover:bg-amber-300 active:scale-95"
                >
                  Auto-fill {devOtp}
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-amber-800">
                Render free tier firewall restricts outbound SMTP port 465. Your generated OTP is{' '}
                <strong className="font-mono text-sm font-bold tracking-widest text-amber-950 bg-amber-200/60 px-1.5 py-0.5 rounded">
                  {devOtp}
                </strong>
                . Click above to auto-fill or enter manually.
              </p>
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="otp-email" className="block text-sm font-medium text-slate-700">
                Registered Email
              </label>
              <input
                id="otp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  6-Digit OTP Code
                </label>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-xs tabular-nums ${
                    expiryRemaining <= 60 ? 'font-semibold text-red-600' : 'text-slate-500'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {expiryRemaining > 0 ? `Expires in ${formatTimer(expiryRemaining)}` : 'Expired'}
                </span>
              </div>

              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                    expiryRemaining <= 60 ? 'bg-red-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${timerPercentage}%` }}
                />
              </div>

              <div
                key={shakeTick}
                className={`mt-3 grid grid-cols-6 gap-2 ${shakeTick > 0 && errorMsg ? 'animate-shake' : ''}`}
                onPaste={handlePaste}
              >
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    aria-label={`OTP digit ${idx + 1}`}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`h-12 w-full rounded-lg border text-center font-mono text-lg font-semibold transition-all duration-150 focus:scale-[1.03] focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/15 ${
                      digit
                        ? 'animate-pop-in border-blue-500 bg-blue-50/40 text-blue-700 shadow-xs'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2.5 text-xs text-slate-500">
                Single-use code valid for 10 minutes. You can paste all 6 digits directly.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="btn-primary w-full py-2.5"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                'Verify & Activate Account'
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending || resendCooldown > 0}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>

            <Link
              to="/login"
              className="text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerify;

