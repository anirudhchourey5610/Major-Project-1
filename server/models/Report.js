import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: String,
  summary: String,
  total_packets: Number,
  total_alerts: Number,
  severity_breakdown: {
    critical: Number,
    high: Number,
    medium: Number,
    low: Number
  },
  threat_types: Map,
  date_from: Date,
  date_to: Date,
  generated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generated_at: { type: Date, default: Date.now }
});

export const Report = mongoose.model('Report', reportSchema);