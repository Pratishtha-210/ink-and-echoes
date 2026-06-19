import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Heart, Calendar, ArrowRight } from 'lucide-react';
import api from '../utils/api.js';

const Library = () => {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');

  const categories = ['All', 'Love', 'Heartbreak', 'Life', 'Nature', 'Philosophy', 'Dreams', 'Personal'];

  const fetchPoems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/poems', {
        params: {
          category: category === 'All' ? undefined : category,
          search: search || undefined,
          sort: sort
        }
      });
      if (res.data && res.data.success) {
        setPoems(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching poems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input
    const delayDebounceFn = setTimeout(() => {
      fetchPoems();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [category, search, sort]);

  return (
    <div className="space-y-10 py-6">
      {/* Page Title */}
      <div className="border-b border-luxury-border/60 pb-6 text-center md:text-left">
        <h1 className="font-serif text-4xl font-bold tracking-wide">The Poetry Library</h1>
        <p className="text-luxury-muted text-sm mt-1">Step into the quiet galleries of verse, rhythm, and silence.</p>
      </div>

      {/* Query Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-4 top-1/2 translate-y-[-50%] text-luxury-muted" />
          <input
            type="text"
            placeholder="Search poems by title or verse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-luxury-card border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-full text-sm text-white placeholder:text-luxury-muted/70 transition-all duration-300"
          />
        </div>

        {/* Sort selector */}
        <div className="lg:col-span-2 flex justify-end gap-3 w-full">
          <label className="text-xs text-luxury-muted font-semibold uppercase tracking-widest self-center mr-2">Sort By</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 bg-luxury-card border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-full text-xs uppercase tracking-widest text-luxury-gold font-medium cursor-pointer transition-all duration-300"
          >
            <option value="latest">Latest Entries</option>
            <option value="most-viewed">Most Viewed</option>
            <option value="most-loved">Most Loved</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs uppercase tracking-widest font-semibold border transition-all duration-300 ${
              category === cat
                ? 'bg-luxury-gold border-luxury-gold text-black shadow-gold-glow'
                : 'bg-luxury-card border-luxury-border text-luxury-muted hover:border-luxury-gold/50 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Poems Listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 rounded-2xl bg-luxury-card/50 border border-luxury-border/40 animate-pulse"></div>
          ))}
        </div>
      ) : poems.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl max-w-xl mx-auto p-8">
          <p className="font-serif italic text-luxury-muted text-base">"The pages are blank. The wind carries no whispers matching this search."</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
          {poems.map((poem) => (
            <div
              key={poem._id}
              className="glass-panel p-8 rounded-2xl flex flex-col justify-between h-80 border border-luxury-border/60 hover:border-luxury-gold/30 shadow-gold-glow transition-all duration-300 group"
            >
              <div>
                <div className="flex justify-between items-center text-xs uppercase tracking-widest text-luxury-gold mb-4">
                  <span>{poem.category}</span>
                  <span className="text-[10px] text-luxury-muted bg-luxury-border/50 px-2 py-0.5 rounded-full">{poem.readingTime} min read</span>
                </div>

                <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-luxury-gold transition-colors line-clamp-2">
                  {poem.title}
                </h3>

                <p className="text-luxury-muted font-light text-sm line-clamp-4 font-poetry whitespace-pre-line leading-relaxed">
                  {poem.content.replace(/\\n/g, '\n')}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-luxury-muted border-t border-luxury-border/60 pt-4">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1"><Eye size={12} /> {poem.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart size={12} className="text-red-500/70" /> {poem.likes || 0}</span>
                </div>
                <Link
                  to={`/library/${poem._id}`}
                  className="text-luxury-gold hover:text-white uppercase tracking-wider font-semibold flex items-center gap-1"
                >
                  Read Poem <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
