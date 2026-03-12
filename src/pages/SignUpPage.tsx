import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GradientButton } from '../components/ui/GradientButton';
import { BackButton } from '../components/ui/button-7';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { SEOHead } from '../components/seo/SEOHead';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MailCheck, ShoppingBag, Eye, EyeOff } from 'lucide-react';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

export const SignUpPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  // ✅ FIX: Redirect already-logged-in users away from the signup page.
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const onEmailSignUp = async (data: SignUpForm) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (error) throw error;

      if (authData.user && !authData.session) {
        setEmailSent(true);
        toast.success('Account created! Please verify your email.');
      } else {
        toast.success('Account created successfully!');
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect back to the page the user was on
          redirectTo: `${window.location.origin}${from}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error('Could not initiate Google Login');
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-[92vh] flex items-center justify-center relative overflow-hidden px-4 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative z-10 w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/50 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
          >
            <MailCheck className="h-9 w-9 text-white" />
          </motion.div>
          <h2 className="text-2xl font-extrabold text-foreground mb-4">Verify your email</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            We've sent a confirmation link to your email address. Please click the link to verify your account and sign in.
          </p>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl transition-all"
            >
              Back to Login
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const inputClass = "w-full h-12 px-4 rounded-xl bg-gray-50/80 dark:bg-slate-700/50 border border-gray-200/80 dark:border-slate-600/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all text-sm";

  return (
    <div className="min-h-[92vh] flex items-center justify-center relative overflow-hidden px-4 py-12">
      <SEOHead title="Sign Up" description="Create your StyleHub account." />

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

      {/* Floating background orbs */}
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-[10%] w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-20 left-[10%] w-80 h-80 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-200/15 dark:bg-blue-500/5 rounded-full blur-3xl"
      />

      {/* Back button */}
      <BackButton
        label="Back"
        className="absolute top-4 left-4 md:top-8 md:left-12 z-20"
        onClick={() => navigate('/')}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl shadow-purple-500/5 dark:shadow-black/20 border border-white/60 dark:border-slate-700/50">

          {/* Logo / Icon */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-7"
          >
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create Account</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Join StyleHub for exclusive deals and faster checkout
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <form onSubmit={handleSubmit(onEmailSignUp)} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className={inputClass}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={inputClass}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground/80">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={inputClass + ' pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/60 hover:text-foreground transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600/50"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground/80">Confirm</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={inputClass + ' pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/60 hover:text-foreground transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600/50"
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30 transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </motion.button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200/80 dark:border-slate-700/80" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 dark:bg-slate-800/80 px-3 text-muted-foreground font-medium tracking-wider">Or sign up with</span>
              </div>
            </div>

            <GradientButton
              icon={
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
              }
              title="Continue with Google"
              size="sm"
              onClick={onGoogleLogin}
              gradientLight={{
                from: "from-purple-500/40",
                via: "via-pink-400/40",
                to: "to-purple-500/60"
              }}
              gradientDark={{
                from: "from-purple-800/30",
                via: "via-black/50",
                to: "to-black/70"
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-7 text-center text-sm text-muted-foreground"
          >
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors hover:underline"
            >
              Sign in
            </Link>
          </motion.div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="h-1 mx-auto mt-0 w-1/2 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent rounded-full"
        />
      </motion.div>
    </div>
  );
};