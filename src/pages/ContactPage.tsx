import { useState, useRef } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare, Lock } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const WEB3FORMS_KEY = (import.meta as any).env?.VITE_WEB3FORMS_KEY || '';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'support@stylehub.com',
    href: 'mailto:support@stylehub.com',
    color: 'blue',
    bg: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: Phone,
    title: 'Call Us',
    detail: '911-STYLE-HUB',
    href: 'tel:+91 9116769548',
    color: 'emerald',
    bg: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'Ahmedabad, Gujarat, India',
    href: '#',
    color: 'orange',
    bg: 'from-orange-500 to-red-500',
    lightBg: 'bg-orange-50 dark:bg-orange-950/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    detail: '24/7 Support Available',
    href: '#',
    color: 'purple',
    bg: 'from-purple-500 to-pink-600',
    lightBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
];

export const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to send a message');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!WEB3FORMS_KEY) {
      toast.error('Contact form is not configured. Missing API key.');
      return;
    }

    setLoading(true);

    const formData = new FormData(formRef.current!);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        toast.success('Message sent successfully!');
        formRef.current?.reset();
      } else {
        toast.error(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err: any) {
      console.error("Contact Form Error:", err);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 bg-gray-50/80 dark:bg-slate-700/40 border border-gray-200/80 dark:border-slate-600/40 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground/50";

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEOHead title="Contact Us | StyleHub" description="Get in touch with the StyleHub support team." />

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-32 left-[5%] w-96 h-96 bg-blue-300/15 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -35, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-20 right-[5%] w-80 h-80 bg-purple-300/15 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-200/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 pt-10 pb-24">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
            >
              <MessageSquare className="h-4 w-4" />
              We'd love to hear from you
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-5">
              Get in{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have a question about a product, order, or just want to say hi? We're here to help and typically reply within 2 hours.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          >
            {contactInfo.map((item, i) => (
              <motion.a
                key={item.title}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-white/60 dark:border-slate-700/40 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <div className={`h-12 w-12 rounded-xl ${item.lightBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </motion.a>
            ))}
          </motion.div>

          {/* Form + Success State */}
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-12 md:p-16 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/50 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                    className="h-20 w-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-extrabold text-foreground mb-4">Message Sent!</h2>
                  <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                    Thank you for reaching out. Our team will get back to you within 2 hours.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all"
                  >
                    Send Another Message
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative"
                >
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl shadow-blue-500/5 dark:shadow-black/20 border border-white/60 dark:border-slate-700/50 relative overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                          <Send className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">Send a Message</h2>
                          <p className="text-sm text-muted-foreground">Fill out the form and we'll get back to you shortly.</p>
                        </div>
                      </div>

                      {!user ? (
                        <div className="text-center py-12 px-6 bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-border">
                          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Login Required</h3>
                          <p className="text-muted-foreground mb-6">You need to be logged in to send us a message.</p>
                          <Button 
                            size="lg" 
                            onClick={() => navigate('/login', { state: { from: location } })}
                            className="px-8"
                          >
                            Login to Message
                          </Button>
                        </div>
                      ) : (
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                          <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
                          <input type="hidden" name="from_name" value="StyleHub Contact Form" />
                          <input type="hidden" name="replyto" value={user.email} />

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-foreground/80">First Name</label>
                              <input
                                type="text"
                                name="first_name"
                                required
                                defaultValue={user.name.split(' ')[0]}
                                placeholder="John"
                                className={inputClass}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-foreground/80">Last Name</label>
                              <input
                                type="text"
                                name="last_name"
                                required
                                defaultValue={user.name.split(' ').slice(1).join(' ')}
                                placeholder="Doe"
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground/80">Email Address</label>
                            <input
                              type="email"
                              name="email"
                              required
                              readOnly
                              value={user.email}
                              placeholder="john@example.com"
                              className={inputClass + ' opacity-70 cursor-not-allowed bg-gray-100 dark:bg-slate-800'}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground/80">Subject</label>
                            <select
                              name="subject"
                              className={inputClass + ' appearance-none cursor-pointer'}
                            >
                              <option value="Order Support">Order Support</option>
                              <option value="Product Inquiry">Product Inquiry</option>
                              <option value="Returns & Exchanges">Returns & Exchanges</option>
                              <option value="Feedback">Feedback</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground/80">Message</label>
                            <textarea
                              name="message"
                              rows={5}
                              required
                              placeholder="How can we help you?"
                              className={inputClass + ' resize-none'}
                            />
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto h-13 px-10 py-3.5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {loading ? (
                              <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                Send Message
                              </>
                            )}
                          </motion.button>
                        </form>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
