import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Users, Briefcase, MessageSquare, Send, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

// Dinh nghia URL Google Apps Script de lien ket sheet
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPEtkA2xnO83NfViqUBA3y0EPt7CBgoBXrUOc0VNtq06o2VzvftiyAANbIR_NFRCUF/exec";

// Thanh cong animation component — hien thi khi gui form thanh cong
const SuccessOverlay = ({ onReset }) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center rounded-2xl"
      style={{
        background: 'linear-gradient(160deg, rgba(4,8,15,0.98) 0%, rgba(10,20,35,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        animation: 'fadeInScale 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>

      {/* Animated rings */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
          style={{ background: 'linear-gradient(135deg, rgba(15,157,138,0.15), rgba(15,157,138,0.05))', border: '2px solid rgba(15,157,138,0.3)' }}>
          <CheckCircle size={40} className="text-luxury-emerald-light" style={{ animation: 'checkPop 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }} />
          {/* Pulse ring 1 */}
          <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(15,157,138,0.3)', animation: 'pulseRing 2s ease-out infinite' }} />
          {/* Pulse ring 2 */}
          <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(15,157,138,0.2)', animation: 'pulseRing 2s 0.5s ease-out infinite' }} />
        </div>
        {/* Sparkle particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute"
            style={{
              top: '50%', left: '50%',
              width: '4px', height: '4px', borderRadius: '50%',
              background: i % 2 === 0 ? '#c9a84c' : '#34d0be',
              animation: `sparkleFloat${i % 3} ${1.5 + i * 0.2}s ${i * 0.15}s ease-out infinite`,
              opacity: 0,
            }} />
        ))}
      </div>

      <h3 className="font-serif text-white mb-3" style={{ fontSize: '1.8rem', fontWeight: 600 }}>
        Gửi Thành Công!
      </h3>
      <p className="text-white/50 text-sm font-light leading-relaxed max-w-sm mb-2" style={{ fontWeight: 300 }}>
        Yêu cầu của bạn đã được tiếp nhận. Đội ngũ tư vấn viên cao cấp sẽ liên hệ lại trong vòng
      </p>
      <div className="flex items-center gap-2 mb-6">
        <span className="font-serif text-luxury-emerald-light font-semibold text-2xl">24</span>
        <span className="text-white/40 text-xs uppercase tracking-widest">giờ tới</span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl mb-8" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <Sparkles size={14} className="text-luxury-gold shrink-0" />
        <span className="text-white/45 text-xs font-light">Mã yêu cầu: <span className="text-luxury-gold font-medium">VNT-{Date.now().toString(36).toUpperCase()}</span></span>
      </div>

      <button onClick={onReset}
        className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-luxury-emerald/70 hover:text-luxury-emerald-light transition-colors font-medium">
        Gửi yêu cầu mới
        <ArrowRight size={12} />
      </button>

      {/* Inline CSS animations */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes checkPop {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes sparkleFloat0 {
          0% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(-30px, -45px) scale(0); }
        }
        @keyframes sparkleFloat1 {
          0% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(40px, -35px) scale(0); }
        }
        @keyframes sparkleFloat2 {
          0% { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) translate(25px, 40px) scale(0); }
        }
      `}</style>
    </div>
  );
};

export default function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: '', zalo: '', email: '', destination: '',
    date: '', guests: '1', serviceClass: 'Standard', message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const payload = { ...formData, submittedAt: new Date().toLocaleString('vi-VN') };

    try {
      if (!SCRIPT_URL || SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT_URL_HERE")) {
        await new Promise(resolve => setTimeout(resolve, 1800));
        setStatus('success');
        setFormData({ fullName: '', zalo: '', email: '', destination: '', date: '', guests: '1', serviceClass: 'Standard', message: '' });
      } else {
        await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
        setStatus('success');
        setFormData({ fullName: '', zalo: '', email: '', destination: '', date: '', guests: '1', serviceClass: 'Standard', message: '' });
      }
    } catch (error) {
      console.error("Loi khi gui form:", error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-luxury-dark/40 border border-white/10 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300";
  const labelClass = "text-[10px] uppercase tracking-[0.2em] text-white/35 font-medium";

  return (
    <section id="lien-he" className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

        {/* Contact info ben trai (ap dung reveal-left de truot tu trai sang) */}
        <div className="lg:col-span-5 reveal-left">
          <span className="section-label">Kết nối phương xa</span>
          <h2 className="font-serif text-white mt-5 mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, lineHeight: 1.1 }}>
            Liên Hệ Với<br />Ban Tư Vấn
          </h2>
          <p className="text-white/40 font-light text-sm leading-relaxed mb-10" style={{ maxWidth: '380px', fontWeight: 300 }}>
            Điền đầy đủ thông tin hành trình mong muốn của bạn. Đội ngũ chuyên viên chăm sóc khách hàng cao cấp sẽ phản hồi trong vòng 24 giờ.
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(15,157,138,0.08)', border: '1px solid rgba(15,157,138,0.2)' }}>
                <Phone size={16} className="text-luxury-emerald-light" />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">Hotline tư vấn</h4>
                <p className="text-white/40 text-xs mt-1 font-light">+84 0931 143 830</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(15,157,138,0.08)', border: '1px solid rgba(15,157,138,0.2)' }}>
                <Mail size={16} className="text-luxury-emerald-light" />
              </div>
              <div>
                <h4 className="font-medium text-white text-sm">Email hỗ trợ</h4>
                <p className="text-white/40 text-xs mt-1 font-light">domjnhkhoa@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Trust signal */}
          <div className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-6">
              {['Phản hồi 24h', 'Bảo mật thông tin', 'Tư vấn miễn phí'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-luxury-emerald" />
                  <span className="text-white/25 text-[10px] uppercase tracking-widest">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form lien he ben phai (ap dung reveal-right va delay-200 de truot tu phai sang voi do tre nhe) */}
        <div className="lg:col-span-7 reveal-right delay-200">
          <div className="relative rounded-2xl p-8 md:p-10 overflow-hidden"
            style={{ background: 'linear-gradient(160deg, rgba(10,17,32,0.8) 0%, rgba(4,8,15,0.9) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Glow decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', filter: 'blur(30px)' }} />

            {/* Success Overlay */}
            {status === 'success' && <SuccessOverlay onReset={() => setStatus(null)} />}

            <h3 className="font-serif text-white mb-7" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Lên Kế Hoạch Cho Chuyến Đi</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="fullName" className={labelClass}>Họ và tên (*)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/20"><User size={15} /></span>
                    <input type="text" id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="zalo" className={labelClass}>Số điện thoại / Zalo (*)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/20"><Phone size={15} /></span>
                    <input type="tel" id="zalo" name="zalo" required value={formData.zalo} onChange={handleChange} placeholder="0931143830" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="email" className={labelClass}>Địa chỉ Email (*)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/20"><Mail size={15} /></span>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} placeholder="email@example.com" className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="destination" className={labelClass}>Điểm đến mong muốn (*)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/20"><Sparkles size={15} /></span>
                    <select id="destination" name="destination" required value={formData.destination} onChange={handleChange}
                      className="w-full bg-luxury-dark border border-white/10 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 appearance-none">
                      <option value="" disabled>Chọn điểm đến...</option>
                      <option value="Vịnh Hạ Long">Vịnh Hạ Long</option>
                      <option value="Hội An">Hội An</option>
                      <option value="Tràng An">Tràng An</option>
                      <option value="Phú Quốc">Phú Quốc</option>
                      <option value="Sa Pa">Sa Pa</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Khác">Khác (Yêu cầu riêng)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label htmlFor="date" className={labelClass}>Ngày khởi hành</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/20"><Calendar size={15} /></span>
                    <input type="date" id="date" name="date" required value={formData.date} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="guests" className={labelClass}>Số lượng khách</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/20"><Users size={15} /></span>
                    <input type="number" id="guests" name="guests" min="1" required value={formData.guests} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceClass" className={labelClass}>Hạng dịch vụ</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/20"><Briefcase size={15} /></span>
                    <select id="serviceClass" name="serviceClass" value={formData.serviceClass} onChange={handleChange}
                      className="w-full bg-luxury-dark border border-white/10 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 appearance-none">
                      <option value="Standard">Tiêu Chuẩn (Explorer)</option>
                      <option value="Premium">Cao Cấp (Signature)</option>
                      <option value="Luxury">Sang Trọng (Prestige)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="space-y-2">
                <label htmlFor="message" className={labelClass}>Yêu cầu đặc biệt / Lời nhắn</label>
                <div className="relative">
                  <span className="absolute top-3.5 left-3.5 text-white/20"><MessageSquare size={15} /></span>
                  <textarea id="message" name="message" rows="3" value={formData.message} onChange={handleChange}
                    placeholder="Ví dụ: Tôi đi tour hưởng tuần trăng mật, muốn phòng hướng biển..."
                    className="w-full bg-luxury-dark/40 border border-white/10 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300 resize-none" />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading}
                className="btn-glow w-full flex items-center justify-center gap-2.5 text-[12px] uppercase tracking-[0.2em] font-semibold text-luxury-dark bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dim py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-luxury-gold/10">
                {isLoading ? (
                  <>
                    <span>Đang gửi yêu cầu...</span>
                    <div className="w-4 h-4 border-2 border-luxury-dark border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    <span>Gửi Yêu Cầu</span>
                    <Send size={14} />
                  </>
                )}
              </button>

              {/* Error alert */}
              {status === 'error' && (
                <div className="rounded-xl p-4 text-sm text-center font-medium mt-4" style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: '#e74c3c' }}>
                  Có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ hotline.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
