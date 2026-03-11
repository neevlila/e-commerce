import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { BackButton } from '../components/ui/button-7';
import { supabase } from '../lib/supabase';
import { SEOHead } from '../components/seo/SEOHead';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowRight } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (error: any) {
      toast.error(error.message || 'Could not send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center relative overflow-hidden px-4 py-12">
      <SEOHead title="Forgot Password" description="Reset your StyleHub account password." />

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

      {/* Back button */}
      <BackButton
        label="Back to Login"
        className="absolute top-4 left-4 md:top-8 md:left-12 z-20"
        onClick={() => navigate('/login')}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/50 text-center">
          
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
              <KeyRound className="h-8 w-8" />
            </div>
          </div>

          {!submitted ? (
            <>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Forgot Password?</h1>
              <p className="text-muted-foreground text-sm mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-sm font-medium text-foreground/80 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      {...register('email')}
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50/80 dark:bg-slate-700/50 border border-gray-200/80 dark:border-slate-600/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending Link...
                    </span>
                  ) : (
                    <>Send Reset Link <ArrowRight className="h-4 w-4" /></>
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Check Your Email</h1>
              <p className="text-muted-foreground">
                We've sent a password reset link to your email address. Please check your inbox and spam folder.
              </p>
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl"
                  onClick={() => setSubmitted(false)}
                >
                  Try another email
                </Button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
