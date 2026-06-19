import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag, Eye, Clock, ArrowRight } from 'lucide-react';
import api from '../utils/api.js';

const Thoughts = () => {
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  const fetchEssays = async () => {
    try {
      setLoading(true);
      const res = await api.get('/essays', {
        params: {
          search: search || undefined,
          tag: selectedTag || undefined
        }
      });
      if (res.data && res.data.success) {
        setEssays(res.data.data);
        
        // Extract all unique tags
        const tags = new Set();
        (res.data.data || []).forEach(e => {
          if (e.tags) e.tags.forEach(t => tags.add(t));
        });
        if (availableTags.length === 0) {
          setAvailableTags([...tags]);
        }
      }
    } catch (err) {
      console.error('Error fetching essays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEssays();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedTag]);

  return (
    <div className="space-y-10 py-6">
      {/* Title */}
      <div className="border-b border-luxury-border/60 pb-6 text-center md:text-left">
        <h1 className="font-serif text-4xl font-bold tracking-wide">Thoughts & Essays</h1>
        <p className="text-luxury-muted text-sm mt-1">Long-form prose, essays on craft, reflections on philosophy and time.</p>
      </div>

      {/* Query Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search size={16} className="absolute left-4 top-1/2 translate-y-[-50%] text-luxury-muted" />
          <input
            type="text"
            placeholder="Search essays by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-luxury-card border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-full text-sm text-white placeholder:text-luxury-muted/70 transition-all duration-300"
          />
        </div>

        {/* Tags */}
        <div className="flex gap-2 w-full justify-end">
          <label className="text-xs text-luxury-muted font-semibold uppercase tracking-widest self-center mr-2">Tag Filter</label>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-3 bg-luxury-card border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-full text-xs uppercase tracking-widest text-luxury-gold font-medium cursor-pointer transition-all duration-300"
          >
            <option value="">All Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Essays Listing */}
      {loading ? (
        <div className="space-y-8">
          {[1, 2].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-luxury-card/50 border border-luxury-border/40 animate-pulse"></div>
          ))}
        </div>
      ) : essays.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl max-w-xl mx-auto p-8">
          <p className="font-serif italic text-luxury-muted text-base">"The parchment remains empty. No essays found matching these keywords."</p>
        </div>
      ) : (
        <div className="space-y-8">
          {essays.map((essay) => (
            <div
              key={essay._id}
              className="glass-panel p-8 rounded-3xl border border-luxury-border hover:border-luxury-gold/30 shadow-gold-glow transition-all duration-300 flex flex-col justify-between md:flex-row gap-6 group"
            >
              <div className="space-y-4 flex-grow max-w-3xl">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-luxury-gold"><Clock size={12} /> {essay.readingTime} min read</span>
                  <span className="text-luxury-muted">•</span>
                  <span className="text-luxury-muted">{new Date(essay.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="font-serif text-2xl font-bold group-hover:text-luxury-gold transition-colors">
                  {essay.title}
                </h3>

                <p className="text-luxury-muted font-light text-sm line-clamp-3 leading-relaxed">
                  {essay.content}
                </p>

                {/* Display tags */}
                {essay.tags && essay.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {essay.tags.map(t => (
                      <span key={t} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-luxury-muted bg-luxury-border/30 px-2.5 py-1 rounded-full border border-luxury-border">
                        <Tag size={8} /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex md:flex-col justify-between items-end min-w-[120px] border-t md:border-t-0 md:border-l border-luxury-border/60 pt-4 md:pt-0 md:pl-6">
                <span className="text-xs text-luxury-muted flex items-center gap-1 self-start md:self-end"><Eye size={12} /> {essay.views || 0} views</span>
                <Link
                  to={`/thoughts/${essay._id}`}
                  className="px-5 py-2.5 bg-transparent border border-luxury-gold/20 hover:border-luxury-gold hover:bg-luxury-gold/5 text-luxury-gold hover:text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5"
                >
                  Read Essay <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Thoughts;
