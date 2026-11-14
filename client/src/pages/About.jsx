import { Link } from 'react-router-dom';
import { ArrowRight, Check, Code2 } from 'lucide-react';
import Reveal from '../components/Reveal';
import { DOMAIN_META } from '../constants/domainMeta';
import { DOMAINS, EVENT_INFO } from '../constants/hackathonOptions';
import { useAuth } from '../context/AuthContext';

const JUDGING_RUBRIC = [
  {
    criterion: 'Technical Execution & Architecture',
    weight: '30%',
    percent: 30,
    detail: 'Code quality, system reliability, API design, and working end-to-end prototype depth.',
  },
  {
    criterion: 'Problem Relevance & Innovation',
    weight: '25%',
    percent: 25,
    detail: 'Originality of the approach and clarity in addressing a well-defined engineering problem.',
  },
  {
    criterion: 'Practical Impact & Usability',
    weight: '25%',
    percent: 25,
    detail: 'Accessibility, clean interface execution, and readiness for real-world deployment.',
  },
  {
    criterion: 'Presentation & Documentation',
    weight: '20%',
    percent: 20,
    detail: 'Clarity of the submitted slide deck, repository README, and live demo walkthrough.',
  },
];

const ELIGIBILITY_RULES = [
  'Open to undergraduate and postgraduate students across B.Tech, B.E, M.Tech, BCA, MCA, B.Sc, and M.Sc programs.',
  'Participants may register solo (Team Size = 1) or in teams of 2 to 5 members.',
  'Each participant must verify their account email via a single-use 6-digit OTP before submitting an entry.',
  'All submitted prototypes, repositories, and slide decks must be original work built for Code-a-Nova 2026.',
];

const About = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      {/* Header Banner */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-slate-50/60 py-14 sm:py-16">
        <div
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_30%,#000_30%,transparent_100%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              About the Hackathon
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {EVENT_INFO.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
              Code-a-Nova brings collegiate engineering teams together to design, build, and demonstrate practical software and hardware-connected prototypes. Rather than slide-only pitches, evaluation focuses on working code, clean architecture, and verified live demonstrations.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Tracks */}
        <section className="border-b border-slate-200 pb-12">
          <Reveal>
            <h2 className="text-xl font-semibold text-slate-900">Engineering Tracks</h2>
            <p className="mt-2 text-sm text-slate-600">
              Teams choose one primary domain when submitting their hackathon entry.
            </p>
          </Reveal>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DOMAINS.map((track, idx) => {
              const meta = DOMAIN_META[track] || {};
              const Icon = meta.icon || Code2;
              return (
                <Reveal key={track} delay={idx * 55}>
                  <div className="editorial-card-hover group flex h-full items-start gap-3.5 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 transition-colors duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{track}</h3>
                      {meta.summary && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          {meta.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Judging Criteria */}
        <section className="border-b border-slate-200 py-12">
          <Reveal>
            <h2 className="text-xl font-semibold text-slate-900">Evaluation Rubric</h2>
            <p className="mt-2 text-sm text-slate-600">
              Every shortlisted submission is scored out of 100 points by the jury panel.
            </p>
          </Reveal>

          <Reveal delay={90} className="mt-6 overflow-x-auto rounded-xl border border-slate-200 shadow-card">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="border-b border-slate-200 px-5 py-3.5">Criterion</th>
                  <th className="border-b border-slate-200 px-5 py-3.5">Weight</th>
                  <th className="border-b border-slate-200 px-5 py-3.5">Focus Area</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {JUDGING_RUBRIC.map((row) => (
                  <tr
                    key={row.criterion}
                    className="transition-colors duration-150 hover:bg-slate-50/75"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">{row.criterion}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 font-mono font-semibold text-blue-600 tabular-nums">
                          {row.weight}
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-700"
                            style={{ width: `${row.percent * 2.5}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </section>

        {/* Eligibility & Guidelines */}
        <section className="pt-12">
          <Reveal>
            <h2 className="text-xl font-semibold text-slate-900">Participation Guidelines</h2>
          </Reveal>
          <ul className="mt-5 space-y-3">
            {ELIGIBILITY_RULES.map((rule, idx) => (
              <Reveal key={rule} delay={idx * 60} as="li">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-700 transition-colors hover:border-slate-300/90 hover:bg-white">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{rule}</span>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={160} className="mt-10 flex flex-wrap gap-3">
            <Link
              to={isAuthenticated ? '/register' : '/signup'}
              className="btn-primary group px-5 py-2.5"
            >
              {isAuthenticated ? 'Proceed to Registration' : 'Create Participant Account'}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link to="/contact" className="btn-secondary px-5 py-2.5">
              Contact Organizers
            </Link>
          </Reveal>
        </section>
      </div>
    </div>
  );
};

export default About;
