import { Link } from 'react-router-dom';
import { Code2, Github, Globe, Linkedin, Mail } from 'lucide-react';
import { EVENT_INFO } from '../constants/hackathonOptions';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-slate-200 bg-slate-50/75">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="group inline-flex items-center gap-2.5 text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:border-blue-200 group-hover:bg-blue-50">
                <Code2 className="h-4 w-4" />
              </span>
              <span className="text-base font-semibold tracking-tight">Code-a-Nova</span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              {EVENT_INFO.tagline}. Bringing student developers, designers, and problem-solvers together to ship reliable software prototypes.
            </p>
            <a
              href={`mailto:${EVENT_INFO.contactEmail}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <Mail className="h-4 w-4" />
              {EVENT_INFO.contactEmail}
            </a>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Quick Navigation
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/" className="transition-colors hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-blue-600">
                  About Hackathon
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-blue-600">
                  Contact Support
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/dashboard" className="transition-colors hover:text-blue-600">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="transition-colors hover:text-blue-600">
                      Team Registration
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="transition-colors hover:text-blue-600">
                      Participant Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="transition-colors hover:text-blue-600">
                      Create Account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Connect
            </h3>
            <p className="mt-3 text-sm text-slate-600">{EVENT_INFO.supportHours}</p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Code-a-Nova on GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-600"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Code-a-Nova on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-600"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${EVENT_INFO.contactEmail}`}
                aria-label="Email Code-a-Nova"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-600"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Code-a-Nova. All rights reserved.</p>
          <p className="font-mono text-[11px] text-slate-500">
            {EVENT_INFO.dates} &middot; {EVENT_INFO.mode}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

