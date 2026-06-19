import React, { useState } from 'react';
import { Send, Mail, User, Info, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const res = await api.post('/contact', formData);
      if (res.data && res.data.success) {
        setStatus({ submitting: false, success: true, error: null });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to deliver message. Please try again.';
      setStatus({ submitting: false, success: false, error: msg });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-semibold">Get In Touch</span>
        <h1 className="font-serif text-4xl font-bold tracking-wide">Send an Echo</h1>
        <p className="text-luxury-muted text-sm max-w-md mx-auto">Have a resonance to share, a question, or a request? Send a message to my drawer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Detail/Info Card */}
        <div className="md:col-span-4 bg-luxury-card/60 border border-luxury-border/60 p-8 rounded-3xl flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-white">The Correspondence</h3>
            <p className="text-luxury-muted text-xs font-light leading-relaxed">
              Every message sent here is stored securely in my database. I read each inquiry in the quiet hours of the evening and reply via email.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-luxury-border/50 text-xs text-luxury-muted">
            <div className="flex items-center gap-3">
              <Mail size={14} className="text-luxury-gold" />
              <span>pratishtha@inkandechoes.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Info size={14} className="text-luxury-gold" />
              <span>Est. Response: 24-48 hours</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="md:col-span-8 glass-panel p-8 rounded-3xl border border-luxury-border hover:border-luxury-gold/20 shadow-gold-glow transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Status Messages */}
            {status.success && (
              <div className="flex items-center gap-2.5 p-4 border border-green-950/40 bg-green-950/10 text-green-400 text-xs rounded-xl font-medium">
                <CheckCircle size={16} />
                <span>Your echo has been delivered. I will read it in silence.</span>
              </div>
            )}

            {status.error && (
              <div className="flex items-center gap-2.5 p-4 border border-red-950/40 bg-red-950/10 text-red-400 text-xs rounded-xl font-medium">
                <AlertCircle size={16} />
                <span>{status.error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
                  <User size={10} className="text-luxury-gold" /> Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-sm text-white placeholder:text-luxury-muted/50 transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
                  <Mail size={10} className="text-luxury-gold" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  className="w-full px-4 py-3 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-sm text-white placeholder:text-luxury-muted/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
                <Info size={10} className="text-luxury-gold" /> Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Inquiry or feedback topic"
                className="w-full px-4 py-3 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-sm text-white placeholder:text-luxury-muted/50 transition-all duration-300"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
                <MessageSquare size={10} className="text-luxury-gold" /> Message
              </label>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Compose your message here..."
                className="w-full px-4 py-3 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-sm text-white placeholder:text-luxury-muted/50 transition-all duration-300 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={status.submitting}
                className="px-6 py-3 bg-luxury-gold hover:bg-luxury-goldMuted text-black disabled:bg-luxury-gold/50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-gold-glow"
              >
                {status.submitting ? 'Delivering...' : 'Send Message'} <Send size={12} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
