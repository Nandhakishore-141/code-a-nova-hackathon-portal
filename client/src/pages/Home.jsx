import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Code2,
  FileCheck2,
  Layers,
  MapPin,
  ShieldCheck,
  Terminal,
  UserCheck,
  Users,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import { DOMAIN_META } from '../constants/domainMeta';
import {
  DOMAINS,
  EVENT_INFO,
  HIGHLIGHTS,
  PRIZES,
  TIMELINE,
} from '../constants/hackathonOptions';
import { useAuth } from '../context/AuthContext';

const HIGHLIGHT_ICONS = [Layers, Users, Code2, Award];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Create Participant Account',
    detail: 'Register your profile and verify eligibility.',
    icon: UserCheck,
  },
  {
    step: '02',
    title: '6-Digit Email OTP',
    detail: 'Single-use code valid for 10 minutes.',
    icon: ShieldCheck,
  },
  {
    step: '03',
    title: 'Submit Project & Team',
    detail: 'Add track, PPT deck, prototype link & roster.',
    icon: FileCheck2,
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      {/* Architectural Editorial Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50/70 via-white to-white">
        <div
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-75 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_20%,#000_40%,transparent_100%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Hero Left Copy */}
            <div className="lg:col-span-7">
              <div className="animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                <span>Registrations Open &middot; {EVENT_INFO.dates}</span>
              </div>

              <h1
                style={{ animationDelay: '70ms' }}
                className="animate-fade-up mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1]"
              >
                Build practical software that ships at{' '}
                <span className="text-blue-600">Code-a-Nova 2026</span>.
              </h1>

              <p
                style={{ animationDelay: '140ms' }}
                className="animate-fade-up mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
              >
                {EVENT_INFO.tagline}. Form a solo entry or a team of up to five builders, select an engineering track, and pitch a working prototype directly to industry reviewers.
              </p>

              <div
                style={{ animationDelay: '210ms' }}
                className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
              >
                <Link
                  to={isAuthenticated ? '/register' : '/signup'}
                  className="btn-primary group px-5 py-3 text-sm"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>

                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-secondary px-5 py-3 text-sm">
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="btn-secondary px-5 py-3 text-sm">
                    Participant Login
                  </Link>
                )}
              </div>

              <div
                style={{ animationDelay: '280ms' }}
                className="animate-fade-up mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  Verified OTP Onboarding
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  7 Engineering Tracks
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  Instant Registration ID
                </span>
              </div>
            </div>

            {/* Hero Right Blueprint Card */}
            <div
              style={{ animationDelay: '180ms' }}
              className="animate-fade-up lg:col-span-5"
            >
              <div className="editorial-card overflow-hidden border-slate-200/90 shadow-elevated">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3.5 text-white">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-blue-400" />
                    <span className="font-mono text-xs font-medium text-slate-200">
                      portal.submission-flow
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>

                <div className="divide-y divide-slate-100 bg-white p-5">
                  {WORKFLOW_STEPS.map((item) => {
                    const StepIcon = item.icon;
                    return (
                      <div
                        key={item.step}
                        className="group flex items-start gap-3.5 py-3.5 first:pt-1 last:pb-1"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 transition-colors duration-200 group-hover:border-blue-200 group-hover:bg-blue-50">
                          <StepIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <span className="font-mono text-[11px] font-semibold text-slate-400">
                              {item.step}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200 bg-slate-50/80 px-5 py-3.5">
                  <div className="pr-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      Team Format
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">1–5 Builders</p>
                  </div>
                  <div className="pl-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      Prize Pool
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-blue-700 tabular-nums">
                      ₹1,10,000+
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Strip */}
          <div className="animate-fade-up mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-card sm:grid-cols-2 lg:grid-cols-4">
            <div className="group bg-white p-5 transition-colors duration-200 hover:bg-slate-50/80">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Calendar className="h-3.5 w-3.5" />
                </span>
                Event Window
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{EVENT_INFO.dates}</p>
            </div>
            <div className="group bg-white p-5 transition-colors duration-200 hover:bg-slate-50/80">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                Format
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Hybrid Screening &amp; Finale
              </p>
            </div>
            <div className="group bg-white p-5 transition-colors duration-200 hover:bg-slate-50/80">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Users className="h-3.5 w-3.5" />
                </span>
                Team Eligibility
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{EVENT_INFO.teamSizeLabel}</p>
            </div>
            <div className="group bg-white p-5 transition-colors duration-200 hover:bg-slate-50/80">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Award className="h-3.5 w-3.5" />
                </span>
                Total Prize Pool
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900 tabular-nums">
                ₹1,10,000+ in Grants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Highlights */}
      <section className="border-b border-slate-200 bg-slate-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Event Highlights
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Designed for serious student builders
              </h2>
            </div>
            <Link
              to="/about"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              View judging criteria &amp; tracks
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((item, idx) => {
              const Icon = HIGHLIGHT_ICONS[idx % HIGHLIGHT_ICONS.length];
              return (
                <Reveal key={item.title} delay={idx * 70}>
                  <div className="editorial-card-hover group h-full p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 transition-colors duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Tracks Strip */}
          <Reveal delay={140} className="mt-10 editorial-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Available Domains
                </span>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select one primary track during team registration
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((domain) => {
                  const DomainIcon = DOMAIN_META[domain]?.icon || Code2;
                  return (
                    <Link
                      key={domain}
                      to="/about"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700"
                    >
                      <DomainIcon className="h-3.5 w-3.5 text-blue-600" />
                      {domain}
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Schedule
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Hackathon Timeline
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Key milestones from team verification to live finale demonstrations.
            </p>
          </Reveal>

          <div className="relative mt-10">
            {/* Desktop connecting rail */}
            <div
              className="pointer-events-none absolute left-10 right-10 top-6 hidden h-px bg-gradient-to-r from-blue-200 via-slate-200 to-blue-200 lg:block"
              aria-hidden="true"
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {TIMELINE.map((step, idx) => (
                <Reveal key={step.phase} delay={idx * 80}>
                  <div className="editorial-card-hover group relative flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                        <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-blue-600">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[11px] font-bold text-blue-700 transition-colors duration-200 group-hover:bg-blue-600 group-hover:text-white">
                            {idx + 1}
                          </span>
                          {step.phase}
                        </span>
                        <span className="font-mono text-xs text-slate-500 tabular-nums">
                          {step.date}
                        </span>
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prizes */}
      <section className="border-b border-slate-200 bg-slate-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Awards &amp; Recognition
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Prizes for high-impact execution
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRIZES.map((prize, idx) => (
              <Reveal key={prize.tier} delay={idx * 75}>
                <div
                  className={`editorial-card-hover relative flex h-full flex-col justify-between overflow-hidden p-6 ${
                    idx === 0 ? 'border-blue-200 ring-1 ring-blue-100' : ''
                  }`}
                >
                  {idx === 0 && (
                    <div
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                          idx === 0
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        {prize.tier}
                      </span>
                      {idx === 0 && (
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                          Top Award
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                      {prize.amount}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{prize.perks}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="editorial-card relative overflow-hidden bg-gradient-to-br from-slate-50/90 via-white to-blue-50/50 p-8 sm:p-10">
              <div
                className="bg-dot-grid pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-50 [mask-image:radial-gradient(ellipse_80%_80%_at_80%_50%,#000_20%,transparent_100%)]"
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div className="max-w-xl">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Ready to submit your team entry?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Sign up with your email, verify your 6-digit OTP within 10 minutes, and complete the hackathon team form from your dashboard.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      Instant OTP Verification
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      Confirmation Email Sent
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={isAuthenticated ? '/register' : '/signup'}
                    className="btn-primary group px-5 py-2.5"
                  >
                    Register Now
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <Link to="/contact" className="btn-secondary px-5 py-2.5">
                    Ask a Question
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
