import OpenDiary from '../models/OpenDiary.js';
import { dataService } from '../models/dataService.js';

/**
 * Retrieve all public Open Diary contributions
 */
export const getEntries = async (req, res) => {
  try {
    const entries = await dataService.find(OpenDiary);
    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve open diary reflections.',
      error: error.message
    });
  }
};

/**
 * Submit a new contribution to the Open Diary
 */
export const createEntry = async (req, res) => {
  const { name, content, mood } = req.body;

  try {
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reflection content is required.'
      });
    }

    const newEntry = await dataService.create(OpenDiary, {
      name: name && name.trim() !== '' ? name.trim() : 'Anonymous',
      content: content.trim(),
      mood: mood || 'neutral'
    });

    res.status(201).json({
      success: true,
      data: newEntry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit open diary reflection.',
      error: error.message
    });
  }
};
