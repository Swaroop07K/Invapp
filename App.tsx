import React, { useState, useEffect } from 'react';
import { User, InventoryItem } from './types';
import { INITIAL_USERS, INITIAL_INVENTORY } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import AdminPanel from './components/AdminPanel';
import AIPredictions from './components/AIPredictions';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Map .env variables for Console branding and status
  const rdsConfig = {
    endpoint: process.env.RDS_ENDPOINT || 'rds-default.aws.amazon.com',
    dbName: process.env.RDS_DB_NAME || 'invtrackdb',
    region: process.env.AWS_REGION || 'us-east-1',
    model: process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0'
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('invtrack_user');
    const savedInv = localStorage.getItem('invtrack_inventory');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedInv) setInventory(JSON.parse(savedInv));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('invtrack_user', JSON.stringify(user));
    else localStorage.removeItem('invtrack_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('invtrack_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = INITIAL_USERS.find(
      u => u.username === loginForm.username && 
      (loginForm.username === 'admin' ? loginForm.password === 'admin123' : loginForm.password === 'emp123')
    );
    if (foundUser) {
      setUser(foundUser);
      setLoginError('');
      setActiveTab('dashboard');
    } else {
      setLoginError('IAM Identity Validation Failed: Invalid Credentials');
    }
  };

  const handleLogout = () => setUser(null);

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: Math.max(...inventory.map(i => i.id), 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const deleteInventoryItem = (id: number) => {
    if (window.confirm('Are you sure you want to terminate this resource record?')) {
      setInventory(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateInventoryItem = (id: number, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    ));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#232F3E] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded shadow-2xl overflow-hidden border-t-8 border-[#FF9900]">
          <div className="p-10 text-center bg-[#F2F3F3] border-b border-slate-200">
            <h1 className="text-3xl font-black text-[#232F3E]">INV<span className="text-[#FF9900]">TRACK</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-2">AWS Identity & Access Management</p>
          </div>
          
          <div className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IAM Username</label>
                <input 
                  type="text" 
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full px-4 py-3 rounded-sm border border-slate-300 outline-none focus:border-[#FF9900] transition-all"
                  placeholder="admin / employee1"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-sm border border-slate-300 outline-none focus:border-[#FF9900] transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              {loginError && (
                <div className="bg-red-50 border border-red-100 p-3 flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <p className="text-[10px] font-bold text-red-700 uppercase">{loginError}</p>
                </div>
              )}
              
              <button 
                type="submit" 
                className="w-full bg-[#FF9900] text-[#232F3E] py-4 rounded-sm font-black text-xs uppercase tracking-[0.15em] hover:bg-[#E88B00] transition-all shadow-md active:translate-y-0.5"
              >
                Sign In to Console
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
               <span>RDS Zone: {rdsConfig.region}</span>
               <span>v4.2.1-PRO</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {activeTab === 'dashboard' && <Dashboard inventory={inventory} />}
        {activeTab === 'inventory' && <InventoryTable inventory={inventory} />}
        {activeTab === 'insights' && <AIPredictions inventory={inventory} />}
        {activeTab === 'manage' && user.role === 'admin' && (
          <AdminPanel 
            inventory={inventory} 
            onAdd={addInventoryItem} 
            onDelete={deleteInventoryItem} 
            onUpdate={updateInventoryItem} 
          />
        )}

        <footer className="pt-12 pb-6 border-t border-slate-200 mt-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <div className="space-y-1">
              <p>Persistence: <span className="text-slate-500">PostgreSQL (RDS)</span></p>
              <p>Endpoint: <span className="text-blue-500 font-mono">{rdsConfig.endpoint}</span></p>
            </div>
            <div className="md:text-right space-y-1">
              <p>AI Engine: <span className="text-slate-500">{rdsConfig.model}</span></p>
              <p>Region: <span className="text-slate-500">{rdsConfig.region}</span> | Cluster: <span className="text-slate-500">{rdsConfig.dbName}</span></p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default App;
