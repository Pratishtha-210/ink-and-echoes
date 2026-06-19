import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye, Bookmark, Tag, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import api from '../utils/api.js';

const EssayDetail = () => {
  const { id } = useParams();
  const [essay, setEssay] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Bookmark and Share States
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const fetchEssayDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/essays/${id}`);
      if (res.data && res.data.success) {
        setEssay(res.data.data);
        
        // Check local storage for bookmark state
        const bookmarks = JSON.parse(localStorage.getItem('ink_echoes_bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(id));

        // Fetch other essays to find related articles
        const allRes = await api.get('/essays');
        const allEssays = allRes.data?.data || [];
        
        // Find essays with overlapping tags (excluding current)
        const currentTags = res.data.data.tags || [];
        const relatedList = allEssays
          .filter(e => e._id !== id && e.tags && e.tags.some(t => currentTags.includes(t)))
          .slice(0, 2);

        // Fallback to latest essays if no tag overlap
        if (relatedList.length < 2) {
          const leftovers = allEssays.filter(e => e._id !== id && !relatedList.some(r => r._id === e._id));
          relatedList.push(...leftovers.slice(0, 2 - relatedList.length));
        }

        setRelated(relatedList);
      }
    } catch (err) {
      console.error('Error fetching essay details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEssayDetails();
  }, [id]);

  // Scroll Progress Bar Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('ink_echoes_bookmarks') || '[]');
    if (isBookmarked) {
      const updated = bookmarks.filter(b => b !== id);
      localStorage.setItem('ink_echoes_bookmarks', JSON.stringify(updated));
      setIsBookmarked(false);
    } else {
      bookmarks.push(id);
      localStorage.setItem('ink_echoes_bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!essay) {
    return (
      <div className="text-center py-20">
        <p className="font-serif italic text-luxury-muted mb-4">"The essay you seek has vanished into the library archives."</p>
        <Link to="/thoughts" className="text-luxury-gold hover:underline flex items-center gap-1 justify-center"><ArrowLeft size={16} /> Return to Thoughts</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-10 relative">
      {/* Pinned Reading Progress Bar */}
      <div className="fixed top-[80px] left-0 w-full h-[2px] bg-luxury-border/60 z-50">
        <div 
          className="h-full bg-luxury-gold transition-all duration-75 shadow-gold-glow" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Header */}
      <div className="flex justify-between items-center">
        <Link
          to="/thoughts"
          className="text-xs uppercase tracking-widest text-luxury-muted hover:text-luxury-gold transition-colors flex items-center gap-1.5 font-semibold"
        >
          <ArrowLeft size={14} /> Back to Essays
        </Link>

        {/* Action Tray */}
        <div className="flex gap-2">
          <button
            onClick={toggleBookmark}
            className={`p-2.5 rounded-full border border-luxury-border/60 bg-luxury-card hover:border-luxury-gold/50 transition-all duration-300 ${isBookmarked ? 'text-luxury-gold' : 'text-luxury-muted hover:text-white'}`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Essay"}
          >
            <Bookmark size={14} className={isBookmarked ? 'fill-luxury-gold' : ''} />
          </button>
          
          <div className="relative">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full border border-luxury-border/60 bg-luxury-card text-luxury-muted hover:text-white hover:border-luxury-gold/50 transition-all duration-300"
              title="Copy share link"
            >
              <Share2 size={14} />
            </button>
            {showShareTooltip && (
              <div className="absolute bottom-11 right-0 bg-luxury-gold text-black text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap z-20">
                Link Copied!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Post Wrapper */}
      <article className="glass-panel p-8 md:p-12 rounded-3xl border border-luxury-border/60 shadow-gold-glow space-y-8 select-text">
        <div className="border-b border-luxury-border/60 pb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-luxury-muted font-light">
            <span className="flex items-center gap-1.5 text-luxury-gold"><Clock size={12} /> {essay.readingTime} min read</span>
            <span>•</span>
            <span>{new Date(essay.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {essay.views || 0} views</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight tracking-wide text-white">
            {essay.title}
          </h1>

          {/* Tags */}
          {essay.tags && essay.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {essay.tags.map(t => (
                <span key={t} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-luxury-muted bg-luxury-border/30 px-2.5 py-1 rounded-full border border-luxury-border">
                  <Tag size={8} /> {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Prose text body */}
        <div className="text-luxury-muted leading-relaxed font-light text-base whitespace-pre-wrap space-y-6">
          {essay.content}
        </div>
      </article>

      {/* Related Articles Panel */}
      {related.length > 0 && (
        <section className="space-y-6 border-t border-luxury-border/60 pt-10">
          <h3 className="font-serif text-xl font-bold">Related Readings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map(item => (
              <div 
                key={item._id} 
                className="bg-luxury-card/50 p-6 rounded-2xl border border-luxury-border hover:border-luxury-gold/30 shadow-gold-glow transition-all duration-300 flex flex-col justify-between h-48 group"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-luxury-gold mb-2">
                    <Clock size={10} /> {item.readingTime} min read
                  </div>
                  <h4 className="font-serif text-base font-bold text-white group-hover:text-luxury-gold transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </div>
                <Link 
                  to={`/thoughts/${item._id}`} 
                  className="text-luxury-gold hover:text-white text-xs uppercase tracking-widest font-semibold flex items-center gap-1 mt-4"
                >
                  Read Essay <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EssayDetail;
