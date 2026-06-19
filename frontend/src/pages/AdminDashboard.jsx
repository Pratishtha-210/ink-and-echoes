import React, { useState, useEffect } from 'react';
import { BookOpen, Feather, Mail, LayoutDashboard, Plus, Trash2, Eye, Heart, Check, Archive, X, PenTool } from 'lucide-react';
import api from '../utils/api.js';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, poems, essays, messages
  const [poems, setPoems] = useState([]);
  const [essays, setEssays] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Creation/Edit forms states
  const [showPoemForm, setShowPoemForm] = useState(false);
  const [editingPoem, setEditingPoem] = useState(null);
  const [poemData, setPoemData] = useState({
    title: '', category: 'Life', content: '', isFeatured: false, isPinned: false
  });

  const [showEssayForm, setShowEssayForm] = useState(false);
  const [editingEssay, setEditingEssay] = useState(null);
  const [essayData, setEssayData] = useState({
    title: '', content: '', tags: '', isFeatured: false
  });

  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState({ success: null, error: null });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [poemsRes, essaysRes, messagesRes] = await Promise.all([
        api.get('/poems'),
        api.get('/essays'),
        api.get('/contact')
      ]);

      if (poemsRes.data?.success) setPoems(poemsRes.data.data);
      if (essaysRes.data?.success) setEssays(essaysRes.data.data);
      if (messagesRes.data?.success) setMessages(messagesRes.data.data);
    } catch (err) {
      setActionStatus({ success: null, error: 'Failed to retrieve administrative records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerStatus = (type, message) => {
    setActionStatus({ [type]: message });
    setTimeout(() => setActionStatus({ success: null, error: null }), 3000);
  };

  // ================= POEMS CRUD =================

  const handlePoemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPoem) {
        await api.put(`/poems/${editingPoem._id}`, poemData);
        triggerStatus('success', 'Poem updated successfully.');
      } else {
        await api.post('/poems', poemData);
        triggerStatus('success', 'New poem cataloged successfully.');
      }
      setPoemData({ title: '', category: 'Life', content: '', isFeatured: false, isPinned: false });
      setShowPoemForm(false);
      setEditingPoem(null);
      fetchData();
    } catch (err) {
      triggerStatus('error', 'Poem write operation failed.');
    }
  };

  const handleEditPoemClick = (poem) => {
    setEditingPoem(poem);
    setPoemData({
      title: poem.title,
      category: poem.category,
      content: poem.content,
      isFeatured: poem.isFeatured,
      isPinned: poem.isPinned
    });
    setShowPoemForm(true);
  };

  const handleDeletePoem = async (poemId) => {
    if (!window.confirm('Purge this poem from database?')) return;
    try {
      await api.delete(`/poems/${poemId}`);
      triggerStatus('success', 'Poem purged.');
      fetchData();
    } catch (err) {
      triggerStatus('error', 'Purge failed.');
    }
  };

  // ================= ESSAYS CRUD =================

  const handleEssaySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEssay) {
        await api.put(`/essays/${editingEssay._id}`, essayData);
        triggerStatus('success', 'Essay updated successfully.');
      } else {
        await api.post('/essays', essayData);
        triggerStatus('success', 'New essay published successfully.');
      }
      setEssayData({ title: '', content: '', tags: '', isFeatured: false });
      setShowEssayForm(false);
      setEditingEssay(null);
      fetchData();
    } catch (err) {
      triggerStatus('error', 'Essay write operation failed.');
    }
  };

  const handleEditEssayClick = (essay) => {
    setEditingEssay(essay);
    setEssayData({
      title: essay.title,
      content: essay.content,
      tags: essay.tags ? essay.tags.join(', ') : '',
      isFeatured: essay.isFeatured
    });
    setShowEssayForm(true);
  };

  const handleDeleteEssay = async (essayId) => {
    if (!window.confirm('Purge this essay draft?')) return;
    try {
      await api.delete(`/essays/${essayId}`);
      triggerStatus('success', 'Essay purged.');
      fetchData();
    } catch (err) {
      triggerStatus('error', 'Purge failed.');
    }
  };

  // ================= MESSAGES INBOX =================

  const handleToggleMessageRead = async (msgId) => {
    try {
      await api.patch(`/contact/${msgId}/read`);
      fetchData();
    } catch (err) {
      triggerStatus('error', 'Update failed.');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Purge this message?')) return;
    try {
      await api.delete(`/contact/${msgId}`);
      triggerStatus('success', 'Message cleared.');
      fetchData();
    } catch (err) {
      triggerStatus('error', 'Purge failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate quick sums
  const totalViews = poems.reduce((acc, p) => acc + (p.views || 0), 0) + essays.reduce((acc, e) => acc + (e.views || 0), 0);
  const totalLikes = poems.reduce((acc, p) => acc + (p.likes || 0), 0);
  const unreadMsgs = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      
      {/* Title */}
      <div className="border-b border-luxury-border/60 pb-6 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide">Admin Control Center</h1>
          <p className="text-luxury-muted text-sm mt-1">Manage public articles, catalog poems, and check correspondence.</p>
        </div>
      </div>

      {actionStatus.success && (
        <div className="p-4 border border-green-950/40 bg-green-950/15 text-green-400 text-xs rounded-xl font-medium">
          {actionStatus.success}
        </div>
      )}
      {actionStatus.error && (
        <div className="p-4 border border-red-950/40 bg-red-950/15 text-red-400 text-xs rounded-xl font-medium">
          {actionStatus.error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-luxury-border/60">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${activeTab === 'overview' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-luxury-muted hover:text-white'}`}
        >
          <LayoutDashboard size={14} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('poems')}
          className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${activeTab === 'poems' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-luxury-muted hover:text-white'}`}
        >
          <Feather size={14} /> Manage Poems
        </button>
        <button
          onClick={() => setActiveTab('essays')}
          className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${activeTab === 'essays' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-luxury-muted hover:text-white'}`}
        >
          <BookOpen size={14} /> Manage Essays
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${activeTab === 'messages' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-luxury-muted hover:text-white'}`}
        >
          <Mail size={14} /> Inbox {unreadMsgs > 0 && <span className="bg-luxury-gold text-black text-[9px] px-1.5 py-0.5 rounded-full ml-1 font-bold">{unreadMsgs}</span>}
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-luxury-border">
              <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Cumulative Reads</span>
              <div className="font-serif text-3xl font-bold mt-2 text-white flex items-center gap-2"><Eye size={22} className="text-luxury-gold" /> {totalViews}</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-luxury-border">
              <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Poetry Hearts</span>
              <div className="font-serif text-3xl font-bold mt-2 text-white flex items-center gap-2"><Heart size={22} className="text-red-500" /> {totalLikes}</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-luxury-border">
              <span className="text-[10px] uppercase tracking-widest text-luxury-muted block">Pending Messages</span>
              <div className="font-serif text-3xl font-bold mt-2 text-white flex items-center gap-2"><Mail size={22} className="text-blue-400" /> {unreadMsgs}</div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-luxury-border space-y-4">
            <h3 className="font-serif text-lg font-bold">Admin Checklist</h3>
            <p className="text-luxury-muted text-xs font-light">Quick navigation pathways to construct your sanctuary.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold pt-4">
              <button onClick={() => setActiveTab('poems')} className="flex items-center justify-between p-4 bg-black/60 rounded-xl border border-luxury-border hover:border-luxury-gold/30 transition-all duration-300">
                <span>📚 Catalog and Feature new Poems ({poems.length} live)</span>
                <Plus size={14} className="text-luxury-gold" />
              </button>
              <button onClick={() => setActiveTab('essays')} className="flex items-center justify-between p-4 bg-black/60 rounded-xl border border-luxury-border hover:border-luxury-gold/30 transition-all duration-300">
                <span>✍️ Compile thoughts and essays ({essays.length} live)</span>
                <Plus size={14} className="text-luxury-gold" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poems tab */}
      {activeTab === 'poems' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold">Poems Catalogue ({poems.length})</h3>
            <button
              onClick={() => {
                setEditingPoem(null);
                setPoemData({ title: '', category: 'Life', content: '', isFeatured: false, isPinned: false });
                setShowPoemForm(!showPoemForm);
              }}
              className="px-4 py-2 bg-luxury-gold hover:bg-luxury-goldMuted text-black rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5"
            >
              <Plus size={14} /> {showPoemForm ? 'Close Drawer' : 'Create Poem'}
            </button>
          </div>

          {/* Collapsible Form */}
          {showPoemForm && (
            <form onSubmit={handlePoemSubmit} className="glass-panel p-6 rounded-2xl border border-luxury-gold/15 space-y-4 shadow-gold-glow animate-fadeIn">
              <h4 className="text-xs uppercase tracking-widest text-luxury-gold font-bold">{editingPoem ? 'Edit Verse' : 'Catalog New Poem'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title of Poem"
                  required
                  value={poemData.title}
                  onChange={(e) => setPoemData({ ...poemData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-lg text-xs text-white"
                />
                <select
                  value={poemData.category}
                  onChange={(e) => setPoemData({ ...poemData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-lg text-xs text-luxury-gold"
                >
                  <option value="Love">Love</option>
                  <option value="Heartbreak">Heartbreak</option>
                  <option value="Life">Life</option>
                  <option value="Nature">Nature</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Dreams">Dreams</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <textarea
                placeholder="Write your poem content. Use newlines to separate verses..."
                required
                rows={10}
                value={poemData.content}
                onChange={(e) => setPoemData({ ...poemData, content: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-lg text-xs text-luxury-muted leading-relaxed font-poetry resize-none"
              />

              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={poemData.isFeatured}
                    onChange={(e) => setPoemData({ ...poemData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-luxury-border bg-black text-luxury-gold focus:ring-0 accent-luxury-gold"
                  />
                  <span>Featured on Showcase</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={poemData.isPinned}
                    onChange={(e) => setPoemData({ ...poemData, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded border-luxury-border bg-black text-luxury-gold focus:ring-0 accent-luxury-gold"
                  />
                  <span>Pin to Top</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPoemForm(false)}
                  className="px-4 py-2 bg-transparent border border-luxury-border text-white rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-luxury-gold text-black rounded-lg text-xs uppercase tracking-wider font-semibold shadow-gold-glow"
                >
                  {editingPoem ? 'Update' : 'Catalog'}
                </button>
              </div>
            </form>
          )}

          {/* List of Poems */}
          <div className="space-y-4">
            {poems.map(poem => (
              <div key={poem._id} className="glass-panel p-5 rounded-xl border border-luxury-border flex justify-between items-center gap-4 text-xs">
                <div>
                  <h4 className="font-serif text-base font-bold text-white mb-1">{poem.title}</h4>
                  <p className="text-luxury-muted font-light uppercase tracking-wider text-[10px]">
                    Category: <span className="text-luxury-gold">{poem.category}</span> | Pinned: {poem.isPinned ? 'Yes' : 'No'} | Featured: {poem.isFeatured ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPoemClick(poem)}
                    className="px-3 py-1.5 border border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/5 text-luxury-gold rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePoem(poem._id)}
                    className="px-3 py-1.5 border border-red-900/30 hover:border-red-500 hover:bg-red-500/5 text-red-400 rounded"
                  >
                    Purge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essays tab */}
      {activeTab === 'essays' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold">Essays Archive ({essays.length})</h3>
            <button
              onClick={() => {
                setEditingEssay(null);
                setEssayData({ title: '', content: '', tags: '', isFeatured: false });
                setShowEssayForm(!showEssayForm);
              }}
              className="px-4 py-2 bg-luxury-gold hover:bg-luxury-goldMuted text-black rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5"
            >
              <Plus size={14} /> {showEssayForm ? 'Close Drawer' : 'Create Essay'}
            </button>
          </div>

          {/* Essay Form */}
          {showEssayForm && (
            <form onSubmit={handleEssaySubmit} className="glass-panel p-6 rounded-2xl border border-luxury-gold/15 space-y-4 shadow-gold-glow animate-fadeIn">
              <h4 className="text-xs uppercase tracking-widest text-luxury-gold font-bold">{editingEssay ? 'Edit Essay' : 'Write New Essay'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title of Essay"
                  required
                  value={essayData.title}
                  onChange={(e) => setEssayData({ ...essayData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated e.g. solitude, philosophy)"
                  value={essayData.tags}
                  onChange={(e) => setEssayData({ ...essayData, tags: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-lg text-xs text-white"
                />
              </div>

              <textarea
                placeholder="Compose essay text content..."
                required
                rows={12}
                value={essayData.content}
                onChange={(e) => setEssayData({ ...essayData, content: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-luxury-border focus:border-luxury-gold focus:outline-none rounded-lg text-xs text-luxury-muted leading-relaxed resize-none"
              />

              <div className="flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={essayData.isFeatured}
                    onChange={(e) => setEssayData({ ...essayData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-luxury-border bg-black text-luxury-gold focus:ring-0 accent-luxury-gold"
                  />
                  <span>Featured on Showcase</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEssayForm(false)}
                  className="px-4 py-2 bg-transparent border border-luxury-border text-white rounded-lg text-xs uppercase tracking-wider font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-luxury-gold text-black rounded-lg text-xs uppercase tracking-wider font-semibold shadow-gold-glow"
                >
                  {editingEssay ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          )}

          {/* List of Essays */}
          <div className="space-y-4">
            {essays.map(essay => (
              <div key={essay._id} className="glass-panel p-5 rounded-xl border border-luxury-border flex justify-between items-center gap-4 text-xs">
                <div>
                  <h4 className="font-serif text-base font-bold text-white mb-1">{essay.title}</h4>
                  <p className="text-luxury-muted font-light uppercase tracking-wider text-[10px]">
                    Tags: <span className="text-luxury-gold">{essay.tags ? essay.tags.join(', ') : 'None'}</span> | Featured: {essay.isFeatured ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEssayClick(essay)}
                    className="px-3 py-1.5 border border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/5 text-luxury-gold rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEssay(essay._id)}
                    className="px-3 py-1.5 border border-red-900/30 hover:border-red-500 hover:bg-red-500/5 text-red-400 rounded"
                  >
                    Purge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Inbox tab */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <h3 className="font-serif text-lg font-bold">Correspondence Inbox ({messages.length})</h3>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-luxury-muted italic">"The inbox is silent. No messages received."</div>
            ) : (
              messages.map(msg => (
                <div key={msg._id} className={`glass-panel p-6 rounded-2xl border transition-colors duration-300 relative ${msg.isRead ? 'border-luxury-border bg-luxury-card/30' : 'border-luxury-gold/25 bg-luxury-card/85 shadow-gold-glow'}`}>
                  {/* Unread dot */}
                  {!msg.isRead && (
                    <div className="absolute top-6 left-3 w-1.5 h-1.5 rounded-full bg-luxury-gold animate-ping"></div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-luxury-border/60 pb-3 mb-3 text-xs">
                    <div>
                      <span className="font-serif font-bold text-white text-sm">{msg.name}</span>
                      <span className="text-luxury-muted ml-2">&lt;{msg.email}&gt;</span>
                    </div>
                    <span className="text-luxury-muted font-light">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-luxury-gold uppercase tracking-wider">Subject: "{msg.subject}"</div>
                    <p className="text-luxury-muted text-xs leading-relaxed font-light whitespace-pre-wrap">{msg.message}</p>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-luxury-border/60 text-[10px] uppercase font-semibold">
                    <button
                      onClick={() => handleToggleMessageRead(msg._id)}
                      className={`px-3 py-1.5 border rounded flex items-center gap-1.5 ${msg.isRead ? 'border-luxury-border hover:border-luxury-gold/50 text-luxury-muted hover:text-white' : 'border-luxury-gold/40 text-luxury-gold hover:text-white'}`}
                    >
                      {msg.isRead ? <Archive size={10} /> : <Check size={10} />}
                      {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="px-3 py-1.5 border border-red-900/30 hover:border-red-500 hover:bg-red-500/5 text-red-400 rounded flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Purge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
