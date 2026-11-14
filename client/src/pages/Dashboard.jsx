import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Layers,
  Mail,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { isValidFullName, isValidIndianMobile } from '../utils/validators';

const Dashboard = () => {
  const { user: authUser, updateUserState } = useAuth();

  const [profile, setProfile] = useState(authUser);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: authUser?.fullName || '',
    collegeName: authUser?.collegeName || '',
    mobileNumber: authUser?.mobileNumber || '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Delete registration confirmation state
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [userRes, entryRes] = await Promise.all([
        api.get('/user/me'),
        api.get('/hackathon/my-entry'),
      ]);

      const fetchedUser = userRes.data?.user;
      if (fetchedUser) {
        setProfile(fetchedUser);
        updateUserState(fetchedUser);
        setProfileForm({
          fullName: fetchedUser.fullName || '',
          collegeName: fetchedUser.collegeName || '',
          mobileNumber: fetchedUser.mobileNumber || '',
        });
      }
      setRegistration(entryRes.data?.registration || null);
    } catch (error) {
      setLoadError(
        error.response?.data?.message || 'Failed to load dashboard data. Please refresh.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [updateUserState]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!isValidFullName(profileForm.fullName)) {
      setProfileError('Full name must be at least 3 characters and contain letters only.');
      return;
    }

    const cleanedMobile = profileForm.mobileNumber.trim();
    if (cleanedMobile && !isValidIndianMobile(cleanedMobile)) {
      setProfileError('Mobile number must be a valid 10-digit Indian number.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const { data } = await api.put('/user/update', {
        fullName: profileForm.fullName.trim(),
        collegeName: profileForm.collegeName.trim(),
        mobileNumber: cleanedMobile,
      });

      setProfile(data.user);
      updateUserState(data.user);
      setIsEditingProfile(false);
      setProfileSuccess(data.message || 'Profile updated successfully.');
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Could not update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleWithdrawRegistration = async () => {
    if (!registration?._id) return;
    setIsDeleting(true);
    setActionMessage('');
    try {
      const { data } = await api.delete(`/hackathon/${registration._id}`);
      setRegistration(null);
      setConfirmWithdraw(false);
      setActionMessage(data.message || 'Hackathon registration withdrawn.');
    } catch (error) {
      setLoadError(
        error.response?.data?.message || 'Unable to withdraw registration right now.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCode = async () => {
    if (!registration?.registrationCode) return;
    try {
      await navigator.clipboard.writeText(registration.registrationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50/50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
              <div className="space-y-2.5">
                <div className="h-3 w-32 rounded bg-slate-200" />
                <div className="h-8 w-64 rounded-md bg-slate-200" />
              </div>
              <div className="h-10 w-36 rounded-lg bg-slate-200" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="editorial-card h-24 p-5">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="mt-3 h-5 w-32 rounded bg-slate-200" />
                </div>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="editorial-card h-80 p-6 lg:col-span-1" />
              <div className="editorial-card h-80 p-6 lg:col-span-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileInitial = profile?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="bg-slate-50/50 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-up flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Participant Dashboard
            </p>
            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Welcome, {profile?.fullName}
            </h1>
          </div>
          {!registration && (
            <Link to="/register" className="btn-primary group">
              Register Now
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {/* Overview Summary Strip */}
        <div
          style={{ animationDelay: '60ms' }}
          className="animate-fade-up mt-6 grid gap-4 sm:grid-cols-3"
        >
          <div className="editorial-card flex items-center gap-3.5 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500">Account Verification</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">OTP Verified</p>
            </div>
          </div>

          <div className="editorial-card flex items-center gap-3.5 p-4">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                registration
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-amber-200 bg-amber-50 text-amber-600'
              }`}
            >
              <Layers className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Hackathon Entry</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                {registration ? registration.status : 'Pending Submission'}
              </p>
            </div>
          </div>

          <div className="editorial-card flex items-center gap-3.5 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600">
              <Users className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Track &amp; Team</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                {registration
                  ? `${registration.domain} · ${registration.teamSize} ${
                      registration.teamSize === 1 ? 'Solo' : 'Members'
                    }`
                  : 'Not Configured'}
              </p>
            </div>
          </div>
        </div>

        {loadError && (
          <div
            role="alert"
            className="animate-scale-in mt-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {actionMessage && (
          <div
            role="status"
            className="animate-scale-in mt-6 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div
          style={{ animationDelay: '120ms' }}
          className="animate-fade-up mt-8 grid gap-8 lg:grid-cols-3"
        >
          {/* Profile Card */}
          <section className="editorial-card p-6 lg:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {profileInitial}
                </span>
                <h2 className="text-base font-semibold text-slate-900">Account Profile</h2>
              </div>
              {!isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(true);
                    setProfileError('');
                    setProfileSuccess('');
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              )}
            </div>

            {profileSuccess && !isEditingProfile && (
              <div className="animate-scale-in mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                {profileSuccess}
              </div>
            )}

            {!isEditingProfile ? (
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Full Name</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{profile?.fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Email Address</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 break-all text-slate-800">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {profile?.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Verification Status</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      OTP Verified
                    </span>
                  </dd>
                </div>
                {profile?.collegeName && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500">College</dt>
                    <dd className="mt-0.5 text-slate-800">{profile.collegeName}</dd>
                  </div>
                )}
                {profile?.mobileNumber && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Mobile Number</dt>
                    <dd className="mt-0.5 font-mono text-slate-800">{profile.mobileNumber}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <form onSubmit={handleProfileSave} className="animate-fade-in mt-5 space-y-3.5">
                {profileError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {profileError}
                  </p>
                )}
                <div>
                  <label htmlFor="edit-fullName" className="block text-xs font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    id="edit-fullName"
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="input-field mt-1 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-college" className="block text-xs font-medium text-slate-700">
                    College Name
                  </label>
                  <input
                    id="edit-college"
                    type="text"
                    value={profileForm.collegeName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, collegeName: e.target.value }))
                    }
                    placeholder="Optional"
                    className="input-field mt-1 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-mobile" className="block text-xs font-medium text-slate-700">
                    10-Digit Mobile
                  </label>
                  <input
                    id="edit-mobile"
                    type="tel"
                    maxLength={10}
                    value={profileForm.mobileNumber}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        mobileNumber: e.target.value.replace(/\D/g, ''),
                      }))
                    }
                    placeholder="Optional"
                    className="input-field mt-1 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-primary w-full py-2 text-xs"
                >
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </form>
            )}
          </section>

          {/* Hackathon Entry Card */}
          <section className="editorial-card p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  Hackathon Registration Details
                </h2>
              </div>

              {registration && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Copy Registration ID"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700 transition-all duration-150 hover:border-blue-300 hover:bg-blue-100/80 active:scale-95"
                >
                  <span>{registration.registrationCode}</span>
                  {copiedCode ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-blue-500" />
                  )}
                </button>
              )}
            </div>

            {!registration ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-blue-600">
                  <Layers className="h-5 w-5" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  No hackathon entry submitted yet
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  Complete the Code-a-Nova 2026 registration form with your project details, submission links, and team members to confirm your spot.
                </p>
                <div className="mt-6">
                  <Link to="/register" className="btn-primary group px-5 py-2.5">
                    Register Now
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-6">
                <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/75 p-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-medium text-slate-500">Project Name</span>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {registration.projectName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500">Domain / Track</span>
                    <p className="mt-0.5 text-sm font-medium text-slate-900">
                      {registration.domain}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500">Status</span>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {registration.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500">Team Size</span>
                    <p className="mt-0.5 text-sm font-medium text-slate-900">
                      {registration.teamSize}{' '}
                      {registration.teamSize === 1 ? '(Solo Participant)' : 'Members Total'}
                    </p>
                  </div>
                </div>

                {/* Participant & Academic Info */}
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-medium text-slate-500">Team Lead</span>
                    <p className="mt-0.5 font-medium text-slate-900">{registration.fullName}</p>
                    <p className="text-xs text-slate-600">{registration.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500">Mobile Number</span>
                    <p className="mt-0.5 font-mono text-slate-900">{registration.mobileNumber}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs font-medium text-slate-500">Academic Institution</span>
                    <p className="mt-0.5 text-slate-900">
                      {registration.collegeName} &middot; {registration.course} ({registration.branch}),{' '}
                      {registration.yearOfStudy}
                    </p>
                  </div>
                </div>

                {/* Project Links */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Submitted Links
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2.5">
                    <a
                      href={registration.pptLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary py-1.5 text-xs"
                    >
                      PPT Presentation
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={registration.prototypeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary py-1.5 text-xs"
                    >
                      Prototype / Repository
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {registration.demoVideoLink && (
                      <a
                        href={registration.demoVideoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary py-1.5 text-xs"
                      >
                        Demo Video
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Team Roster
                  </h3>
                  <div className="mt-2.5 overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full min-w-[440px] border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-medium text-slate-600">
                        <tr>
                          <th className="border-b border-slate-200 px-3.5 py-2.5">Role</th>
                          <th className="border-b border-slate-200 px-3.5 py-2.5">Name</th>
                          <th className="border-b border-slate-200 px-3.5 py-2.5">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        <tr className="transition-colors hover:bg-slate-50/70">
                          <td className="px-3.5 py-2.5 text-xs font-medium text-blue-700">
                            Team Lead
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-slate-900">
                            {registration.fullName}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600">{registration.email}</td>
                        </tr>
                        {registration.teamMembers?.map((member, index) => (
                          <tr
                            key={`${member.memberEmail}-${index}`}
                            className="transition-colors hover:bg-slate-50/70"
                          >
                            <td className="px-3.5 py-2.5 text-xs text-slate-500">
                              Member {index + 2}
                            </td>
                            <td className="px-3.5 py-2.5 font-medium text-slate-900">
                              {member.memberName}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600">{member.memberEmail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Withdraw Registration */}
                <div className="border-t border-slate-200 pt-4">
                  {!confirmWithdraw ? (
                    <button
                      type="button"
                      onClick={() => setConfirmWithdraw(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 transition-colors hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Withdraw Hackathon Registration
                    </button>
                  ) : (
                    <div className="animate-scale-in flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                      <p className="text-xs font-medium text-red-800">
                        Are you sure you want to permanently withdraw this registration?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmWithdraw(false)}
                          disabled={isDeleting}
                          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleWithdrawRegistration}
                          disabled={isDeleting}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                          {isDeleting ? 'Withdrawing...' : 'Confirm Withdraw'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

