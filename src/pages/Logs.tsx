import React, { useEffect, useState } from 'react';
import { Search, Download } from 'lucide-react';
import { api, PacketLog } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export const Logs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<PacketLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<PacketLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, statusFilter, protocolFilter]);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/api/logs');
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;
    if (searchTerm) {
      filtered = filtered.filter((log) =>
        log.src_ip.includes(searchTerm) ||
        log.dest_ip.includes(searchTerm) ||
        log.protocol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }
    if (protocolFilter !== 'all') {
      filtered = filtered.filter((log) => log.protocol === protocolFilter);
    }
    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const protocols = Array.from(new Set(logs.map((log) => log.protocol)));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const statusConfig = {
    normal: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Normal' },
    suspicious: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Suspicious' },
    malicious: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Malicious' },
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Source IP', 'Destination IP', 'Protocol', 'Size', 'Status'],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toISOString(),
        log.src_ip,
        log.dest_ip,
        log.protocol,
        log.packet_size.toString(),
        log.status,
      ]),
    ].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `packet_logs_${new Date().toISOString()}.csv`;
    a.click();
  };

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
          <h1 className="text-3xl font-bold text-white">Packet Logs</h1>
          <p className="text-slate-400 mt-1">View and analyze captured network packets</p>
        </div>
        <button onClick={exportLogs} className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Search by IP or protocol..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="all">All Status</option>
            <option value="normal">Normal</option>
            <option value="suspicious">Suspicious</option>
            <option value="malicious">Malicious</option>
          </select>
          <select value={protocolFilter} onChange={(e) => setProtocolFilter(e.target.value)} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="all">All Protocols</option>
            {protocols.map((protocol) => <option key={protocol} value={protocol}>{protocol}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Source IP</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Destination IP</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Protocol</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Size</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => {
                const config = statusConfig[log.status];
                return (
                  <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm font-mono text-slate-300">{log.src_ip}</td>
                    <td className="py-3 px-4 text-sm font-mono text-slate-300">{log.dest_ip}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{log.protocol}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{log.packet_size} B</td>
                    <td className="py-3 px-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};