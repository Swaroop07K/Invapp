
import React from 'react';
import { InventoryItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  inventory: InventoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ inventory }) => {
  const lowStock = inventory.filter(i => i.current_quantity < i.min_required_quantity);
  
  const chartData = inventory.map(item => ({
    name: item.name.length > 12 ? item.name.substring(0, 10) + '...' : item.name,
    qty: item.current_quantity,
    min: item.min_required_quantity
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Resources', val: inventory.length, color: 'blue' },
          { label: 'Critical Alerts', val: lowStock.length, color: 'orange' },
          { label: 'Active Regions', val: '04', color: 'green' },
          { label: 'Nova Requests', val: '842', color: 'slate' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color === 'orange' ? 'text-[#FF9900]' : 'text-slate-800'}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Resource Allocation (Stock Level)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F3F3" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#F2F3F3'}} />
                <Bar dataKey="qty" fill="#232F3E" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.qty < entry.min ? '#FF9900' : '#232F3E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#232F3E] p-6 rounded text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-6xl font-black">AI</span>
          </div>
          <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-[#FF9900]">Bedrock Status</h3>
          <div className="space-y-4">
            <div className="p-3 bg-[#19222D] rounded border border-slate-700">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Current Model</p>
              <p className="text-sm font-bold">Nova Lite v1.0</p>
            </div>
            <div className="p-3 bg-[#19222D] rounded border border-slate-700">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Inference Speed</p>
              <p className="text-sm font-bold text-green-400">124ms / token</p>
            </div>
            <div className="pt-4">
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "AI-driven replenishment logic is currently monitoring all SKUs in real-time."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
