import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import LeadsView from './LeadsView';
import ReportsView from './ReportsView';
import SettingsView from './SettingsView';
import LeadDetailsModal from './LeadDetailsModal';
import { STATUS_LABELS } from './SharedUI';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://touris-vietnam-api.vercel.app';
const ITEMS_PER_PAGE = 8;

export default function Dashboard() {
  const navigate = useNavigate();
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

  // Chart Data: Leads over time (last 14 active days)
  const leadsByDate = useMemo(() => {
    const counts = {};
    leads.forEach(l => {
      const dateStr = new Date(l.submitted_at).toLocaleDateString('vi-VN');
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => {
      const [d1, m1, y1] = a.split('/');
      const [d2, m2, y2] = b.split('/');
      return new Date(y1, m1-1, d1) - new Date(y2, m2-1, d2);
    }).slice(-14).map(key => ({ name: key, count: counts[key] }));
  }, [leads]);

  const handleLogout = () => {
    localStorage.removeItem('touris_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen font-sans flex relative overflow-hidden" style={{ background: '#04080f', color: '#e8e4d8' }}>
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-luxury-emerald/5 rounded-full blur-[150px] pointer-events-none" />

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
