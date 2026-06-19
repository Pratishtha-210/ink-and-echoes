import Essay from '../models/Essay.js';
import { dataService } from '../models/dataService.js';

// Calculate reading time roughly: 220 words per minute for essay prose
const calculateReadingTime = (content) => {
  const words = content ? content.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 220));
};

/**
 * Get all essays with optional search and tag filters
 */
export const getEssays = async (req, res) => {
  try {
    const { tag, search } = req.query;
    let essays = await dataService.find(Essay);

    // Filter by tag
    if (tag) {
      essays = essays.filter(e => e.tags && e.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    // Filter by search query (title or content)
    if (search) {
      const query = search.toLowerCase();
      essays = essays.filter(e => 
        e.title.toLowerCase().includes(query) || 
        e.content.toLowerCase().includes(query)
      );
    }

    res.status(200).json({ success: true, count: essays.length, data: essays });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving essays', error: error.message });
  }
};

/**
 * Get single essay by ID and increment view count
 */
export const getEssay = async (req, res) => {
  try {
    const essay = await dataService.findById(Essay, req.params.id);
    if (!essay) {
      return res.status(404).json({ message: 'Essay not found' });
    }

    // Increment views
    const currentViews = essay.views || 0;
    const updatedEssay = await dataService.findByIdAndUpdate(Essay, req.params.id, {
      views: currentViews + 1
    });

    res.status(200).json({ success: true, data: updatedEssay });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving essay', error: error.message });
  }
};

// ==================== ADMIN PORTION ====================

/**
 * Create a new essay (Admin only)
 */
export const createEssay = async (req, res) => {
  const { title, content, tags, isFeatured } = req.body;

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content.' });
    }

    const processedTags = Array.isArray(tags) 
      ? tags.map(t => t.trim()) 
      : tags ? tags.split(',').map(t => t.trim()) : [];

    const newEssay = await dataService.create(Essay, {
      title,
      content,
      tags: processedTags,
      isFeatured: !!isFeatured,
      readingTime: calculateReadingTime(content),
      views: 0
    });

    res.status(219).json({ success: true, data: newEssay });
  } catch (error) {
    res.status(500).json({ message: 'Error creating essay', error: error.message });
  }
};

/**
 * Update an essay (Admin only)
 */
export const updateEssay = async (req, res) => {
  const { title, content, tags, isFeatured } = req.body;

  try {
    const essay = await dataService.findById(Essay, req.params.id);
    if (!essay) {
      return res.status(404).json({ message: 'Essay not found' });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) {
      updateFields.content = content;
      updateFields.readingTime = calculateReadingTime(content);
    }
    if (tags !== undefined) {
      updateFields.tags = Array.isArray(tags) 
        ? tags.map(t => t.trim()) 
        : tags.split(',').map(t => t.trim());
    }
    if (isFeatured !== undefined) updateFields.isFeatured = isFeatured;

    const updatedEssay = await dataService.findByIdAndUpdate(Essay, req.params.id, updateFields);

    res.status(200).json({ success: true, data: updatedEssay });
  } catch (error) {
    res.status(500).json({ message: 'Error updating essay', error: error.message });
  }
};

/**
 * Delete an essay (Admin only)
 */
export const deleteEssay = async (req, res) => {
  try {
    const essay = await dataService.findByIdAndDelete(Essay, req.params.id);
    if (!essay) {
      return res.status(404).json({ message: 'Essay not found' });
    }

    res.status(200).json({ success: true, message: 'Essay deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting essay', error: error.message });
  }
};
