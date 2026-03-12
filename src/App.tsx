import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { FAQPage } from './pages/legal/FAQPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { TermsPage } from './pages/legal/TermsPage';
import { WishlistPage } from './pages/WishlistPage';
import { SupportPage } from './pages/SupportPage';
import { ContactPage } from './pages/ContactPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CartRecommendationModal } from './components/cart/CartRecommendationModal';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { api } from './lib/api';
import { useThemeStore } from './store/themeStore';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const setUser = useAuthStore((state) => state.setUser);
  const theme = useThemeStore((state) => state.theme);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  // Initialize theme immediately on app load to prevent flickering
  React.useLayoutEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        try {
          // ✅ FIXED: Role is read ONLY from the database — no hardcoded email checks.
          // To make a user admin, update their role in the Supabase `profiles` table:
          //   UPDATE profiles SET role = 'ADMIN' WHERE id = '<user-id>';
          const profile = await api.auth.getProfile(session.user.id);

          if (profile) {
            setUser(profile);
          } else {
            // New user — profile not yet created (e.g., first Google login)
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata.full_name || 'User',
              role: 'USER', // Always default to USER — never elevate on the client
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialize, setUser]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-background font-sans text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-grow pt-16">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Legal Routes */}
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
        <CartRecommendationModal />
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'text-sm font-medium dark:bg-slate-800 dark:text-white dark:border dark:border-slate-700',
            duration: 3000,
          }}
        />
      </div>
    </Router>
  );
}

export default App;