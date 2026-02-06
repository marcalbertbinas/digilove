import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-lg border-b border-rose-100/30 px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo / Home Link */}
        <Link 
          to="/" 
          className="group flex items-center gap-3 no-underline transition-transform active:scale-95"
        >
          {/* Heart Icon Container */}
          <div className="bg-rose-500 p-2 rounded-xl shadow-lg shadow-rose-200 group-hover:rotate-12 transition-all duration-300">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="white" 
              className="w-5 h-5"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3c1.74 0 3.285.834 4.312 2.122A5.496 5.496 0 0116.312 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>

          {/* Brand Name */}
          <h1 className="text-2xl font-black tracking-tighter text-rose-600">
            Digi<span className="text-rose-400 group-hover:text-rose-500 transition-colors">Love</span>
          </h1>
        </Link>

        {/* Right Side Navigation (Optional) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/create" 
            className="text-sm font-bold text-rose-400 cursor-pointer hover:text-rose-600 transition-colors"
          >
            Create Yours
          </Link>
          <div className="h-4 w-[1px] bg-rose-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">
            Est. 2026
          </span>
        </nav>

      </div>
    </header>
  );
}

export default Header;