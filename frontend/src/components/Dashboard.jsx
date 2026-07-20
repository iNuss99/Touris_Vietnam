import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, CheckCircle, Clock, XCircle, ArrowLeft, RefreshCw, PieChart as PieChartIcon, 
  Settings, Search, Filter, Eye, ChevronLeft, ChevronRight, X, Download, MessageSquare, Briefcase, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://touris-vietnam-api.vercel.app';

const STATUS_COLORS = {
  'NEW': { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' }, // Blue
  'IN_PROGRESS': { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' }, // Amber
  'CONVERTED': { bg: 'rgba(15, 157, 138, 0.1)', text: '#34d0be', border: 'rgba(15, 157, 138, 0.3)' }, // Emerald
  'LOST': { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' } // Red
};

const STATUS_LABELS = {
  'NEW': 'Mới',
  'IN_PROGRESS': 'Đang xử lý',
  'CONVERTED': 'Thành công',
  'LOST': 'Hủy bỏ'
};

const ITEMS_PER_PAGE = 8;

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States cho Filter, Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [destFilter, setDestFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  
  // State cho Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State cho Sidebar Tabs
  const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'reports', 'settings'

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/leads`);
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/leads/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + err.message);
    }
  };

  // Lấy danh sách điểm đến duy nhất cho Filter
  const uniqueDestinations = useMemo(() => {
    const dests = new Set(leads.map(l => l.destination).filter(Boolean));
    return Array.from(dests);
  }, [leads]);

  // Xử lý Lọc & Tìm kiếm
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = (lead.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (lead.phone?.includes(searchQuery)) ||
                            (lead.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const matchesDest = destFilter === 'ALL' || lead.destination === destFilter;
      
      return matchesSearch && matchesStatus && matchesDest;
    });
  }, [leads, searchQuery, statusFilter, destFilter]);

  // Reset trang về 1 khi đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, destFilter]);

  // Xử lý Phân trang
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Họ Tên', 'SĐT', 'Email', 'Điểm đến', 'Ngày đi', 'Số khách', 'Hạng dịch vụ', 'Lời nhắn', 'Ngày gửi', 'Trạng thái'];
    const rows = filteredLeads.map(l => [
      l.id, `"${l.full_name}"`, `"${l.phone}"`, l.email, `"${l.destination || ''}"`,
      l.departure_date ? new Date(l.departure_date).toLocaleDateString() : '',
      l.guests, l.service_class, `"${l.message ? l.message.replace(/"/g, '""') : ''}"`,
      new Date(l.submitted_at).toLocaleString('vi-VN'),
      STATUS_LABELS[l.status] || l.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'NEW').length;
  const inProgress = leads.filter(l => l.status === 'IN_PROGRESS').length;
  const converted = leads.filter(l => l.status === 'CONVERTED').length;

  // Chart Data: Leads by Destination
  const destData = useMemo(() => {
    const counts = {};
    leads.forEach(l => {
      const dest = l.destination || 'Khác';
      counts[dest] = (counts[dest] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).sort((a,b) => b.value - a.value).slice(0,5);
  }, [leads]);

  // Luxury Chart Colors
  const PIE_COLORS = ['#c9a84c', '#34d0be', '#3b82f6', '#8b5cf6', '#f59e0b', '#64748b'];

  return (
    <div className="min-h-screen font-sans flex relative overflow-hidden" style={{ background: '#04080f', color: '#e8e4d8' }}>
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-luxury-emerald/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar */}
      <aside className={`transition-all duration-300 ease-in-out border-r border-white/5 bg-white/[0.01] backdrop-blur-md z-10 flex flex-col h-screen sticky top-0 ${isSidebarOpen ? 'w-64 p-6' : 'w-20 p-4 items-center'}`}>
        <div className="mb-10 w-full">
          <Link to="/" className={`inline-flex items-center text-white/40 hover:text-white transition-colors text-sm mb-8 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <ArrowLeft size={16} className={isSidebarOpen ? "mr-2" : ""} />
            {isSidebarOpen && "Trang chủ"}
          </Link>
          <div className={`flex items-center ${!isSidebarOpen && 'justify-center'} gap-3`}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-luxury-gold to-luxury-gold-dim flex items-center justify-center shrink-0">
              <span className="font-serif font-bold text-black text-sm">V</span>
            </div>
            {isSidebarOpen && <h1 className="text-xl font-serif font-bold text-white tracking-wide">Touris CRM</h1>}
          </div>
        </div>

        <nav className="flex-1 space-y-2 w-full">
          <NavItem icon={<Users size={18} />} label="Quản lý Leads" active={activeTab === 'leads'} isOpen={isSidebarOpen} onClick={() => setActiveTab('leads')} />
          <NavItem icon={<PieChartIcon size={18} />} label="Báo cáo" active={activeTab === 'reports'} isOpen={isSidebarOpen} onClick={() => setActiveTab('reports')} />
          <NavItem icon={<Settings size={18} />} label="Cài đặt" active={activeTab === 'settings'} isOpen={isSidebarOpen} onClick={() => setActiveTab('settings')} />
        </nav>

        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-20 w-6 h-6 bg-luxury-dark border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-luxury-gold transition-colors z-20">
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="mt-auto pt-6 border-t border-white/5 w-full">
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'} text-white/50 cursor-pointer hover:text-white transition-colors`}>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">AD</span>
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Administrator</p>
                <p className="text-[11px] truncate uppercase tracking-wider">admin@touris.vn</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative z-0">
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
          {activeTab === 'leads' && (
            <>
              {/* Header Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-2">Tổng quan dữ liệu</h2>
                  <p className="text-white/40 text-sm font-light tracking-wide">Cập nhật và quản lý yêu cầu khách hàng mới nhất</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all text-sm font-medium text-white/80 hover:text-white">
                    <Download size={16} /> Xuất CSV
                  </button>
                  <button onClick={fetchLeads} className="flex items-center gap-2 px-5 py-2.5 bg-luxury-emerald/10 hover:bg-luxury-emerald/20 border border-luxury-emerald/30 text-luxury-emerald-light rounded-xl transition-all text-sm font-medium shadow-[0_0_15px_rgba(15,157,138,0.1)]">
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
                <KpiCard title="Tổng số Lead" value={totalLeads} icon={<Users size={20} />} accent="rgba(255,255,255,0.2)" />
                <KpiCard title="Yêu cầu mới" value={newLeads} icon={<CheckCircle size={20} />} accent="#3b82f6" />
                <KpiCard title="Đang xử lý" value={inProgress} icon={<Clock size={20} />} accent="#fbbf24" />
                <KpiCard title="Thành công" value={converted} icon={<CheckCircle size={20} />} accent="#34d0be" />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Chart 1: Destinations */}
                <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-luxury-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-6">Top Điểm Đến</h3>
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
                      <div className="h-full flex items-center justify-center text-white/20 text-sm">Chưa có dữ liệu</div>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {destData.slice(0,3).map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-white/50">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></span>
                        {d.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2: Pipeline Status */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-luxury-emerald/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-6">Tình Trạng Pipeline</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Mới', count: newLeads, fill: '#3b82f6' },
                        { name: 'Đang xử lý', count: inProgress, fill: '#fbbf24' },
                        { name: 'Thành công', count: converted, fill: '#34d0be' },
                        { name: 'Hủy bỏ', count: leads.filter(l => l.status === 'LOST').length, fill: '#f87171' },
                      ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} allowDecimals={false} axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Data Table Section */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-sm flex flex-col mb-12">
                
                {/* Toolbar */}
                <div className="p-5 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01] rounded-t-2xl">
                  <div className="relative w-full md:w-80">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input 
                      type="text" 
                      placeholder="Tìm tên, SĐT, Email..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/50 transition-all"
                    />
                  </div>

                  <div className="flex w-full md:w-auto items-center gap-3">
                    <div className="relative w-full md:w-40">
                      <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-8 text-sm text-white outline-none focus:border-luxury-gold appearance-none cursor-pointer"
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
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none focus:border-luxury-gold appearance-none cursor-pointer"
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
                    <thead className="bg-white/[0.01] text-white/40 text-[11px] uppercase tracking-wider font-medium border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4">Khách hàng</th>
                        <th className="px-6 py-4">Liên hệ</th>
                        <th className="px-6 py-4">Chuyến đi</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-16 text-center text-white/40">
                            <div className="flex flex-col items-center justify-center">
                              <RefreshCw size={24} className="animate-spin mb-3 text-luxury-gold/50" />
                              <p>Đang tải dữ liệu...</p>
                            </div>
                          </td>
                        </tr>
                      ) : paginatedLeads.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-16 text-center text-white/40">
                            Không tìm thấy dữ liệu phù hợp
                          </td>
                        </tr>
                      ) : paginatedLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-medium text-white group-hover:text-luxury-gold-light transition-colors">{lead.full_name}</div>
                            <div className="text-xs text-white/40 mt-1 max-w-[200px] truncate" title={lead.message}>
                              {new Date(lead.submitted_at).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white/90">{lead.phone}</div>
                            <div className="text-white/40 text-xs mt-0.5">{lead.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white/90 font-medium">{lead.destination || 'Chưa chọn'}</div>
                            <div className="text-white/40 text-xs mt-0.5">
                              {lead.departure_date ? new Date(lead.departure_date).toLocaleDateString('vi-VN') : '-'} • {lead.guests || 1} khách
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={lead.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedLead(lead)}
                              className="p-2 bg-white/5 hover:bg-luxury-gold/20 text-white/50 hover:text-luxury-gold rounded-lg transition-all border border-transparent hover:border-luxury-gold/30"
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
                  <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm">
                    <span className="text-white/40">Hiển thị {(currentPage-1)*ITEMS_PER_PAGE + 1} - {Math.min(currentPage*ITEMS_PER_PAGE, filteredLeads.length)} trong {filteredLeads.length}</span>
                    <div className="flex gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'reports' && (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <PieChartIcon size={64} className="text-white/10 mb-6" />
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Báo cáo & Phân tích</h2>
              <p className="text-white/40 text-sm">Tính năng này đang được phát triển và sẽ sớm ra mắt.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <Settings size={64} className="text-white/10 mb-6" />
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Cài đặt hệ thống</h2>
              <p className="text-white/40 text-sm">Tính năng này đang được phát triển và sẽ sớm ra mắt.</p>
            </div>
          )}
        </div>
      </main>

      {/* Lead Details Modal */}
      {selectedLead && (
        <LeadDetailsModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onStatusChange={handleStatusChange} 
        />
      )}
    </div>
  );
}

// ─── Sub Components ─────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, isOpen, onClick }) {
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-gradient-to-r from-luxury-gold/10 to-transparent text-luxury-gold-light border-l-2 border-luxury-gold' 
             : 'text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
    } ${!isOpen && 'justify-center px-0'}`}>
      {icon}
      {isOpen && <span className="font-medium text-sm">{label}</span>}
    </a>
  );
}

function KpiCard({ title, value, icon, accent }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 group-hover:opacity-20" style={{ color: accent }}>
        {React.cloneElement(icon, { size: 60 })}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
            {icon}
          </div>
          <p className="text-[13px] font-medium text-white/50 uppercase tracking-wider">{title}</p>
        </div>
        <h4 className="text-3xl font-serif font-bold text-white tracking-tight">{value}</h4>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full opacity-50" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const config = STATUS_COLORS[status || 'NEW'];
  const label = STATUS_LABELS[status || 'NEW'];
  
  return (
    <span 
      className="px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide inline-flex items-center gap-1.5 border"
      style={{ backgroundColor: config.bg, color: config.text, borderColor: config.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: config.text, boxShadow: `0 0 5px ${config.text}` }}></span>
      {label}
    </span>
  );
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a1423]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{payload[0].name}</p>
        <p className="text-white font-serif text-lg font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}

// ─── Modal Chi tiết Lead ────────────────────────────────────────────────────────

function LeadDetailsModal({ lead, onClose, onStatusChange }) {
  // Đóng modal khi bấm phím Escape
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
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#0a1120] border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.01] rounded-t-2xl">
          <div>
            <h3 className="text-xl font-serif font-bold text-white">Chi tiết yêu cầu</h3>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">ID: VNT-{lead.id.toString().padStart(4, '0')} • {new Date(lead.submitted_at).toLocaleString('vi-VN')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/50">Trạng thái hiện tại:</span>
              <StatusBadge status={lead.status} />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm text-white/50 hidden sm:block">Đổi trạng thái:</span>
              <select
                value={lead.status || 'NEW'}
                onChange={(e) => onStatusChange(lead.id, e.target.value)}
                className="w-full sm:w-auto bg-black border border-white/10 focus:border-luxury-gold rounded-lg px-3 py-2 text-sm font-medium outline-none cursor-pointer transition-colors"
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
              <h4 className="text-xs font-semibold text-luxury-gold uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                <Users size={14} /> Thông tin khách hàng
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">Họ và tên</label>
                  <p className="text-white font-medium text-sm">{lead.full_name}</p>
                </div>
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">Điện thoại / Zalo</label>
                  <p className="text-white font-medium text-sm">{lead.phone}</p>
                </div>
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">Email</label>
                  <p className="text-white font-medium text-sm">{lead.email}</p>
                </div>
              </div>
            </div>

            {/* Cột 2: Thông tin Tour */}
            <div className="space-y-5">
              <h4 className="text-xs font-semibold text-luxury-emerald-light uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                <Briefcase size={14} /> Yêu cầu dịch vụ
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">Điểm đến</label>
                  <p className="text-white font-medium text-sm">{lead.destination || 'Chưa xác định'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">Ngày đi</label>
                    <p className="text-white font-medium text-sm flex items-center gap-1.5">
                      <Calendar size={13} className="text-white/30" /> 
                      {lead.departure_date ? new Date(lead.departure_date).toLocaleDateString('vi-VN') : 'Đang linh động'}
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">Số lượng</label>
                    <p className="text-white font-medium text-sm">{lead.guests || 1} khách</p>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">Hạng dịch vụ</label>
                  <p className="text-white font-medium text-sm">{lead.service_class || 'Standard'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lời nhắn */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest flex items-center gap-2 mb-3">
              <MessageSquare size={14} /> Lời nhắn / Yêu cầu đặc biệt
            </h4>
            <div className="bg-black/30 border border-white/5 rounded-xl p-4 min-h-[100px]">
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {lead.message || <span className="text-white/20 italic">Khách hàng không để lại lời nhắn.</span>}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
