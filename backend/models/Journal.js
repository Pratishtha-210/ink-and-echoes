import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true // Encrypted hex string
  },
  content: {
    type: String,
    required: true // Encrypted hex string
  },
  iv: {
    type: String,
    required: true // Initialization vector
  },
  authTag: {
    type: String,
    required: true // Authentication tag for AES-256-GCM integrity check
  },
  mood: {
    type: String,
    enum: ['serene', 'melancholic', 'inspired', 'reflective', 'turbulent', 'neutral'],
    default: 'neutral'
  },
  weather: {
    type: String,
    enum: ['sunny', 'rainy', 'cloudy', 'snowy', 'misty'],
    default: 'cloudy'
  },
  tags: {
    type: [String],
    default: []
  },
  favorite: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Journal', journalSchema);
