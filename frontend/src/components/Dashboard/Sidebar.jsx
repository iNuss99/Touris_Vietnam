import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, PieChart as PieChartIcon, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { NavItem } from './SharedUI';

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  adminProfile
}) {
  const navigate = useNavigate();

  return (
    <aside className={`transition-all duration-300 ease-in-out border-r border-white/5 bg-white/[0.01] backdrop-blur-md z-10 flex flex-col h-screen sticky top-0 ${isSidebarOpen ? 'w-64 p-6' : 'w-20 p-4 items-center'}`}>
      <div className="mb-10 w-full">
        <Link to="/" className={`inline-flex items-center text-white/40 hover:text-white transition-colors text-sm mb-8 ${!isSidebarOpen && 'justify-center w-full'}`}>
          <ArrowLeft size={16} className={isSidebarOpen ? "mr-2" : ""} />
          {isSidebarOpen && "Trang chủ"}
        </Link>
        <div className={`flex items-center ${!isSidebarOpen && 'justify-center'} gap-3`}>
          <div className="w-8 h-8 rounded bg-gradient-to-br from-luxury-gold to-luxury-gold-dim flex items-center justify-center shrink-0">
            <span className="font-serif font-bold text-black text-sm">V</span>
          </div>
          {isSidebarOpen && <h1 className="text-xl font-serif font-bold text-white tracking-wide">Touris CRM</h1>}
        </div>
      </div>

      <nav className="flex-1 space-y-2 w-full">
        <NavItem icon={<Users size={18} />} label="Quản lý Leads" active={activeTab === 'leads'} isOpen={isSidebarOpen} onClick={() => setActiveTab('leads')} />
        <NavItem icon={<PieChartIcon size={18} />} label="Báo cáo" active={activeTab === 'reports'} isOpen={isSidebarOpen} onClick={() => setActiveTab('reports')} />
        <NavItem icon={<Settings size={18} />} label="Cài đặt" active={activeTab === 'settings'} isOpen={isSidebarOpen} onClick={() => setActiveTab('settings')} />
      </nav>

      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-20 w-6 h-6 bg-luxury-dark border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-luxury-gold transition-colors z-20">
        {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className="mt-auto pt-6 border-t border-white/5 w-full">
        <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'} text-white/50 cursor-pointer hover:text-white transition-colors`}>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
            {adminProfile.avatar ? (
              <img src={adminProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">AD</span>
            )}
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{adminProfile.name}</p>
              <p className="text-[11px] truncate uppercase tracking-wider">{adminProfile.email}</p>
            </div>
          )}
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('touris_token');
            navigate('/login');
          }}
          className={`mt-4 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all ${!isSidebarOpen && 'justify-center px-0'}`}
        >
          <LogOut size={16} />
          {isSidebarOpen && <span className="text-sm font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
