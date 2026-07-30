import React, { useRef } from 'react';
import { Save, LogOut, Upload, Camera, Trash2, User, Key } from 'lucide-react';

export default function SettingsView({ adminProfile, setAdminProfile, handleLogout }) {
  const fileInputRef = useRef(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setAdminProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAdminProfile(prev => ({ ...prev, avatar: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    // The Dashboard component automatically saves to localStorage via useEffect
    alert('Đã lưu thông tin hồ sơ (Local Storage)');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Hidden file input for device image upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-sans text-slate-800 tracking-tight mb-2">Cài đặt hệ thống</h2>
          <p className="text-slate-500 text-sm">Quản lý tài khoản và cấu hình CRM.</p>
        </div>
      </div>

      {/* Unified Single Card Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Top Header Row inside Card: Profile Summary & Logout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-sky-500 flex items-center justify-center text-2xl font-sans font-bold text-white shadow-md overflow-hidden relative group cursor-pointer border-2 border-slate-100 hover:border-teal-400 transition-all shrink-0"
              title="Bấm để tải ảnh từ máy"
            >
              {adminProfile.avatar ? (
                <img src={adminProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] gap-0.5 font-normal">
                <Camera size={16} />
                <span>Tải ảnh</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-sans font-bold text-slate-800">{adminProfile.name || 'Admin'}</h3>
              <p className="text-slate-500 text-xs">{adminProfile.email || 'admin@touris.vn'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors font-medium text-xs shadow-xs cursor-pointer"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* Horizontal 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Column 1: Thông tin hồ sơ */}
          <div className="space-y-5">
            <h3 className="text-lg font-sans font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User size={18} className="text-teal-600" />
              <span>Thông tin hồ sơ</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">Họ và tên</label>
                <input 
                  type="text" 
                  name="name"
                  value={adminProfile.name}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                  placeholder="Nhập họ tên"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">Số điện thoại</label>
                <input 
                  type="text" 
                  name="phone"
                  value={adminProfile.phone || ''}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                  placeholder="Nhập SĐT"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">Email liên hệ</label>
              <input 
                type="email" 
                name="email"
                value={adminProfile.email}
                onChange={handleProfileChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                placeholder="admin@touris.vn"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">Ảnh đại diện (Avatar)</label>
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                >
                  <Upload size={15} className="text-teal-600" />
                  Chọn ảnh
                </button>

                <div className="relative flex-1">
                  <input 
                    type="text" 
                    name="avatar"
                    value={adminProfile.avatar || ''}
                    onChange={handleProfileChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-xs shadow-sm pr-8"
                    placeholder="Dán URL ảnh"
                  />
                  {adminProfile.avatar && (
                    <button
                      type="button"
                      onClick={() => setAdminProfile(prev => ({ ...prev, avatar: '' }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">Ngôn ngữ</label>
              <select 
                name="language"
                value={adminProfile.language || 'vi'}
                onChange={handleProfileChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm appearance-none shadow-sm cursor-pointer"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                className="bg-teal-600 text-white px-5 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-teal-700 transition-colors text-xs shadow-sm cursor-pointer"
              >
                <Save size={16} />
                Lưu thay đổi
              </button>
            </div>
          </div>

          {/* Column 2: Đổi mật khẩu */}
          <div className="space-y-5 lg:border-l lg:border-slate-100 lg:pl-8">
            <h3 className="text-lg font-sans font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Key size={18} className="text-teal-600" />
              <span>Đổi mật khẩu</span>
            </h3>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">Mật khẩu mới</label>
              <input 
                type="password" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-1.5">Xác nhận mật khẩu</label>
              <input 
                type="password" 
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button className="bg-slate-100 text-slate-700 border border-slate-200 px-5 py-2 rounded-xl font-medium hover:bg-slate-200 transition-colors text-xs shadow-sm cursor-pointer">
                Cập nhật mật khẩu
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
