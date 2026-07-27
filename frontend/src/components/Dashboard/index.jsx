import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LeadsView from './LeadsView';
import ReportsView from './ReportsView';
import SettingsView from './SettingsView';
import LeadDetailsModal from './LeadDetailsModal';
import UserManagement from './UserManagement';
import ContentView from './ContentView';
import { STATUS_LABELS } from './SharedUI';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://touris-vietnam-api.vercel.app';
const ITEMS_PER_PAGE = 8;

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States cho Filter, Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [destFilter, setDestFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'submitted_at', direction: 'desc' });
  
  // State cho Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State cho Sidebar Tabs
  const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'reports', 'settings'
  
  // State cho Admin Profile
  const [adminProfile, setAdminProfile] = useState(() => {
    const saved = localStorage.getItem('touris_admin_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return {
      name: 'Administrator',
      email: 'admin@touris.vn',
      avatar: null
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('touris_admin_profile', JSON.stringify(adminProfile));
    } catch (e) {
      console.warn('Lỗi khi lưu vào localStorage (có thể do dung lượng ảnh quá lớn):', e);
    }
  }, [adminProfile]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        logout();
        navigate('/login');
        return;
      }
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
    if (user?.role === 'super_admin' || user?.role === 'sales') {
      fetchLeads();
    } else {
      setIsLoading(false);
      // If editor, default to content tab
      if (user?.role === 'editor') {
        setActiveTab('content');
      }
    }
  }, [user]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/leads/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  // Xử lý Lọc & Tìm kiếm & Sắp xếp
  const filteredLeads = useMemo(() => {
    let result = leads.filter(lead => {
      const matchesSearch = (lead.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (lead.phone?.includes(searchQuery)) ||
                            (lead.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const matchesDest = destFilter === 'ALL' || lead.destination === destFilter;
      
      return matchesSearch && matchesStatus && matchesDest;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'score') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else if (sortConfig.key === 'submitted_at') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [leads, searchQuery, statusFilter, destFilter, sortConfig]);

  // Reset trang về 1 khi đổi filter hoặc sort
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, destFilter, sortConfig]);

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
    filteredLeads.forEach(l => {
      if (l.destination) {
        counts[l.destination] = (counts[l.destination] || 0) + 1;
      }
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).sort((a,b) => b.value - a.value).slice(0,5);
  }, [filteredLeads]);

  // Chart Data: Leads over time (last 14 days)
  const leadsByDate = useMemo(() => {
    const counts = {};
    const today = new Date();
    
    // Khởi tạo 14 ngày gần nhất
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN');
      counts[dateStr] = 0;
    }

    // Đếm số lượng leads
    leads.forEach(l => {
      const dateStr = new Date(l.submitted_at).toLocaleDateString('vi-VN');
      if (counts[dateStr] !== undefined) {
        counts[dateStr]++;
      }
    });

    // Tạo mảng kết quả đảm bảo thứ tự thời gian
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN');
      result.push({ name: dateStr, count: counts[dateStr] });
    }
    return result;
  }, [leads]);

  const handleLogout = () => {
    localStorage.removeItem('touris_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen font-sans flex relative overflow-hidden bg-slate-50 text-slate-800">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminProfile={adminProfile}
      />

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative z-0">
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
          {activeTab === 'leads' && (
            <LeadsView
              leads={leads}
              totalLeads={totalLeads}
              newLeads={newLeads}
              inProgress={inProgress}
              converted={converted}
              destData={destData}
              exportToCSV={exportToCSV}
              fetchLeads={fetchLeads}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              destFilter={destFilter}
              setDestFilter={setDestFilter}
              uniqueDestinations={uniqueDestinations}
              paginatedLeads={paginatedLeads}
              filteredLeads={filteredLeads}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              setSelectedLead={setSelectedLead}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView 
              totalLeads={totalLeads}
              converted={converted}
              newLeads={newLeads}
              inProgress={inProgress}
              leads={leads}
              leadsByDate={leadsByDate}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              adminProfile={adminProfile} 
              setAdminProfile={setAdminProfile} 
              handleLogout={handleLogout}
            />
          )}

          {activeTab === 'users' && user?.role === 'super_admin' && (
            <div className="max-w-4xl mx-auto animate-fade-in pb-12">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-4xl font-sans text-slate-800 tracking-tight mb-2">Quản lý nhân sự</h2>
                  <p className="text-slate-500 text-sm">Phân quyền và quản lý tài khoản truy cập CRM.</p>
                </div>
              </div>
              <UserManagement />
            </div>
          )}
          
          {activeTab === 'content' && (user?.role === 'super_admin' || user?.role === 'editor') && (
            <div className="max-w-7xl mx-auto animate-fade-in pb-12">
              <ContentView />
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
