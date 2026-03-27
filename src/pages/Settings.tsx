import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(user?.settings || { alert_threshold_low: 10, alert_threshold_medium: 5, alert_threshold_high: 2, email_notifications: true });

  const handleSave = async () => {
    await api.put('/api/settings', settings);
    alert('Settings saved!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="space-y-4">
          <label className="text-white block">High Alert Threshold</label>
          <input type="number" value={settings.alert_threshold_high} onChange={(e) => setSettings({...settings, alert_threshold_high: +e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded" />
          <button onClick={handleSave} className="bg-emerald-500 text-white px-4 py-2 rounded flex items-center space-x-2"><Save className="w-4 h-4" /> <span>Save</span></button>
        </div>
      </div>
    </div>
  );
};