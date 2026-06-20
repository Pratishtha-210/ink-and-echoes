import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Feather, BookOpen, MessageSquare, ArrowRight, Star } from 'lucide-react';
import api from '../utils/api.js';
import { localPoems } from '../utils/localPoems.js';
import { localEssays } from '../utils/localEssays.js';
import { playPageTurnSound } from '../utils/soundEffects.js';

const Landing = () => {
  const [featuredWorks, setFeaturedWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Typewriter effect variables
  const quote = "Some poems are written with ink. Some are written with scars.";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let active = true;
    let i = 0;
    setDisplayText("");
    const interval = setInterval(() => {
      if (!active) return;
      setDisplayText(quote.substring(0, i + 1));
      i++;
      if (i >= quote.length) clearInterval(interval);
    }, 60);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const [poemsRes, essaysRes] = await Promise.all([
          api.get('/poems'),
          api.get('/essays')
        ]);
        
        const featuredPoems = (poemsRes.data?.data || [])
          .filter(p => p.isFeatured || p.isPinned)
          .map(p => ({ ...p, type: 'poem' }));
          
        const featuredEssays = (essaysRes.data?.data || [])
          .filter(e => e.isFeatured)
          .map(e => ({ ...e, type: 'essay' }));

        if (featuredPoems.length > 0 || featuredEssays.length > 0) {
          setFeaturedWorks([...featuredPoems, ...featuredEssays].slice(0, 3));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('API error loading featured showcase. Utilizing offline files.');
      }

      // Offline client fallback from localStorage
      let poemsList = [];
      const storedP = localStorage.getItem('local_poems');
      if (storedP) {
        try {
          poemsList = JSON.parse(storedP);
        } catch (e) {
          poemsList = [...localPoems];
        }
      } else {
        poemsList = [...localPoems];
      }

      let essaysList = [];
      const storedE = localStorage.getItem('local_essays');
      if (storedE) {
        try {
          essaysList = JSON.parse(storedE);
        } catch (e) {
          essaysList = [...localEssays];
        }
      } else {
        essaysList = [...localEssays];
      }

      const featuredPoems = poemsList
        .filter(p => p.isFeatured || p.isPinned)
        .map(p => ({ ...p, type: 'poem' }));
        
      const featuredEssays = essaysList
        .filter(e => e.isFeatured)
        .map(e => ({ ...e, type: 'essay' }));

      setFeaturedWorks([...featuredPoems, ...featuredEssays].slice(0, 3));
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-24 py-10 relative">
      {/* Hero Section */}
      <section className="min-h-[75vh] flex flex-col justify-center items-center text-center relative px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-xs uppercase tracking-[0.3em] text-luxury-gold mb-6 font-semibold"
        >
          Welcome to the Sanctuary
        </motion.div>

        {/* Animated quote */}
        <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white max-w-4xl leading-tight min-h-[140px] md:min-h-[180px] select-none font-semibold">
          <span className="typewriter-cursor">{displayText}</span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1.5 }}
          className="text-luxury-muted max-w-xl text-base md:text-lg mt-6 font-light font-serif italic"
        >
          Ink & Echoes — A digital museum of classical poetry, long-form thoughts, and personal reflections by Pratishtha Sharma.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          <Link
            to="/library"
            onClick={playPageTurnSound}
            className="px-8 py-4 border border-luxury-gold bg-luxury-gold/5 text-luxury-gold hover:bg-luxury-gold hover:text-black rounded-full font-semibold uppercase tracking-wider text-xs flex items-center gap-2 transition-all duration-300 shadow-gold-glow cursor-pointer"
          >
            <Feather size={14} /> Read Poems
          </Link>
          <Link
            to="/thoughts"
            onClick={playPageTurnSound}
            className="px-8 py-4 border border-luxury-border bg-luxury-card hover:border-white rounded-full font-semibold uppercase tracking-wider text-xs flex items-center gap-2 transition-all duration-300 cursor-pointer"
          >
            <BookOpen size={14} /> Explore Thoughts
          </Link>
          <Link
            to="/contact"
            onClick={playPageTurnSound}
            className="px-8 py-4 border border-transparent text-luxury-muted hover:text-white rounded-full font-semibold uppercase tracking-wider text-xs flex items-center gap-2 transition-all duration-300 cursor-pointer"
          >
            <MessageSquare size={14} /> Contact Me
          </Link>
        </motion.div>
      </section>

      {/* Showcase Grid */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-luxury-border/60 pb-6 gap-4">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-wide">The Writer's Showcase</h2>
            <p className="text-luxury-muted text-sm mt-1">A curated collection of pinned works, emotional logs, and thoughts.</p>
          </div>
          <Link 
            to="/library" 
            className="text-xs uppercase tracking-widest text-luxury-gold hover:text-white flex items-center gap-1.5 transition-colors font-medium"
          >
            View Full Library <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-luxury-card/50 border border-luxury-border/40 animate-pulse"></div>
            ))}
          </div>
        ) : featuredWorks.length === 0 ? (
          <div className="text-center py-16 text-luxury-muted glass-panel rounded-2xl p-10">
            <p className="font-serif italic">No featured works seeded yet. Enter the admin portal to pin your first creations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredWorks.map((work) => (
              <motion.div
                key={work._id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="glass-panel-gold p-8 rounded-2xl flex flex-col justify-between h-80 relative overflow-hidden group shadow-gold-glow"
              >
                {/* Accent glow on card hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none group-hover:bg-luxury-gold/15 transition-all duration-300"></div>

                <div>
                  <div className="flex justify-between items-center text-xs uppercase tracking-widest text-luxury-gold mb-4">
                    <span>{work.type === 'poem' ? work.category : 'Essay'}</span>
                    {(work.isPinned || work.type === 'essay') && (
                      <Star size={12} className="fill-luxury-gold text-luxury-gold" />
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-semibold mb-3 group-hover:text-luxury-gold transition-colors line-clamp-2">
                    {work.title}
                  </h3>

                  <p className="text-luxury-muted font-light text-sm line-clamp-4 font-poetry whitespace-pre-line">
                    {work.content.replace(/\\n/g, '\n')}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-luxury-muted border-t border-luxury-border/60 pt-4">
                  <span>{new Date(work.createdAt).toLocaleDateString()}</span>
                  <Link
                    to={work.type === 'poem' ? `/library/${work._id}` : `/thoughts/${work._id}`}
                    className="text-luxury-gold hover:text-white uppercase tracking-wider font-semibold flex items-center gap-1"
                  >
                    Read More <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Landing;
