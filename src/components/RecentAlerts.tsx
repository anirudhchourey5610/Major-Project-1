import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Alert } from '../lib/api';

interface RecentAlertsProps {
  alerts: Alert[];
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({ alerts }) => {
  const severityConfig = {
    critical: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
    high: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
    low: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-red-500/10 p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Recent Alerts</h2>
          <p className="text-sm text-slate-400">Latest security events</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-slate-400">No active alerts</p>
          <p className="text-sm text-slate-500 mt-1">Your network is secure</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                className={`bg-slate-900/50 border-l-4 ${config.border} rounded-lg p-4 hover:bg-slate-900 transition-all`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${config.bg} animate-pulse`} />
                    <span className={`text-xs font-semibold uppercase ${config.text}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{formatTime(alert.timestamp)}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-white mb-1">{alert.threat_type}</h3>

                <div className="text-sm text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Source:</span>
                    <span className="font-mono text-slate-300">{alert.src_ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-mono text-slate-300">{alert.dest_ip}</span>
                  </div>
                  {alert.packet_count > 1 && (
                    <div className="flex justify-between">
                      <span>Packets:</span>
                      <span className="text-slate-300">{alert.packet_count}</span>
                    </div>
                  )}
                </div>

                {alert.details && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{alert.details}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <button className="w-full text-center text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
            View All Alerts →
          </button>
        </div>
      )}
    </div>
  );
};
