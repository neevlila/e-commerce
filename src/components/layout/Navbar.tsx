import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Loader2, Search, Menu, X, Home, Package2, LayoutDashboard, Heart, MessageCircle, Send, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { AuthToggleButton } from '../auth/AuthToggleButton';
import { TubelightNavBar } from '../ui/tubelight-navbar';

import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { Product } from '../../types';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Build nav items dynamically based on auth
  const getActiveTab = () => {
    if (location.pathname === '/') return 'Home';
    if (location.pathname.startsWith('/products')) return 'Shop';
    if (location.pathname.startsWith('/support')) return 'Support';
    if (location.pathname.startsWith('/contact')) return 'Contact';
    if (location.pathname.startsWith('/admin')) return 'Admin';
    return '';
  };
  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Scroll State for styling
  const [isScrolled, setIsScrolled] = useState(false);

  // Search Suggestions State
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.products.list().then(setAllProducts);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const lowerQuery = searchQuery.toLowerCase();
      const matches = allProducts.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allProducts]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
      setShowMobileSearch(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    navigate(`/products/${product.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setShowMobileSearch(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white dark:bg-slate-900 shadow-md border-b border-border'
        : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-border/50'
        }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2 md:gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
          <img src="/StyleHub_logo.png" alt="StyleHub" className="h-8 md:h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight whitespace-nowrap flex-shrink-0">
            StyleHub
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <div className="flex-1 max-w-md hidden md:block relative group" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-secondary/50 focus:bg-background focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
          </form>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-border overflow-hidden z-50"
              >
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Suggestions
                  </div>
                  {suggestions.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleSuggestionClick(product)}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="h-8 w-8 rounded bg-gray-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate text-foreground">{product.name}</span>
                        <span className="text-xs text-muted-foreground">in {product.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Navigation with Tubelight */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <TubelightNavBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            items={[
              { name: 'Home', url: '/', icon: Home, onClick: () => navigate('/') },
              { name: 'Shop', url: '/products', icon: Package2, onClick: () => navigate('/products') },
              { name: 'Support', url: '/support', icon: MessageCircle, onClick: () => navigate('/support') },
              { name: 'Contact', url: '/contact', icon: Send, onClick: () => navigate('/contact') },
              ...(isAuthenticated && user?.role === 'ADMIN'
                ? [{ name: 'Admin', url: '/admin', icon: LayoutDashboard, onClick: () => navigate('/admin') }]
                : []),
            ]}
          />

          <ThemeToggle />

          <Link to="/wishlist" className="relative p-2 text-muted-foreground hover:text-pink-500 dark:hover:text-pink-400 transition-colors rounded-full hover:bg-secondary">
            <Heart className={`h-5 w-5 transition-colors ${wishlistItems.length > 0 ? 'text-pink-500 fill-pink-500' : ''}`} />
            <AnimatePresence>
              {wishlistItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center overflow-hidden"
                >
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={wishlistItems.length}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {wishlistItems.length}
                    </motion.div>
                  </AnimatePresence>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary">
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {totalCartItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center overflow-hidden"
                >
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={totalCartItems}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {totalCartItems}
                    </motion.div>
                  </AnimatePresence>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <div className="pl-4 border-l border-border">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline max-w-[100px] truncate">{user?.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-red-600 px-2">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <AuthToggleButton className="max-w-xs" />
            )}
          </div>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-1">
          <button onClick={() => setShowMobileSearch(!showMobileSearch)} className="p-2 text-muted-foreground hover:text-primary">
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle className="scale-90 origin-right" />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-muted-foreground hover:text-primary ml-1">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-b border-border bg-background overflow-hidden">
            <div className="p-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-secondary/50 focus:bg-background focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-border bg-background overflow-hidden shadow-xl">
            <div className="p-4 space-y-4">
              <div className="flex flex-col space-y-1">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 hover:bg-secondary rounded-md text-sm font-medium flex items-center gap-3"><Home className="h-5 w-5" /> Home</Link>
                <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 hover:bg-secondary rounded-md text-sm font-medium flex items-center gap-3"><Package2 className="h-5 w-5" /> Shop All</Link>
                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 hover:bg-secondary rounded-md text-sm font-medium flex items-center justify-between">
                  <div className="flex items-center gap-3"><ShoppingCart className="h-5 w-5" /> Cart</div>
                  {totalCartItems > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalCartItems}</span>}
                </Link>
                <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 hover:bg-secondary rounded-md text-sm font-medium flex items-center justify-between">
                  <div className="flex items-center gap-3"><Heart className="h-5 w-5" /> Wishlist</div>
                  {wishlistItems.length > 0 && <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{wishlistItems.length}</span>}
                </Link>
                {isAuthenticated && user?.role === 'ADMIN' && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 hover:bg-secondary rounded-md text-sm font-medium flex items-center gap-3"><LayoutDashboard className="h-5 w-5" /> Admin Dashboard</Link>
                )}
              </div>
              <div className="pt-4 border-t border-border">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary rounded-md text-sm font-medium">
                      <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400"><User className="h-4 w-4" /></div>
                      <div className="flex flex-col"><span className="font-semibold">{user?.name}</span><span className="text-xs text-muted-foreground">View Profile</span></div>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-md text-sm font-medium w-full text-left"><LogOut className="h-5 w-5" />Logout</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><Button variant="outline" className="w-full">Login</Button></Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}><Button className="w-full">Sign Up</Button></Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
