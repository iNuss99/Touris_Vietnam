import React, { useEffect } from 'react';
import { X, Users, Briefcase, Calendar, MessageSquare } from 'lucide-react';
import { StatusBadge, STATUS_COLORS, STATUS_LABELS } from './SharedUI';

export default function LeadDetailsModal({ lead, onClose, onStatusChange }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-sans font-bold text-slate-800">Chi tiết yêu cầu</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">ID: VNT-{lead.id.toString().padStart(4, '0')} • {new Date(lead.submitted_at).toLocaleString('vi-VN')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Trạng thái hiện tại:</span>
              <StatusBadge status={lead.status} />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm text-slate-500 hidden sm:block">Đổi trạng thái:</span>
              <select
                value={lead.status || 'NEW'}
                onChange={(e) => onStatusChange(lead.id, e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 rounded-lg px-3 py-2 text-sm font-medium outline-none cursor-pointer transition-all shadow-sm"
                style={{ color: STATUS_COLORS[lead.status || 'NEW'].text }}
              >
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột 1: Thông tin khách */}
            <div className="space-y-5">
              <h4 className="text-xs font-semibold text-teal-600 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-2">
                <Users size={14} /> Thông tin khách hàng
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Họ và tên</label>
                  <p className="text-slate-800 font-medium text-sm">{lead.full_name}</p>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Điện thoại / Zalo</label>
                  <p className="text-slate-800 font-medium text-sm">{lead.phone}</p>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                  <p className="text-slate-800 font-medium text-sm">{lead.email}</p>
                </div>
              </div>
            </div>

            {/* Cột 2: Thông tin Tour */}
            <div className="space-y-5">
              <h4 className="text-xs font-semibold text-sky-600 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-2">
                <Briefcase size={14} /> Yêu cầu dịch vụ
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Điểm đến</label>
                  <p className="text-slate-800 font-medium text-sm">{lead.destination || 'Chưa xác định'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Ngày đi</label>
                    <p className="text-slate-800 font-medium text-sm flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" /> 
                      {lead.departure_date ? new Date(lead.departure_date).toLocaleDateString('vi-VN') : 'Đang linh động'}
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Số lượng</label>
                    <p className="text-slate-800 font-medium text-sm">{lead.guests || 1} khách</p>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Hạng dịch vụ</label>
                  <p className="text-slate-800 font-medium text-sm">{lead.service_class || 'Standard'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lời nhắn */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-2 mb-3">
              <MessageSquare size={14} /> Lời nhắn / Yêu cầu đặc biệt
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[100px] shadow-inner">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {lead.message || <span className="text-slate-400 italic">Khách hàng không để lại lời nhắn.</span>}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
