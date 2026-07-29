import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { 
  Sparkles, RefreshCw, Calendar, Users, Target, Activity, 
  Flame, ShieldAlert, Award, Search, X, CheckCircle2, ChevronRight,
  TrendingUp, ArrowUpRight, Filter, Eye
} from 'lucide-react';
import { CustomTooltip, StatusBadge, normalizeStatus } from './SharedUI';

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#c026d3'];
const GRADE_COLORS = { 'HOT': '#ef4444', 'WARM': '#f59e0b', 'COLD': '#94a3b8' };
const GRADE_BG = { 
  'HOT': 'bg-red-50 text-red-600 border-red-200', 
  'WARM': 'bg-amber-50 text-amber-600 border-amber-200', 
  'COLD': 'bg-slate-100 text-slate-600 border-slate-200' 
};

// Status Helper Functions for Robust Sync
const isConvertedStatus = (status) => normalizeStatus(status) === 'CONVERTED';
const isInProgressStatus = (status) => normalizeStatus(status) === 'IN_PROGRESS';
const isNewStatus = (status) => normalizeStatus(status) === 'NEW';

export default function ReportsView({ leads = [], fetchLeads }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState('ALL');
  
  // Interactive Drill-down State
  const [drillDownData, setDrillDownData] = useState(null); // { title: string, leads: Array }
  const [drillSearch, setDrillSearch] = useState('');
  const [drillGradeFilter, setDrillGradeFilter] = useState('ALL');

  // AI Insights State
  const [aiRefreshing, setAiRefreshing] = useState(false);

  // 0. Preset Quick Select
  const handleApplyPreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
      return;
    }

    const endDateStr = new Date().toISOString().split('T')[0];
    let startDateObj = new Date();

    if (preset === 'TODAY') {
      startDateObj = today;
    } else if (preset === '7DAYS') {
      startDateObj.setDate(today.getDate() - 7);
    } else if (preset === 'MONTH') {
      startDateObj = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    setStartDate(startDateObj.toISOString().split('T')[0]);
    setEndDate(endDateStr);
  };

  // 1. Filter leads by Date Range
  const filteredReportsLeads = useMemo(() => {
    return leads.filter(l => {
      if (!startDate && !endDate) return true;
      const leadDate = new Date(l.submitted_at);
      leadDate.setHours(0, 0, 0, 0);
      let isValid = true;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (leadDate < start) isValid = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (leadDate > end) isValid = false;
      }
      return isValid;
    });
  }, [leads, startDate, endDate]);

  // Lấy các chỉ số từ danh sách đã lọc (Hỗ trợ chuẩn hóa trạng thái linh hoạt)
  const totalLeads = filteredReportsLeads.length;
  const converted = filteredReportsLeads.filter(l => isConvertedStatus(l.status)).length;
  const newLeads = filteredReportsLeads.filter(l => isNewStatus(l.status)).length;
  const inProgress = filteredReportsLeads.filter(l => isInProgressStatus(l.status)).length;

  const hotLeadsCount = filteredReportsLeads.filter(l => (l.grade || '').toUpperCase() === 'HOT').length;
  const warmLeadsCount = filteredReportsLeads.filter(l => (l.grade || '').toUpperCase() === 'WARM').length;
  const coldLeadsCount = filteredReportsLeads.filter(l => (l.grade || '').toUpperCase() === 'COLD' || !l.grade).length;
  
  const hotWarmCount = hotLeadsCount + warmLeadsCount;

  // 2. Phân loại theo Chất lượng Lead (HOT/WARM/COLD)
  const gradeData = useMemo(() => {
    const counts = { HOT: 0, WARM: 0, COLD: 0 };
    filteredReportsLeads.forEach(l => {
      const g = (l.grade || 'COLD').toUpperCase();
      if (counts[g] !== undefined) counts[g]++;
      else counts.COLD++;
    });
    return [
      { name: 'HOT', value: counts.HOT, pct: totalLeads ? Math.round((counts.HOT / totalLeads) * 100) : 0 },
      { name: 'WARM', value: counts.WARM, pct: totalLeads ? Math.round((counts.WARM / totalLeads) * 100) : 0 },
      { name: 'COLD', value: counts.COLD, pct: totalLeads ? Math.round((counts.COLD / totalLeads) * 100) : 0 }
    ].filter(d => d.value > 0);
  }, [filteredReportsLeads, totalLeads]);

  // 3. Phân loại theo Hạng dịch vụ
  const serviceClassData = useMemo(() => {
    const counts = {};
    filteredReportsLeads.forEach(l => {
      let sc = l.service_class ? l.service_class.toUpperCase() : 'KHÔNG RÕ';
      if (sc.includes('VIP')) sc = 'VIP';
      else if (sc.includes('PREMIUM')) sc = 'PREMIUM';
      else if (sc.includes('ECONOMY')) sc = 'ECONOMY';
      else sc = 'KHÁC';
      
      counts[sc] = (counts[sc] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ 
        name, 
        value, 
        pct: totalLeads ? Math.round((value / totalLeads) * 100) : 0 
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredReportsLeads, totalLeads]);

  // 4. Top 5 Điểm đến được quan tâm nhất
  const destinationData = useMemo(() => {
    const counts = {};
    filteredReportsLeads.forEach(l => {
      if (l.destination) {
        counts[l.destination] = (counts[l.destination] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredReportsLeads]);

  // 5. Phân bố quy mô đoàn khách
  const groupSizeData = useMemo(() => {
    const counts = { '1 khách': 0, '2-4 khách': 0, '5+ khách': 0 };
    filteredReportsLeads.forEach(l => {
      const g = parseInt(l.guests, 10) || 1;
      if (g === 1) counts['1 khách']++;
      else if (g >= 2 && g <= 4) counts['2-4 khách']++;
      else counts['5+ khách']++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredReportsLeads]);

  // 6. Biểu đồ Xu hướng
  const reportsLeadsByDate = useMemo(() => {
    const counts = {};
    const result = [];
    
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    if (!startDate) {
      start.setDate(end.getDate() - 13);
    }
    
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    const current = new Date(start);
    const dateStrings = [];
    
    const MAX_DAYS = 60;
    let dayCount = 0;

    while (current <= end && dayCount < MAX_DAYS) {
      const dateStr = current.toLocaleDateString('vi-VN');
      counts[dateStr] = 0;
      dateStrings.push(dateStr);
      current.setDate(current.getDate() + 1);
      dayCount++;
    }

    filteredReportsLeads.forEach(l => {
      const dateStr = new Date(l.submitted_at).toLocaleDateString('vi-VN');
      if (counts[dateStr] !== undefined) {
        counts[dateStr]++;
      }
    });

    dateStrings.forEach(ds => {
      result.push({ name: ds, count: counts[ds] });
    });
    
    return result;
  }, [filteredReportsLeads, startDate, endDate]);

  // Dynamic AI Operational Insights calculation
  const aiInsightsText = useMemo(() => {
    if (totalLeads === 0) return {
      title: 'Phân Tích Vận Hành & Nhu Cầu Thị Trường',
      bullet1: 'Chưa có dữ liệu Lead trong khoảng thời gian đã chọn.',
      bullet2: 'Vui lòng thay đổi khoảng thời gian hoặc nhấn Xóa lọc.',
      bullet3: 'Không có thông tin về thị trường.'
    };
    
    const topDest = destinationData[0] ? destinationData[0].name : 'Chưa rõ';
    const topDestCount = destinationData[0] ? destinationData[0].value : 0;
    const topDestPct = totalLeads ? Math.round((topDestCount / totalLeads) * 100) : 0;
    const coldPct = totalLeads ? Math.round((coldLeadsCount / totalLeads) * 100) : 0;
    const economyObj = serviceClassData.find(s => s.name === 'ECONOMY');
    const economyPct = economyObj ? economyObj.pct : 0;

    return {
      title: `Phân Tích Vận Hành & Nhu Cầu Thị Trường (${totalLeads} Leads)`,
      bullet1: `Tỉ lệ chốt thành công đạt <b>${totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0}%</b> (${converted}/${totalLeads} khách). Hiệu suất phễu ở mức ổn định.`,
      bullet2: `<b>${coldPct}%</b> Lead hiện tại thuộc phân khúc <b>COLD</b> (${coldLeadsCount} khách). Đề xuất Sales kích hoạt lại quy trình chăm sóc qua Zalo/Email.`,
      bullet3: `Điểm đến <b>${topDest}</b> đang dẫn đầu với <b>${topDestCount} lượt quan tâm</b> (${topDestPct}%). Nhu cầu phân khúc <b>ECONOMY</b> chiếm ưu thế (<b>${economyPct}%</b>).`
    };
  }, [totalLeads, converted, coldLeadsCount, destinationData, serviceClassData]);

  // Click Handlers for Drill-Down
  const handleOpenGradeDrill = (entry) => {
    const matched = filteredReportsLeads.filter(l => (l.grade || 'COLD').toUpperCase() === entry.name);
    setDrillDownData({
      title: `Danh sách Lead cấp độ ${entry.name} (${matched.length} khách)`,
      leads: matched,
      type: 'GRADE'
    });
  };

  const handleOpenServiceDrill = (entry) => {
    const matched = filteredReportsLeads.filter(l => {
      let sc = l.service_class ? l.service_class.toUpperCase() : 'KHÔNG RÕ';
      if (sc.includes('VIP')) sc = 'VIP';
      else if (sc.includes('PREMIUM')) sc = 'PREMIUM';
      else if (sc.includes('ECONOMY')) sc = 'ECONOMY';
      else sc = 'KHÁC';
      return sc === entry.name;
    });
    setDrillDownData({
      title: `Danh sách Lead phân khúc ${entry.name} (${matched.length} khách)`,
      leads: matched,
      type: 'SERVICE'
    });
  };

  const handleOpenDestinationDrill = (entry) => {
    const matched = filteredReportsLeads.filter(l => l.destination === entry.name);
    setDrillDownData({
      title: `Danh sách Lead quan tâm tour ${entry.name} (${matched.length} khách)`,
      leads: matched,
      type: 'DESTINATION'
    });
  };

  const handleOpenGroupSizeDrill = (entry) => {
    const matched = filteredReportsLeads.filter(l => {
      const g = parseInt(l.guests, 10) || 1;
      if (entry.name === '1 khách') return g === 1;
      if (entry.name === '2-4 khách') return g >= 2 && g <= 4;
      return g >= 5;
    });
    setDrillDownData({
      title: `Danh sách Lead quy mô ${entry.name} (${matched.length} khách)`,
      leads: matched,
      type: 'GROUPSIZE'
    });
  };

  // Filtered DrillDown list by search and grade
  const modalFilteredLeads = useMemo(() => {
    if (!drillDownData) return [];
    return drillDownData.leads.filter(l => {
      const matchSearch = !drillSearch || 
        (l.customer_name || l.full_name || l.name || '').toLowerCase().includes(drillSearch.toLowerCase()) ||
        (l.phone || '').includes(drillSearch) ||
        (l.destination || '').toLowerCase().includes(drillSearch.toLowerCase());
      
      const matchGrade = drillGradeFilter === 'ALL' || (l.grade || 'COLD').toUpperCase() === drillGradeFilter;
      return matchSearch && matchGrade;
    });
  }, [drillDownData, drillSearch, drillGradeFilter]);

  const handleRefreshAi = () => {
    setAiRefreshing(true);
    if (fetchLeads) fetchLeads();
    setTimeout(() => {
      setAiRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header & Date Range Picker */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-sans font-bold text-slate-800 tracking-tight">Báo cáo & Phân tích</h2>
            <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <Activity size={13} /> Phễu Vận Hành & Demand
            </span>
          </div>
          <p className="text-slate-500 text-sm font-light">Theo dõi phễu chuyển đổi, hành vi khách hàng và xu hướng thị trường (Tự động đồng bộ)</p>
        </div>
        
        {/* Date Presets & Refresh & Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {fetchLeads && (
            <button 
              onClick={() => fetchLeads()}
              className="px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Đồng bộ dữ liệu thời gian thực từ CSDL"
            >
              <RefreshCw size={13} /> Đồng bộ dữ liệu
            </button>
          )}

          {/* Quick Presets */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => handleApplyPreset('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activePreset === 'ALL' && !startDate && !endDate
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleApplyPreset('TODAY')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activePreset === 'TODAY'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => handleApplyPreset('7DAYS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activePreset === '7DAYS'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => handleApplyPreset('MONTH')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activePreset === 'MONTH'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tháng này
            </button>
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar size={15} className="text-slate-400 ml-1" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setActivePreset('CUSTOM'); }}
              className="text-xs text-slate-700 outline-none bg-transparent cursor-pointer w-[110px]"
            />
            <span className="text-xs text-slate-300">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setActivePreset('CUSTOM'); }}
              className="text-xs text-slate-700 outline-none bg-transparent cursor-pointer w-[110px]"
            />
          </div>

          {(startDate || endDate) && (
            <button 
              onClick={() => handleApplyPreset('ALL')}
              className="px-3 py-2 text-xs text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium border border-red-100 flex items-center gap-1 cursor-pointer"
            >
              <X size={14} /> Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* DATE FILTER EMPTY STATE HELPER BANNER */}
      {totalLeads === 0 && (startDate || endDate) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs font-medium">
              Không tìm thấy yêu cầu Lead nào trong mốc từ <strong>{startDate || 'đầu kỳ'}</strong> đến <strong>{endDate || 'hiện tại'}</strong>. 
            </p>
          </div>
          <button
            onClick={() => handleApplyPreset('ALL')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            🔄 Hiển thị tất cả dữ liệu (ALL)
          </button>
        </div>
      )}



      {/* Conversion & Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Conversion Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-teal-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tỉ lệ chuyển đổi</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Target size={18} />
            </div>
          </div>
          <h4 className="text-3xl font-sans font-bold text-teal-600 tracking-tight mb-1">
            {totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0}%
          </h4>
          <p className="text-xs text-slate-500 mb-3">{converted} / {totalLeads} khách chốt thành công</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full transition-all duration-700" style={{ width: `${totalLeads > 0 ? (converted / totalLeads) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Card 2: Hot & Warm Leads */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lead Tiềm Năng (Hot/Warm)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame size={18} />
            </div>
          </div>
          <h4 className="text-3xl font-sans font-bold text-amber-600 tracking-tight mb-1">
            {totalLeads > 0 ? Math.round((hotWarmCount / totalLeads) * 100) : 0}%
          </h4>
          <p className="text-xs text-slate-500">{hotWarmCount} Lead chất lượng cao</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 rounded border border-red-100">{hotLeadsCount} HOT</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 rounded border border-amber-100">{warmLeadsCount} WARM</span>
          </div>
        </div>

        {/* Card 3: Pax / Booking */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-sky-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trung bình số khách</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <h4 className="text-3xl font-sans font-bold text-sky-600 tracking-tight mb-1">
            {totalLeads > 0 ? (filteredReportsLeads.reduce((sum, l) => sum + (parseInt(l.guests, 10) || 1), 0) / totalLeads).toFixed(1) : 0}
          </h4>
          <p className="text-xs text-slate-500">Khách / mỗi yêu cầu booking</p>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <Award size={13} className="text-sky-500" /> Quy mô phổ biến: 1 - 4 khách
          </div>
        </div>

        {/* Card 4: Leads in Consultation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-indigo-300 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang cần tư vấn</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <h4 className="text-3xl font-sans font-bold text-indigo-600 tracking-tight mb-1">
            {newLeads + inProgress}
          </h4>
          <p className="text-xs text-slate-500">Gồm {newLeads} Mới & {inProgress} Đang đàm phán</p>
          <div className="mt-3 text-[11px] text-teal-600 font-medium flex items-center gap-1">
            <ArrowUpRight size={13} /> Cần Sales chủ động tương tác
          </div>
        </div>
      </div>

      {/* Line Chart: Xu hướng yêu cầu */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Xu hướng yêu cầu mới (Theo ngày)</h3>
            <p className="text-xs text-slate-400">Số lượng lượt đăng ký tour mới theo mốc thời gian</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full font-medium">
            Tổng {filteredReportsLeads.length} lượt yêu cầu
          </span>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportsLeadsByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
              <YAxis stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 11}} allowDecimals={false} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{stroke: '#cbd5e1', strokeDasharray: '4 4'}} content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#0d9488" 
                strokeWidth={3} 
                dot={{r: 4, fill: '#ffffff', stroke: '#0d9488', strokeWidth: 2}} 
                activeDot={{r: 7, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2}} 
                name="Số lượng yêu cầu" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Charts Section (Segmentation) */}
      <div className="pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-xl font-sans font-bold text-slate-800">Phân Tích Khách Hàng (Segmentation)</h3>
            <p className="text-xs text-slate-500">Mẹo: Click vào vạch hoặc miếng bánh biểu đồ để **xem danh sách khách hàng tương ứng**</p>
          </div>
          <span className="text-xs text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
            <Eye size={13} /> Click biểu đồ để Drill-down
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Grade (HOT/WARM/COLD) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:border-slate-300 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Chất lượng Lead (Grade)</h4>
              <span className="text-[11px] text-slate-400">Click để xem danh sách</span>
            </div>

            <div className="h-[250px] w-full cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(entry) => handleOpenGradeDrill(entry)}
                  >
                    {gradeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={GRADE_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                        className="transition-opacity hover:opacity-80 cursor-pointer outline-none"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => {
                      const item = gradeData.find(g => g.name === value);
                      return <span className="text-xs text-slate-700 font-medium">{value} ({item ? item.pct : 0}%)</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Service Class */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:border-slate-300 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Hạng dịch vụ mong muốn</h4>
              <span className="text-[11px] text-slate-400">Click để xem danh sách</span>
            </div>

            <div className="h-[250px] w-full cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceClassData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(entry) => handleOpenServiceDrill(entry)}
                  >
                    {serviceClassData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className="transition-opacity hover:opacity-80 cursor-pointer outline-none"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => {
                      const item = serviceClassData.find(s => s.name === value);
                      return <span className="text-xs text-slate-700 font-medium">{value} ({item ? item.pct : 0}%)</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Top Destinations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:border-slate-300 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Top 5 Điểm đến được quan tâm</h4>
              <span className="text-[11px] text-slate-400">Click vạch để lọc</span>
            </div>

            <div className="h-[250px] w-full cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destinationData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#cbd5e1" tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} width={90} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6" 
                    radius={[0, 6, 6, 0]} 
                    barSize={22} 
                    name="Số lượng khách" 
                    onClick={(entry) => handleOpenDestinationDrill(entry)}
                    className="cursor-pointer hover:opacity-80"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Group Size */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:border-slate-300 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Quy mô đoàn khách</h4>
              <span className="text-[11px] text-slate-400">Click vạch để lọc</span>
            </div>

            <div className="h-[250px] w-full cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupSizeData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="#0d9488" 
                    radius={[6, 6, 0, 0]} 
                    barSize={44} 
                    name="Số lượng khách" 
                    onClick={(entry) => handleOpenGroupSizeDrill(entry)}
                    className="cursor-pointer hover:opacity-80"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE DRILL-DOWN MODAL */}
      {drillDownData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{drillDownData.title}</h3>
                  <p className="text-xs text-slate-500">Danh sách các khách hàng thuộc phân khúc đã chọn</p>
                </div>
              </div>
              <button 
                onClick={() => { setDrillDownData(null); setDrillSearch(''); setDrillGradeFilter('ALL'); }}
                className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Filters & Search */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, tour..."
                  value={drillSearch}
                  onChange={(e) => setDrillSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Lọc Grade:</span>
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                  {['ALL', 'HOT', 'WARM', 'COLD'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setDrillGradeFilter(g)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        drillGradeFilter === g 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {g === 'ALL' ? 'Tất cả' : g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {modalFilteredLeads.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Không tìm thấy khách hàng phù hợp.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-3">Khách hàng</th>
                        <th className="py-3 px-3">SĐT</th>
                        <th className="py-3 px-3">Điểm đến</th>
                        <th className="py-3 px-3">Hạng dịch vụ</th>
                        <th className="py-3 px-3">Cấp độ</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-3 text-right">Giá trị (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {modalFilteredLeads.map((lead, idx) => {
                        const grade = (lead.grade || 'COLD').toUpperCase();
                        const val = parseInt(lead.estimated_value, 10) || 0;
                        return (
                          <tr key={lead.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              {lead.customer_name || lead.full_name || lead.name || 'Khách vãng lai'}
                            </td>
                            <td className="py-3 px-3 text-slate-600">{lead.phone || 'N/A'}</td>
                            <td className="py-3 px-3 font-medium text-teal-700">{lead.destination || 'Chưa chọn'}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                                {lead.service_class || 'ECONOMY'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${GRADE_BG[grade] || GRADE_BG['COLD']}`}>
                                {grade}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={lead.status} />
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-800">
                              {val > 0 ? val.toLocaleString('vi-VN') + ' đ' : '---'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
              <span>Hiển thị <b>{modalFilteredLeads.length}</b> / {drillDownData.leads.length} bản ghi</span>
              <button 
                onClick={() => { setDrillDownData(null); setDrillSearch(''); setDrillGradeFilter('ALL'); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
              >
                Đóng Màn Hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
