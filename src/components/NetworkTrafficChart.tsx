import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { PacketLog } from '../lib/supabase';

interface NetworkTrafficChartProps {
  data: PacketLog[];
}

export const NetworkTrafficChart: React.FC<NetworkTrafficChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const last24Hours = new Array(24).fill(0);
    const now = new Date();

    data.forEach((log) => {
      const logTime = new Date(log.timestamp);
      const hoursDiff = Math.floor((now.getTime() - logTime.getTime()) / (1000 * 60 * 60));
      if (hoursDiff >= 0 && hoursDiff < 24) {
        last24Hours[23 - hoursDiff]++;
      }
    });

    return last24Hours;
  }, [data]);

  const maxValue = Math.max(...chartData, 1);
  const statusCounts = useMemo(() => {
    return {
      normal: data.filter((d) => d.status === 'normal').length,
      suspicious: data.filter((d) => d.status === 'suspicious').length,
      malicious: data.filter((d) => d.status === 'malicious').length,
    };
  }, [data]);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Network Traffic</h2>
            <p className="text-sm text-slate-400">Last 24 hours</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="text-right">
            <div className="text-sm text-slate-400">Normal</div>
            <div className="text-lg font-semibold text-emerald-500">{statusCounts.normal}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Suspicious</div>
            <div className="text-lg font-semibold text-yellow-500">{statusCounts.suspicious}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Malicious</div>
            <div className="text-lg font-semibold text-red-500">{statusCounts.malicious}</div>
          </div>
        </div>
      </div>

      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end justify-between space-x-1">
          {chartData.map((value, index) => {
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const currentHour = new Date().getHours();
            const barHour = (currentHour - (23 - index) + 24) % 24;

            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all duration-300 group-hover:from-emerald-400 group-hover:to-emerald-300"
                  style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                />

                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                  <div className="font-semibold">{value} packets</div>
                  <div className="text-slate-400">{barHour}:00</div>
                </div>

                {index % 4 === 0 && (
                  <div className="text-xs text-slate-500 mt-2">{barHour}:00</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{data.length}</div>
            <div className="text-xs text-slate-400">Total Packets</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {data.length > 0 ? Math.round(data.reduce((acc, d) => acc + d.packet_size, 0) / data.length) : 0}
            </div>
            <div className="text-xs text-slate-400">Avg Size (bytes)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {((statusCounts.suspicious + statusCounts.malicious) / Math.max(data.length, 1) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">Threat Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
