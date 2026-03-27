import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  src_ip: String,
  dest_ip: String,
  protocol: String,
  packet_size: Number,
  status: { type: String, enum: ['normal', 'suspicious', 'malicious'] },
  details: Object,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

export const Log = mongoose.model('PacketLog', logSchema);