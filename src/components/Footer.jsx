import React from 'react';
import { Phone, Mail, Instagram, Facebook, Youtube, ArrowRight } from 'lucide-react';
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
      className="relative overflow-hidden pt-20"
      style={{ background: 'linear-gradient(180deg, #04080f 0%, #020408 100%)' }}
    >
      {/* Decorative Golden Top Line */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.15) 30%, rgba(201,168,76,0.3) 50%, rgba(201,168,76,0.15) 70%, transparent 100%)' }} />

      {/* Decorative Radial Light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: '1000px', height: '350px', background: 'radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.03) 0%, transparent 65%)', filter: 'blur(50px)' }}
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 relative z-10">

        {/* ===== MAIN FOOTER GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">

          {/* Left Column: Branding & Contact Info */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              {/* Logo Brand */}
              <div className="flex items-center gap-3.5 mb-6">
                <img src={logoImg} alt="Vietnam Tourism" style={{ height: '56px', width: 'auto', filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.2))' }} />
                <div className="flex flex-col leading-none">
                  <span className="font-serif text-lg font-bold tracking-[0.2em]"
                    style={{ background: 'linear-gradient(135deg, #f0d080, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    VIETNAM
                  </span>
                  <span className="text-[9px] tracking-[0.45em] uppercase text-white/40 mt-1">TOURISM</span>
                </div>
              </div>

              <p className="text-white/35 text-xs font-light leading-relaxed mb-8" style={{ fontWeight: 300, maxWidth: '290px' }}>
                {footer.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3.5 mb-8">
                <a href="tel:+840931143830" className="flex items-center gap-3 text-white/35 hover:text-luxury-gold transition-colors duration-300 w-fit group">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/3 border border-white/5 group-hover:border-luxury-gold/30 group-hover:bg-luxury-gold/5 transition-all">
                    <Phone size={12} className="text-luxury-gold" />
                  </span>
                  <span className="text-xs font-light">+84 0931 143 830</span>
                </a>

                <a href="mailto:domjnhkhoa@gmail.com" className="flex items-center gap-3 text-white/35 hover:text-luxury-gold transition-colors duration-300 w-fit group">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/3 border border-white/5 group-hover:border-luxury-gold/30 group-hover:bg-luxury-gold/5 transition-all">
                    <Mail size={12} className="text-luxury-gold" />
                  </span>
                  <span className="text-xs font-light">domjnhkhoa@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: <Facebook size={14} />, href: 'https://facebook.com', label: 'Facebook' },
                { icon: <Instagram size={14} />, href: 'https://instagram.com', label: 'Instagram' },
                { icon: <Youtube size={14} />, href: 'https://youtube.com', label: 'Youtube' },
              ].map(({ icon, href, label }, i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-white/30 hover:text-luxury-gold hover:bg-luxury-gold/5 transition-all duration-300"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Columns: Structured Navigation Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {Object.entries(columns).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-6"
                  style={{ color: 'rgba(201,168,76,0.65)' }}>
                  {category}
                </h4>
                <ul className="space-y-4">
                  {links.map((link, i) => (
                    <li key={i}>
                      <a href={link.href} className="flex items-center gap-1.5 text-xs text-white/35 hover:text-luxury-gold-light transition-all duration-300 group w-fit"
                        style={{ fontWeight: 300 }}>
                        <span className="transition-transform group-hover:translate-x-0.5">{link.label}</span>
                        <ArrowRight size={10} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-luxury-gold" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ===== FOOTER BOTTOM BAR ===== */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-[10px] uppercase tracking-wider font-light" style={{ fontWeight: 300 }}>
            {footer.copyright}
          </p>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-white/20">
            {bottomLinks.map((label, i) => (
              <a key={i} href={bottomHrefs[i]} className="hover:text-luxury-gold-light transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
