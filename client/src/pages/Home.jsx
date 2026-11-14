import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Blocks,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cloud,
  Code2,
  Cpu,
  ExternalLink,
  FileCheck2,
  Globe,
  Landmark,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  UserCheck,
  Users,
  Zap,
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
    detail: 'Register with your student profile and college credentials.',
    icon: UserCheck,
  },
  {
    step: '02',
    title: '6-Digit Email OTP',
    detail: 'Cryptographic single-use code valid for 10 minutes.',
    icon: ShieldCheck,
  },
  {
    step: '03',
    title: 'Submit Project & Team',
    detail: 'Pick your track, link PPT slide deck & prototype repository.',
    icon: FileCheck2,
  },
];

const TRACK_DETAILS = {
  'AI/ML': {
    badge: 'Popular',
    icon: BrainCircuit,
    headline: 'Agentic AI, LLM Orchestration & Computer Vision',
    description:
      'Design intelligent systems that solve non-trivial workflow automation, local inference, multi-modal perception, or synthetic evaluation.',
    sampleIdeas: [
      'Autonomous Code Review Agent with Static Analysis',
      'Privacy-Preserving On-Device OCR & Document Parser',
      'Real-Time Multimodal Diagnostic Assistant',
    ],
    tools: ['PyTorch', 'LangChain', 'FastAPI', 'Hugging Face', 'Ollama', 'Vector DBs'],
  },
  'Web Dev': {
    badge: 'High Impact',
    icon: Globe,
    headline: 'Scalable Full-Stack Web & Real-Time Collaborative Platforms',
    description:
      'Engineer high-performance client-server applications with real-time sync, accessible UI/UX, and rock-solid database architectures.',
    sampleIdeas: [
      'Multiplayer Collaborative Design Canvas',
      'Offline-First Progressive Web App for Field Work',
      'Micro-Frontend Architecture for Enterprise Tooling',
    ],
    tools: ['React 18', 'Vite', 'Node.js', 'Express', 'Tailwind CSS', 'WebSockets'],
  },
  IoT: {
    badge: 'Hardware Sync',
    icon: Cpu,
    headline: 'Smart Edge Systems, Telemetry & Sensor Networks',
    description:
      'Bridge hardware sensors with cloud dashboards to deliver predictive maintenance, environmental monitoring, or smart campus automation.',
    sampleIdeas: [
      'Campus Energy Mesh Grid & Load Balancer',
      'Automated Cold-Chain Telemetry Tracker',
      'Wearable Vital Signs Monitor with Edge Anomaly Alerts',
    ],
    tools: ['ESP32', 'MQTT', 'Raspberry Pi', 'WebSockets', 'InfluxDB', 'FreeRTOS'],
  },
  'Cyber Security': {
    badge: 'Zero Trust',
    icon: ShieldCheck,
    headline: 'Defensive Tooling, Privacy Engineering & Threat Intelligence',
    description:
      'Build automated penetration analysis, vulnerability scanners, identity verification safeguards, or zero-knowledge proof applications.',
    sampleIdeas: [
      'Real-Time API Secret Leak Detector & Revocation Bot',
      'Zero-Knowledge Credential Verification Protocol',
      'Automated Dependency Vulnerability & License Auditor',
    ],
    tools: ['Go', 'Rust', 'Docker', 'Snort', 'Wireshark', 'JWT / SHA-256'],
  },
  Blockchain: {
    badge: 'Decentralized',
    icon: Blocks,
    headline: 'Verifiable Smart Contracts & Distributed Ledgers',
    description:
      'Deploy transparent protocols, decentralized governance, tokenized real-world assets, or verified tamper-proof academic credentials.',
    sampleIdeas: [
      'Decentralized Academic Degree & Certificate Verifier',
      'Automated Hackathon Milestone Escrow Contract',
      'P2P Micro-Grants & Quadratic Funding Protocol',
    ],
    tools: ['Solidity', 'Hardhat', 'Ethers.js', 'Ethereum', 'Polygon', 'IPFS'],
  },
  'Cloud & DevOps': {
    badge: 'Infrastructure',
    icon: Cloud,
    headline: 'Container Orchestration, CI/CD & Observability',
    description:
      'Innovate deployment pipelines, automated autoscaling, cost-optimization analyzers, and distributed system monitoring.',
    sampleIdeas: [
      'Ephemeral PR Staging Environment Operator',
      'Cloud Bill Waste Sentinel & Auto-Downscaler',
      'Distributed Chaos Engineering & Resilience Test Harness',
    ],
    tools: ['Kubernetes', 'Docker', 'Terraform', 'GitHub Actions', 'Prometheus', 'Grafana'],
  },
  FinTech: {
    badge: 'High Value',
    icon: Landmark,
    headline: 'Digital Banking, Micro-Lending & Fraud Prevention',
    description:
      'Architect compliant payment rails, credit scoring engines, recurring billing primitives, or multi-currency wallets.',
    sampleIdeas: [
      'UPI Split-Bill Micro-Escrow with Dispute Mediation',
      'Alternative Student Credit Scoring via Academic Data',
      'Real-Time Transaction Anomaly Detector',
    ],
    tools: ['Python', 'Express.js', 'MongoDB', 'Stripe API', 'Webhooks', 'Chart.js'],
  },
};

const FAQS = [
  {
    q: 'Who is eligible to participate in Code-a-Nova 2026?',
    a: 'Any undergraduate or postgraduate student enrolled in engineering, technology, or computer science programs (B.Tech, B.E, BCA, MCA, B.Sc, M.Sc, etc.) across accredited institutions is welcome.',
  },
  {
    q: 'Can I participate solo or do I need a full team?',
    a: 'You can participate solo (Team Size = 1) or in teams of up to 5 builders. The registration form dynamically renders teammate fields based on your selected team size.',
  },
  {
    q: 'Is there any registration fee?',
    a: 'No! Registration for Code-a-Nova 2026 is 100% free for all students. Mentorship, evaluation, cloud sandboxes, and participation certificates are provided at zero cost.',
  },
  {
    q: 'What if my prototype or code is not fully finished yet?',
    a: 'For initial registration, submit your idea deck (PPT) and your repository/prototype link showing your proposed architecture. You can continue polishing your code until the final sprint deadline.',
  },
  {
    q: 'How does the email OTP verification work?',
    a: 'During signup, a 6-digit cryptographic OTP is generated and emailed to your address (valid for 10 minutes). On free cloud hosting tiers where SMTP traffic is restricted, the verification screen includes an evaluation sandbox helper so you are never blocked.',
  },
  {
    q: 'Can I edit or withdraw my registration after submitting?',
    a: 'Yes! Your Participant Dashboard allows you to review your submitted registration details, update your personal profile, or withdraw your entry if your project scope changes.',
  },
];

const ECOSYSTEM_TOOLS = [
  { name: 'MongoDB Atlas', tag: 'Database' },
  { name: 'Node.js & Express', tag: 'Backend' },
  { name: 'React 18 & Vite', tag: 'Frontend' },
  { name: 'Tailwind CSS', tag: 'Styling' },
  { name: 'Render', tag: 'API Cloud' },
  { name: 'Vercel', tag: 'Edge Host' },
  { name: 'GitHub', tag: 'Source' },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [activeTrack, setActiveTrack] = useState('AI/ML');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Live countdown targeting December 12, 2026 09:00:00 IST
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date('2026-12-12T09:00:00+05:30').getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaqIndex((prev) => (prev === idx ? -1 : idx));
  };

  const selectedTrackDetail = TRACK_DETAILS[activeTrack] || TRACK_DETAILS['AI/ML'];
  const TrackIcon = selectedTrackDetail.icon;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50/80 via-white to-white">
        <div
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_20%,#000_40%,transparent_100%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-28 right-0 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-48 -left-20 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Hero Left Copy */}
            <div className="lg:col-span-7">
              <div className="animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                <span>Registrations Live &middot; {EVENT_INFO.dates}</span>
              </div>

              <h1
                style={{ animationDelay: '70ms' }}
                className="animate-fade-up mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.12]"
              >
                Build practical software that ships at{' '}
                <span className="gradient-text">Code-a-Nova 2026</span>.
              </h1>

              <p
                style={{ animationDelay: '140ms' }}
                className="animate-fade-up mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
              >
                {EVENT_INFO.tagline}. Form a solo entry or an engineering squad of up to five builders, select an engineering track, and pitch a working prototype directly to industry reviewers.
              </p>

              {/* Live Countdown Timer */}
              <div
                style={{ animationDelay: '180ms' }}
                className="animate-fade-up mt-6 flex flex-wrap items-center gap-3"
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="flex min-w-[58px] flex-col items-center justify-center rounded-lg border border-slate-200/90 bg-white p-2 shadow-xs sm:min-w-[66px]">
                    <span className="font-mono text-xl font-bold text-blue-600 tabular-nums sm:text-2xl">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Days
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-400">:</span>
                  <div className="flex min-w-[58px] flex-col items-center justify-center rounded-lg border border-slate-200/90 bg-white p-2 shadow-xs sm:min-w-[66px]">
                    <span className="font-mono text-xl font-bold text-blue-600 tabular-nums sm:text-2xl">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Hours
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-400">:</span>
                  <div className="flex min-w-[58px] flex-col items-center justify-center rounded-lg border border-slate-200/90 bg-white p-2 shadow-xs sm:min-w-[66px]">
                    <span className="font-mono text-xl font-bold text-blue-600 tabular-nums sm:text-2xl">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Mins
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-400">:</span>
                  <div className="flex min-w-[58px] flex-col items-center justify-center rounded-lg border border-slate-200/90 bg-white p-2 shadow-xs sm:min-w-[66px]">
                    <span className="font-mono text-xl font-bold text-blue-600 tabular-nums sm:text-2xl">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Secs
                    </span>
                  </div>
                </div>

                <div className="hidden pl-2 text-xs text-slate-500 sm:block">
                  <p className="font-semibold text-slate-700">Kickoff Countdown</p>
                  <p>Grand Finale starts Dec 12, 2026</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{ animationDelay: '220ms' }}
                className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
              >
                <Link
                  to={isAuthenticated ? '/register' : '/signup'}
                  className="btn-primary group px-6 py-3 text-sm shadow-md"
                >
                  Register Your Team
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-secondary px-6 py-3 text-sm">
                    Participant Dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="btn-secondary px-6 py-3 text-sm">
                    Participant Login
                  </Link>
                )}
              </div>

              <div
                style={{ animationDelay: '260ms' }}
                className="animate-fade-up mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  Verified 6-Digit OTP Onboarding
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  7 Engineering Tracks
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  Instant Registration Code
                </span>
              </div>
            </div>

            {/* Hero Right Blueprint Card */}
            <div
              style={{ animationDelay: '180ms' }}
              className="animate-fade-up lg:col-span-5"
            >
              <div className="editorial-card overflow-hidden shadow-elevated">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3.5 text-white">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-blue-400" />
                    <span className="font-mono text-xs font-medium text-slate-200">
                      portal.submission-flow
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Open
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
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 transition-colors duration-200 group-hover:border-blue-300 group-hover:bg-blue-50">
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
                    <p className="mt-0.5 font-mono text-sm font-bold text-blue-700 tabular-nums">
                      ₹1,10,000+
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="animate-fade-up mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-card sm:grid-cols-2 lg:grid-cols-4">
            <div className="group bg-white p-5 transition-colors duration-200 hover:bg-slate-50/90">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Calendar className="h-3.5 w-3.5" />
                </span>
                Event Window
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{EVENT_INFO.dates}</p>
            </div>
            <div className="group bg-white p-5 transition-colors duration-200 hover:bg-slate-50/90">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                Format
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Hybrid Screening &amp; Finale
              </p>
            </div>
            <div className="group bg-white p-5 transition-colors duration-200 hover:bg-slate-50/90">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Users className="h-3.5 w-3.5" />
                </span>
                Team Eligibility
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{EVENT_INFO.teamSizeLabel}</p>
            </div>
            <div className="group bg-white p-5 transition-colors duration-200 hover:bg-slate-50/90">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Trophy className="h-3.5 w-3.5" />
                </span>
                Total Prize Pool
              </div>
              <p className="mt-2 text-sm font-bold text-blue-700 tabular-nums">
                ₹1,10,000+ in Grants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tracks Explorer */}
      <section className="border-b border-slate-200 bg-slate-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Engineering Tracks
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Choose your challenge domain
              </h2>
            </div>
            <p className="text-xs text-slate-500 sm:text-right">
              Click any track to explore sample problem statements &amp; stacks
            </p>
          </Reveal>

          {/* Track Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {DOMAINS.map((domain) => {
              const info = TRACK_DETAILS[domain] || {};
              const DIcon = info.icon || Code2;
              const isActive = activeTrack === domain;
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setActiveTrack(domain)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'border border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <DIcon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                  {domain}
                </button>
              );
            })}
          </div>

          {/* Selected Track Detailed Spotlight Card */}
          <Reveal key={activeTrack} delay={40} className="mt-6">
            <div className="editorial-card overflow-hidden border-blue-200/90 shadow-elevated">
              <div className="border-b border-slate-200/80 bg-white p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      <TrackIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{activeTrack}</h3>
                        <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800">
                          {selectedTrackDetail.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {selectedTrackDetail.headline}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={isAuthenticated ? '/register' : '/signup'}
                    className="btn-primary shrink-0 text-xs"
                  >
                    Register for {activeTrack}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {selectedTrackDetail.description}
                </p>
              </div>

              <div className="grid divide-y divide-slate-100 bg-slate-50/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sample Project Challenges
                  </p>
                  <ul className="mt-3 space-y-2">
                    {selectedTrackDetail.sampleIdeas.map((idea) => (
                      <li key={idea} className="flex items-start gap-2 text-xs text-slate-700">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recommended Tech Stack
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTrackDetail.tools.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-slate-800 shadow-2xs"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Schedule &amp; Milestones
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Roadmap to the Grand Finale
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Clear deadlines from team registration to the live jury pitch.
            </p>
          </Reveal>

          <div className="relative mt-10">
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

      {/* Prizes Section */}
      <section className="border-b border-slate-200 bg-slate-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Prize Pool &amp; Recognition
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              ₹1,10,000+ in Cash &amp; Grants
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Rewards for clean engineering execution, architecture, and live utility.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRIZES.map((prize, idx) => (
              <Reveal key={prize.tier} delay={idx * 75}>
                <div
                  className={`editorial-card-hover relative flex h-full flex-col justify-between overflow-hidden p-6 ${
                    idx === 0 ? 'border-blue-300 ring-2 ring-blue-100 shadow-card-hover' : ''
                  }`}
                >
                  {idx === 0 && (
                    <div
                      className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                          idx === 0
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        {prize.tier}
                      </span>
                      {idx === 0 && (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          Champion
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

      {/* Interactive FAQ Section */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Frequently Asked Questions
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Everything you need to know
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Have a question not answered here? Visit our Support desk.
            </p>
          </Reveal>

          <div className="mt-10 space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="editorial-card overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50/80"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 pb-5 pt-3.5 text-xs leading-relaxed text-slate-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem & Stack Ribbon */}
      <section className="border-b border-slate-200 bg-slate-50/50 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Built with Modern Engineering Tooling
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {ECOSYSTEM_TOOLS.map((tool) => (
                <span
                  key={tool.name}
                  className="rounded-full border border-slate-200/90 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs"
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="editorial-card relative overflow-hidden bg-gradient-to-br from-slate-50/90 via-white to-blue-50/50 p-8 sm:p-12 shadow-elevated">
              <div
                className="bg-dot-grid pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-50 [mask-image:radial-gradient(ellipse_80%_80%_at_80%_50%,#000_20%,transparent_100%)]"
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div className="max-w-xl">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Ready to build at Code-a-Nova 2026?
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    Sign up with your student email, verify your 6-digit OTP, and submit your team entry directly from your dashboard.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
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
                    className="btn-primary group px-6 py-3 text-sm shadow-md"
                  >
                    Register Your Team
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <Link to="/contact" className="btn-secondary px-6 py-3 text-sm">
                    Inquire Desk
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
