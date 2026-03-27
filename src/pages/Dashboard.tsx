import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { api, Alert, PacketLog } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { NetworkTrafficChart } from '../components/NetworkTrafficChart';
import { RecentAlerts } from '../components/RecentAlerts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPackets: 0,
    activeAlerts: 0,
    threatLevel: 'low' as 'low' | 'medium' | 'high',
    packetsToday: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [trafficData, setTrafficData] = useState<PacketLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/api/dashboard');
      setStats({
        totalPackets: data.totalPackets,
        activeAlerts: data.activeAlerts,
        threatLevel: data.threatLevel,
        packetsToday: data.packetsToday,
      });
      // The backend now returns 50 logs, we pass them to the chart
      setTrafficData(data.recentTraffic || []);
      
      // We need to fetch alerts separately for the list or include them in the dashboard endpoint
      // For simplicity, let's assume we fetch recent alerts separately
      const alertsRes = await api.get('/api/alerts');
      setRecentAlerts(alertsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      // Poll every 5 seconds instead of real-time socket for simplicity
      const interval = setInterval(fetchDashboardData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const threatLevelConfig = {
    low: { bg: 'bg-emerald-500', text: 'text-emerald-500', label: 'Low' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-500', label: 'Medium' },
    high: { bg: 'bg-red-500', text: 'text-red-500', label: 'High' },
  };

  const currentThreatConfig = threatLevelConfig[stats.threatLevel];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Network Security Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time monitoring and threat detection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalPackets.toLocaleString()}</div>
          <div className="text-sm text-slate-400">Total Packets Captured</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-500/10 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.activeAlerts}</div>
          <div className="text-sm text-slate-400">Active Alerts</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className={`${currentThreatConfig.bg}/10 p-3 rounded-lg`}>
              <Shield className={`w-6 h-6 ${currentThreatConfig.text}`} />
            </div>
          </div>
          <div className={`text-3xl font-bold mb-1 ${currentThreatConfig.text}`}>
            {currentThreatConfig.label}
          </div>
          <div className="text-sm text-slate-400">Threat Level</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.packetsToday.toLocaleString()}</div>
          <div className="text-sm text-slate-400">Packets Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetworkTrafficChart data={trafficData} />
        </div>

        <div>
          <RecentAlerts alerts={recentAlerts} />
        </div>
      </div>
    </div>
  );
};