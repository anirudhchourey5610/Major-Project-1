import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'analyst', 'viewer'], default: 'viewer' },
  settings: {
    alert_threshold_low: { type: Number, default: 10 },
    alert_threshold_medium: { type: Number, default: 5 },
    alert_threshold_high: { type: Number, default: 2 },
    email_notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);