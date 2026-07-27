import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Mail, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://touris-vietnam-api.vercel.app';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', full_name: '', role: 'sales' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const roleLabels = {
    super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
    sales: { label: 'Kinh doanh', color: 'bg-blue-100 text-blue-700' },
    editor: { label: 'Biên tập viên', color: 'bg-orange-100 text-orange-700' },
    viewer: { label: 'Người xem', color: 'bg-slate-100 text-slate-700' }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể tải danh sách người dùng');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');
      
      setUsers([...users, data.user]);
      setShowModal(false);
      setFormData({ email: '', full_name: '', role: 'sales' });
      alert('Đã tạo tài khoản thành công! Mật khẩu đã được gửi qua email.');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error('Lỗi cập nhật quyền');
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const token = localStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Lỗi cập nhật trạng thái');
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.')) return;
    try {
      const token = localStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi khi xóa');
      }
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (user?.role !== 'super_admin') return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-sans text-slate-800">Quản lý nhân sự</h3>
          <p className="text-sm text-slate-500 mt-1">Thêm và phân quyền tài khoản truy cập CRM</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          Thêm nhân sự
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 text-slate-400">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-3 font-medium">Nhân sự</th>
                <th className="pb-3 font-medium">Vai trò (Role)</th>
                <th className="pb-3 font-medium">Trạng thái</th>
                <th className="pb-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{u.full_name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === user.id}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer appearance-none ${roleLabels[u.role]?.color || 'bg-slate-100 text-slate-700'}`}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="sales">Kinh doanh</option>
                      <option value="editor">Biên tập viên</option>
                      <option value="viewer">Người xem</option>
                    </select>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handleStatusToggle(u.id, u.status)}
                      disabled={u.id === user.id}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                        u.status === 'active' 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {u.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </button>
                  </td>
                  <td className="py-4 text-right">
                    {u.id !== user.id && (
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa tài khoản"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Thêm nhân sự mới</h3>
            <p className="text-sm text-slate-500 mb-6">Mật khẩu tạm thời sẽ được gửi tự động qua email.</p>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Họ và tên</label>
                <div className="relative">
                  <UserPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="nhanvien@touris.vn"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Vai trò (Role)</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 appearance-none"
                  >
                    <option value="sales">Kinh doanh (Quản lý leads)</option>
                    <option value="editor">Biên tập (Quản lý tour/bài viết)</option>
                    <option value="viewer">Người xem (Chỉ xem báo cáo)</option>
                    <option value="super_admin">Super Admin (Toàn quyền)</option>
                  </select>
                </div>
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
