
import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface AdminPanelProps {
  inventory: InventoryItem[];
  onAdd: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<InventoryItem>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ inventory, onAdd, onDelete, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    current_quantity: 0,
    min_required_quantity: 0,
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newItem,
      sales_history: []
    });
    setNewItem({ name: '', category: '', current_quantity: 0, min_required_quantity: 0, price: 0 });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Manage Inventory Database</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {isAdding ? 'Cancel' : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              New Item
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Product Name</label>
              <input 
                required
                type="text" 
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. 4K Monitor"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <input 
                required
                type="text" 
                value={newItem.category}
                onChange={e => setNewItem({...newItem, category: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Electronics"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Stock</label>
                <input 
                  required
                  type="number" 
                  value={newItem.current_quantity}
                  onChange={e => setNewItem({...newItem, current_quantity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Min. Stock</label>
                <input 
                  required
                  type="number" 
                  value={newItem.min_required_quantity}
                  onChange={e => setNewItem({...newItem, min_required_quantity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Price ($)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
            Save Product to RDS
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <span className="text-sm font-semibold text-slate-500">Master Record Set</span>
          <span className="text-xs text-slate-400">{inventory.length} total entries</span>
        </div>
        <div className="divide-y divide-slate-100">
          {inventory.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between group">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400">
                  {item.id}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{item.name}</h4>
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span>{item.category}</span>
                    <span className="text-slate-300">|</span>
                    <span>Last updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete Item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
