import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, Heart, Share2, ArrowLeft, MessageSquare, Send, Type, Settings } from 'lucide-react';
import api from '../utils/api.js';
import { localPoems } from '../utils/localPoems.js';

const PoemDetail = () => {
  const { id } = useParams();
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  // Reading Mode States
  const [fontSize, setFontSize] = useState('text-lg'); // text-base, text-lg, text-xl, text-2xl
  const [fontFamily, setFontFamily] = useState('font-poetry'); // font-poetry, font-serif, font-sans
  const [themeMode, setThemeMode] = useState('midnight'); // midnight (dark black), parchment (sepia), charcoal (medium gray)
  const [showSettings, setShowSettings] = useState(false);

  const fetchPoemDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/poems/${id}`);
      if (res.data && res.data.success) {
        setPoem(res.data.data);
        setLikeCount(res.data.data.likes || 0);
        setComments(res.data.data.comments || []);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('API error fetching poem details. Querying offline database.');
    }

    // Client-side fallback matching
    let list = [];
    const stored = localStorage.getItem('local_poems');
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        list = [...localPoems];
      }
    } else {
      list = [...localPoems];
    }
    const localMatch = list.find(p => p._id === id);
    if (localMatch) {
      setPoem(localMatch);
      setLikeCount(localMatch.likes || 0);
      setComments(localMatch.comments || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPoemDetails();
  }, [id]);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await api.post(`/poems/${id}/like`);
      if (res.data && res.data.success) {
        setLikeCount(res.data.likes);
        setLiked(true);
      }
    } catch (err) {
      console.warn('Like API call failed. Liking poem locally (offline)...');
      let list = [];
      const stored = localStorage.getItem('local_poems');
      if (stored) {
        list = JSON.parse(stored);
      } else {
        list = [...localPoems];
      }

      list = list.map(p => {
        if (p._id === id) {
          const newLikes = (p.likes || 0) + 1;
          setLikeCount(newLikes);
          return { ...p, likes: newLikes };
        }
        return p;
      });

      localStorage.setItem('local_poems', JSON.stringify(list));
      setLiked(true);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName || !commentContent) return;

    try {
      const res = await api.post(`/poems/${id}/comment`, {
        name: commentName,
        content: commentContent
      });
      if (res.data && res.data.success) {
        setComments(res.data.data);
        setCommentName('');
        setCommentContent('');
      }
    } catch (err) {
      console.warn('Comment API call failed. Saving comment locally (offline)...');
      let list = [];
      const stored = localStorage.getItem('local_poems');
      if (stored) {
        list = JSON.parse(stored);
      } else {
        list = [...localPoems];
      }

      const newComment = {
        _id: `comment_${Date.now()}`,
        name: commentName,
        content: commentContent,
        createdAt: new Date().toISOString()
      };

      list = list.map(p => {
        if (p._id === id) {
          const updatedComments = [newComment, ...(p.comments || [])];
          setComments(updatedComments);
          return { ...p, comments: updatedComments };
        }
        return p;
      });

      localStorage.setItem('local_poems', JSON.stringify(list));
      setCommentName('');
      setCommentContent('');
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

  if (!poem) {
    return (
      <div className="text-center py-20">
        <p className="font-serif italic text-luxury-muted mb-4">"The verse you seek has faded back into the silence."</p>
        <Link to="/library" className="text-luxury-gold hover:underline flex items-center gap-1 justify-center"><ArrowLeft size={16} /> Return to Library</Link>
      </div>
    );
  }

  // Set reader classes dynamically based on settings
  const getThemeClass = () => {
    if (themeMode === 'parchment') return 'bg-[#F5EBD0] text-[#2C221E] border-[#E8DAB2]';
    if (themeMode === 'charcoal') return 'bg-[#151515] text-[#E0E0E0] border-[#252525]';
    return 'bg-[#0A0A0A] text-white border-[#1A1A1A]'; // midnight
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Back navigation */}
      <div className="flex justify-between items-center">
        <Link
          to="/library"
          className="text-xs uppercase tracking-widest text-luxury-muted hover:text-luxury-gold transition-colors flex items-center gap-1.5 font-semibold"
        >
          <ArrowLeft size={14} /> Back to Library
        </Link>

        {/* Reading Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-luxury-border/60 bg-luxury-card text-xs text-luxury-gold hover:text-white uppercase tracking-wider font-semibold transition-all duration-300"
          title="Reader Preferences"
        >
          <Settings size={13} /> Settings
        </button>
      </div>

      {/* Reader Settings Controller panel */}
      {showSettings && (
        <div className="glass-panel p-6 rounded-2xl border border-luxury-gold/15 space-y-4 shadow-gold-glow animate-fadeIn">
          <h4 className="text-xs uppercase tracking-widest text-luxury-gold font-bold mb-3 flex items-center gap-1.5">
            <Type size={14} /> Reading Mode Customization
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Font Family */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-luxury-muted">Typography</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFontFamily('font-poetry')}
                  className={`flex-1 py-1 rounded text-xs border ${fontFamily === 'font-poetry' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  Cormorant
                </button>
                <button
                  onClick={() => setFontFamily('font-serif')}
                  className={`flex-1 py-1 rounded text-xs border ${fontFamily === 'font-serif' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  Playfair
                </button>
                <button
                  onClick={() => setFontFamily('font-sans')}
                  className={`flex-1 py-1 rounded text-xs border ${fontFamily === 'font-sans' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  Inter
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-luxury-muted">Scale</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFontSize('text-base')}
                  className={`flex-1 py-1 rounded text-xs border ${fontSize === 'text-base' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('text-lg')}
                  className={`flex-1 py-1 rounded text-xs border ${fontSize === 'text-lg' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('text-xl')}
                  className={`flex-1 py-1 rounded text-xs border ${fontSize === 'text-xl' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('text-2xl')}
                  className={`flex-1 py-1 rounded text-xs border ${fontSize === 'text-2xl' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  A++
                </button>
              </div>
            </div>

            {/* Theme backdrop */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-luxury-muted">Backdrop</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setThemeMode('midnight')}
                  className={`flex-1 py-1 rounded text-xs border ${themeMode === 'midnight' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  Midnight
                </button>
                <button
                  onClick={() => setThemeMode('parchment')}
                  className={`flex-1 py-1 rounded text-xs border ${themeMode === 'parchment' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  Parchment
                </button>
                <button
                  onClick={() => setThemeMode('charcoal')}
                  className={`flex-1 py-1 rounded text-xs border ${themeMode === 'charcoal' ? 'bg-luxury-gold text-black border-luxury-gold' : 'bg-transparent border-luxury-border text-white'}`}
                >
                  Charcoal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Poem Card */}
      <article className={`p-8 md:p-12 rounded-3xl border transition-colors duration-500 shadow-gold-glow flex flex-col justify-between ${getThemeClass()}`}>
        {/* Header inside article */}
        <div className="border-b border-current/10 pb-6 mb-8 text-center">
          <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">{poem.category}</span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2 tracking-wide leading-tight">{poem.title}</h1>
          <div className="flex justify-center items-center gap-4 text-xs mt-4 opacity-75 font-light">
            <span>{new Date(poem.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{poem.readingTime} min read</span>
          </div>
        </div>

        {/* Content of Poem */}
        <div className={`py-6 select-text max-w-xl mx-auto whitespace-pre-line leading-loose text-center tracking-wide font-light ${fontFamily} ${fontSize}`}>
          {poem.content.replace(/\\n/g, '\n')}
        </div>

        {/* Actions inside article */}
        <div className="border-t border-current/10 pt-6 mt-8 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border rounded-full transition-all duration-300 ${liked ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-transparent border-current/20 hover:border-red-500 hover:text-red-400'}`}
            >
              <Heart size={14} className={liked ? 'fill-red-500 text-red-500' : ''} /> {likeCount}
            </button>
            <button
              onClick={() => setCommentsOpen(!commentsOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-current/20 hover:border-luxury-gold hover:text-luxury-gold rounded-full transition-all duration-300"
            >
              <MessageSquare size={14} /> Comments ({comments.length})
            </button>
          </div>

          <div className="relative">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-current/20 hover:border-luxury-gold hover:text-luxury-gold rounded-full transition-all duration-300"
              title="Copy link to share"
            >
              <Share2 size={14} /> Share
            </button>
            {showShareTooltip && (
              <div className="absolute bottom-11 right-0 bg-luxury-gold text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider animate-bounce">
                Link Copied!
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Views and Reading analytics */}
      <div className="text-right text-xs text-luxury-muted flex items-center gap-4 justify-end px-4">
        <span className="flex items-center gap-1"><Eye size={12} /> {poem.views || 0} views</span>
      </div>

      {/* Comments Panel */}
      {commentsOpen && (
        <section className="glass-panel p-8 rounded-3xl border border-luxury-border space-y-6">
          <h3 className="font-serif text-lg font-bold">Conversations & Echoes ({comments.length})</h3>

          {/* Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Your name"
                required
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="md:col-span-1 px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-lg text-sm text-white placeholder:text-luxury-muted"
              />
              <input
                type="text"
                placeholder="Share your resonance with this poem..."
                required
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="md:col-span-2 px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-lg text-sm text-white placeholder:text-luxury-muted"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-luxury-gold hover:bg-luxury-goldMuted text-black rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              >
                Send Echo <Send size={12} />
              </button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-4 border-t border-luxury-border/60 pt-6 max-h-[400px] overflow-y-auto pr-2">
            {comments.length === 0 ? (
              <p className="text-center text-xs text-luxury-muted italic py-4">No echoes have been left yet. Share your thoughts above.</p>
            ) : (
              comments.map((c, i) => (
                <div key={i} className="bg-black/50 p-4 rounded-xl border border-luxury-border/40 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-serif font-bold text-luxury-gold">{c.name}</span>
                    <span className="text-[10px] text-luxury-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-luxury-muted text-xs leading-relaxed font-light">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default PoemDetail;
