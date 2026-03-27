import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import { connectToDatabase, isDatabaseConnected } from './db.js';
import { User } from './models/User.js';
import { Log } from './models/Log.js';
import { Alert } from './models/Alert.js';
import { Report } from './models/Report.js';

dotenv.config();

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const allowedOrigins = [
  ...new Set(
    [
      ...defaultAllowedOrigins,
      ...(process.env.FRONTEND_URL || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ],
  ),
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';

const serializeUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  role: user.role,
  settings: user.settings,
  created_at: user.createdAt,
});

const ensureDatabase = async (_req, _res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'NetShield API is running',
    database: isDatabaseConnected() ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
  });
});

app.use(ensureDatabase);

app.post('/auth/signup', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY);
    res.status(201).json({ user: serializeUser(user), token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email is already registered. Please sign in instead.' });
    }

    next(error);
  }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY);
    res.json({ user: serializeUser(user), token });
  } catch (error) {
    next(error);
  }
});

app.get('/auth/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(serializeUser(user));
  } catch (error) {
    next(error);
  }
});

app.post('/api/logs', async (req, res, next) => {
  try {
    const log = await Log.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

app.post('/api/alerts', async (req, res, next) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
});

app.get('/api/logs', authenticate, async (req, res, next) => {
  try {
    const logs = await Log.find({ user_id: req.user.id }).sort({ timestamp: -1 }).limit(1000);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

app.get('/api/alerts', authenticate, async (req, res, next) => {
  try {
    const alerts = await Alert.find({ user_id: req.user.id }).sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/alerts/:id', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    const update = { status };

    if (status === 'resolved') {
      update.resolved_at = new Date();
      update.resolved_by = req.user.id;
    }

    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      update,
      { new: true },
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

app.get('/api/dashboard', authenticate, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userFilter = { user_id: req.user.id };

    const [totalPackets, activeAlerts, packetsToday, recentTraffic] = await Promise.all([
      Log.countDocuments(userFilter),
      Alert.countDocuments({ ...userFilter, status: 'unresolved' }),
      Log.countDocuments({ ...userFilter, timestamp: { $gte: today } }),
      Log.find(userFilter).sort({ timestamp: -1 }).limit(50),
    ]);

    const criticalCount = await Alert.countDocuments({
      ...userFilter,
      status: 'unresolved',
      severity: { $in: ['critical', 'high'] },
    });

    const threatLevel = criticalCount > 0 ? 'high' : activeAlerts > 5 ? 'medium' : 'low';

    res.json({ totalPackets, activeAlerts, threatLevel, packetsToday, recentTraffic });
  } catch (error) {
    next(error);
  }
});

app.put('/api/settings', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings: req.body },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(serializeUser(user));
  } catch (error) {
    next(error);
  }
});

app.get('/api/reports', authenticate, async (req, res, next) => {
  try {
    const reports = await Report.find({ user_id: req.user.id }).sort({ generated_at: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
});

app.post('/api/reports/generate', authenticate, async (req, res, next) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const userFilter = { user_id: req.user.id, timestamp: { $gte: weekAgo } };

    const [packetCount, alerts] = await Promise.all([
      Log.countDocuments(userFilter),
      Alert.find(userFilter),
    ]);

    const severityBreakdown = {
      critical: alerts.filter((alert) => alert.severity === 'critical').length,
      high: alerts.filter((alert) => alert.severity === 'high').length,
      medium: alerts.filter((alert) => alert.severity === 'medium').length,
      low: alerts.filter((alert) => alert.severity === 'low').length,
    };

    const threatTypes = {};
    alerts.forEach((alert) => {
      threatTypes[alert.threat_type] = (threatTypes[alert.threat_type] || 0) + 1;
    });

    const summary = `Weekly security report generated for ${weekAgo.toLocaleDateString()} to ${now.toLocaleDateString()}. ${packetCount} packets were analyzed and ${alerts.length} alerts were detected.`;

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
      user_id: req.user.id,
    });

    res.json(report);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);

  const message = error?.message || 'Internal server error';
  res.status(500).json({ error: message });
});

export default app;
