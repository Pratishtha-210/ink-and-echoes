import Poem from '../models/Poem.js';
import { dataService } from '../models/dataService.js';

// Calculate reading time roughly: 200 words per minute
const calculateReadingTime = (content) => {
  const words = content ? content.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 150)); // poetry is read slower, ~150 words/min
};

/**
 * Get all poems with optional search, category filter, and sorting
 */
export const getPoems = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let poems = await dataService.find(Poem);

    // Apply category filter
    if (category && category !== 'All') {
      poems = poems.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Apply search filter (title or content)
    if (search) {
      const query = search.toLowerCase();
      poems = poems.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.content.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sort === 'most-viewed') {
      poems.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sort === 'most-loved') {
      poems.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      // Default: latest (newest first)
      poems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({ success: true, count: poems.length, data: poems });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving poems', error: error.message });
  }
};

/**
 * Get single poem by ID and increment view count
 */
export const getPoem = async (req, res) => {
  try {
    const poem = await dataService.findById(Poem, req.params.id);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    // Increment views
    const currentViews = poem.views || 0;
    const updatedPoem = await dataService.findByIdAndUpdate(Poem, req.params.id, {
      views: currentViews + 1
    });

    res.status(200).json({ success: true, data: updatedPoem });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving poem', error: error.message });
  }
};

/**
 * Like a poem
 */
export const likePoem = async (req, res) => {
  try {
    const poem = await dataService.findById(Poem, req.params.id);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    const currentLikes = poem.likes || 0;
    const updatedPoem = await dataService.findByIdAndUpdate(Poem, req.params.id, {
      likes: currentLikes + 1
    });

    res.status(200).json({ success: true, likes: updatedPoem.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error liking poem', error: error.message });
  }
};

/**
 * Add a comment to a poem
 */
export const addComment = async (req, res) => {
  const { name, content } = req.body;

  try {
    if (!name || !content) {
      return res.status(400).json({ message: 'Please provide name and comment content' });
    }

    const poem = await dataService.findById(Poem, req.params.id);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    const comment = {
      name,
      content,
      createdAt: new Date().toISOString()
    };

    const comments = poem.comments || [];
    comments.push(comment);

    const updatedPoem = await dataService.findByIdAndUpdate(Poem, req.params.id, { comments });

    res.status(219).json({ success: true, data: updatedPoem.comments });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// ==================== ADMIN PORTION ====================

/**
 * Create a new poem (Admin only)
 */
export const createPoem = async (req, res) => {
  const { title, category, content, isFeatured, isPinned } = req.body;

  try {
    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Please provide title, category, and content.' });
    }

    const newPoem = await dataService.create(Poem, {
      title,
      category,
      content,
      isFeatured: !!isFeatured,
      isPinned: !!isPinned,
      readingTime: calculateReadingTime(content),
      views: 0,
      likes: 0,
      comments: []
    });

    res.status(219).json({ success: true, data: newPoem });
  } catch (error) {
    res.status(500).json({ message: 'Error creating poem', error: error.message });
  }
};

/**
 * Update a poem (Admin only)
 */
export const updatePoem = async (req, res) => {
  const { title, category, content, isFeatured, isPinned } = req.body;

  try {
    const poem = await dataService.findById(Poem, req.params.id);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (category !== undefined) updateFields.category = category;
    if (content !== undefined) {
      updateFields.content = content;
      updateFields.readingTime = calculateReadingTime(content);
    }
    if (isFeatured !== undefined) updateFields.isFeatured = isFeatured;
    if (isPinned !== undefined) updateFields.isPinned = isPinned;

    const updatedPoem = await dataService.findByIdAndUpdate(Poem, req.params.id, updateFields);

    res.status(200).json({ success: true, data: updatedPoem });
  } catch (error) {
    res.status(500).json({ message: 'Error updating poem', error: error.message });
  }
};

/**
 * Delete a poem (Admin only)
 */
export const deletePoem = async (req, res) => {
  try {
    const poem = await dataService.findByIdAndDelete(Poem, req.params.id);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    res.status(200).json({ success: true, message: 'Poem deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting poem', error: error.message });
  }
};
