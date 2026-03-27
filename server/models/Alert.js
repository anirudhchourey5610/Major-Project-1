import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  threat_type: String,
  src_ip: String,
  dest_ip: String,
  packet_count: { type: Number, default: 1 },
  details: String,
  status: { type: String, enum: ['unresolved', 'investigating', 'resolved'], default: 'unresolved' },
  resolved_at: Date,
  resolved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

export const Alert = mongoose.model('Alert', alertSchema);