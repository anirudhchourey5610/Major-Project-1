import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Shared Types
export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  settings: {
    alert_threshold_low: number;
    alert_threshold_medium: number;
    alert_threshold_high: number;
    email_notifications: boolean;
  };
  created_at: string;
}

export interface PacketLog {
  id: string;
  timestamp: string;
  src_ip: string;
  dest_ip: string;
  protocol: string;
  packet_size: number;
  status: 'normal' | 'suspicious' | 'malicious';
  details: Record<string, any>;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threat_type: string;
  src_ip: string;
  dest_ip: string;
  packet_count: number;
  details: string;
  status: 'unresolved' | 'investigating' | 'resolved';
  resolved_at?: string;
}

export interface Report {
  id: string;
  title: string;
  summary: string;
  total_packets: number;
  total_alerts: number;
  severity_breakdown: Record<string, number>;
  threat_types: Record<string, number>;
  date_from: string;
  date_to: string;
  generated_at: string;
}