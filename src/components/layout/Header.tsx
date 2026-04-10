import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';

export const Header: React.FC = () => {
  const { user } = useUser();
  const { cart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = cart.items.length;

  const NavLinks = () => (
    <>
      <a href="#menu-section" className="font-semibold text-text-primary hover:text-neon-green hover:underline decoration-2 underline-offset-8 transition-colors">
        Order Fuel
      </a>
      <Link to="/recipes" className="font-semibold text-text-primary hover:text-electric-blue hover:underline decoration-2 underline-offset-8 transition-colors">
        Cook Yourself
      </Link>
      <a href="#" className="font-semibold text-text-primary hover:text-neon-green hover:underline decoration-2 underline-offset-8 transition-colors">
        Learn & Train
      </a>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-dark-bg/90 backdrop-blur-md border-b border-dark-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-black text-neon-green tracking-tighter cursor-pointer">
              MacroPlate
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <NavLinks />
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            
            {/* Streak */}
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 bg-dark-elevated px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(255,107,53,0.1)] hover:shadow-[0_0_15px_rgba(255,107,53,0.3)] transition-shadow cursor-default" title={`You've hit your macros ${user.streak} days in a row!`}>
                <Flame size={18} className="text-intense-orange" />
                <span className="text-sm font-bold text-text-primary">
                  {user.streak} Day
                </span>
              </div>
            )}

            {/* Profile (Desktop) */}
            <a href="#" className="hidden md:block text-sm font-bold text-text-secondary hover:text-white transition">
              Profile
            </a>

            {/* Cart Icon */}
            <button className="relative p-2 text-text-primary hover:text-neon-green transition-colors group">
              <ShoppingCart size={24} className={cartItemCount > 0 ? "transform group-hover:scale-110 transition-transform" : ""} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-dark-bg bg-neon-green rounded-full border-2 border-dark-bg animate-[bounce_0.5s_ease-in-out]">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-text-primary hover:text-neon-green focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-dark-surface border-b border-dark-elevated py-4 px-4 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-4">
            <NavLinks />
            <div className="h-px bg-dark-elevated w-full my-2"></div>
            {user && (
              <div className="flex items-center gap-2 text-intense-orange font-bold">
                <Flame size={20} />
                {user.streak} Day Streak
              </div>
            )}
            <a href="#" className="font-semibold text-text-secondary hover:text-white">Profile</a>
          </div>
        </div>
      )}
    </header>
  );
};
