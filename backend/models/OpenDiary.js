import mongoose from 'mongoose';

const openDiarySchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Anonymous',
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  mood: {
    type: String,
    default: 'neutral'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('OpenDiary', openDiarySchema);
