import Journal from '../models/Journal.js';
import { dataService } from '../models/dataService.js';
import { encrypt, decrypt } from '../utils/crypto.js';

/**
 * Encrypt journal fields helper
 */
const encryptEntry = (title, content) => {
  const encTitle = encrypt(title);
  const encContent = encrypt(content);
  
  // To keep schema simple and secure, we'll store single iv & authTag.
  // Wait, if we encrypt title and content separately, they produce different IVs and tags.
  // Let's encrypt them as a single JSON payload!
  // This is a master stroke! We encrypt a stringified object { title, content } as a single cryptogram.
  // That way we only have one ciphertext, one IV, and one authentication tag, completely securing the record.
  const payload = JSON.stringify({ title, content });
  return encrypt(payload);
};

/**
 * Decrypt journal fields helper
 */
const decryptEntry = (encryptedData, iv, authTag) => {
  try {
    const decryptedPayload = decrypt(encryptedData, iv, authTag);
    return JSON.parse(decryptedPayload);
  } catch (error) {
    console.error('Decryption failed for entry:', error.message);
    return { title: '[Decryption Error]', content: 'Failed to decrypt journal entry.' };
  }
};

/**
 * Get all decrypted journal entries (Admin/Private only)
 */
export const getEntries = async (req, res) => {
  try {
    const { search, mood, favorite } = req.query;
    const entries = await dataService.find(Journal);

    // Decrypt all entries first
    const decryptedEntries = entries.map(entry => {
      const decrypted = decryptEntry(entry.content, entry.iv, entry.authTag);
      return {
        _id: entry._id || entry.id,
        title: decrypted.title,
        content: decrypted.content,
        mood: entry.mood,
        weather: entry.weather,
        tags: entry.tags,
        favorite: entry.favorite,
        isArchived: entry.isArchived,
        createdAt: entry.createdAt
      };
    });

    let filtered = decryptedEntries;

    // Filter by mood
    if (mood) {
      filtered = filtered.filter(e => e.mood === mood);
    }

    // Filter by favorite
    if (favorite === 'true') {
      filtered = filtered.filter(e => e.favorite === true);
    }

    // Search filter (searches decrypted titles and contents)
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) || 
        e.content.toLowerCase().includes(query) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving journal entries', error: error.message });
  }
};

/**
 * Get single decrypted journal entry by ID (Admin/Private only)
 */
export const getEntry = async (req, res) => {
  try {
    const entry = await dataService.findById(Journal, req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    const decrypted = decryptEntry(entry.content, entry.iv, entry.authTag);

    res.status(200).json({
      success: true,
      data: {
        _id: entry._id || entry.id,
        title: decrypted.title,
        content: decrypted.content,
        mood: entry.mood,
        weather: entry.weather,
        tags: entry.tags,
        favorite: entry.favorite,
        isArchived: entry.isArchived,
        createdAt: entry.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving journal entry', error: error.message });
  }
};

/**
 * Create a new encrypted journal entry (Admin/Private only)
 */
export const createEntry = async (req, res) => {
  const { title, content, mood, weather, tags, favorite } = req.body;

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content.' });
    }

    // Encrypt combined payload { title, content }
    const cryptoResult = encryptEntry(title, content);

    const processedTags = Array.isArray(tags) 
      ? tags.map(t => t.trim()) 
      : tags ? tags.split(',').map(t => t.trim()) : [];

    const newEntry = await dataService.create(Journal, {
      title: cryptoResult.encryptedData, // Maintain legacy schema compatibility, store cipher in title too
      content: cryptoResult.encryptedData,
      iv: cryptoResult.iv,
      authTag: cryptoResult.authTag,
      mood: mood || 'neutral',
      weather: weather || 'cloudy',
      tags: processedTags,
      favorite: !!favorite,
      isArchived: false
    });

    res.status(219).json({
      success: true,
      data: {
        _id: newEntry._id || newEntry.id,
        title,
        content,
        mood: newEntry.mood,
        weather: newEntry.weather,
        tags: newEntry.tags,
        favorite: newEntry.favorite,
        createdAt: newEntry.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating journal entry', error: error.message });
  }
};

/**
 * Update an encrypted journal entry (Admin/Private only)
 */
export const updateEntry = async (req, res) => {
  const { title, content, mood, weather, tags, favorite, isArchived } = req.body;

  try {
    const entry = await dataService.findById(Journal, req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Decrypt old entry to preserve field defaults
    const oldDecrypted = decryptEntry(entry.content, entry.iv, entry.authTag);
    const updatedTitle = title !== undefined ? title : oldDecrypted.title;
    const updatedContent = content !== undefined ? content : oldDecrypted.content;

    // Encrypt updated combined payload
    const cryptoResult = encryptEntry(updatedTitle, updatedContent);

    const updateFields = {
      title: cryptoResult.encryptedData,
      content: cryptoResult.encryptedData,
      iv: cryptoResult.iv,
      authTag: cryptoResult.authTag
    };

    if (mood !== undefined) updateFields.mood = mood;
    if (weather !== undefined) updateFields.weather = weather;
    if (favorite !== undefined) updateFields.favorite = favorite;
    if (isArchived !== undefined) updateFields.isArchived = isArchived;
    if (tags !== undefined) {
      updateFields.tags = Array.isArray(tags) 
        ? tags.map(t => t.trim()) 
        : tags.split(',').map(t => t.trim());
    }

    const updatedEntry = await dataService.findByIdAndUpdate(Journal, req.params.id, updateFields);

    res.status(200).json({
      success: true,
      data: {
        _id: updatedEntry._id || updatedEntry.id,
        title: updatedTitle,
        content: updatedContent,
        mood: updatedEntry.mood,
        weather: updatedEntry.weather,
        tags: updatedEntry.tags,
        favorite: updatedEntry.favorite,
        isArchived: updatedEntry.isArchived,
        createdAt: updatedEntry.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating journal entry', error: error.message });
  }
};

/**
 * Delete a journal entry (Admin/Private only)
 */
export const deleteEntry = async (req, res) => {
  try {
    const entry = await dataService.findByIdAndDelete(Journal, req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    res.status(200).json({ success: true, message: 'Journal entry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting journal entry', error: error.message });
  }
};

/**
 * Calculate journal analytics and AI-style reflections (Admin/Private only)
 */
export const getAnalytics = async (req, res) => {
  try {
    const entries = await dataService.find(Journal);
    const count = entries.length;

    // Decrypt entries for word frequency and details
    const decryptedEntries = entries.map(entry => {
      const dec = decryptEntry(entry.content, entry.iv, entry.authTag);
      return {
        ...entry,
        title: dec.title,
        content: dec.content,
        dateStr: new Date(entry.createdAt).toDateString(),
        dateRaw: new Date(entry.createdAt)
      };
    });

    // 1. Calculate mood counts
    const moodCounts = {
      serene: 0,
      melancholic: 0,
      inspired: 0,
      reflective: 0,
      turbulent: 0,
      neutral: 0
    };
    decryptedEntries.forEach(e => {
      if (moodCounts[e.mood] !== undefined) {
        moodCounts[e.mood]++;
      } else {
        moodCounts.neutral++;
      }
    });

    // 2. Calculate writing streak
    let currentStreak = 0;
    const uniqueDates = [...new Set(decryptedEntries.map(e => {
      const d = new Date(e.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))].sort((a, b) => new Date(b) - new Date(a)); // Sort descending

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Verify if logged today or yesterday to continue streak
    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      currentStreak = 0;
      let checkDate = new Date();
      
      // If today is not logged, start checking from yesterday
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

    // 3. Word counts and insights
    let totalWords = 0;
    const wordFreq = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'but', 'or', 'to', 'for', 'in', 'at', 'on', 'with', 'by', 'of', 'i', 'my', 'me', 'we', 'you', 'he', 'she', 'they', 'it', 'is', 'was', 'were', 'am', 'are', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'that', 'this', 'there', 'here', 'when', 'how', 'why', 'where', 'so', 'up', 'down', 'out', 'about', 'just', 'more', 'some', 'can', 'will', 'would', 'could', 'should', 'very', 'than']);

    decryptedEntries.forEach(e => {
      const words = e.content ? e.content.toLowerCase().match(/\b\w+\b/g) : null;
      if (words) {
        totalWords += words.length;
        words.forEach(w => {
          if (!stopWords.has(w) && w.length > 2) {
            wordFreq[w] = (wordFreq[w] || 0) + 1;
          }
        });
      }
    });

    const commonWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, freq]) => ({ word, freq }));

    // 4. Generate Poetic AI-style reflections
    let reflection = "Your pages lie silent. Begin writing to receive creative and emotional echoes from your journal.";
    if (count > 0) {
      const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
      
      const moodReflections = {
        serene: "Lately, a quiet peace blankets your mind. You are finding anchors in simplicity, reflecting a soul gently returning to calm waters.",
        melancholic: "The ink flows heavy with longing and nostalgia. Your words are seeking comfort in shadows—remember that shadows exist only because there is light nearby.",
        inspired: "A surge of creative energy courses through your lines. You are looking at the world with open eyes, capturing fragments of beauty in every passing moment.",
        reflective: "You are standing on the precipice of deep self-inquiry. Your journal entries behave as a mirror, asking important questions and gathering wisdom from memory.",
        turbulent: "Your writings echo with storms and currents of unrest. Writing these thoughts down is your first step to releasing their hold over you. Let the storm break on the page.",
        neutral: "You are documenting life as it flows—evenly, steadily. These quiet intermediate pages are the fertile soil from which deep thoughts will soon sprout."
      };
      
      const themeInsights = decryptedEntries.some(e => e.content.toLowerCase().includes('scars') || e.content.toLowerCase().includes('pain') || e.content.toLowerCase().includes('cry'))
        ? " There is a tender theme of healing and scar-tending in your recent records. You are writing through the weight."
        : " There is a strong focus on observing external scenery and daily rituals, creating a beautiful archive of the present.";

      reflection = `${moodReflections[dominantMood]} With ${count} entries logged and a streak of ${currentStreak} days, your journal reads like a sanctuary.${themeInsights}`;
    }

    res.status(200).json({
      success: true,
      stats: {
        totalEntries: count,
        totalWords,
        currentStreak,
        moodCounts,
        commonWords
      },
      reflection
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating journal analytics', error: error.message });
  }
};
