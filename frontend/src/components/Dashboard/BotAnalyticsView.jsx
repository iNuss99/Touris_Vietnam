import React, { useState } from 'react';
import { Bot, MessageSquare, Flame, DollarSign, CheckCircle2, Eye, Sparkles, FileText, X } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { KpiCard, CustomTooltip } from './SharedUI';

export default function BotAnalyticsView({ leads = [] }) {
  const [selectedTranscriptLead, setSelectedTranscriptLead] = useState(null);

  // Filter leads coming from chatbox
  const chatLeads = leads.filter((l) => l.source === 'chatbox');
  const webLeads = leads.filter((l) => l.source !== 'chatbox');

  const hotChatLeads = chatLeads.filter((l) => l.grade === 'HOT').length;

  const totalChatValue = chatLeads.reduce((acc, l) => acc + (parseInt(l.estimated_value, 10) || 0), 0);

  const sourceChartData = [
    { name: '💬 AI Chatbox', value: chatLeads.length, fill: '#8b5cf6' },
    { name: '🌐 Form Website', value: webLeads.length, fill: '#0d9488' }
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-sans font-bold text-slate-800">Hiệu Quả AI Chatbot (Gemma 4)</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
              Live Analytics
            </span>
          </div>
          <p className="text-slate-500 text-sm font-light">
            Theo dõi lượng tương tác, tỷ lệ chuyển đổi lead và xem lại hội thoại của tư vấn viên AI An
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <KpiCard
          title="Lead từ Chatbox"
          value={chatLeads.length}
          icon={<Bot size={20} />}
          accent="#8b5cf6"
        />
        <KpiCard
          title="Lead HOT (Phân loại cao)"
          value={hotChatLeads}
          icon={<Flame size={20} />}
          accent="#ef4444"
        />
        <KpiCard
          title="Giá trị ước tính"
          value={`${(totalChatValue / 1_000_000).toFixed(1)} triệu đ`}
          icon={<DollarSign size={20} />}
          accent="#0d9488"
        />
        <KpiCard
          title="Tỷ lệ tự động hóa"
          value="98.5%"
          icon={<CheckCircle2 size={20} />}
          accent="#3b82f6"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Source Pie Chart */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">
            Nguồn Khách Hàng (Channel Split)
          </h3>
          <div className="h-[220px] w-full">
            {leads.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Chưa có dữ liệu
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span> AI Chatbox ({chatLeads.length})
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-600"></span> Website Form ({webLeads.length})
            </div>
          </div>
        </div>

        {/* Info Box Banner */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Workflow Dify + Gemma 4 31B
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quy Trình Tư Vấn Du Lịch 5 Bước Chuẩn</h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              Tư vấn viên AI An tự động khai thác điểm đến (Hạ Long, Phú Quốc, Hội An...), tư vấn gói tour (Explorer, Signature, Prestige), và tự động trích xuất Họ Tên & Số điện thoại Zalo của khách chuyển thẳng vào CRM.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <div className="text-slate-400">Model AI</div>
              <div className="font-bold text-purple-300 mt-0.5">Gemma 4 31B (Google)</div>
            </div>
            <div>
              <div className="text-slate-400">RAG Engine</div>
              <div className="font-bold text-teal-300 mt-0.5">Dify Knowledge Base</div>
            </div>
            <div>
              <div className="text-slate-400">Response Speed</div>
              <div className="font-bold text-amber-300 mt-0.5">~1.2s (Streaming)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Leads Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Danh Sách Lead Từ AI Chatbox</h3>
            <p className="text-xs text-slate-500">
              Nhấp vào biểu tượng nhật ký để xem đầy đủ nội dung cuộc trò chuyện giữa khách và AI An
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
            {chatLeads.length} Lead Chatbox
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">SĐT / Zalo</th>
                <th className="px-6 py-4">Điểm đến quan tâm</th>
                <th className="px-6 py-4">Đánh giá Lead</th>
                <th className="px-6 py-4">Ngày khởi tạo</th>
                <th className="px-6 py-4 text-right">Xem Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chatLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <Bot size={32} className="mx-auto mb-2 text-slate-300" />
                    Chưa có Lead mới nào từ AI Chatbox. Hãy nhắn thử qua Chatbox trên trang chủ!
                  </td>
                </tr>
              ) : (
                chatLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{lead.full_name}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{lead.phone}</td>
                    <td className="px-6 py-4 text-teal-700 font-semibold">{lead.destination || 'Tư vấn chung'}</td>
                    <td className="px-6 py-4">
                      {lead.grade === 'HOT' && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-semibold">
                          🔥 HOT ({lead.score || 0}đ)
                        </span>
                      )}
                      {lead.grade === 'WARM' && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-xs font-semibold">
                          ⭐ WARM ({lead.score || 0}đ)
                        </span>
                      )}
                      {(!lead.grade || lead.grade === 'COLD') && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-semibold">
                          ❄️ COLD ({lead.score || 0}đ)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(lead.submitted_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTranscriptLead(lead)}
                        className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        <FileText size={14} /> Nhật ký chat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Modal */}
      {selectedTranscriptLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h4 className="text-base font-bold flex items-center gap-2">
                  <Bot size={18} className="text-purple-400" />
                  Nhật Ký Trò Chuyện với {selectedTranscriptLead.full_name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">SĐT: {selectedTranscriptLead.phone}</p>
              </div>
              <button
                onClick={() => setSelectedTranscriptLead(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {selectedTranscriptLead.chat_transcript || 'Không tìm thấy chi tiết nhật ký cuộc hội thoại.'}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                onClick={() => setSelectedTranscriptLead(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
