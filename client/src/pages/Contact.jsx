import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Loader2, Mail, MapPin, Send } from 'lucide-react';
import api from '../api/axiosInstance';
import Reveal from '../components/Reveal';
import { EVENT_INFO } from '../constants/hackathonOptions';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validators';

const Contact = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const next = {};
    if (formData.name.trim().length < 2) {
      next.name = 'Please enter your name (at least 2 characters).';
    }
    if (!isValidEmail(formData.email)) {
      next.email = 'Please enter a valid email address.';
    }
    if (formData.message.trim().length < 10) {
      next.message = 'Please enter a message of at least 10 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMsg('');
    try {
      const { data } = await api.post('/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });
      setSuccessMsg(
        data.message || 'Your message has been delivered to the Code-a-Nova organizing team.'
      );
      setFormData((prev) => ({ ...prev, message: '' }));
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Unable to send message right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-slate-50/50 py-14 sm:py-20">
      <div
        className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 h-72 opacity-55 [mask-image:linear-gradient(to_bottom,#000,transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-up max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Support &amp; Inquiries
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Contact Code-a-Nova
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Questions about team eligibility, OTP verification, or project submissions? Reach out to the organizing desk directly.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          {/* Contact Info Column */}
          <div className="space-y-4 lg:col-span-2">
            <Reveal delay={60}>
              <div className="editorial-card-hover group p-6">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 transition-colors duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Official Email</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Direct organizing committee inbox
                    </p>
                    <a
                      href={`mailto:${EVENT_INFO.contactEmail}`}
                      className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {EVENT_INFO.contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="editorial-card-hover group p-6">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 transition-colors duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Response Window</h2>
                    <p className="mt-1 text-sm text-slate-600">{EVENT_INFO.supportHours}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Typical reply within 1 business day.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="editorial-card-hover group p-6">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 transition-colors duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Event Format</h2>
                    <p className="mt-1 text-sm text-slate-600">{EVENT_INFO.mode}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Contact Form Column */}
          <div style={{ animationDelay: '100ms' }} className="animate-fade-up lg:col-span-3">
            <div className="editorial-card p-6 sm:p-8">
              <h2 className="border-b border-slate-200 pb-4 text-base font-semibold text-slate-900">
                Send a Message
              </h2>

              {serverError && (
                <div
                  role="alert"
                  className="animate-scale-in mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {successMsg && (
                <div
                  role="status"
                  className="animate-scale-in mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={`input-field mt-1.5 ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@college.edu"
                    className={`input-field mt-1.5 ${errors.email ? 'input-error' : ''}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Message
                    </label>
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      {formData.message.trim().length} chars
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your question or issue..."
                    className={`input-field mt-1.5 resize-y ${errors.message ? 'input-error' : ''}`}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-2.5 sm:w-auto sm:px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

