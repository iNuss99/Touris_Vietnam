import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, PieChart as PieChartIcon, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

export const STATUS_COLORS = {
  'NEW': { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }, // Blue
  'IN_PROGRESS': { bg: '#fffbeb', text: '#d97706', border: '#fde68a' }, // Amber
  'CONVERTED': { bg: '#f0fdfa', text: '#0d9488', border: '#ccfbf1' }, // Teal
  'LOST': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' } // Red
};

export const STATUS_LABELS = {
  'NEW': 'Mới',
  'IN_PROGRESS': 'Đang xử lý',
  'CONVERTED': 'Thành công',
  'LOST': 'Hủy bỏ'
};

export function NavItem({ icon, label, active, isOpen, onClick }) {
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-500 shadow-sm' 
             : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l-4 border-transparent'
    } ${!isOpen && 'justify-center px-0'}`}>
      {icon}
      {isOpen && <span className="font-medium text-sm">{label}</span>}
    </a>
  );
}

export function KpiCard({ title, value, icon, accent }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:opacity-10" style={{ color: accent }}>
        {React.cloneElement(icon, { size: 60 })}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
            {icon}
          </div>
          <p className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        </div>
        <h4 className="text-3xl font-sans font-bold text-slate-800 tracking-tight">{value}</h4>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full opacity-50" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
    </div>
  );
}

export function StatusBadge({ status }) {
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

export function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-xl">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{payload[0].name}</p>
        <p className="text-slate-800 font-sans text-lg font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}
