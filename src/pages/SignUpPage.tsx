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
import { MailCheck } from 'lucide-react';

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
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
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
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error('Could not initiate Google Login');
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-12 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 text-center"
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
            <MailCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Verify your email</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            We've sent a confirmation link to your email address. Please click the link to verify your account and sign in.
          </p>
          <Link to="/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-12 relative transition-colors duration-300">
      <SEOHead title="Sign Up" description="Create your Nova 3D account." />
      
      <BackButton
        label="Back"
        className="absolute top-0.5 left-4 md:top-8 md:left-12 z-10"
        onClick={() => navigate('/')}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Join Nova 3D for exclusive deals and faster checkout
          </p>
        </div>

        <form onSubmit={handleSubmit(onEmailSignUp)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
            className="h-11"
          />
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
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            className="h-11"
          />
          
          <Button className="w-full h-12 text-base mt-2 rounded-full" type="submit" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-800 px-3 text-gray-400 dark:text-gray-500 font-medium tracking-wider">Or sign up with</span>
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

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link 
            to="/login" 
            state={{ from: location.state?.from }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-semibold transition-colors"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
