import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import { User } from './models/User.js';
import { Log } from './models/Log.js';
import { Alert } from './models/Alert.js';
import { Report } from './models/Report.js';

dotenv.config({ path: '../.env' });

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/netshield';
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// --- AUTH ROUTES ---
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role });
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY);
    res.status(201).json({ user: { id: user._id, ...user.toObject() }, token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email is already registered. Please sign in instead.' });
    }
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY);
    res.json({ user: { id: user._id, ...user.toObject() }, token });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Login failed' });
  }
});

app.get('/auth/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ ...user.toObject(), id: user._id });
});

// --- INGESTION ROUTES (For Python Script) ---
// Note: These are unprotected for simplicity in this demo, 
// but you should secure them with a static API key in production.

app.post('/api/logs', async (req, res) => {
  try {
    const log = await Log.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alerts', async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DASHBOARD READ ROUTES ---
app.get('/api/logs', authenticate, async (req, res) => {
  const logs = await Log.find().sort({ timestamp: -1 }).limit(1000);
  res.json(logs);
});

app.get('/api/alerts', authenticate, async (req, res) => {
  const alerts = await Alert.find().sort({ timestamp: -1 });
  res.json(alerts);
});

app.patch('/api/alerts/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  const update = { status };
  if (status === 'resolved') {
    update.resolved_at = new Date();
    update.resolved_by = req.user.id;
  }
  const alert = await Alert.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(alert);
});

app.get('/api/dashboard', authenticate, async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const [totalPackets, activeAlerts, packetsToday, recentTraffic] = await Promise.all([
    Log.countDocuments(),
    Alert.countDocuments({ status: 'unresolved' }),
    Log.countDocuments({ timestamp: { $gte: today } }),
    Log.find().sort({ timestamp: -1 }).limit(50)
  ]);
  
  const criticalCount = await Alert.countDocuments({ status: 'unresolved', severity: { $in: ['critical', 'high'] } });
  const threatLevel = criticalCount > 0 ? 'high' : activeAlerts > 5 ? 'medium' : 'low';

  res.json({ totalPackets, activeAlerts, threatLevel, packetsToday, recentTraffic });
});

app.put('/api/settings', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { settings: req.body }, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- REPORT ROUTES ---
app.get('/api/reports', authenticate, async (req, res) => {
  const reports = await Report.find().sort({ generated_at: -1 });
  res.json(reports);
});

app.post('/api/reports/generate', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [packetCount, alerts] = await Promise.all([
      Log.countDocuments({ timestamp: { $gte: weekAgo } }),
      Alert.find({ timestamp: { $gte: weekAgo } })
    ]);

    const severityBreakdown = {
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
    };

    const threatTypes = {};
    alerts.forEach(a => {
      threatTypes[a.threat_type] = (threatTypes[a.threat_type] || 0) + 1;
    });

    const summary = `Weekly security report generated for the period from ${weekAgo.toLocaleDateString()} to ${now.toLocaleDateString()}.
    Total of ${packetCount} packets analyzed with ${alerts.length} security alerts detected.`;

    const report = await Report.create({
      title: `Weekly Security Report - ${now.toLocaleDateString()}`,
      summary,
      total_packets: packetCount,
      total_alerts: alerts.length,
      severity_breakdown: severityBreakdown,
      threat_types: threatTypes,
      date_from: weekAgo,
      date_to: now,
      generated_by: req.user.id,
      user_id: req.user.id
    });

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NetShield API is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});