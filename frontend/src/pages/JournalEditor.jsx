import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Calendar, Smile, Cloud, Tag, Download, Archive, Check } from 'lucide-react';
import api from '../utils/api.js';

const JournalEditor = () => {
  const { id } = useParams(); // exists if editing
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [weather, setWeather] = useState('cloudy');
  const [tags, setTags] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  // Status & Save logs
  const [saveStatus, setSaveStatus] = useState('Clean'); // Clean, Edited, Saving, Saved
  const [errorMessage, setErrorMessage] = useState(null);
  const autoSaveTimerRef = useRef(null);
  
  // Keep track of values for auto-save ref closure
  const stateRef = useRef({ title, content, mood, weather, tags, favorite, isArchived });

  useEffect(() => {
    stateRef.current = { title, content, mood, weather, tags, favorite, isArchived };
    if (saveStatus === 'Clean') {
      setSaveStatus('Edited');
    }
  }, [title, content, mood, weather, tags, favorite, isArchived]);

  // Load entry if edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchEntry = async () => {
        try {
          const res = await api.get(`/journal/${id}`);
          if (res.data?.success) {
            const entry = res.data.data;
            setTitle(entry.title);
            setContent(entry.content);
            setMood(entry.mood);
            setWeather(entry.weather);
            setFavorite(entry.favorite);
            setIsArchived(entry.isArchived || false);
            setTags(entry.tags ? entry.tags.join(', ') : '');
            
            // Set save status back to Clean so we don't trigger immediate autosave
            setTimeout(() => setSaveStatus('Clean'), 100);
          }
        } catch (err) {
          console.warn('API error loading entry. Querying local storage:', err);
          const localData = localStorage.getItem('local_journals') || '[]';
          const parsed = JSON.parse(localData);
          const localEntry = parsed.find(e => e._id === id);
          if (localEntry) {
            setTitle(localEntry.title);
            setContent(localEntry.content);
            setMood(localEntry.mood);
            setWeather(localEntry.weather);
            setFavorite(localEntry.favorite);
            setIsArchived(localEntry.isArchived || false);
            setTags(localEntry.tags ? localEntry.tags.join(', ') : '');
            setTimeout(() => setSaveStatus('Clean'), 100);
          } else {
            setErrorMessage('Failed to retrieve entry from vault.');
          }
        }
      };
      fetchEntry();
    }
  }, [id, isEditMode]);

  // Save entry logic (Create or Update)
  const saveEntry = async (silent = false) => {
    const currentData = stateRef.current;
    if (!currentData.title || !currentData.content) {
      if (!silent) setErrorMessage('Please provide both title and content to secure.');
      return;
    }

    if (!silent) setSaveStatus('Saving');
    
    try {
      const payload = {
        title: currentData.title,
        content: currentData.content,
        mood: currentData.mood,
        weather: currentData.weather,
        favorite: currentData.favorite,
        isArchived: currentData.isArchived,
        tags: currentData.tags
      };

      if (isEditMode) {
        await api.put(`/journal/${id}`, payload);
      } else {
        const res = await api.post('/journal', payload);
        if (res.data?.success && res.data.data._id) {
          // If we created a new entry, redirect to its edit path so autosave can continue updates
          const newId = res.data.data._id;
          setSaveStatus('Saved');
          navigate(`/journal/edit/${newId}`, { replace: true });
          return;
        }
      }
      setSaveStatus('Saved');
      setErrorMessage(null);
    } catch (err) {
      console.warn('API error saving journal. Utilizing local storage fallback:', err);
      // Local storage fallback save
      const localData = localStorage.getItem('local_journals') || '[]';
      const parsed = JSON.parse(localData);
      
      const newTags = currentData.tags 
        ? currentData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      if (isEditMode) {
        const idx = parsed.findIndex(e => e._id === id);
        if (idx !== -1) {
          parsed[idx] = {
            ...parsed[idx],
            title: currentData.title,
            content: currentData.content,
            mood: currentData.mood,
            weather: currentData.weather,
            favorite: currentData.favorite,
            isArchived: currentData.isArchived,
            tags: newTags,
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        const newId = 'local_' + Math.random().toString(36).substring(2, 11);
        const newEntry = {
          _id: newId,
          title: currentData.title,
          content: currentData.content,
          mood: currentData.mood,
          weather: currentData.weather,
          favorite: currentData.favorite,
          isArchived: currentData.isArchived,
          tags: newTags,
          createdAt: new Date().toISOString(),
          isOffline: true
        };
        parsed.push(newEntry);
        localStorage.setItem('local_journals', JSON.stringify(parsed));
        setSaveStatus('Saved');
        setErrorMessage(null);
        navigate(`/journal/edit/${newId}`, { replace: true });
        return;
      }
      
      localStorage.setItem('local_journals', JSON.stringify(parsed));
      setSaveStatus('Saved');
      setErrorMessage(null);
    }
  };

  // Trigger manual save
  const handleManualSave = (e) => {
    e.preventDefault();
    saveEntry(false);
  };

  // Auto-save logic: Runs every 10 seconds if fields have been edited
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => {
      // Check if state is in Edited mode before pushing automatic changes
      if (saveStatus === 'Edited') {
        saveEntry(true);
      }
    }, 10000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [saveStatus]);

  // Delete entry
  const handleDelete = async () => {
    if (!window.confirm('⚠️ Are you sure you want to permanently purge this reflection from the vault? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/journal/${id}`);
      navigate('/journal');
    } catch (err) {
      console.warn('API error deleting journal. Querying local storage fallback:', err);
      // Local storage delete fallback
      const localData = localStorage.getItem('local_journals') || '[]';
      const parsed = JSON.parse(localData);
      const filtered = parsed.filter(e => e._id !== id);
      localStorage.setItem('local_journals', JSON.stringify(filtered));
      navigate('/journal');
    }
  };

  // Export entry as Markdown file
  const handleExport = () => {
    const currentData = stateRef.current;
    const mdContent = `---
title: ${currentData.title}
date: ${new Date().toLocaleDateString()}
mood: ${currentData.mood}
weather: ${currentData.weather}
tags: [${currentData.tags}]
favorite: ${currentData.favorite}
---

# ${currentData.title}

${currentData.content}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentData.title.toLowerCase().replace(/\s+/g, '_')}_reflections.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      
      {/* Top Navbar */}
      <div className="flex justify-between items-center border-b border-luxury-border/60 pb-4">
        <Link
          to="/journal"
          className="text-xs uppercase tracking-widest text-luxury-muted hover:text-luxury-gold transition-colors flex items-center gap-1.5 font-semibold"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Save Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
          {saveStatus === 'Saving' && <span className="text-luxury-gold animate-pulse">🔒 Securing Vault...</span>}
          {saveStatus === 'Saved' && <span className="text-green-400 flex items-center gap-1"><Check size={12} /> Secured in Vault</span>}
          {saveStatus === 'Edited' && <span className="text-luxury-muted">Editing... (Autosaves 10s)</span>}
          {saveStatus === 'Clean' && <span className="text-luxury-muted/50">Synced</span>}

          <div className="flex gap-2">
            {isEditMode && (
              <>
                <button
                  type="button"
                  onClick={handleExport}
                  className="p-2.5 rounded-xl border border-luxury-border/60 bg-luxury-card text-luxury-gold hover:text-white hover:border-luxury-gold/50 transition-all duration-300"
                  title="Export Entry to Markdown file"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2.5 rounded-xl border border-red-950/40 bg-red-950/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                  title="Purge Entry"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            
            <button
              onClick={handleManualSave}
              className="px-4 py-2.5 bg-luxury-gold hover:bg-luxury-goldMuted text-black rounded-xl flex items-center gap-1.5 transition-all duration-300 shadow-gold-glow"
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 border border-red-950/40 bg-red-950/15 text-red-400 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      {/* Main Form Fields */}
      <form onSubmit={handleManualSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Title and Editor */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title */}
          <input
            type="text"
            placeholder="Title of Reflection..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-4 bg-luxury-card border border-luxury-border focus:border-luxury-gold/50 focus:outline-none rounded-2xl text-xl font-serif text-white placeholder:text-luxury-muted/50 transition-all duration-300 shadow-gold-glow"
          />

          {/* Rich Content Editor */}
          <div className="relative">
            <textarea
              placeholder="Start typing your private journal reflections here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-6 py-6 bg-luxury-card border border-luxury-border focus:border-luxury-gold/50 focus:outline-none rounded-3xl text-sm leading-relaxed text-luxury-muted placeholder:text-luxury-muted/40 transition-all duration-300 resize-none font-light"
            />
          </div>
        </div>

        {/* Right Side: Metadata Config card */}
        <div className="lg:col-span-4 bg-luxury-card/60 border border-luxury-border/60 p-6 rounded-3xl space-y-6">
          <h3 className="font-serif text-base font-semibold text-white pb-3 border-b border-luxury-border">Metadata Drawer</h3>

          {/* Mood Selector */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
              <Smile size={12} className="text-luxury-gold" /> Mood State
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white cursor-pointer"
            >
              <option value="neutral">Neutral ☁️</option>
              <option value="serene">Serene ☀️</option>
              <option value="melancholic">Melancholic 🌧️</option>
              <option value="inspired">Inspired ⚡</option>
              <option value="reflective">Reflective 🌖</option>
              <option value="turbulent">Turbulent ⛈️</option>
            </select>
          </div>

          {/* Weather Selector */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
              <Cloud size={12} className="text-luxury-gold" /> Weather State
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white cursor-pointer"
            >
              <option value="cloudy">Cloudy ☁️</option>
              <option value="sunny">Sunny ☀️</option>
              <option value="rainy">Rainy 🌧️</option>
              <option value="snowy">Snowy ❄️</option>
              <option value="misty">Misty 🌫️</option>
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-luxury-muted font-semibold flex items-center gap-1.5">
              <Tag size={12} className="text-luxury-gold" /> Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. dreams, longing, storms"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white placeholder:text-luxury-muted/40 transition-all duration-300"
            />
          </div>

          {/* Favorite and Archive checkboxes */}
          <div className="space-y-3 pt-2">
            {/* Favorite toggle */}
            <label className="flex items-center gap-3 cursor-pointer text-xs text-luxury-muted hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="w-4 h-4 rounded border-luxury-border bg-black text-luxury-gold focus:ring-0 focus:ring-offset-0 cursor-pointer accent-luxury-gold"
              />
              <span>Pin to Favorite Entries</span>
            </label>

            {/* Archive toggle */}
            <label className="flex items-center gap-3 cursor-pointer text-xs text-luxury-muted hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.target.checked)}
                className="w-4 h-4 rounded border-luxury-border bg-black text-luxury-gold focus:ring-0 focus:ring-offset-0 cursor-pointer accent-luxury-gold"
              />
              <span>Archive this Entry</span>
            </label>
          </div>
        </div>

      </form>
    </div>
  );
};

export default JournalEditor;
