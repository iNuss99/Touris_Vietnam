import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Activity, AlertCircle, ArrowUpRight, ArrowDownRight, 
  Sparkles, RefreshCw, ArrowUp, ArrowDown, ChevronDown, ChevronUp 
} from 'lucide-react';

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444'];
const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'https://touris-vietnam-api.vercel.app';
const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_BASE}/api`;

const StatCard = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-teal-600 border border-slate-100">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
          {trend >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
    <div className="text-2xl font-bold text-slate-800 tracking-tight">{value}</div>
    {subtext && <p className="text-slate-400 text-xs mt-2 font-medium">{subtext}</p>}
  </div>
);

export default function CeoDashboardView() {
  const [timeFilter, setTimeFilter] = useState('year'); // 'month', 'quarter', 'year'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (Cao -> Thấp), 'asc' (Thấp -> Cao)
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'THÀNH CÔNG', 'ĐANG ĐÀM PHÁN', 'MỚI'
  const [showAllDeals, setShowAllDeals] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);

  const fetchCeoData = async (period = timeFilter) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/ceo/stats?period=${period}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setStatsData(data);
      } else {
        throw new Error(data.error || 'Failed to load CEO stats');
      }
    } catch (err) {
      console.error('Error fetching CEO stats:', err);
      setError(`Không thể kết nối máy chủ backend (${API_URL}). Vui lòng thử lại sau hoặc liên hệ quản trị viên.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCeoData(timeFilter);
  }, [timeFilter]);

  // Compute processed deals with Sorting & Filtering
  const processedDeals = useMemo(() => {
    if (!statsData?.topDeals) return [];
    let list = [...statsData.topDeals];

    // Status Filter
    if (statusFilter !== 'ALL') {
      list = list.filter(d => d.status === statusFilter);
    }

    // Sort by Value (rawValue)
    list.sort((a, b) => {
      return sortOrder === 'desc' 
        ? b.rawValue - a.rawValue 
        : a.rawValue - b.rawValue;
    });

    return list;
  }, [statsData?.topDeals, sortOrder, statusFilter]);

  // Slice visible deals based on showAllDeals toggle
  const visibleDeals = useMemo(() => {
    return showAllDeals ? processedDeals : processedDeals.slice(0, 8);
  }, [processedDeals, showAllDeals]);

  const formatMoneyUnit = (valInVnd) => {
    if (!valInVnd || valInVnd === 0) return '0 VNĐ';
    if (valInVnd >= 1000000000) {
      const inBillions = valInVnd / 1000000000;
      return inBillions.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 3 }) + ' Tỷ';
    }
    if (valInVnd >= 1000000) {
      const inMillions = valInVnd / 1000000;
      return inMillions.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' Triệu';
    }
    return valInVnd.toLocaleString('vi-VN') + ' VNĐ';
  };

  const totalRevFormatted = statsData?.stats ? formatMoneyUnit(statsData.stats.totalRevenue) : '0 VNĐ';
  const cashflowFormatted = statsData?.stats ? formatMoneyUnit(statsData.stats.actualCashflow) : '0 VNĐ';
  const pendingARFormatted = statsData?.stats ? formatMoneyUnit(statsData.stats.pendingAR) : '0 VNĐ';

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bảng Điều Khiển CEO</h2>
            <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
              Live DB Synced (PostgreSQL)
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Tổng quan tài chính & hiệu suất kinh doanh chiến lược thời gian thực.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchCeoData(timeFilter)}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-teal-600" : "text-teal-600"} />
            Làm mới dữ liệu
          </button>
          
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { id: 'month', label: 'Tháng này' },
              { id: 'quarter', label: 'Quý này' },
              { id: 'year', label: 'Năm nay' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setTimeFilter(item.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${timeFilter === item.id ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          <button 
            onClick={() => fetchCeoData(timeFilter)}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh Thu Ước Tính" 
          value={totalRevFormatted} 
          subtext={`Từ ${statsData?.stats?.totalLeads || 0} Yêu cầu/Leads thực tế`} 
          icon={TrendingUp} 
          trend={12.5} 
        />
        <StatCard 
          title="Dòng Tiền Thực Thu" 
          value={cashflowFormatted} 
          subtext="Các Hợp đồng đã chốt thành công" 
          icon={DollarSign} 
          trend={8.2} 
        />
        <StatCard 
          title="Biên Lợi Nhuận Gộp" 
          value={`${statsData?.stats?.profitMargin || 24.5}%`} 
          subtext="Dự kiến theo định mức Tour" 
          icon={Activity} 
          trend={1.2} 
        />
        <StatCard 
          title="Công Nợ / HĐ Đang Đàm Phán" 
          value={pendingARFormatted} 
          subtext="Giá trị các Deal tiềm năng cao" 
          icon={AlertCircle} 
          trend={-5.4} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Financial Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Doanh Thu & Dòng Tiền Theo Kỳ (Triệu VNĐ)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cập nhật tự động từ CSDL Neon DB - Bộ lọc: <span className="font-semibold text-teal-600 uppercase">{timeFilter}</span></p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={statsData?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Doanh Thu Dự Kiến" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line type="monotone" dataKey="cashflow" name="Dòng Tiền Thực Thu" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Cơ Cấu Chi Phí & Lợi Nhuận</h3>
          <p className="text-xs text-slate-400 mb-4">Ước tính tỷ trọng theo quy mô doanh thu</p>
          <div className="flex-1 min-h-[260px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsData?.expenseData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {(statsData?.expenseData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 500 }}
                  formatter={(val) => [`${val} Triệu VNĐ`, 'Giá trị']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tổng Quy Mô</span>
              <span className="text-xl font-bold text-slate-800 mt-0.5">{formatMoneyUnit(statsData?.stats?.totalRevenue || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced High Value Deals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        {/* Table Controls Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Danh Sách Cơ Hội & Dòng Tiền Hợp Đồng</h3>
              <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {processedDeals.length} Deals
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Dữ liệu tiền thực tế từ CSDL PostgreSQL (Neon DB)</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter Tabs */}
            <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-medium border border-slate-200">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'THÀNH CÔNG', label: 'Thành công' },
                { id: 'ĐANG ĐÀM PHÁN', label: 'Đang đàm phán' },
                { id: 'MỚI', label: 'Mới' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setStatusFilter(t.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === t.id ? 'bg-white text-teal-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sort Toggle Button */}
            <button
              onClick={toggleSort}
              className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Nhấp để đổi kiểu sắp xếp Cao/Thấp"
            >
              {sortOrder === 'desc' ? (
                <>
                  <ArrowDown size={14} className="text-teal-600" />
                  <span>Giá trị: Cao ➔ Thấp</span>
                </>
              ) : (
                <>
                  <ArrowUp size={14} className="text-amber-600" />
                  <span>Giá trị: Thấp ➔ Cao</span>
                </>
              )}
            </button>

            {/* Expand / Collapse All Deals Button */}
            <button
              onClick={() => setShowAllDeals(prev => !prev)}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {showAllDeals ? (
                <>
                  <ChevronUp size={14} />
                  <span>Thu gọn (8 Deals)</span>
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  <span>Xem tất cả ({processedDeals.length} Deals)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className={`overflow-x-auto ${showAllDeals ? 'max-h-[550px] overflow-y-auto' : ''}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-400 font-medium border-b border-slate-100 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px]">Khách hàng / Doanh nghiệp</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px]">Điểm đến / Tour</th>
                
                {/* Clickable Sortable Header */}
                <th 
                  onClick={toggleSort} 
                  className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px] cursor-pointer hover:text-teal-700 select-none group"
                >
                  <div className="flex items-center gap-1">
                    <span>Giá trị ước tính (VNĐ)</span>
                    {sortOrder === 'desc' ? (
                      <ArrowDown size={13} className="text-teal-600 font-bold" />
                    ) : (
                      <ArrowUp size={13} className="text-amber-600 font-bold" />
                    )}
                  </div>
                </th>

                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px]">Trạng thái</th>
                <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px]">Xác suất chốt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleDeals.length > 0 ? (
                visibleDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800">{deal.customer}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs">{deal.destination}</td>
                    <td className="py-4 px-6 font-bold text-teal-700">{deal.value}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${
                        deal.status === 'THÀNH CÔNG' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        deal.status === 'ĐANG ĐÀM PHÁN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-700 w-10 text-xs">{deal.prob}</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full" 
                            style={{ width: deal.prob }} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    Không tìm thấy Hợp đồng/Deal nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>Đang hiển thị {visibleDeals.length} / {processedDeals.length} Deals</span>
          <button 
            onClick={() => setShowAllDeals(prev => !prev)}
            className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
          >
            {showAllDeals ? 'Thu gọn' : `Xem tất cả ${processedDeals.length} Deals ➔`}
          </button>
        </div>
      </div>

    </div>
  );
}
