import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  recommendations: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Alert', alertSchema);

