import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import LeadsView from './LeadsView';
import ReportsView from './ReportsView';
import SettingsView from './SettingsView';
import LeadDetailsModal from './LeadDetailsModal';
import UserManagement from './UserManagement';
import ContentView from './ContentView';
import CeoDashboardView from './CeoDashboardView';
import BotAnalyticsView from './BotAnalyticsView';
import { STATUS_LABELS, normalizeStatus } from './SharedUI';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://touris-vietnam-api.vercel.app';
const ITEMS_PER_PAGE = 8;

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, user, isSuperAdmin, viewAsRole, setViewAsRole } = useAuth();

  // States cho Filter, Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [destFilter, setDestFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'submitted_at', direction: 'desc' });
  
  // State cho Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State cho Sidebar Tabs
  const [activeTab, setActiveTab] = useState(() => {
    if (user?.role === 'super_admin') return 'ceo';
    if (user?.role === 'editor') return 'content';
    if (user?.role === 'viewer') return 'reports';
    if (user?.role === 'sales') return 'leads';
    return 'settings';
  });
  
  // State cho Admin Profile
  const [adminProfile, setAdminProfile] = useState(() => {
    const saved = localStorage.getItem(`touris_profile_${user?.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return {
      name: user?.name || 'Administrator',
      email: user?.email || 'admin@touris.vn',
      avatar: null
    };
  });

  useEffect(() => {
    try {
      if (user?.id) {
        localStorage.setItem(`touris_profile_${user.id}`, JSON.stringify(adminProfile));
      }
    } catch (e) {
      console.warn('Lỗi khi lưu vào localStorage:', e);
    }
  }, [adminProfile, user?.id]);

  // 1. TanStack Query: Fetch Leads với cache 5 phút tự động & chống spam BE
  const canReadLeads = ['super_admin', 'sales', 'viewer', 'admin'].includes(user?.role);

  const {
    data: leads = [],
    isLoading,
    error: queryError,
    refetch: fetchLeads
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const token = sessionStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        logout();
        navigate('/login');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
    enabled: canReadLeads,
    staleTime: 5 * 60 * 1000,
  });

  const error = queryError ? queryError.message : null;

  // Tự động kiểm tra và chuyển tab phù hợp theo quyền nhân sự hiện tại
  useEffect(() => {
    const roleTabs = {
      super_admin: ['ceo', 'bot', 'leads', 'reports', 'users', 'content', 'settings'],
      sales: ['bot', 'leads', 'reports', 'settings'],
      editor: ['content', 'settings'],
      viewer: ['reports', 'settings']
    };
    const allowed = roleTabs[user?.role] || ['settings'];
    if (!allowed.includes(activeTab)) {
      setActiveTab(allowed[0]);
    }
  }, [user?.role, activeTab]);

  // 2. TanStack Mutation: Optimistic status update (0ms lag UI)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const token = sessionStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/leads/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData(['leads']);

      queryClient.setQueryData(['leads'], (old = []) =>
        old.map(lead => (lead.id === id ? { ...lead, status: newStatus } : lead))
      );

      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
      }

      return { previousLeads };
    },
    onError: (err, variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      alert('Lỗi cập nhật trạng thái: ' + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  const handleStatusChange = (id, newStatus) => {
    updateStatusMutation.mutate({ id, newStatus });
  };

  // Lấy danh sách điểm đến chuẩn 6 Tour chính cho Filter
  const uniqueDestinations = useMemo(() => {
    const OFFICIAL_6_TOURS = ['Vịnh Hạ Long', 'Hội An', 'Tràng An', 'Phú Quốc', 'Sa Pa', 'Đà Nẵng'];
    const dests = new Set([...OFFICIAL_6_TOURS, ...leads.map(l => l.destination).filter(Boolean)]);
    return Array.from(dests);
  }, [leads]);

  // Xử lý Lọc & Tìm kiếm & Sắp xếp voi deferredSearchQuery de 0ms lag phím
  const filteredLeads = useMemo(() => {
    const query = (deferredSearchQuery || '').toLowerCase();
    let result = leads.filter(lead => {
      const matchesSearch = !query || 
                            (lead.full_name?.toLowerCase().includes(query)) ||
                            (lead.phone?.includes(query)) ||
                            (lead.email?.toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'ALL' || normalizeStatus(lead.status) === normalizeStatus(statusFilter);
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
  const newLeads = leads.filter(l => normalizeStatus(l.status) === 'NEW').length;
  const inProgress = leads.filter(l => normalizeStatus(l.status) === 'IN_PROGRESS').length;
  const converted = leads.filter(l => normalizeStatus(l.status) === 'CONVERTED').length;

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
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN');
      counts[dateStr] = 0;
    }

    leads.forEach(l => {
      const dateStr = new Date(l.submitted_at).toLocaleDateString('vi-VN');
      if (counts[dateStr] !== undefined) {
        counts[dateStr]++;
      }
    });

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
    sessionStorage.removeItem('touris_token');
    sessionStorage.removeItem('touris_must_change_password');
    navigate('/login');
  };

  return (
    <div className="min-h-screen font-sans flex relative overflow-hidden bg-slate-50 text-slate-800">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminProfile={adminProfile}
      />

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative z-0 flex flex-col">
        <TopHeader 
          adminProfile={adminProfile} 
          setActiveTab={setActiveTab} 
          activeTab={activeTab} 
          leads={leads}
          setSelectedLead={setSelectedLead}
          setSearchQuery={setSearchQuery}
        />

        {/* Role Impersonation Warning Banner */}
        {isSuperAdmin && viewAsRole && viewAsRole !== 'super_admin' && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-6 py-2.5 flex items-center justify-between shadow-md text-xs font-semibold shrink-0 animate-in slide-in-from-top-2 duration-200 z-20">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span>
                ⚠️ Đang trải nghiệm giao diện với <strong>Góc nhìn: {
                  {
                    sales: 'Kinh doanh (Sales)',
                    editor: 'Biên tập viên (Editor)',
                    viewer: 'Người xem (Viewer)'
                  }[viewAsRole] || viewAsRole
                }</strong> (Tài khoản gốc: Super Admin)
              </span>
            </div>
            <button
              onClick={() => setViewAsRole(null)}
              className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border border-white/20"
              title="Khôi phục lại giao diện Super Admin"
            >
              <span>Thoát chế độ xem</span>
              <span className="text-sm font-normal">✕</span>
            </button>
          </div>
        )}

        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto flex-1 w-full">
          {activeTab === 'leads' && (user?.role === 'super_admin' || user?.role === 'sales') && (
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
              onStatusChange={handleStatusChange}
            />
          )}

          {activeTab === 'ceo' && user?.role === 'super_admin' && (
            <CeoDashboardView />
          )}

          {activeTab === 'bot' && (user?.role === 'super_admin' || user?.role === 'sales') && (
            <BotAnalyticsView leads={leads} />
          )}

          {activeTab === 'reports' && (user?.role === 'super_admin' || user?.role === 'sales' || user?.role === 'viewer') && (
            <ReportsView 
              totalLeads={totalLeads}
              converted={converted}
              newLeads={newLeads}
              inProgress={inProgress}
              leads={leads}
              leadsByDate={leadsByDate}
              fetchLeads={fetchLeads}
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
