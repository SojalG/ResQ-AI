import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: 'Lucknow, Uttar Pradesh' }
  },
  imageUrl: String,
  aiAnalysis: {
    detected: { type: String, default: 'Citizen report' },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    suggested_action: { type: String, default: 'Keep a safe distance and follow local authority guidance.' }
  },
  contactNumber: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Incident', incidentSchema);

