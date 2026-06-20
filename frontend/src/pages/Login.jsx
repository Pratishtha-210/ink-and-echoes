import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, Mail, User, Shield, AlertCircle, KeyRound } from 'lucide-react';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    adminSecret: ''
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isRegistering) {
        await register(formData.username, formData.email, formData.password, formData.adminSecret);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/journal'); // Redirect straight to private journal on login
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-6">
      <div className="glass-panel-gold p-8 md:p-10 rounded-3xl border border-luxury-gold/20 shadow-gold-glow max-w-md w-full space-y-8 relative overflow-hidden">
        {/* Accent glow corner */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-luxury-gold/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold mb-2">
            <Lock size={20} className="animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-wide">
            {isRegistering ? 'Register Administrator' : 'The Writer\'s Gate'}
          </h2>
          <p className="text-luxury-muted text-xs font-light">
            {isRegistering 
              ? 'Establish admin credentials with server secret.' 
              : 'Enter credentials to access private journal and dashboard.'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 border border-red-950/40 bg-red-950/15 text-red-400 text-xs rounded-xl font-medium">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
                <User size={10} className="text-luxury-gold" /> Username
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. admin"
                className="w-full px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white placeholder:text-luxury-muted/50 transition-all duration-300"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
              <Mail size={10} className="text-luxury-gold" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. pratishtha@inkandechoes.com"
              className="w-full px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white placeholder:text-luxury-muted/50 transition-all duration-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
              <Lock size={10} className="text-luxury-gold" /> Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white placeholder:text-luxury-muted/50 transition-all duration-300"
            />
          </div>

          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
                <KeyRound size={10} className="text-luxury-gold" /> Admin Secret Key
              </label>
              <input
                type="password"
                name="adminSecret"
                required
                value={formData.adminSecret}
                onChange={handleChange}
                placeholder="Enter server admin token"
                className="w-full px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white placeholder:text-luxury-muted/50 transition-all duration-300"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-luxury-gold hover:bg-luxury-goldMuted text-black disabled:bg-luxury-gold/50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 shadow-gold-glow"
          >
            {submitting 
              ? 'Validating Key...' 
              : isRegistering ? 'Create Admin Account' : 'Authenticate Session'
            }
          </button>

          {!isRegistering && (
            <button
              type="button"
              disabled={submitting}
              onClick={async () => {
                setError(null);
                setSubmitting(true);
                try {
                  await login('pratishtha@inkandechoes.com', 'adminpassword123');
                  navigate('/journal');
                } catch (err) {
                  setError(err.message || 'Authentication failed.');
                } finally {
                  setSubmitting(false);
                }
              }}
              className="w-full py-2.5 bg-transparent border border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/5 text-luxury-gold hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Shield size={13} /> Demo Admin Bypass
            </button>
          )}
        </form>

        {/* Seed Info Box (Convenience check) */}
        {!isRegistering && (
          <div className="p-3 border border-luxury-border/80 bg-luxury-border/20 text-luxury-muted text-[10px] rounded-lg leading-relaxed text-center font-light">
            💡 Local environment seeds a default user: <br />
            <strong>pratishtha@inkandechoes.com</strong> / <strong>adminpassword123</strong>
          </div>
        )}

        {/* Toggle Account Creation */}
        <div className="text-center pt-2 border-t border-luxury-border/40">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-[11px] uppercase tracking-wider text-luxury-gold hover:text-white transition-colors"
          >
            {isRegistering 
              ? '← Back to Login Portal' 
              : 'Create New Admin Profile →'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
