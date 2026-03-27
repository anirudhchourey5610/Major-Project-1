import React, { useEffect, useState } from 'react';
import { FileText, Download, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { api, Report } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/api/reports');
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      await api.post('/api/reports/generate');
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Security Reports</h1>
        <button onClick={generateReport} disabled={generating} className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:bg-slate-700">
          <FileText className="w-4 h-4" />
          <span>{generating ? 'Generating...' : 'Generate Report'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white">{report.title}</h3>
            <p className="text-slate-300 my-4">{report.summary}</p>
            <div className="grid grid-cols-4 gap-4">
               <div className="bg-slate-900/50 p-4 rounded-lg text-white">
                 <div className="text-sm text-slate-400">Packets</div>
                 <div className="text-xl font-bold">{report.total_packets}</div>
               </div>
               <div className="bg-slate-900/50 p-4 rounded-lg text-white">
                 <div className="text-sm text-slate-400">Alerts</div>
                 <div className="text-xl font-bold">{report.total_alerts}</div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};