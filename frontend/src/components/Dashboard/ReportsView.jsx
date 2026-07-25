import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { CustomTooltip } from './SharedUI';

export default function ReportsView({ totalLeads, converted, newLeads, inProgress, leads, leadsByDate }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Báo cáo & Phân tích</h2>
          <p className="text-white/40 text-sm font-light">Theo dõi xu hướng và hiệu suất chuyển đổi khách hàng</p>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <p className="text-[13px] font-medium text-white/50 uppercase tracking-wider mb-2">Tỉ lệ chuyển đổi (Lead to Customer)</p>
          <h4 className="text-3xl font-serif font-bold text-luxury-gold tracking-tight">
            {totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0}%
          </h4>
          <div className="mt-4 w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className="bg-luxury-gold h-full rounded-full" style={{ width: `${totalLeads > 0 ? (converted / totalLeads) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <p className="text-[13px] font-medium text-white/50 uppercase tracking-wider mb-2">Trung bình số khách / Booking</p>
          <h4 className="text-3xl font-serif font-bold text-luxury-emerald-light tracking-tight">
            {totalLeads > 0 ? (leads.reduce((sum, l) => sum + (l.guests || 1), 0) / totalLeads).toFixed(1) : 0}
          </h4>
          <p className="text-xs text-white/40 mt-4">Khách mỗi yêu cầu</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <p className="text-[13px] font-medium text-white/50 uppercase tracking-wider mb-2">Lượng khách hàng quan tâm</p>
          <h4 className="text-3xl font-serif font-bold text-blue-400 tracking-tight">
            {newLeads + inProgress}
          </h4>
          <p className="text-xs text-white/40 mt-4">Đang cần tư vấn</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-6">Xu hướng yêu cầu mới (Theo ngày)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={leadsByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} allowDecimals={false} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{stroke: 'rgba(255,255,255,0.1)'}} content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#c9a84c" strokeWidth={3} dot={{r: 4, fill: '#04080f', stroke: '#c9a84c', strokeWidth: 2}} activeDot={{r: 6}} name="Số lượng yêu cầu" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
