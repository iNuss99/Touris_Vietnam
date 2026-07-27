import React from 'react';
import { Download, RefreshCw, XCircle, Users, CheckCircle, Clock, Search, Filter, Eye, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { KpiCard, StatusBadge, CustomTooltip, STATUS_LABELS } from './SharedUI';

export default function LeadsView({
  leads,
  totalLeads,
  newLeads,
  inProgress,
  converted,
  destData,
  exportToCSV,
  fetchLeads,
  isLoading,
  error,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  destFilter,
  setDestFilter,
  uniqueDestinations,
  paginatedLeads,
  filteredLeads,
  currentPage,
  setCurrentPage,
  totalPages,
  ITEMS_PER_PAGE,
  setSelectedLead,
  sortConfig,
  setSortConfig
}) {
  const PIE_COLORS = ['#c9a84c', '#34d0be', '#3b82f6', '#8b5cf6', '#f59e0b', '#64748b'];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIndicator = ({ sortKey }) => {
    if (sortConfig.key !== sortKey) return <ArrowUpDown size={14} className="text-slate-300 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-teal-500 ml-1 inline" />
      : <ArrowDown size={14} className="text-teal-500 ml-1 inline" />;
  };

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-sans font-bold text-slate-800 mb-2">Tổng quan dữ liệu</h2>
          <p className="text-slate-500 text-sm font-light tracking-wide">Cập nhật và quản lý yêu cầu khách hàng mới nhất</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-sm font-medium text-slate-600 hover:text-slate-900 shadow-sm">
            <Download size={16} /> Xuất CSV
          </button>
          <button onClick={fetchLeads} className="flex items-center gap-2 px-5 py-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-xl transition-all text-sm font-medium shadow-sm">
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
          <XCircle size={18} /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <KpiCard title="Tổng số Lead" value={totalLeads} icon={<Users size={20} />} accent="#64748b" />
        <KpiCard title="Yêu cầu mới" value={newLeads} icon={<CheckCircle size={20} />} accent="#3b82f6" />
        <KpiCard title="Đang xử lý" value={inProgress} icon={<Clock size={20} />} accent="#fbbf24" />
        <KpiCard title="Thành công" value={converted} icon={<CheckCircle size={20} />} accent="#0d9488" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Chart 1: Destinations */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Top Điểm Đến</h3>
          <div className="h-[220px] w-full">
            {destData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={destData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {destData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {destData.slice(0,3).map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></span>
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Pipeline Status */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Tình Trạng Pipeline</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Mới', count: filteredLeads.filter(l => l.status === 'NEW').length, fill: '#3b82f6' },
                { name: 'Đang xử lý', count: filteredLeads.filter(l => l.status === 'IN_PROGRESS').length, fill: '#fbbf24' },
                { name: 'Thành công', count: filteredLeads.filter(l => l.status === 'CONVERTED').length, fill: '#34d0be' },
                { name: 'Hủy bỏ', count: filteredLeads.filter(l => l.status === 'LOST').length, fill: '#f87171' },
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl flex flex-col mb-12 shadow-sm">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm tên, SĐT, Email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-sm"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-40">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-teal-500 shadow-sm appearance-none cursor-pointer"
              >
                <option value="ALL">Mọi trạng thái</option>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full md:w-40">
              <select 
                value={destFilter}
                onChange={(e) => setDestFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-700 outline-none focus:border-teal-500 shadow-sm appearance-none cursor-pointer"
              >
                <option value="ALL">Mọi điểm đến</option>
                {uniqueDestinations.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-medium border-b border-slate-200">
              <tr>
                <th 
                  className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('submitted_at')}
                >
                  Khách hàng <SortIndicator sortKey="submitted_at" />
                </th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Chuyến đi</th>
                <th 
                  className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('score')}
                >
                  Chất lượng <SortIndicator sortKey="score" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer group hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Trạng thái <SortIndicator sortKey="status" />
                </th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw size={24} className="animate-spin mb-3 text-teal-500" />
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              ) : paginatedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 group-hover:text-teal-600 transition-colors">{lead.full_name}</div>
                    <div className="text-xs text-slate-400 mt-1 max-w-[200px] truncate" title={lead.message}>
                      {new Date(lead.submitted_at).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800">{lead.phone}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800 font-medium">{lead.destination || 'Chưa chọn'}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {lead.departure_date ? new Date(lead.departure_date).toLocaleDateString('vi-VN') : '-'} • {lead.guests || 1} khách
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {lead.grade === 'HOT' && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-semibold whitespace-nowrap">🔥 HOT</span>}
                      {lead.grade === 'WARM' && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-semibold whitespace-nowrap">⭐ WARM</span>}
                      {(!lead.grade || lead.grade === 'COLD') && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-semibold whitespace-nowrap">❄️ COLD</span>}
                      <span className="text-xs text-slate-500 font-medium">{lead.score || 0}đ</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedLead(lead)}
                      className="p-2 bg-slate-100 hover:bg-teal-50 text-slate-500 hover:text-teal-600 rounded-lg transition-all border border-transparent hover:border-teal-200"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm">
            <span className="text-slate-500">Hiển thị {(currentPage-1)*ITEMS_PER_PAGE + 1} - {Math.min(currentPage*ITEMS_PER_PAGE, filteredLeads.length)} trong {filteredLeads.length}</span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
