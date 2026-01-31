
import React from 'react';
import { InventoryItem } from '../types';

interface InventoryTableProps {
  inventory: InventoryItem[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventory }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Master Inventory Record</h3>
        <div className="flex gap-2">
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">SORT: BY NAME</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <th className="px-8 py-4">Product Info</th>
              <th className="px-8 py-4">Classification</th>
              <th className="px-8 py-4">Stock Metrics</th>
              <th className="px-8 py-4">Unit Price</th>
              <th className="px-8 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs">
                      #{item.id}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Modified: {new Date(item.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md uppercase tracking-wider">
                    {item.category}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between w-32">
                      <span className="text-xs font-bold text-slate-800">{item.current_quantity}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Target {item.min_required_quantity}</span>
                    </div>
                    <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${item.current_quantity < item.min_required_quantity ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((item.current_quantity / (item.min_required_quantity || 1)) * 50, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-slate-700">${item.price.toLocaleString()}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  {item.current_quantity < item.min_required_quantity ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase">
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                      Optimal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
