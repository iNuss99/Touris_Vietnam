import React from 'react';
import { Save, LogOut } from 'lucide-react';
import UserManagement from './UserManagement';

export default function SettingsView({ adminProfile, setAdminProfile, handleLogout }) {
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setAdminProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    // The Dashboard component automatically saves to localStorage via useEffect
    alert('Đã lưu thông tin hồ sơ (Local Storage)');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-sans text-slate-800 tracking-tight mb-2">Cài đặt hệ thống</h2>
          <p className="text-slate-500 text-sm">Quản lý tài khoản và cấu hình CRM.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-sky-500 mx-auto mb-4 flex items-center justify-center text-3xl font-sans font-bold text-white shadow-lg overflow-hidden">
              {adminProfile.avatar ? (
                <img src={adminProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'
              )}
            </div>
            <h3 className="text-lg font-sans text-slate-800 mb-1">{adminProfile.name || 'Admin'}</h3>
            <p className="text-slate-500 text-sm">{adminProfile.email || 'admin@touris.vn'}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-sans text-slate-800 mb-6 border-b border-slate-200 pb-4">Thông tin hồ sơ</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Họ và tên</label>
                  <input 
                    type="text" 
                    name="name"
                    value={adminProfile.name}
                    onChange={handleProfileChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Số điện thoại</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={adminProfile.phone || ''}
                    onChange={handleProfileChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                    placeholder="Nhập SĐT"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Email liên hệ</label>
                <input 
                  type="email" 
                  name="email"
                  value={adminProfile.email}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                  placeholder="admin@touris.vn"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Avatar URL (Link ảnh)</label>
                <input 
                  type="text" 
                  name="avatar"
                  value={adminProfile.avatar || ''}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Ngôn ngữ</label>
                <select 
                  name="language"
                  value={adminProfile.language || 'vi'}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm appearance-none shadow-sm cursor-pointer"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-teal-700 transition-colors text-sm shadow-sm"
                >
                  <Save size={18} />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-sans text-slate-800 mb-6 border-b border-slate-200 pb-4">Đổi mật khẩu</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Xác nhận mật khẩu</label>
                  <input 
                    type="password" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="bg-slate-100 text-slate-700 border border-slate-200 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm shadow-sm">
                  Cập nhật mật khẩu
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-sans text-slate-800 mb-6 border-b border-slate-200 pb-4">Thông báo</h3>
            <div className="space-y-4">
              {[
                { id: 'notif-1', label: 'Email khi có khách hàng mới (Lead mới)' },
                { id: 'notif-2', label: 'Cảnh báo Lead chưa xử lý quá 24h' },
                { id: 'notif-3', label: 'Báo cáo tổng kết hàng tuần' }
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" defaultChecked={idx === 0} />
                    <div className="w-10 h-6 bg-slate-200 rounded-full transition-colors peer-checked:bg-teal-500"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform translate-x-0 peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <UserManagement />
        </div>
      </div>
    </div>
  );
}
