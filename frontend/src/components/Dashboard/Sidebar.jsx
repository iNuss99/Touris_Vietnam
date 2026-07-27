import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, PieChart as PieChartIcon, Settings, ChevronLeft, ChevronRight, LogOut, UserCog, Newspaper } from 'lucide-react';
import { NavItem } from './SharedUI';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  adminProfile
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <aside className={`transition-all duration-300 ease-in-out border-r border-slate-200 bg-white z-10 flex flex-col h-screen sticky top-0 shadow-sm ${isSidebarOpen ? 'w-64 p-6' : 'w-20 p-4 items-center'}`}>
      <div className="mb-10 w-full">
        <Link to="/" className={`inline-flex items-center text-slate-400 hover:text-teal-600 transition-colors text-sm mb-8 ${!isSidebarOpen && 'justify-center w-full'}`}>
          <ArrowLeft size={16} className={isSidebarOpen ? "mr-2" : ""} />
          {isSidebarOpen && "Trang chủ"}
        </Link>
        <div className={`flex items-center ${!isSidebarOpen && 'justify-center'} gap-3`}>
          <div className="w-8 h-8 rounded bg-gradient-to-br from-teal-500 to-sky-500 flex items-center justify-center shrink-0 shadow-sm">
            <span className="font-sans font-bold text-white text-sm">V</span>
          </div>
          {isSidebarOpen && <h1 className="text-xl font-sans font-bold text-slate-800 tracking-wide">Touris CRM</h1>}
        </div>
      </div>

      <nav className="flex-1 space-y-2 w-full">
        <NavItem icon={<Users size={18} />} label="Quản lý Leads" active={activeTab === 'leads'} isOpen={isSidebarOpen} onClick={() => setActiveTab('leads')} />
        <NavItem icon={<PieChartIcon size={18} />} label="Báo cáo" active={activeTab === 'reports'} isOpen={isSidebarOpen} onClick={() => setActiveTab('reports')} />
        
        {user?.role === 'super_admin' && (
          <NavItem icon={<UserCog size={18} />} label="Nhân sự" active={activeTab === 'users'} isOpen={isSidebarOpen} onClick={() => setActiveTab('users')} />
        )}
        
        {(user?.role === 'super_admin' || user?.role === 'editor') && (
          <NavItem icon={<Newspaper size={18} />} label="Nội dung" active={activeTab === 'content'} isOpen={isSidebarOpen} onClick={() => setActiveTab('content')} />
        )}

        <NavItem icon={<Settings size={18} />} label="Cài đặt" active={activeTab === 'settings'} isOpen={isSidebarOpen} onClick={() => setActiveTab('settings')} />
      </nav>

      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-300 transition-colors z-20">
        {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className="mt-auto pt-6 border-t border-slate-200 w-full">
        <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'} text-slate-500 cursor-pointer hover:text-slate-800 transition-colors`}>
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
            {adminProfile.avatar ? (
              <img src={adminProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-slate-600">
                {adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-800 truncate">{adminProfile.name}</p>
              <p className="text-[11px] truncate uppercase tracking-wider text-slate-400">{adminProfile.email}</p>
            </div>
          )}
        </div>
        <button 
          onClick={() => {
            sessionStorage.removeItem('touris_token');
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
