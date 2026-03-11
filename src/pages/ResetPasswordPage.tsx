import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/ui/button-7';
import { supabase } from '../lib/supabase';
import { SEOHead } from '../components/seo/SEOHead';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a session or recovery flow
    supabase.auth.onAuthStateChange(async (event) => {
      if (event !== 'PASSWORD_RECOVERY') {
        // Optional: you could redirect if not in recovery mode, 
        // but often Supabase handles this via the URL fragment
      }
    });
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center relative overflow-hidden px-4 py-12">
      <SEOHead title="Reset Password" description="Create a new password for your StyleHub account." />

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/50 text-center">
          
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
              <Lock className="h-8 w-8" />
            </div>
          </div>

          {!success ? (
            <>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">New Password</h1>
              <p className="text-muted-foreground text-sm mb-8">
                Please enter your new password below.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-sm font-medium text-foreground/80 ml-1">New Password</label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1 ml-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-sm font-medium text-foreground/80 ml-1">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className="w-full h-12 px-4 rounded-xl bg-gray-50/80 dark:bg-slate-700/50 border border-gray-200/80 dark:border-slate-600/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1">{errors.confirmPassword.message}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </motion.button>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Success!</h1>
              <p className="text-muted-foreground">
                Your password has been reset successfully. Redirecting you to login...
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
