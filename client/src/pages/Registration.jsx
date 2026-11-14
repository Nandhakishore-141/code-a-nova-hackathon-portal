import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Users,
} from 'lucide-react';
import api from '../api/axiosInstance';
import {
  BRANCHES,
  COLLEGES,
  COURSES,
  DOMAINS,
  YEARS_OF_STUDY,
} from '../constants/hackathonOptions';
import { useAuth } from '../context/AuthContext';
import {
  isValidEmail,
  isValidFullName,
  isValidHttpUrl,
  isValidIndianMobile,
} from '../utils/validators';

const Registration = () => {
  const { user } = useAuth();

  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingEntry, setExistingEntry] = useState(null);
  const [submittedEntry, setSubmittedEntry] = useState(null);
  const [emailSentNotice, setEmailSentNotice] = useState(true);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    collegeName: '',
    customCollegeName: '',
    course: '',
    branch: '',
    yearOfStudy: '',
    domain: '',
    projectName: '',
    pptLink: '',
    prototypeLink: '',
    demoVideoLink: '',
    teamSize: 1,
    teamMembers: [],
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const { data } = await api.get('/hackathon/my-entry');
        if (data?.registration) {
          setExistingEntry(data.registration);
        }
      } catch {
        // Allow user to proceed if check fails temporarily; POST will still enforce uniqueness
      } finally {
        setCheckingExisting(false);
      }
    };
    checkRegistration();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        fullName: prev.fullName || user.fullName || '',
        mobileNumber: prev.mobileNumber || user.mobileNumber || '',
      }));
    }
  }, [user]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleMobileChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, mobileNumber: digitsOnly }));
    setErrors((prev) => ({ ...prev, mobileNumber: '' }));
    setServerError('');
  };

  const handleTeamSizeChange = (e) => {
    const nextSize = Number(e.target.value);
    const neededTeammates = Math.max(0, nextSize - 1);

    setFormData((prev) => {
      const resizedMembers = Array.from({ length: neededTeammates }, (_, idx) => ({
        memberName: prev.teamMembers[idx]?.memberName || '',
        memberEmail: prev.teamMembers[idx]?.memberEmail || '',
      }));
      return {
        ...prev,
        teamSize: nextSize,
        teamMembers: resizedMembers,
      };
    });

    setErrors((prev) => {
      const cleaned = { ...prev };
      Object.keys(cleaned).forEach((key) => {
        if (key.startsWith('teamMember_')) delete cleaned[key];
      });
      return cleaned;
    });
    setServerError('');
  };

  const handleMemberChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.teamMembers.map((member, idx) =>
        idx === index ? { ...member, [field]: value } : member
      );
      return { ...prev, teamMembers: updated };
    });
    setErrors((prev) => ({ ...prev, [`teamMember_${index}_${field}`]: '' }));
    setServerError('');
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!isValidFullName(formData.fullName)) {
      nextErrors.fullName = 'Full name must be at least 3 characters and contain letters only.';
    }
    if (!isValidEmail(formData.email)) {
      nextErrors.email = 'Please provide a valid email address.';
    }
    if (!isValidIndianMobile(formData.mobileNumber)) {
      nextErrors.mobileNumber = 'Enter a valid 10-digit Indian mobile number (starts with 6–9).';
    }

    const resolvedCollege =
      formData.collegeName === 'Other' ? formData.customCollegeName.trim() : formData.collegeName;
    if (!resolvedCollege) {
      nextErrors.collegeName =
        formData.collegeName === 'Other'
          ? 'Please enter your college name.'
          : 'Please select your college.';
    }

    if (!formData.course) nextErrors.course = 'Please select your course.';
    if (!formData.branch) nextErrors.branch = 'Please select your branch.';
    if (!formData.yearOfStudy) nextErrors.yearOfStudy = 'Please select your year of study.';
    if (!formData.domain) nextErrors.domain = 'Please select a domain / track.';

    if (formData.projectName.trim().length < 5) {
      nextErrors.projectName = 'Project name must be at least 5 characters long.';
    }
    if (!isValidHttpUrl(formData.pptLink)) {
      nextErrors.pptLink = 'Enter a valid shareable URL (https://...) for your PPT.';
    }
    if (!isValidHttpUrl(formData.prototypeLink)) {
      nextErrors.prototypeLink = 'Enter a valid URL (https://...) for your prototype.';
    }
    if (formData.demoVideoLink.trim() && !isValidHttpUrl(formData.demoVideoLink)) {
      nextErrors.demoVideoLink = 'Enter a valid URL (https://...) or leave Demo Video Link blank.';
    }

    const seenEmails = new Set([formData.email.trim().toLowerCase()]);
    formData.teamMembers.forEach((member, idx) => {
      if (!isValidFullName(member.memberName)) {
        nextErrors[`teamMember_${idx}_memberName`] =
          'Member name must be at least 3 characters (letters only).';
      }
      if (!isValidEmail(member.memberEmail)) {
        nextErrors[`teamMember_${idx}_memberEmail`] = 'Enter a valid teammate email address.';
      } else {
        const normalized = member.memberEmail.trim().toLowerCase();
        if (seenEmails.has(normalized)) {
          nextErrors[`teamMember_${idx}_memberEmail`] =
            'Each team member must have a unique email address.';
        }
        seenEmails.add(normalized);
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const resolvedCollege =
      formData.collegeName === 'Other' ? formData.customCollegeName.trim() : formData.collegeName;

    setIsSubmitting(true);
    setServerError('');
    try {
      const { data } = await api.post('/hackathon/register', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        collegeName: resolvedCollege,
        course: formData.course,
        branch: formData.branch,
        yearOfStudy: formData.yearOfStudy,
        domain: formData.domain,
        projectName: formData.projectName.trim(),
        pptLink: formData.pptLink.trim(),
        prototypeLink: formData.prototypeLink.trim(),
        demoVideoLink: formData.demoVideoLink.trim(),
        teamSize: formData.teamSize,
        teamMembers: formData.teamMembers.map((m) => ({
          memberName: m.memberName.trim(),
          memberEmail: m.memberEmail.trim().toLowerCase(),
        })),
      });

      setSubmittedEntry(data.registration);
      setEmailSentNotice(data.emailSent !== false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Unable to submit registration. Please verify your inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="bg-slate-50/50 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="border-b border-slate-200 pb-6">
              <div className="h-3 w-36 rounded bg-slate-200" />
              <div className="mt-2 h-8 w-72 rounded-md bg-slate-200" />
              <div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-200" />
            </div>
            <div className="editorial-card h-24 p-6" />
            <div className="editorial-card h-72 p-6" />
          </div>
        </div>
      </div>
    );
  }

  // Success Screen after Submission
  if (submittedEntry) {
    return (
      <div className="bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="animate-scale-in editorial-card p-6 shadow-elevated sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
              Hackathon Registration Confirmed
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {emailSentNotice
                ? `Your Code-a-Nova 2026 entry has been saved and a confirmation email has been sent to ${submittedEntry.email}.`
                : 'Your Code-a-Nova 2026 entry has been saved in our database.'}
            </p>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <dl className="divide-y divide-slate-200 text-sm">
                <div className="flex justify-between gap-4 bg-slate-50 px-4 py-3">
                  <dt className="font-medium text-slate-500">Registration ID</dt>
                  <dd className="font-mono font-semibold text-blue-700">
                    {submittedEntry.registrationCode}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="font-medium text-slate-500">Participant</dt>
                  <dd className="font-medium text-slate-900">{submittedEntry.fullName}</dd>
                </div>
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="font-medium text-slate-500">Project Name</dt>
                  <dd className="font-medium text-slate-900">{submittedEntry.projectName}</dd>
                </div>
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="font-medium text-slate-500">Domain / Track</dt>
                  <dd className="text-slate-900">{submittedEntry.domain}</dd>
                </div>
                <div className="flex justify-between gap-4 px-4 py-3">
                  <dt className="font-medium text-slate-500">Team Size</dt>
                  <dd className="text-slate-900">
                    {submittedEntry.teamSize}{' '}
                    {submittedEntry.teamSize === 1 ? '(Solo)' : 'Members'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className="btn-primary group px-5 py-2.5">
                View in Dashboard
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link to="/" className="btn-secondary px-5 py-2.5">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Already Registered Guard
  if (existingEntry) {
    return (
      <div className="bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div className="animate-fade-up editorial-card p-6 shadow-elevated sm:p-8">
            <h1 className="text-xl font-bold text-slate-900">Registration Already Submitted</h1>
            <p className="mt-2 text-sm text-slate-600">
              You have already registered{' '}
              <span className="font-semibold text-slate-800">{existingEntry.projectName}</span>{' '}
              under reference{' '}
              <span className="font-mono font-semibold text-blue-700">
                {existingEntry.registrationCode}
              </span>
              . Manage or withdraw your entry from your dashboard.
            </p>
            <div className="mt-6">
              <Link to="/dashboard" className="btn-primary group">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const resolvedCollegeValue =
    formData.collegeName === 'Other' ? formData.customCollegeName.trim() : formData.collegeName;

  const isSection1Done =
    Boolean(formData.fullName.trim()) &&
    Boolean(formData.email.trim()) &&
    formData.mobileNumber.length === 10 &&
    Boolean(resolvedCollegeValue) &&
    Boolean(formData.course) &&
    Boolean(formData.branch) &&
    Boolean(formData.yearOfStudy);

  const isSection2Done =
    Boolean(formData.domain) &&
    formData.projectName.trim().length >= 5 &&
    Boolean(formData.pptLink.trim()) &&
    Boolean(formData.prototypeLink.trim());

  const isSection3Done =
    formData.teamSize === 1 ||
    formData.teamMembers.every(
      (member) => Boolean(member.memberName.trim()) && Boolean(member.memberEmail.trim())
    );

  const completedCount = [isSection1Done, isSection2Done, isSection3Done].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  return (
    <div className="bg-slate-50/50 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-up border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Code-a-Nova 2026 Entry
          </p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Hackathon Registration Form
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Complete all mandatory fields accurately. Confirmation with your project and team details will be emailed to your verified address.
          </p>
        </div>

        {/* Live Section Completion Tracker */}
        <div
          style={{ animationDelay: '70ms' }}
          className="animate-fade-up editorial-card mt-6 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Form Completion
            </span>
            <span className="font-mono text-xs font-semibold text-blue-600 tabular-nums">
              {completedCount}/3 sections ready ({progressPercent}%)
            </span>
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(8, progressPercent)}%` }}
            />
          </div>

          <div className="mt-3.5 grid gap-2 sm:grid-cols-3">
            {[
              { num: 1, title: 'Participant & Academic', done: isSection1Done },
              { num: 2, title: 'Project & Links', done: isSection2Done },
              { num: 3, title: 'Team Configuration', done: isSection3Done },
            ].map((step) => (
              <div
                key={step.num}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-200 ${
                  step.done
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold ${
                    step.done
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-300 bg-white text-slate-500'
                  }`}
                >
                  {step.done ? <Check className="h-3 w-3" /> : step.num}
                </span>
                <span className="truncate">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {serverError && (
          <div
            role="alert"
            className="animate-scale-in mt-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8" noValidate>
          {/* Section 1: Participant & Academic Information */}
          <section
            style={{ animationDelay: '120ms' }}
            className="animate-fade-up editorial-card p-6 sm:p-8"
          >
            <h2 className="flex items-center gap-2.5 border-b border-slate-200 pb-3.5 text-base font-semibold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 font-mono text-xs font-semibold text-blue-700">
                1
              </span>
              Participant &amp; Academic Details
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-fullName" className="block text-sm font-medium text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleFieldChange}
                  placeholder="Letters only, min 3 characters"
                  className={`input-field mt-1.5 ${errors.fullName ? 'input-error' : ''}`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="input-field mt-1.5"
                />
                <p className="mt-1 text-xs text-slate-500">Pre-filled from verified account session.</p>
              </div>

              <div>
                <label htmlFor="reg-mobile" className="block text-sm font-medium text-slate-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-mobile"
                  name="mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChange={handleMobileChange}
                  placeholder="10-digit Indian mobile number"
                  className={`input-field mt-1.5 font-mono ${
                    errors.mobileNumber ? 'input-error' : ''
                  }`}
                />
                {errors.mobileNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.mobileNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-college" className="block text-sm font-medium text-slate-700">
                  College Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-college"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleFieldChange}
                  className={`input-field mt-1.5 ${errors.collegeName ? 'input-error' : ''}`}
                >
                  <option value="">Select your college</option>
                  {COLLEGES.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
                {formData.collegeName === 'Other' && (
                  <input
                    type="text"
                    name="customCollegeName"
                    value={formData.customCollegeName}
                    onChange={handleFieldChange}
                    placeholder="Enter your full college name"
                    className="input-field mt-2"
                  />
                )}
                {errors.collegeName && (
                  <p className="mt-1 text-xs text-red-600">{errors.collegeName}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-course" className="block text-sm font-medium text-slate-700">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-course"
                  name="course"
                  value={formData.course}
                  onChange={handleFieldChange}
                  className={`input-field mt-1.5 ${errors.course ? 'input-error' : ''}`}
                >
                  <option value="">Select course</option>
                  {COURSES.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                {errors.course && <p className="mt-1 text-xs text-red-600">{errors.course}</p>}
              </div>

              <div>
                <label htmlFor="reg-branch" className="block text-sm font-medium text-slate-700">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleFieldChange}
                  className={`input-field mt-1.5 ${errors.branch ? 'input-error' : ''}`}
                >
                  <option value="">Select branch</option>
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
                {errors.branch && <p className="mt-1 text-xs text-red-600">{errors.branch}</p>}
              </div>

              <div>
                <label htmlFor="reg-year" className="block text-sm font-medium text-slate-700">
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-year"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleFieldChange}
                  className={`input-field mt-1.5 ${errors.yearOfStudy ? 'input-error' : ''}`}
                >
                  <option value="">Select year</option>
                  {YEARS_OF_STUDY.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.yearOfStudy && (
                  <p className="mt-1 text-xs text-red-600">{errors.yearOfStudy}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Project & Submission Links */}
          <section className="editorial-card p-6 sm:p-8">
            <h2 className="flex items-center gap-2.5 border-b border-slate-200 pb-3.5 text-base font-semibold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 font-mono text-xs font-semibold text-blue-700">
                2
              </span>
              Project &amp; Submission Links
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-domain" className="block text-sm font-medium text-slate-700">
                  Domain / Track <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleFieldChange}
                  className={`input-field mt-1.5 ${errors.domain ? 'input-error' : ''}`}
                >
                  <option value="">Select domain / track</option>
                  {DOMAINS.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                {errors.domain && <p className="mt-1 text-xs text-red-600">{errors.domain}</p>}
              </div>

              <div>
                <label htmlFor="reg-projectName" className="block text-sm font-medium text-slate-700">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-projectName"
                  name="projectName"
                  type="text"
                  value={formData.projectName}
                  onChange={handleFieldChange}
                  placeholder="Minimum 5 characters"
                  className={`input-field mt-1.5 ${errors.projectName ? 'input-error' : ''}`}
                />
                {errors.projectName && (
                  <p className="mt-1 text-xs text-red-600">{errors.projectName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="reg-pptLink" className="block text-sm font-medium text-slate-700">
                  PPT Link (Google Drive / OneDrive shareable link){' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-pptLink"
                  name="pptLink"
                  type="url"
                  value={formData.pptLink}
                  onChange={handleFieldChange}
                  placeholder="https://drive.google.com/file/d/..."
                  className={`input-field mt-1.5 ${errors.pptLink ? 'input-error' : ''}`}
                />
                {errors.pptLink && <p className="mt-1 text-xs text-red-600">{errors.pptLink}</p>}
              </div>

              <div>
                <label
                  htmlFor="reg-prototypeLink"
                  className="block text-sm font-medium text-slate-700"
                >
                  Prototype Link (GitHub / Figma / Live Demo){' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-prototypeLink"
                  name="prototypeLink"
                  type="url"
                  value={formData.prototypeLink}
                  onChange={handleFieldChange}
                  placeholder="https://github.com/team/project"
                  className={`input-field mt-1.5 ${errors.prototypeLink ? 'input-error' : ''}`}
                />
                {errors.prototypeLink && (
                  <p className="mt-1 text-xs text-red-600">{errors.prototypeLink}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-demoVideoLink" className="block text-sm font-medium text-slate-700">
                  Demo Video Link <span className="text-xs font-normal text-slate-500">(Optional — YouTube / Drive)</span>
                </label>
                <input
                  id="reg-demoVideoLink"
                  name="demoVideoLink"
                  type="url"
                  value={formData.demoVideoLink}
                  onChange={handleFieldChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className={`input-field mt-1.5 ${errors.demoVideoLink ? 'input-error' : ''}`}
                />
                {errors.demoVideoLink && (
                  <p className="mt-1 text-xs text-red-600">{errors.demoVideoLink}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Team Size & Dynamic Teammates */}
          <section className="editorial-card p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-200 pb-3.5 sm:flex-row sm:items-center">
              <h2 className="flex items-center gap-2.5 text-base font-semibold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 font-mono text-xs font-semibold text-blue-700">
                  3
                </span>
                Team Configuration
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                {formData.teamSize === 1
                  ? 'Solo entry (Lead only)'
                  : `Team Lead + ${formData.teamSize - 1} teammate(s) = ${formData.teamSize} total`}
              </span>
            </div>

            <div className="mt-5 max-w-xs">
              <label htmlFor="reg-teamSize" className="block text-sm font-medium text-slate-700">
                Team Size (1–5) <span className="text-red-500">*</span>
              </label>
              <select
                id="reg-teamSize"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleTeamSizeChange}
                className="input-field mt-1.5"
              >
                <option value={1}>1 (Solo)</option>
                <option value={2}>2 Members</option>
                <option value={3}>3 Members</option>
                <option value={4}>4 Members</option>
                <option value={5}>5 Members</option>
              </select>
            </div>

            {formData.teamSize === 1 ? (
              <p className="animate-fade-in mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Solo participation selected. No additional teammate boxes are required.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {formData.teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="animate-scale-in rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Teammate {index + 1} (Member {index + 2} of {formData.teamSize})
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`member-name-${index}`}
                          className="block text-xs font-medium text-slate-700"
                        >
                          Member Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`member-name-${index}`}
                          type="text"
                          value={member.memberName}
                          onChange={(e) =>
                            handleMemberChange(index, 'memberName', e.target.value)
                          }
                          placeholder="Full name (letters only)"
                          className={`input-field mt-1 py-2 text-sm ${
                            errors[`teamMember_${index}_memberName`] ? 'input-error' : ''
                          }`}
                        />
                        {errors[`teamMember_${index}_memberName`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`teamMember_${index}_memberName`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`member-email-${index}`}
                          className="block text-xs font-medium text-slate-700"
                        >
                          Member Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id={`member-email-${index}`}
                          type="email"
                          value={member.memberEmail}
                          onChange={(e) =>
                            handleMemberChange(index, 'memberEmail', e.target.value)
                          }
                          placeholder="teammate@college.edu"
                          className={`input-field mt-1 py-2 text-sm ${
                            errors[`teamMember_${index}_memberEmail`] ? 'input-error' : ''
                          }`}
                        />
                        {errors[`teamMember_${index}_memberEmail`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`teamMember_${index}_memberEmail`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
            <Link to="/dashboard" className="btn-secondary px-5 py-2.5 text-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-6 py-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Registration...
                </>
              ) : (
                'Submit Hackathon Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;

