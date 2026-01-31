
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

  // Critical System Mapping from .env
  const sysConfig = {
    rdsEndpoint: process.env.RDS_ENDPOINT || 'rds-cluster-01.aws.internal',
    rdsDbName: process.env.RDS_DB_NAME || 'invtrackdb',
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    modelId: process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0',
    deploymentMode: "EC2-Production"
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('inv_user');
    const savedInv = localStorage.getItem('inv_data');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedInv) setInventory(JSON.parse(savedInv));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('inv_user', JSON.stringify(user));
    else localStorage.removeItem('inv_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('inv_data', JSON.stringify(inventory));
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
      setLoginError('IAM Identity Validation Failed: Access Denied');
    }
  };

  const handleLogout = () => setUser(null);

  const addItem = (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setInventory([newItem, ...inventory]);
  };

  const deleteItem = (id: number) => {
    if (window.confirm('Terminate resource record?')) {
      setInventory(inventory.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: number, updates: Partial<InventoryItem>) => {
    setInventory(inventory.map(i => i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#232F3E] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded shadow-2xl overflow-hidden border-t-8 border-[#FF9900]">
          <div className="p-10 text-center bg-[#F2F3F3]">
            <h1 className="text-3xl font-black text-[#232F3E] tracking-tighter italic">INV<span className="text-[#FF9900]">TRACK</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mt-2">AWS Identity & Access Management</p>
          </div>
          <div className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IAM User</label>
                <input 
                  type="text" 
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full px-4 py-3 rounded-sm border border-slate-300 focus:border-[#FF9900] outline-none text-sm transition-all"
                  placeholder="admin / employee1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-sm border border-slate-300 focus:border-[#FF9900] outline-none text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
              {loginError && <p className="text-red-600 text-[10px] font-black uppercase bg-red-50 p-2 border border-red-100">{loginError}</p>}
              <button type="submit" className="w-full bg-[#FF9900] text-[#232F3E] py-4 rounded-sm font-black text-xs uppercase tracking-widest hover:brightness-95 active:scale-[0.98] transition-all">
                Sign In to Console
              </button>
            </form>
          </div>
          <div className="bg-slate-50 p-4 border-t text-[9px] font-bold text-slate-400 flex justify-between items-center px-10">
            <span>REGION: {sysConfig.awsRegion}</span>
            <span className="text-blue-500">ROOT LOGIN?</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-7xl mx-auto space-y-8">
        {activeTab === 'dashboard' && <Dashboard inventory={inventory} />}
        {activeTab === 'inventory' && <InventoryTable inventory={inventory} />}
        {activeTab === 'insights' && <AIPredictions inventory={inventory} />}
        {activeTab === 'manage' && user.role === 'admin' && (
          <AdminPanel inventory={inventory} onAdd={addItem} onDelete={deleteItem} onUpdate={updateItem} />
        )}

        <footer className="pt-16 pb-8 border-t border-slate-200 mt-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500">Data Persistence Layer</span>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 <span>RDS Endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono lowercase">{sysConfig.rdsEndpoint}</code></span>
              </div>
            </div>
            <div className="md:text-right flex flex-col gap-1">
              <span className="text-slate-500">Inference Architecture</span>
              <span>Model: {sysConfig.modelId} | Region: {sysConfig.awsRegion}</span>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default App;
