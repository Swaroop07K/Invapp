
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Console Home', icon: '🏠' },
    { id: 'inventory', label: 'Inventory (RDS)', icon: '📦' },
    { id: 'insights', label: 'Bedrock Insights', icon: '✨' }
  ];

  // Pulls AWS_REGION from .env
  const awsRegion = process.env.AWS_REGION || 'us-east-1';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F2F3F3]">
      {/* AWS Management Console Side Nav */}
      <aside className="w-full md:w-64 bg-[#232F3E] text-white flex-shrink-0 flex flex-col">
        <div className="p-6 bg-[#19222D]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF9900] rounded flex items-center justify-center font-black text-[#232F3E]">IT</div>
            <h1 className="text-lg font-bold tracking-tight">InvTrack <span className="text-[#FF9900]">Pro</span></h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Nova Lite Interface</p>
        </div>
        
        <nav className="mt-4 px-3 flex-1 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-colors ${
                activeTab === item.id ? 'bg-[#37475A] border-l-4 border-[#FF9900]' : 'hover:bg-[#37475A] text-slate-300'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
          
          {user.role === 'admin' && (
            <div className="mt-6 pt-4 border-t border-slate-700">
              <button
                onClick={() => setActiveTab('manage')}
                className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 ${
                  activeTab === 'manage' ? 'bg-[#37475A] border-l-4 border-[#FF9900]' : 'hover:bg-[#37475A] text-slate-400'
                }`}
              >
                <span>⚙️</span>
                <span className="text-sm font-medium">RDS Configuration</span>
              </button>
            </div>
          )}
        </nav>
        
        <div className="p-4 bg-[#19222D]">
          <div className="flex items-center gap-3 p-2 bg-[#232F3E] rounded">
            <div className="w-8 h-8 rounded bg-[#FF9900] flex items-center justify-center font-bold text-[#232F3E]">
              {user.username[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-0.5">Role: {user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full mt-2 py-2 text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
          >
            Switch IAM User
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-12 bg-white border-b border-slate-200 px-6 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#FF9900]"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{awsRegion}</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Service: Operating
            </span>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border px-2 py-0.5 rounded uppercase tracking-tighter">AWS Enterprise</span>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
