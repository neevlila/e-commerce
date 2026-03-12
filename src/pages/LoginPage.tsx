import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GradientButton } from '../components/ui/GradientButton';
import { BackButton } from '../components/ui/button-7';
import { supabase } from '../lib/supabase';
import { SEOHead } from '../components/seo/SEOHead';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, isLoading } = useAuthStore();

  // ✅ FIX: If user is already logged in, redirect them away from the login page.
  const from = (location.state as any)?.from?.pathname || '/';
  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onEmailLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Explicitly redirect to the current window's origin
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error('Could not initiate Google Login');
    }
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center relative overflow-hidden px-4 py-12">
      <SEOHead title="Login" description="Sign in to your StyleHub account." />

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

      {/* Floating background orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-[10%] w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-20 right-[10%] w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/15 dark:bg-indigo-500/5 rounded-full blur-3xl"
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
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl shadow-blue-500/5 dark:shadow-black/20 border border-white/60 dark:border-slate-700/50">

          {/* Logo / Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
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
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in to access your account and orders
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-4"
          >
            <form onSubmit={handleSubmit(onEmailLogin)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50/80 dark:bg-slate-700/50 border border-gray-200/80 dark:border-slate-600/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground/80">Password</label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-gray-50/80 dark:bg-slate-700/50 border border-gray-200/80 dark:border-slate-600/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/60 hover:text-foreground transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600/50"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </motion.button>
            </form>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200/80 dark:border-slate-700/80" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 dark:bg-slate-800/80 px-3 text-muted-foreground font-medium tracking-wider">Or continue with</span>
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
                from: "from-blue-500/40",
                via: "via-blue-400/40",
                to: "to-blue-500/60"
              }}
              gradientDark={{
                from: "from-blue-800/30",
                via: "via-black/50",
                to: "to-black/70"
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Don't have an account?{' '}
            <Link
              to="/signup"
              state={{ from: location.state?.from }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors hover:underline"
            >
              Create an account
            </Link>
          </motion.div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="h-1 mx-auto mt-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full"
        />
      </motion.div>
    </div>
  );
};