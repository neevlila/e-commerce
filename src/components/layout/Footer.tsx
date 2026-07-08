import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 mt-auto transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-bold text-foreground mb-4 text-lg">StyleHub</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium electronics and accessories for the modern professional.
              Elevate your workspace today.
            </p>
          </div>

          {/* Mobile Optimized Grid for Links */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/products" className="hover:text-blue-600 transition-colors">All Products</Link></li>
                <li><Link to="/products?category=Laptops" className="hover:text-blue-600 transition-colors">Laptops</Link></li>
                <li><Link to="/products?category=Peripherals" className="hover:text-blue-600 transition-colors">Peripherals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
                <li><Link to="/profile" className="hover:text-blue-600 transition-colors">My Account</Link></li>
                <li><Link to="/profile" className="hover:text-blue-600 transition-colors">Track Order</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center flex flex-col items-center justify-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} StyleHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
