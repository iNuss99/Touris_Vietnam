import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Mail, Shield, CheckCircle, XCircle, Loader2, KeyRound, Copy, Check } from 'lucide-react';
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

  // Reset Password State
  const [resetResult, setResetResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Custom Confirmation Modal & Toast Notifications State
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null, user: null, loading: false });
  const [notification, setNotification] = useState(null);

  const roleLabels = {
    super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
    sales: { label: 'Kinh doanh', color: 'bg-blue-100 text-blue-700' },
    editor: { label: 'Biên tập viên', color: 'bg-orange-100 text-orange-700' },
    viewer: { label: 'Người xem', color: 'bg-slate-100 text-slate-700' }
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('touris_token');
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
      const token = sessionStorage.getItem('touris_token');
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
      setNotification({ type: 'success', message: 'Đã tạo tài khoản thành công! Mật khẩu đã được gửi qua email.' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = sessionStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error('Lỗi cập nhật quyền');
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setNotification({ type: 'success', message: 'Cập nhật vai trò thành công.' });
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const token = sessionStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Lỗi cập nhật trạng thái');
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      setNotification({ 
        type: 'success', 
        message: newStatus === 'active' ? 'Đã kích hoạt tài khoản.' : 'Đã khóa tài khoản.' 
      });
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Open Custom Confirmation Dialogs
  const triggerConfirmReset = (targetUser) => {
    setConfirmModal({ show: true, type: 'reset', user: targetUser, loading: false });
  };

  const triggerConfirmDelete = (targetUser) => {
    setConfirmModal({ show: true, type: 'delete', user: targetUser, loading: false });
  };

  // Execute Action from Custom Confirmation Dialog
  const handleExecuteConfirmAction = async () => {
    if (!confirmModal.user || !confirmModal.type) return;
    const targetUser = confirmModal.user;

    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
      const token = sessionStorage.getItem('touris_token');
      if (confirmModal.type === 'reset') {
        const res = await fetch(`${BACKEND_URL}/api/users/${targetUser.id}/reset-password`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra khi cấp lại mật khẩu');

        setConfirmModal({ show: false, type: null, user: null, loading: false });
        setResetResult({
          email: targetUser.email,
          fullName: targetUser.name || targetUser.full_name,
          tempPassword: data.tempPassword
        });
        setCopied(false);
      } else if (confirmModal.type === 'delete') {
        const res = await fetch(`${BACKEND_URL}/api/users/${targetUser.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Lỗi khi xóa tài khoản');
        }
        setUsers(users.filter(u => u.id !== targetUser.id));
        setConfirmModal({ show: false, type: null, user: null, loading: false });
        setNotification({ type: 'success', message: `Đã xóa tài khoản ${targetUser.email} thành công.` });
      }
    } catch (err) {
      setConfirmModal(prev => ({ ...prev, loading: false }));
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleCopyPassword = () => {
    if (resetResult?.tempPassword) {
      navigator.clipboard.writeText(resetResult.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => triggerConfirmReset(u)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Cấp lại mật khẩu"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button 
                          onClick={() => triggerConfirmDelete(u)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

      {/* Reset Password Result Modal */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4 mx-auto border border-amber-100">
              <KeyRound size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 text-center mb-1">Đã cấp lại mật khẩu thành công</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Mật khẩu mới đã được cập nhật cho tài khoản <strong className="text-slate-700">{resetResult.email}</strong> và gửi tự động qua email.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Mật khẩu tạm thời mới
              </label>
              <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-3">
                <span className="font-mono text-lg font-bold text-teal-700 tracking-wider">
                  {resetResult.tempPassword}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copied ? 'Đã chép!' : 'Sao chép'}
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setResetResult(null)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-colors cursor-pointer"
              >
                Đã xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto border ${
              confirmModal.type === 'reset' 
                ? 'bg-amber-50 text-amber-600 border-amber-100' 
                : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {confirmModal.type === 'reset' ? <KeyRound size={28} /> : <Trash2 size={28} />}
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
              {confirmModal.type === 'reset' ? 'Xác nhận cấp lại mật khẩu' : 'Xác nhận xóa tài khoản'}
            </h3>
            
            <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
              {confirmModal.type === 'reset' ? (
                <>Bạn có chắc chắn muốn cấp lại mật khẩu cho tài khoản <strong className="text-slate-800 font-semibold">{confirmModal.user?.email}</strong>? Mật khẩu tạm mới sẽ được khởi tạo và gửi qua email.</>
              ) : (
                <>Hành động này <strong className="text-red-600 font-semibold">không thể hoàn tác</strong>. Bạn có chắc muốn xóa vĩnh viễn tài khoản <strong className="text-slate-800 font-semibold">{confirmModal.user?.email}</strong>?</>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={confirmModal.loading}
                onClick={() => setConfirmModal({ show: false, type: null, user: null, loading: false })}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={confirmModal.loading}
                onClick={handleExecuteConfirmAction}
                className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                  confirmModal.type === 'reset'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
              >
                {confirmModal.loading && <Loader2 size={16} className="animate-spin" />}
                {confirmModal.type === 'reset' ? 'Cấp lại ngay' : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${
            notification.type === 'success' 
              ? 'bg-slate-900 text-emerald-400 border-slate-800' 
              : 'bg-slate-900 text-red-400 border-slate-800'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="text-slate-100">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
