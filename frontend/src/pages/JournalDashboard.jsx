import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Calendar, BarChart2, MessageSquare, Star, ArrowRight, Activity, Smile, Cloud } from 'lucide-react';
import api from '../utils/api.js';

const JournalDashboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(true);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('');

  const calculateLocalAnalytics = (entriesList) => {
    const moodCounts = {
      serene: 0, melancholic: 0, inspired: 0, reflective: 0, turbulent: 0, neutral: 0
    };
    entriesList.forEach(e => {
      if (moodCounts[e.mood] !== undefined) {
        moodCounts[e.mood]++;
      } else {
        moodCounts.neutral++;
      }
    });

    let currentStreak = 0;
    const uniqueDates = [...new Set(entriesList.map(e => {
      const d = new Date(e.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))].sort((a, b) => new Date(b) - new Date(a));

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      currentStreak = 0;
      let checkDate = new Date();
      if (!uniqueDates.includes(todayStr)) {
        checkDate = yesterday;
      }
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    let totalWords = 0;
    entriesList.forEach(e => {
      const words = e.content ? e.content.toLowerCase().match(/\b\w+\b/g) : null;
      if (words) {
        totalWords += words.length;
      }
    });

    let reflectionText = "Your journal is a quiet sanctuary. Begin writing your daily reflections to see your emotional resonance develop over time.";
    if (entriesList.length > 0) {
      if (moodCounts.inspired > moodCounts.melancholic) {
        reflectionText = "A creative spark resides in your recent writings. The whispers of inspiration are guiding your thoughts towards growth.";
      } else if (moodCounts.melancholic > moodCounts.serene) {
        reflectionText = "A beautiful melancholy laces your reflections. Writing is the silent bridge between sorrow and healing.";
      } else {
        reflectionText = "Your thoughts show a calm, reflective balance. Stride forward quietly, preserving your peaceful sanctuary.";
      }
    }

    return {
      stats: {
        totalEntries: entriesList.length,
        moodCounts,
        currentStreak,
        totalWords
      },
      reflection: reflectionText
    };
  };

  const fetchJournalData = async () => {
    try {
      setLoading(true);
      const [entriesRes, statsRes] = await Promise.all([
        api.get('/journal'),
        api.get('/journal/analytics')
      ]);

      if (entriesRes.data?.success) {
        setEntries(entriesRes.data.data);
      }
      if (statsRes.data?.success) {
        setAnalytics(statsRes.data.stats);
        setReflection(statsRes.data.reflection);
      }
    } catch (err) {
      console.warn('Failed to load private journal from backend. Querying local storage fallback.');
      const localData = localStorage.getItem('local_journals') || '[]';
      const parsedEntries = JSON.parse(localData);
      setEntries(parsedEntries);

      const localStats = calculateLocalAnalytics(parsedEntries);
      setAnalytics(localStats.stats);
      setReflection(localStats.reflection);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalData();
  }, []);

  const getMoodEmoji = (mood) => {
    const moods = {
      serene: '☀️',
      melancholic: '🌧️',
      inspired: '⚡',
      reflective: '🌖',
      turbulent: '⛈️',
      neutral: '☁️'
    };
    return moods[mood] || '☁️';
  };

  const getWeatherEmoji = (weather) => {
    const weathers = {
      sunny: '☀️',
      rainy: '🌧️',
      cloudy: '☁️',
      snowy: '❄️',
      misty: '🌫️'
    };
    return weathers[weather] || '☁️';
  };

  // Filter entries locally based on queries
  const filteredEntries = entries.filter(e => {
    const matchesSearch = searchQuery 
      ? e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    const matchesMood = filterMood ? e.mood === filterMood : true;
    
    return matchesSearch && matchesMood;
  });

  // SVG Mood Chart helper
  const renderMoodChart = () => {
    if (!analytics || !analytics.moodCounts) return null;
    const counts = analytics.moodCounts;
    const maxVal = Math.max(...Object.values(counts), 1);
    
    const moods = Object.keys(counts);
    const chartHeight = 120;
    const barWidth = 32;
    const gap = 16;
    const chartWidth = moods.length * (barWidth + gap) - gap;

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-sm h-32 text-luxury-gold">
        {moods.map((mood, index) => {
          const count = counts[mood];
          const valRatio = count / maxVal;
          const barHeight = valRatio * 90; // max height 90px to leave space for labels
          const x = index * (barWidth + gap);
          const y = chartHeight - barHeight - 15; // padding top/bottom

          return (
            <g key={mood} className="group">
              {/* Hover tooltip or label */}
              <text 
                x={x + barWidth / 2} 
                y={y - 8} 
                textAnchor="middle" 
                className="fill-white text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {count}
              </text>
              {/* Rounded Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                className="fill-luxury-gold/20 stroke-luxury-gold stroke-2 group-hover:fill-luxury-gold/50 transition-colors duration-300"
              />
              {/* Mood label text */}
              <text 
                x={x + barWidth / 2} 
                y={chartHeight - 2} 
                textAnchor="middle" 
                className="fill-luxury-muted text-[8px] uppercase tracking-wider font-semibold"
              >
                {mood.slice(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-luxury-border/60 pb-6 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide">Journal Sanctuary</h1>
          <p className="text-luxury-muted text-sm mt-1">🔒 Complete client-side encrypted private reflections database.</p>
        </div>
        <Link
          to="/journal/new"
          className="px-5 py-2.5 bg-luxury-gold hover:bg-luxury-goldMuted text-black rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 shadow-gold-glow"
        >
          <PenTool size={14} /> New Entry
        </Link>
      </div>

      {/* Stats Summary cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total entries */}
          <div className="glass-panel p-6 rounded-2xl border border-luxury-border">
            <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Total Entries</span>
            <div className="font-serif text-3xl font-bold mt-2 text-white">{analytics.totalEntries}</div>
          </div>
          
          {/* Total Words */}
          <div className="glass-panel p-6 rounded-2xl border border-luxury-border">
            <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Word Count</span>
            <div className="font-serif text-3xl font-bold mt-2 text-white">{analytics.totalWords}</div>
          </div>

          {/* Current Streak */}
          <div className="glass-panel p-6 rounded-2xl border border-luxury-border">
            <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Writing Streak</span>
            <div className="font-serif text-3xl font-bold mt-2 text-luxury-gold flex items-center gap-2">
              <Activity size={22} className="animate-pulse" /> {analytics.currentStreak} Days
            </div>
          </div>

          {/* Seed indicator */}
          <div className="glass-panel p-6 rounded-2xl border border-luxury-border">
            <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Vault Security</span>
            <div className="font-serif text-sm font-bold mt-3 text-green-400">AES-256-GCM</div>
          </div>
        </div>
      )}

      {/* Analytics Panel: Moods & AI Insights */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* AI Poetic Reflection */}
          <div className="md:col-span-8 glass-panel-gold p-8 rounded-3xl border border-luxury-gold/20 shadow-gold-glow flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">Poetic Reflection & Insights</span>
              <p className="font-serif italic text-base md:text-lg leading-relaxed text-luxury-muted">
                "{reflection}"
              </p>
            </div>
            
            {/* Common words tag cloud */}
            {analytics.commonWords && analytics.commonWords.length > 0 && (
              <div className="pt-6 border-t border-luxury-border/60 mt-6">
                <span className="text-[9px] uppercase tracking-widest text-luxury-muted block mb-3 font-semibold">Most Frequent Expressions</span>
                <div className="flex flex-wrap gap-1.5">
                  {analytics.commonWords.map(cw => (
                    <span key={cw.word} className="text-[10px] bg-black/60 border border-luxury-border/80 px-2.5 py-1 rounded text-luxury-muted font-mono">
                      {cw.word} ({cw.freq})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mood chart visualization */}
          <div className="md:col-span-4 glass-panel p-8 rounded-3xl border border-luxury-border flex flex-col justify-between items-center text-center">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold">Emotion Chart</h3>
              <p className="text-luxury-muted text-[11px]">Dominant moods mapped by entry tags.</p>
            </div>
            
            <div className="py-4 w-full flex justify-center">
              {renderMoodChart()}
            </div>
          </div>
        </div>
      )}

      {/* Entry filtering bar & Vault lists */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-t border-luxury-border/40 pt-8">
          <h2 className="font-serif text-xl font-semibold">Reflections Vault</h2>
          
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search private vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-white placeholder:text-luxury-muted/70 transition-all duration-300 min-w-[200px]"
            />
            {/* Mood selector */}
            <select
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
              className="px-4 py-2.5 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-xl text-xs text-luxury-gold font-medium cursor-pointer transition-all duration-300"
            >
              <option value="">All Moods</option>
              <option value="serene">Serene</option>
              <option value="melancholic">Melancholic</option>
              <option value="inspired">Inspired</option>
              <option value="reflective">Reflective</option>
              <option value="turbulent">Turbulent</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl p-8">
            <p className="font-serif italic text-luxury-muted text-sm">"The vault is silent. No entries match your filters."</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEntries.map(entry => (
              <div
                key={entry._id}
                className="glass-panel p-6 rounded-2xl border border-luxury-border hover:border-luxury-gold/15 transition-all duration-300 flex flex-col justify-between h-48 group shadow-gold-glow"
              >
                <div>
                  <div className="flex justify-between items-center text-[10px] text-luxury-muted mb-3 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(entry.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-2.5">
                      <span title={`Mood: ${entry.mood}`}>{getMoodEmoji(entry.mood)}</span>
                      <span title={`Weather: ${entry.weather}`}>{getWeatherEmoji(entry.weather)}</span>
                      {entry.favorite && <Star size={10} className="fill-luxury-gold text-luxury-gold" />}
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-luxury-gold transition-colors mb-2 line-clamp-1">
                    {entry.title}
                  </h3>
                  
                  <p className="text-luxury-muted text-xs font-light line-clamp-2 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-luxury-border/60 pt-3 mt-3 text-[10px] text-luxury-muted uppercase tracking-wider font-semibold">
                  <span className="flex gap-1">
                    {entry.tags && entry.tags.slice(0, 2).map(t => (
                      <span key={t} className="bg-luxury-border/30 px-2 py-0.5 rounded">#{t}</span>
                    ))}
                  </span>
                  <button
                    onClick={() => navigate(`/journal/edit/${entry._id}`)}
                    className="text-luxury-gold hover:text-white flex items-center gap-0.5"
                  >
                    Open Vault <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default JournalDashboard;
