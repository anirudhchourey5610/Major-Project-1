import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { api, Alert } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export const Alerts: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) fetchAlerts();
  }, [user]);

  useEffect(() => {
    filterAlerts();
  }, [alerts, severityFilter, statusFilter]);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/api/alerts');
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;
    if (severityFilter !== 'all') filtered = filtered.filter((alert) => alert.severity === severityFilter);
    if (statusFilter !== 'all') filtered = filtered.filter((alert) => alert.status === statusFilter);
    setFilteredAlerts(filtered);
  };

  const updateAlertStatus = async (alertId: string, newStatus: 'investigating' | 'resolved') => {
    try {
      await api.patch(`/api/alerts/${alertId}`, { status: newStatus });
      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  const severityConfig = {
    critical: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
    high: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
    low: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Security Alerts</h1>
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
            <option value="all">All Status</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`bg-slate-900/50 border-l-4 ${severityConfig[alert.severity].border} rounded-lg p-6`}>
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{alert.threat_type}</h3>
                  {/* Fixed: Escaped the arrow characters */}
                  <p className="text-slate-400">{alert.src_ip} -{'>'} {alert.dest_ip}</p>
                </div>
                {alert.status === 'unresolved' && (
                  <button onClick={() => updateAlertStatus(alert.id, 'resolved')} className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <CheckCircle className="w-4 h-4" /> <span>Resolve</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};