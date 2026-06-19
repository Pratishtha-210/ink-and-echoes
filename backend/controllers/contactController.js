import Contact from '../models/Contact.js';
import { dataService } from '../models/dataService.js';

/**
 * Public endpoint to submit a contact message
 */
export const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please provide name, email, and message.' });
    }

    const newMessage = await dataService.create(Contact, {
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
      isRead: false
    });

    // Note: Email notifications can be integrated here (e.g. nodemailer)
    console.log(`✉️ New contact message received from ${name} (${email}): "${subject}"`);

    res.status(219).json({ success: true, data: newMessage, message: 'Message sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting contact message', error: error.message });
  }
};

/**
 * Get all contact messages (Admin only)
 */
export const getMessages = async (req, res) => {
  try {
    const messages = await dataService.find(Contact);
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact messages', error: error.message });
  }
};

/**
 * Toggle read status of a message (Admin only)
 */
export const toggleReadStatus = async (req, res) => {
  try {
    const msg = await dataService.findById(Contact, req.params.id);
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const updatedMsg = await dataService.findByIdAndUpdate(Contact, req.params.id, {
      isRead: !msg.isRead
    });

    res.status(200).json({ success: true, data: updatedMsg });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling read status', error: error.message });
  }
};

/**
 * Delete a contact message (Admin only)
 */
export const deleteMessage = async (req, res) => {
  try {
    const msg = await dataService.findByIdAndDelete(Contact, req.params.id);
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};
