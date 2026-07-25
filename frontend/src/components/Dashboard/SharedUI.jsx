import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, PieChart as PieChartIcon, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

export const STATUS_COLORS = {
  'NEW': { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' }, // Blue
  'IN_PROGRESS': { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' }, // Amber
  'CONVERTED': { bg: 'rgba(15, 157, 138, 0.1)', text: '#34d0be', border: 'rgba(15, 157, 138, 0.3)' }, // Emerald
  'LOST': { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' } // Red
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
      active ? 'bg-gradient-to-r from-luxury-gold/10 to-transparent text-luxury-gold-light border-l-2 border-luxury-gold' 
             : 'text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
    } ${!isOpen && 'justify-center px-0'}`}>
      {icon}
      {isOpen && <span className="font-medium text-sm">{label}</span>}
    </a>
  );
}

export function KpiCard({ title, value, icon, accent }) {
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
      <div className="bg-[#0a1423]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{payload[0].name}</p>
        <p className="text-white font-serif text-lg font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}
