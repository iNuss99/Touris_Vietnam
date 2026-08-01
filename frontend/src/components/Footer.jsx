import React from 'react';
import { Phone, Mail, Instagram, Facebook, Youtube, ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
// Import logo da chuyen sang webp de toi uu hoa
import logoImg from '../assets/images/logo.webp';
import { useLanguage } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const footer = t('footer');
  const columns = footer.columns || {};
  const bottomLinks = footer.bottomLinks || [];
  const bottomHrefs = ['#kham-pha', '#van-hoa', '#lien-he'];

  return (
    <footer
      className="relative overflow-hidden text-slate-200 font-sans antialiased"
      style={{ background: 'linear-gradient(180deg, #070C16 0%, #03060C 100%)' }}
    >
      {/* Decorative Ambient Light */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: '1100px', height: '400px', background: 'radial-gradient(ellipse at 50% 0%, rgba(217, 160, 91, 0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 relative z-10 pt-16">

        {/* ===== MAIN FOOTER GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">

          {/* Left Column: Branding & Contact Info */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
            <div>
              {/* Logo Brand */}
              <div className="flex items-center gap-3.5 mb-6">
                <img
                  src={logoImg}
                  alt="Vietnam Tourism"
                  loading="lazy"
                  width="56"
                  height="56"
                  style={{ height: '56px', width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(217,160,91,0.3))' }}
                />
                <div className="flex flex-col leading-none">
                  <span
                    className="font-serif text-xl font-bold tracking-[0.2em]"
                    style={{ background: 'linear-gradient(135deg, #FFE29F, #D9A05B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    VIETNAM
                  </span>
                  <span className="text-[10px] tracking-[0.45em] uppercase text-amber-400/80 mt-1 font-semibold">TOURISM</span>
                </div>
              </div>

              <p className="text-slate-300 text-sm font-normal leading-relaxed mb-8 max-w-sm">
                {footer.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-4 mb-8">
                <a href="tel:+840931143830" className="flex items-center gap-3.5 text-slate-300 hover:text-amber-400 transition-colors duration-300 w-fit group">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800/80 border border-slate-700/60 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-all shadow-sm">
                    <Phone size={15} className="text-amber-400" />
                  </span>
                  <span className="text-sm font-medium tracking-wide">+84 0931 143 830</span>
                </a>

                <a href="mailto:domjnhkhoa@gmail.com" className="flex items-center gap-3.5 text-slate-300 hover:text-amber-400 transition-colors duration-300 w-fit group">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800/80 border border-slate-700/60 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-all shadow-sm">
                    <Mail size={15} className="text-amber-400" />
                  </span>
                  <span className="text-sm font-medium tracking-wide">domjnhkhoa@gmail.com</span>
                </a>

                <div className="flex items-start gap-3.5 text-slate-300 text-xs font-normal leading-relaxed pt-1">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800/80 border border-slate-700/60 shrink-0 mt-0.5">
                    <MapPin size={15} className="text-amber-400" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-slate-200"><span className="text-amber-400 font-semibold">Địa chỉ:</span> 123 Nguyễn Văn Linh, Q. Thanh Khê, Đà Nẵng</p>
                    <p className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                      <ShieldCheck size={13} className="text-amber-400 shrink-0" />
                      <span>Giấy phép TCDL-GPLHQT số 01-1234/2026</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <Facebook size={16} />, href: '#', label: 'Facebook' },
                { icon: <Instagram size={16} />, href: '#', label: 'Instagram' },
                { icon: <Youtube size={16} />, href: '#', label: 'Youtube' },
              ].map(({ icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 shadow-md cursor-pointer"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Columns: Structured Navigation Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {Object.entries(columns).map(([category, links]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400 pb-2.5 border-b border-amber-500/30">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-xs md:text-sm text-slate-300 hover:text-amber-300 font-normal transition-all duration-300 group w-fit"
                      >
                        <span className="transition-transform group-hover:translate-x-1">{link.label}</span>
                        <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-amber-400 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ===== FOOTER BOTTOM BAR ===== */}
        <div className="py-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 md:pr-20">
          <p className="text-slate-400 text-xs font-medium tracking-wide">
            {footer.copyright}
          </p>
          <div className="flex items-center gap-6 text-xs uppercase tracking-widest text-slate-300 font-medium">
            {bottomLinks.map((label, i) => (
              <a key={i} href={bottomHrefs[i]} className="hover:text-amber-400 transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

