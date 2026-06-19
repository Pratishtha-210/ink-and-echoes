import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Particles from './Particles.jsx';
import CursorGlow from './CursorGlow.jsx';
import MusicPlayer from './MusicPlayer.jsx';
import { Feather, Shield, PenTool, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-luxury-bg text-white relative font-sans flex flex-col justify-between selection:bg-luxury-gold selection:text-black">
      {/* Background aesthetics */}
      <Particles />
      <CursorGlow />
      <MusicPlayer />

      {/* Global Luxury Header */}
      <header className="sticky top-0 z-40 bg-luxury-bg/70 backdrop-blur-md border-b border-luxury-border/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Feather className="text-luxury-gold group-hover:rotate-12 transition-transform duration-300" size={22} />
            <span className="font-serif text-xl tracking-wider font-semibold group-hover:text-luxury-gold transition-colors duration-300">
              Ink & Echoes
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest uppercase">
            <NavLink 
              to="/" 
              className={({ isActive }) => `hover:text-luxury-gold transition-colors duration-300 ${isActive ? 'text-luxury-gold border-b border-luxury-gold/50 pb-1' : 'text-luxury-muted'}`}
            >
              Home
            </NavLink>
            <NavLink 
              to="/library" 
              className={({ isActive }) => `hover:text-luxury-gold transition-colors duration-300 ${isActive ? 'text-luxury-gold border-b border-luxury-gold/50 pb-1' : 'text-luxury-muted'}`}
            >
              Poems
            </NavLink>
            <NavLink 
              to="/thoughts" 
              className={({ isActive }) => `hover:text-luxury-gold transition-colors duration-300 ${isActive ? 'text-luxury-gold border-b border-luxury-gold/50 pb-1' : 'text-luxury-muted'}`}
            >
              Thoughts
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => `hover:text-luxury-gold transition-colors duration-300 ${isActive ? 'text-luxury-gold border-b border-luxury-gold/50 pb-1' : 'text-luxury-muted'}`}
            >
              About
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `hover:text-luxury-gold transition-colors duration-300 ${isActive ? 'text-luxury-gold border-b border-luxury-gold/50 pb-1' : 'text-luxury-muted'}`}
            >
              Contact
            </NavLink>

            {/* Authenticated Admin Portals */}
            {user && user.role === 'admin' && (
              <>
                <NavLink 
                  to="/journal" 
                  className={({ isActive }) => `flex items-center gap-1.5 hover:text-luxury-gold transition-colors duration-300 ${isActive ? 'text-luxury-gold border-b border-luxury-gold/50 pb-1' : 'text-luxury-muted'}`}
                >
                  <PenTool size={14} /> Journal
                </NavLink>
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `flex items-center gap-1.5 hover:text-luxury-gold transition-colors duration-300 ${isActive ? 'text-luxury-gold border-b border-luxury-gold/50 pb-1' : 'text-luxury-muted'}`}
                >
                  <Shield size={14} /> Admin
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={logout} 
                className="flex items-center gap-1 px-4 py-2 border border-red-950/40 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:border-red-500/50 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              >
                <LogOut size={12} /> Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 border border-luxury-gold/20 hover:border-luxury-gold/80 bg-luxury-card hover:bg-luxury-gold hover:text-black rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              >
                Gate
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow z-10 max-w-7xl mx-auto px-6 py-8 w-full">
        {children}
      </main>

      {/* Luxury Footer */}
      <footer className="z-10 border-t border-luxury-border/40 py-10 bg-luxury-bg/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-luxury-muted">
          <div>
            <p className="font-serif italic text-base text-luxury-gold">"Ink writes the stories that the heart cannot speak."</p>
            <p className="mt-1 text-xs">© {new Date().getFullYear()} Ink & Echoes. All Rights Reserved.</p>
          </div>
          <div className="flex gap-6 text-xs uppercase tracking-widest">
            <Link to="/" className="hover:text-luxury-gold transition-colors duration-300">Home</Link>
            <Link to="/library" className="hover:text-luxury-gold transition-colors duration-300">Library</Link>
            <Link to="/contact" className="hover:text-luxury-gold transition-colors duration-300">Contact</Link>
            <Link to="/login" className="hover:text-luxury-gold transition-colors duration-300">Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
