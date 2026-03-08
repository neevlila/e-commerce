import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GradientButton } from '../components/ui/GradientButton';
import { BackButton } from '../components/ui/button-7';
import { supabase } from '../lib/supabase';
import { SEOHead } from '../components/seo/SEOHead';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  const from = location.state?.from?.pathname || '/';

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
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error('Could not initiate Google Login');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-12 relative transition-colors duration-300">
      <SEOHead title="Login" description="Sign in to your Nova 3D account." />
      
      <BackButton
        label="Back"
        className="absolute top-4 left-4 md:top-8 md:left-12 z-10"
        onClick={() => navigate('/')}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 text-foreground"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Sign in to access your account and orders
          </p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit(onEmailLogin)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
              className="h-11"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
              className="h-11"
            />
            
            <Button className="w-full h-12 text-base mt-2 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" type="submit" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-800 px-3 text-gray-400 dark:text-gray-500 font-medium tracking-wider">Or continue with</span>
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
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            state={{ from: location.state?.from }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-semibold transition-colors"
          >
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
