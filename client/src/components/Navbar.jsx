import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Code2, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `relative py-1.5 text-sm font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:rounded-full after:bg-blue-600 after:transition-transform after:duration-200 ${
      isActive
        ? 'text-blue-600 after:scale-x-100'
        : 'text-slate-600 hover:text-slate-900 after:scale-x-0 hover:after:scale-x-100'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
    }`;

  const userInitial = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        isScrolled
          ? 'border-slate-200/90 bg-white/90 shadow-[0_2px_16px_-2px_rgba(15,23,42,0.06)] backdrop-blur-md'
          : 'border-slate-200/75 bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="group flex items-center gap-2.5 text-slate-900 focus:outline-none"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:border-blue-200 group-hover:bg-blue-50">
            <Code2 className="h-4 w-4 transition-transform duration-200 group-hover:-rotate-6" />
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Code-a-Nova
          </span>
          <span className="hidden rounded border border-blue-200/80 bg-blue-50/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700 sm:inline-flex">
            2026
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
              <div className="h-4 w-px bg-slate-200" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/80 py-1 pl-1.5 pr-3 transition-colors hover:border-slate-300 hover:bg-slate-100"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                    {userInitial}
                  </span>
                  <span className="max-w-[120px] truncate text-xs font-medium text-slate-700">
                    {user?.fullName}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 active:translate-y-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="mr-1 h-4 w-px bg-slate-200" aria-hidden="true" />
              <NavLink
                to="/login"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] active:translate-y-0"
              >
                Signup
              </NavLink>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span className="transition-transform duration-200">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </span>
        </button>
      </div>

      {/* Smooth Animated Mobile Drawer */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3">
            <nav className="space-y-1" aria-label="Mobile navigation">
              <NavLink to="/" end onClick={closeMenu} className={mobileNavLinkClass}>
                Home
              </NavLink>
              <NavLink to="/about" onClick={closeMenu} className={mobileNavLinkClass}>
                About
              </NavLink>
              <NavLink to="/contact" onClick={closeMenu} className={mobileNavLinkClass}>
                Contact
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" onClick={closeMenu} className={mobileNavLinkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/register" onClick={closeMenu} className={mobileNavLinkClass}>
                    Register
                  </NavLink>
                  <div className="my-2 border-t border-slate-200 pt-2">
                    <p className="px-3 py-1 text-xs text-slate-500">
                      Signed in as{' '}
                      <span className="font-medium text-slate-800">{user?.fullName}</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="btn-secondary w-full text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="btn-primary w-full text-center"
                  >
                    Signup
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

