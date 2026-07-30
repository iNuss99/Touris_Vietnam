import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut, ShieldCheck, Sparkles, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopHeader({ adminProfile, setActiveTab, activeTab }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

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

  const roleLabels = {
    super_admin: 'Super Admin',
    sales: 'Kinh doanh',
    editor: 'Biên tập viên',
    viewer: 'Người xem'
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
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left Title / Tab Indicator */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
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

      {/* Right Top Header Actions: Notification & Avatar */}
      <div className="flex items-center gap-4">
        
        {/* Notification Icon */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
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
                {roleLabels[user?.role] || user?.role || 'Super Admin'}
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
