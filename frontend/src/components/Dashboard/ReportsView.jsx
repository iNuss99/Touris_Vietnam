import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { CustomTooltip } from './SharedUI';

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#c026d3'];
const GRADE_COLORS = { 'HOT': '#ef4444', 'WARM': '#f59e0b', 'COLD': '#94a3b8' };

export default function ReportsView({ leads }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 0. Filter leads by Date Range
  const filteredReportsLeads = useMemo(() => {
    return leads.filter(l => {
      if (!startDate && !endDate) return true;
      const leadDate = new Date(l.submitted_at);
      leadDate.setHours(0, 0, 0, 0); // Normalize time
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

  // Lấy các chỉ số từ danh sách đã lọc
  const totalLeads = filteredReportsLeads.length;
  const converted = filteredReportsLeads.filter(l => l.status === 'CONVERTED').length;
  const newLeads = filteredReportsLeads.filter(l => l.status === 'NEW').length;
  const inProgress = filteredReportsLeads.filter(l => l.status === 'IN_PROGRESS').length;

  // 1. Phân loại theo Chất lượng Lead (HOT/WARM/COLD)
  const gradeData = useMemo(() => {
    const counts = { HOT: 0, WARM: 0, COLD: 0 };
    filteredReportsLeads.forEach(l => {
      const g = l.grade || 'COLD';
      if (counts[g] !== undefined) counts[g]++;
    });
    return [
      { name: 'HOT', value: counts.HOT },
      { name: 'WARM', value: counts.WARM },
      { name: 'COLD', value: counts.COLD }
    ].filter(d => d.value > 0);
  }, [filteredReportsLeads]);

  // 2. Phân loại theo Hạng dịch vụ
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
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredReportsLeads]);

  // 3. Top 5 Điểm đến được quan tâm nhất
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

  // 4. Phân bố quy mô đoàn khách
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

  // 5. Biểu đồ Xu hướng (Theo khoảng thời gian đã chọn, hoặc 14 ngày)
  const reportsLeadsByDate = useMemo(() => {
    const counts = {};
    const result = [];
    
    // Nếu có startDate và endDate, generate mảng ngày giữa 2 khoảng
    // Nếu không, default là 14 ngày gần nhất
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    if (!startDate) {
      start.setDate(end.getDate() - 13); // 14 ngày (bao gồm cả hôm nay)
    }
    
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    const current = new Date(start);
    const dateStrings = [];
    
    // Đảm bảo không render quá nhiều điểm (tối đa 60 ngày để chart không bị lag)
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-sans font-bold text-slate-800 mb-2">Báo cáo & Phân tích</h2>
          <p className="text-slate-500 text-sm font-light">Theo dõi xu hướng và phân tích dữ liệu khách hàng</p>
        </div>
        
        {/* Date Range Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Từ:</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer w-[110px]"
              />
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Đến:</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer w-[110px]"
              />
            </div>
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-3 py-2 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium border border-red-100"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
          <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider mb-2">Tỉ lệ chuyển đổi (Lead to Customer)</p>
          <h4 className="text-3xl font-sans font-bold text-teal-600 tracking-tight">
            {totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0}%
          </h4>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${totalLeads > 0 ? (converted / totalLeads) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
          <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider mb-2">Trung bình số khách / Booking</p>
          <h4 className="text-3xl font-sans font-bold text-sky-600 tracking-tight">
            {totalLeads > 0 ? (filteredReportsLeads.reduce((sum, l) => sum + (parseInt(l.guests, 10) || 1), 0) / totalLeads).toFixed(1) : 0}
          </h4>
          <p className="text-xs text-slate-500 mt-4">Khách mỗi yêu cầu</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
          <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider mb-2">Lượng khách hàng quan tâm</p>
          <h4 className="text-3xl font-sans font-bold text-slate-800 tracking-tight">
            {newLeads + inProgress}
          </h4>
          <p className="text-xs text-slate-500 mt-4">Đang cần tư vấn</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Xu hướng yêu cầu mới (Theo ngày)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportsLeadsByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{stroke: '#f1f5f9'}} content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={3} dot={{r: 4, fill: '#ffffff', stroke: '#0d9488', strokeWidth: 2}} activeDot={{r: 6}} name="Số lượng yêu cầu" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-xl font-sans font-semibold text-slate-800 mb-6">Phân tích Khách hàng (Segmentation)</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Grade */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Chất lượng Lead (Grade)</h4>
            <div className="h-[250px] w-full">
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
                  >
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Service Class */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Hạng dịch vụ mong muốn</h4>
            <div className="h-[250px] w-full">
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
                  >
                    {serviceClassData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Top Destinations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Top 5 Điểm đến</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destinationData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} width={80} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Group Size */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">Quy mô đoàn khách</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupSizeData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#cbd5e1" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
