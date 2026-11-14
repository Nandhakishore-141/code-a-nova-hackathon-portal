import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Create Account' },
  { id: 2, label: 'Verify Email OTP' },
  { id: 3, label: 'Sign In' },
];

/**
 * Displays onboarding progress across Signup, OTP Verification, and Login.
 */
const AuthStepIndicator = ({ currentStep = 1 }) => (
  <nav aria-label="Account verification steps" className="mb-6">
    <ol className="flex items-center justify-between gap-2">
      {STEPS.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        return (
          <li key={step.id} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-600/15'
                      : 'border border-slate-300 bg-white text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
              </span>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  isCurrent
                    ? 'text-slate-900'
                    : isCompleted
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="mx-2 h-px flex-1 overflow-hidden bg-slate-200">
                <div
                  className={`h-full bg-emerald-500 transition-all duration-500 ease-out ${
                    isCompleted ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default AuthStepIndicator;

