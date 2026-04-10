import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-surface py-12 mt-24 border-t border-dark-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-2xl font-black text-neon-green tracking-tighter">
          MacroPlate
        </span>
        <p className="mt-4 text-text-secondary max-w-sm mx-auto">
          Performance nutrition delivered. Treat food as true, measurable data to reach your elite potential.
        </p>
        <div className="mt-8 flex justify-center space-x-6 text-sm text-text-muted font-semibold">
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>
        <p className="mt-8 text-xs text-text-muted">
          &copy; {new Date().getFullYear()} MacroPlate Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
