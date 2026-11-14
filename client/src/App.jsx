import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import OtpVerify from './pages/OtpVerify';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';

const NotFoundPage = () => (
  <div className="relative flex min-h-[64vh] flex-col items-center justify-center overflow-hidden bg-white px-4 text-center">
    <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)]" />
    <div className="relative animate-fade-up">
      <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-blue-700">
        404 &middot; Route Not Found
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
        The page you requested does not exist on the Code-a-Nova portal.
      </p>
      <Link to="/" className="btn-primary mt-6 px-5 py-2.5">
        Return Home
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-white text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<OtpVerify />} />
              <Route path="/login" element={<Login />} />

              {/* JWT-Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PrivateRoute>
                    <Registration />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

