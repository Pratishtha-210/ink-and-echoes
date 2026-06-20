import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, MessageSquare, Feather, Smile, Clock, Sparkles, X, Heart, AlertCircle, Check } from 'lucide-react';
import api from '../utils/api.js';
import { playPageTurnSound } from '../utils/soundEffects.js';
import axios from 'axios';

const OpenDiary = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    mood: 'neutral',
    content: ''
  });
  const [status, setStatus] = useState({ success: null, error: null });

  // Mood constants with their representation details
  const moodPicker = [
    { value: 'serene', label: 'Serene', emoji: '☀️', color: 'text-yellow-400/90' },
    { value: 'melancholic', label: 'Melancholic', emoji: '🌧️', color: 'text-blue-400/90' },
    { value: 'inspired', label: 'Inspired', emoji: '⚡', color: 'text-purple-400/90' },
    { value: 'reflective', label: 'Reflective', emoji: '🌖', color: 'text-amber-400/90' },
    { value: 'turbulent', label: 'Turbulent', emoji: '⛈️', color: 'text-red-400/90' },
    { value: 'neutral', label: 'Neutral', emoji: '☁️', color: 'text-slate-400/90' }
  ];

  const initialOfflineSeeds = [
    {
      _id: 'seed_diary_1',
      name: 'Julian Vance',
      content: 'I write these lines from a quiet library corner as rain brushes the stained glass. The scratch of fountain pens is the only rhythm that keeps me company tonight.',
      mood: 'melancholic',
      createdAt: '2026-06-19T21:40:00.000Z'
    },
    {
      _id: 'seed_diary_2',
      name: 'Aurelia',
      content: 'Found an old leather notebook at a local thrift stall. The pages smelled of sandalwood and forgotten years. There is something holy about writing on a surface another soul has touched.',
      mood: 'reflective',
      createdAt: '2026-06-18T14:10:00.000Z'
    },
    {
      _id: 'seed_diary_3',
      name: 'Anonymous',
      content: 'Creation is a double-edged blade. The same thoughts that inspire you in the morning can haunt you in the dark. But still, we must write.',
      mood: 'inspired',
      createdAt: '2026-06-17T09:12:00.000Z'
    }
  ];

  const fetchReflections = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      
      // Try backend API first
      try {
        const res = await api.get('/open-diary');
        if (res.data && res.data.success) {
          setReflections(res.data.data);
          localStorage.setItem('local_open_diary', JSON.stringify(res.data.data));
          if (!isPolling) setLoading(false);
          return;
        }
      } catch (backendErr) {
        console.warn('Backend API unreachable. Trying shared cloud database...');
      }

      // Fallback to shared cloud database (KVDB)
      try {
        const cloudRes = await axios.get('https://kvdb.io/FS13hStgD5SZR9MQZj2wza/open_diary');
        if (cloudRes.data && Array.isArray(cloudRes.data)) {
          setReflections(cloudRes.data);
          localStorage.setItem('local_open_diary', JSON.stringify(cloudRes.data));
          if (!isPolling) setLoading(false);
          return;
        }
      } catch (cloudErr) {
        if (cloudErr.response?.status === 404) {
          // Uninitialized key on KVDB, initialize it with seed data
          console.log('Shared cloud database is empty. Initializing...');
          await axios.post('https://kvdb.io/FS13hStgD5SZR9MQZj2wza/open_diary', initialOfflineSeeds);
          setReflections(initialOfflineSeeds);
          localStorage.setItem('local_open_diary', JSON.stringify(initialOfflineSeeds));
          if (!isPolling) setLoading(false);
          return;
        }
        throw cloudErr;
      }
    } catch (err) {
      console.warn('API and Cloud DB both unreachable. Querying localStorage fallback...');
    }

    // Offline local device storage fallback
    if (!isPolling) {
      const stored = localStorage.getItem('local_open_diary');
      if (stored) {
        try {
          setReflections(JSON.parse(stored));
        } catch (e) {
          setReflections(initialOfflineSeeds);
        }
      } else {
        setReflections(initialOfflineSeeds);
        localStorage.setItem('local_open_diary', JSON.stringify(initialOfflineSeeds));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReflections(false);

    // Setup polling interval for real-time updates (every 5 seconds)
    const interval = setInterval(() => {
      fetchReflections(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMoodSelect = (moodVal) => {
    setFormData({
      ...formData,
      mood: moodVal
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setSubmitting(true);
    setStatus({ success: null, error: null });
    playPageTurnSound();

    try {
      // Try to submit to backend API first
      const res = await api.post('/open-diary', formData);
      if (res.data && res.data.success) {
        setStatus({ success: 'Your reflection has been pinned to the board.', error: null });
        setFormData({ name: '', mood: 'neutral', content: '' });
        setShowForm(false);
        fetchReflections();
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.warn('Backend API submission failed. Attempting shared cloud database submission...');
    }

    // Try to submit to shared cloud database (KVDB)
    try {
      let currentList = [];
      try {
        const cloudRes = await axios.get('https://kvdb.io/FS13hStgD5SZR9MQZj2wza/open_diary');
        if (cloudRes.data && Array.isArray(cloudRes.data)) {
          currentList = cloudRes.data;
        } else {
          currentList = [...initialOfflineSeeds];
        }
      } catch (e) {
        currentList = [...initialOfflineSeeds];
      }

      const newEntry = {
        _id: `cloud_ref_${Date.now()}`,
        name: formData.name.trim() || 'Anonymous',
        content: formData.content.trim(),
        mood: formData.mood,
        createdAt: new Date().toISOString()
      };

      const updatedList = [newEntry, ...currentList];
      await axios.post('https://kvdb.io/FS13hStgD5SZR9MQZj2wza/open_diary', updatedList);
      
      localStorage.setItem('local_open_diary', JSON.stringify(updatedList));
      setReflections(updatedList);
      
      setStatus({ success: 'Your reflection has been pinned to the board.', error: null });
      setFormData({ name: '', mood: 'neutral', content: '' });
      setShowForm(false);
    } catch (err) {
      console.warn('Cloud DB submission failed. Saving locally to device only...');
      try {
        const stored = localStorage.getItem('local_open_diary');
        const list = stored ? JSON.parse(stored) : [...initialOfflineSeeds];
        
        const newEntry = {
          _id: `local_ref_${Date.now()}`,
          name: formData.name.trim() || 'Anonymous',
          content: formData.content.trim(),
          mood: formData.mood,
          createdAt: new Date().toISOString()
        };

        list.unshift(newEntry);
        localStorage.setItem('local_open_diary', JSON.stringify(list));
        setReflections(list);
        
        setStatus({ success: 'Pinned to board locally (offline mode).', error: null });
        setFormData({ name: '', mood: 'neutral', content: '' });
        setShowForm(false);
      } catch (e) {
        setStatus({ success: null, error: 'Failed to record reflection. Please try again.' });
      }
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus({ success: null, error: null }), 4000);
    }
  };

  const getMoodDetails = (moodVal) => {
    return moodPicker.find(m => m.value === moodVal) || moodPicker[5];
  };

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      {/* Header Block */}
      <div className="border-b border-luxury-border/60 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-semibold">The Community Ledger</span>
          <h1 className="font-serif text-4xl font-bold tracking-wide mt-1">The Open Diary</h1>
          <p className="text-luxury-muted text-sm mt-1">A public registry of anonymous echoes, passing thoughts, and collective whispers.</p>
        </div>

        <button
          onClick={() => {
            playPageTurnSound();
            setShowForm(true);
          }}
          className="px-6 py-3 bg-luxury-gold hover:bg-luxury-goldMuted text-black rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-gold-glow mx-auto md:mx-0 cursor-pointer"
        >
          <PenTool size={13} /> Pen a Reflection
        </button>
      </div>

      {/* Success/Error Alerts */}
      {status.success && (
        <div className="flex items-center gap-2.5 p-4 border border-green-950/40 bg-green-950/15 text-green-400 text-xs rounded-xl font-medium max-w-2xl mx-auto animate-pulse">
          <Check size={15} />
          <span>{status.success}</span>
        </div>
      )}
      {status.error && (
        <div className="flex items-center gap-2.5 p-4 border border-red-950/40 bg-red-950/15 text-red-400 text-xs rounded-xl font-medium max-w-2xl mx-auto">
          <AlertCircle size={15} />
          <span>{status.error}</span>
        </div>
      )}

      {/* Reflections Board Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-60 rounded-2xl bg-luxury-card/50 border border-luxury-border/40 animate-pulse"></div>
          ))}
        </div>
      ) : reflections.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-2xl max-w-xl mx-auto p-10 space-y-4">
          <Feather size={28} className="text-luxury-gold/40 mx-auto animate-bounce" />
          <p className="font-serif italic text-luxury-muted text-base">"The collective journal is empty. Be the first to whisper your soul to the paper."</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
          {reflections.map((ref, idx) => {
            const mood = getMoodDetails(ref.mood);
            // Dynamic subtle paper rotation to give a realistic look
            const rotations = ['rotate-[-1deg]', 'rotate-[0.5deg]', 'rotate-[-0.5deg]', 'rotate-[1deg]', 'rotate-[0deg]'];
            const rotClass = rotations[idx % rotations.length];

            return (
              <motion.div
                key={ref._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`glass-panel p-8 rounded-2xl border border-luxury-border/60 hover:border-luxury-gold/30 shadow-gold-glow flex flex-col justify-between min-h-[220px] transition-all duration-300 ${rotClass} group hover:rotate-0`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4 text-xs font-light">
                    <span className="font-serif font-semibold text-white/95">{ref.name}</span>
                    <span className={`px-2 py-0.5 rounded-full bg-luxury-border/30 text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-medium ${mood.color}`}>
                      <span>{mood.emoji}</span> <span>{mood.label}</span>
                    </span>
                  </div>

                  <p className="text-luxury-muted font-light text-sm font-poetry leading-relaxed whitespace-pre-line group-hover:text-white/90 transition-colors">
                    "{ref.content}"
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between text-[10px] text-luxury-muted/70 border-t border-luxury-border/40 pt-3">
                  <span className="flex items-center gap-1"><Clock size={10} /> {new Date(ref.createdAt).toLocaleDateString()}</span>
                  <span className="uppercase tracking-widest text-[9px] text-luxury-gold/50 font-semibold group-hover:text-luxury-gold transition-colors">Echo</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Slide-over Drawer / Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playPageTurnSound();
                setShowForm(false);
              }}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4 }}
              className="glass-panel-gold p-8 rounded-3xl border border-luxury-gold/20 shadow-gold-glow max-w-lg w-full space-y-6 relative overflow-hidden z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playPageTurnSound();
                  setShowForm(false);
                }}
                className="absolute top-5 right-5 text-luxury-muted hover:text-white p-1 rounded-full hover:bg-luxury-border/30 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-1.5 pr-6">
                <h3 className="font-serif text-2xl font-bold tracking-wide">Write to the Ledger</h3>
                <p className="text-luxury-muted text-xs font-light">Share your voice. What occupies your mind in the silence of today?</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Pen Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
                    <Feather size={10} className="text-luxury-gold" /> Pen Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Anonymous"
                    maxLength={30}
                    className="w-full px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white placeholder:text-luxury-muted/50 transition-all duration-300"
                  />
                </div>

                {/* Mood Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
                    <Smile size={10} className="text-luxury-gold" /> Present Resonance
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {moodPicker.map(m => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => handleMoodSelect(m.value)}
                        className={`py-2 px-1 text-center rounded-xl border text-[10px] flex flex-col items-center justify-center gap-1 transition-all duration-300 cursor-pointer ${
                          formData.mood === m.value
                            ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold font-semibold scale-105'
                            : 'bg-black/45 border-luxury-border text-luxury-muted hover:border-luxury-gold/50 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{m.emoji}</span>
                        <span className="scale-95">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
                    <MessageSquare size={10} className="text-luxury-gold" /> Reflection
                  </label>
                  <textarea
                    name="content"
                    required
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your entry here..."
                    maxLength={280}
                    rows={4}
                    className="w-full px-4 py-3 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white placeholder:text-luxury-muted/50 transition-all duration-300 resize-none font-poetry leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[9px] text-luxury-muted/70 px-1 pt-0.5">
                    <span>💡 Max 280 characters. Keep it brief.</span>
                    <span>{formData.content.length}/280</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || !formData.content.trim()}
                  className="w-full py-3 bg-luxury-gold hover:bg-luxury-goldMuted text-black disabled:bg-luxury-gold/50 disabled:cursor-not-allowed rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 shadow-gold-glow cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles size={13} /> Pin to Ledger
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpenDiary;
