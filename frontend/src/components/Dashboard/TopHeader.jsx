import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut, ShieldCheck, Sparkles, UserCog, Eye, Search, Command, ArrowRight, LayoutDashboard, Users, PieChart as PieChartIcon, Newspaper, X, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopHeader({ adminProfile, setActiveTab, activeTab, leads = [], setSelectedLead, setSearchQuery }) {
  const { user, logout, isSuperAdmin, viewAsRole, setViewAsRole } = useAuth();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Global Search State
  const [globalQuery, setGlobalQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const roleMenuRef = useRef(null);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Danh mục Modules hệ thống cho Global Search
  const systemModules = useMemo(() => [
    { id: 'ceo', label: 'Bảng điều khiển CEO', desc: 'Thống kê tài chính & dòng tiền thực thu', icon: LayoutDashboard, roleReq: ['super_admin'] },
    { id: 'leads', label: 'Quản lý Leads', desc: 'Danh sách 62+ yêu cầu tour & chấm điểm Hot', icon: Users },
    { id: 'reports', label: 'Báo cáo Thống kê', desc: 'Phân tích tăng trưởng & tỷ lệ chốt', icon: PieChartIcon },
    { id: 'users', label: 'Quản lý Nhân sự', desc: 'Phân quyền tài khoản CRM', icon: UserCog, roleReq: ['super_admin'] },
    { id: 'content', label: 'Quản lý Nội dung', desc: 'Biên tập tour & điểm đến', icon: Newspaper, roleReq: ['super_admin', 'editor'] },
    { id: 'settings', label: 'Cài đặt Tài khoản', desc: 'Thông tin cá nhân & mật khẩu', icon: Settings }
  ], []);

  // Lọc kết quả tìm kiếm xuyên module
  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return { modules: systemModules, leads: [] };

    const matchedModules = systemModules.filter(m => 
      m.label.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
    );

    const matchedLeads = (leads || []).filter(l => 
      (l.full_name && l.full_name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.destination && l.destination.toLowerCase().includes(q))
    ).slice(0, 5);

    return { modules: matchedModules, leads: matchedLeads };
  }, [globalQuery, systemModules, leads]);

  const mockNotifications = [
    {
      id: 1,
      type: 'lead',
      title: 'Lead mới từ Website',
      desc: 'Khách hàng Nguyễn Văn Anh vừa yêu cầu báo giá Tour Hạ Long (5 khách).',
      time: '5 phút trước',
      unread: true,
      icon: Sparkles,
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-100'
    },
    {
      id: 2,
      type: 'deal',
      title: 'Hợp đồng mới thành công',
      desc: 'Deal Khách đoàn Doanh nghiệp FPT (450 Triệu VNĐ) chuyển trạng thái THÀNH CÔNG.',
      time: '1 giờ trước',
      unread: true,
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    },
    {
      id: 3,
      type: 'user',
      title: 'Cấp lại mật khẩu thành công',
      desc: 'Quản trị viên vừa khởi tạo lại mật khẩu mới cho tài khoản kinh doanh.',
      time: '3 giờ trước',
      unread: true,
      icon: UserCog,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100'
    }
  ];

  const roleDisplayNames = {
    super_admin: 'Super Admin',
    sales: 'Kinh doanh',
    editor: 'Biên tập viên',
    viewer: 'Người xem'
  };

  const roleFullLabels = {
    super_admin: 'Super Admin (Mặc định)',
    sales: 'Kinh doanh (Sales)',
    editor: 'Biên tập viên (Editor)',
    viewer: 'Người xem (Viewer)'
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setShowRoleMenu(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('touris_token');
    sessionStorage.removeItem('touris_must_change_password');
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shadow-xs gap-4">
      {/* Left Title / Tab Indicator */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium shrink-0">
        <span className="text-slate-400">Dashboard</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold uppercase tracking-wider text-xs">
          {activeTab === 'ceo' && 'Bảng điều khiển CEO'}
          {activeTab === 'leads' && 'Quản lý Leads'}
          {activeTab === 'reports' && 'Báo cáo Thống kê'}
          {activeTab === 'users' && 'Quản lý Nhân sự'}
          {activeTab === 'content' && 'Quản lý Nội dung'}
          {activeTab === 'settings' && 'Cài đặt Tài khoản'}
        </span>
      </div>

      {/* Center: Global Cross-Module Search Bar */}
      <div className="relative flex-1 max-w-lg mx-4 hidden sm:block" ref={searchContainerRef}>
        <div 
          onClick={() => {
            setIsSearchOpen(true);
            searchInputRef.current?.focus();
          }}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs transition-all cursor-text ${
            isSearchOpen 
              ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-md' 
              : 'bg-slate-100/70 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 text-slate-400'
          }`}
        >
          <Search size={16} className={isSearchOpen ? 'text-teal-600' : 'text-slate-400'} />
          <input
            ref={searchInputRef}
            type="text"
            value={globalQuery}
            onChange={(e) => {
              setGlobalQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Tìm nhanh xuyên module (Leads, Khách hàng, Báo cáo)..."
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs font-medium"
          />
          {globalQuery ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setGlobalQuery('');
              }} 
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X size={14} />
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-slate-400 shadow-2xs">
              <Command size={10} />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Command Palette Dropdown Search Results */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-2 max-h-[420px] overflow-y-auto">
            {/* Header Hint */}
            <div className="px-3 py-1.5 border-b border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              <span>Tìm kiếm tức thì xuyên hệ thống</span>
              <span>Dùng Ctrl + K để mở nhanh</span>
            </div>

            {/* Section 1: Modules / Navigation */}
            {searchResults.modules.length > 0 && (
              <div className="py-2">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chức năng & Module</p>
                <div className="space-y-0.5">
                  {searchResults.modules.map((mod) => {
                    const IconComp = mod.icon;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          setActiveTab(mod.id);
                          setIsSearchOpen(false);
                          setGlobalQuery('');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                          activeTab === mod.id ? 'bg-teal-50 text-teal-800 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 text-teal-600 shrink-0">
                          <IconComp size={16} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-semibold text-slate-800 leading-tight">{mod.label}</p>
                          <p className="text-[11px] text-slate-400 truncate">{mod.desc}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 2: Matched Leads */}
            {searchResults.leads.length > 0 && (
              <div className="py-2 border-t border-slate-100">
                <p className="px-3 text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Kết quả Khách hàng / Leads ({searchResults.leads.length})</p>
                <div className="space-y-0.5">
                  {searchResults.leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => {
                        setActiveTab('leads');
                        if (setSearchQuery) setSearchQuery(lead.full_name || '');
                        if (setSelectedLead) setSelectedLead(lead);
                        setIsSearchOpen(false);
                        setGlobalQuery('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-teal-50/70 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{lead.full_name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {lead.phone && <span className="flex items-center gap-1"><Phone size={11} /> {lead.phone}</span>}
                          {lead.destination && <span className="text-teal-700 font-medium">📍 {lead.destination}</span>}
                        </p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                        Xem chi tiết ➔
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchResults.modules.length === 0 && searchResults.leads.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Không tìm thấy kết quả nào phù hợp với "{globalQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Top Header Actions: Notification & Avatar */}
      <div className="flex items-center gap-3">
        
        {/* Role Impersonation Switcher (Only for Super Admin) */}
        {isSuperAdmin && (
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                viewAsRole && viewAsRole !== 'super_admin'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-amber-200 hover:bg-amber-600'
                  : 'bg-slate-100/80 text-slate-700 border-slate-200/80 hover:bg-slate-200/80 hover:text-teal-700'
              }`}
              title="Kiểm tra góc nhìn của các role khác"
            >
              <Eye size={16} className={viewAsRole && viewAsRole !== 'super_admin' ? 'animate-pulse text-white' : 'text-slate-500'} />
              <span className="hidden sm:inline">
                {`Góc nhìn: ${roleDisplayNames[viewAsRole || user?.role] || 'Super Admin'}`}
              </span>
              <ChevronDown size={14} className={viewAsRole && viewAsRole !== 'super_admin' ? 'text-white' : 'text-slate-400'} />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-200">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Góc nhìn Role (Giả lập)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Thử nghiệm giao diện các quyền khác</p>
                </div>
                
                <div className="space-y-1 py-1">
                  {Object.entries(roleFullLabels).map(([roleKey, roleLabel]) => {
                    const isSelected = (viewAsRole === roleKey) || (!viewAsRole && roleKey === 'super_admin');
                    return (
                      <button
                        key={roleKey}
                        onClick={() => {
                          setViewAsRole(roleKey === 'super_admin' ? null : roleKey);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 text-teal-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-teal-500' : 'bg-slate-300'}`}></span>
                          <span>{roleLabel}</span>
                        </div>
                        {isSelected && <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold">Đang bật</span>}
                      </button>
                    );
                  })}
                </div>

                {viewAsRole && viewAsRole !== 'super_admin' && (
                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setViewAsRole(null);
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-center py-1.5 text-xs text-amber-600 font-semibold hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                    >
                      ↺ Khôi phục về Super Admin
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notification Icon */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setShowRoleMenu(false);
            }}
            className="w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200/60 border border-slate-200/60 flex items-center justify-center text-slate-600 hover:text-teal-600 transition-all relative cursor-pointer"
            title="Thông báo"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-800">Thông báo hệ thống</h4>
                  {unreadCount > 0 && (
                    <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => setUnreadCount(0)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {mockNotifications.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                        <IconComp size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800">{item.title}</p>
                          <span className="text-[10px] text-slate-400">{item.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-medium">Hệ thống thông báo tự động Touris CRM</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 pl-2.5 rounded-2xl hover:bg-slate-100/80 border border-slate-200/60 transition-all cursor-pointer bg-white"
          >
            {/* Avatar Circle */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-sky-600 border border-teal-200 flex items-center justify-center text-white font-bold text-xs shadow-xs overflow-hidden shrink-0">
              {adminProfile?.avatar ? (
                <img src={adminProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{(adminProfile?.name || user?.name || 'A').charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Name & Role Text */}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {adminProfile?.name || user?.name || 'Admin'}
              </p>
              <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider mt-0.5">
                {roleDisplayNames[user?.role] || user?.role || 'Super Admin'}
              </p>
            </div>

            <ChevronDown size={14} className="text-slate-400 mr-1" />
          </button>

          {/* User Profile Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Profile Card Header */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                  {adminProfile?.avatar ? (
                    <img src={adminProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(adminProfile?.name || user?.name || 'A').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{adminProfile?.name || user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{adminProfile?.email || user?.email}</p>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-teal-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Settings size={16} className="text-slate-400" />
                  <span>Cài đặt tài khoản</span>
                </button>

                {user?.role === 'super_admin' && (
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-teal-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <UserCog size={16} className="text-slate-400" />
                    <span>Quản lý nhân sự</span>
                  </button>
                )}
              </div>

              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
