import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  title: { type: String, default: 'New conversation' },
  messages: [{ role: String, content: String, timestamp: { type: Date, default: Date.now } }],
  lang: { type: String, enum: ['en', 'hi'], default: 'en' }
}, { timestamps: true });

export default mongoose.model('ChatSession', chatSessionSchema);

