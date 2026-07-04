// import react va hook useState
import React, { useState } from 'react';
// import cac icon can thiet tu lucide-react, dong thoi them CheckCircle va loai bo code thua
import { ArrowRight, Star, Clock, MapPin, X, Calendar, Compass, Sun, CheckCircle } from 'lucide-react';

// import cac file hinh anh dia danh phien ban webp da duoc nen de tang toc do load trang
import imgHaLong from '../assets/images/places/halong-bay.webp';
import imgHoiAn from '../assets/images/places/hoi-an.webp';
import imgTrangAn from '../assets/images/places/trang-an.webp';
import imgPhuQuoc from '../assets/images/places/phu-quoc.webp';
import imgSaPa from '../assets/images/places/sapa.webp';
import imgDaNang from '../assets/images/places/da-nang.webp';

// Du lieu diem den voi thong tin chi tiet ve dia diem va tour
const DESTINATIONS = [
  {
    id: 'halong',
    title: 'Vịnh Hạ Long',
    category: 'Di Sản Thiên Nhiên',
    description: 'Kiệt tác tạo hóa với hàng ngàn hòn đảo đá vôi kỳ vĩ nhô lên giữa làn nước xanh ngọc huyền ảo.',
    image: imgHaLong,
    rating: 4.9,
    duration: '2-3 Ngày',
    location: 'Quảng Ninh',
    badge: 'UNESCO',
    delay: '0ms',
    about: 'Vịnh Hạ Long nằm ở bờ tây vịnh Bắc Bộ, là di sản thiên nhiên thế giới được UNESCO công nhận. Với hơn 1.600 hòn đảo đá vôi lớn nhỏ được bao phủ bởi thảm thực vật nhiệt đới phong phú, Hạ Long tựa như một bức tranh thủy mặc khổng lồ được thiên nhiên tạc nên giữa biển khơi, mang vẻ đẹp huyền bí thách thức thời gian.',
    bestTime: 'Tháng 4 - Tháng 6 & Tháng 9 - Tháng 11 (tránh bão)',
    cuisine: 'Chả mực giã tay ăn kèm xôi nóng, Sá sùng khô/tươi, Hàu đá nướng mỡ hành, Bánh gật gù.',
    localHighlights: [
      'Du thuyền nghỉ dưỡng 5 sao sang trọng neo đậu qua đêm trên vịnh.',
      'Khám phá các hang động thạch nhũ hàng triệu năm tuổi như Hang Sửng Sốt, Động Thiên Cung.',
      'Trải nghiệm chèo thuyền Kayak tự do lướt trên làn nước xanh ngọc tại khu vực Hang Luồn.',
      'Chinh phục đỉnh núi trên đảo Ti Tốp ngắm toàn cảnh vịnh 360 độ từ trên cao.',
    ],
    tour: {
      tourName: 'Hạ Long Bay Luxury Cruise',
      price: '12,900,000',
      pricePer: 'VNĐ / người',
      highlights: [
        'Du thuyền 5 sao qua đêm trên vịnh',
        'Chèo kayak khám phá hang Luồn bí ẩn',
        'Thưởng thức hải sản tươi sống trên du thuyền',
        'Ngắm hoàng hôn trên boong thượng',
        'Tham quan làng chài Cửa Vạn',
        'Tắm biển tại bãi Ti Tốp',
      ],
      includes: ['Xe đưa đón từ Hà Nội', 'Khách sạn 4-5 sao', 'Tất cả bữa ăn', 'Hướng dẫn viên', 'Bảo hiểm du lịch'],
      itinerary: ['Ngày 1: Hà Nội → Bến tàu Tuần Châu → Du thuyền → Hang Sửng Sốt', 'Ngày 2: Bình minh trên vịnh → Kayak → Bãi Ti Tốp → Trở về'],
    },
  },
  {
    id: 'hoian',
    title: 'Hội An',
    category: 'Di Sản Văn Hóa',
    description: 'Phố cổ thơ mộng lung linh đèn lồng rực rỡ, kiến trúc cổ đô hòa quyện cùng tinh thần hiện đại.',
    image: imgHoiAn,
    rating: 4.8,
    duration: '2-4 Ngày',
    location: 'Quảng Nam',
    badge: 'UNESCO',
    delay: '100ms',
    about: 'Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn, tỉnh Quảng Nam. Từng là một thương cảng quốc tế sầm uất thế kỷ XVII-XVIII, Hội An lưu giữ gần như nguyên vẹn hơn 1.000 di tích kiến trúc cổ xưa như nhà cửa, hội quán, đình chùa, giếng nước... kết hợp hài hòa nét văn hóa Việt - Hoa - Nhật.',
    bestTime: 'Tháng 2 - Tháng 4 (thời tiết khô ráo, gió mát dịu nhẹ)',
    cuisine: 'Cao lầu Hội An, Cơm gà Phố Hội, Bánh mì Phượng/Madame Khánh, Hoành thánh chiên giòn.',
    localHighlights: [
      'Thả hoa đăng cầu may trên sông Thu Bồn lung linh đèn lồng rực rỡ.',
      'Khám phá kiến trúc cổ độc đáo hơn 400 năm tuổi của Chùa Cầu Hội An.',
      'Đạp xe thong dong qua làng rau sạch Trà Quế trải nghiệm làm nông dân thực thụ.',
      'Ghé thăm các xưởng thủ công mỹ nghệ cổ truyền và tự tay làm đèn lồng.',
    ],
    tour: {
      tourName: 'Hội An Heritage Discovery',
      price: '9,500,000',
      pricePer: 'VNĐ / người',
      highlights: [
        'Dạo phố cổ về đêm thả đèn hoa đăng',
        'Trải nghiệm may áo dài truyền thống',
        'Học nấu ăn với đầu bếp địa phương',
        'Đạp xe qua làng rau Trà Quế',
        'Tham quan Chùa Cầu & Nhà cổ Tấn Ký',
        'Tắm biển An Bàng',
      ],
      includes: ['Khách sạn Boutique', 'Xe đạp miễn phí', 'Bữa sáng hàng ngày', 'Hướng dẫn viên', 'Vé tham quan'],
      itinerary: ['Ngày 1: Đà Nẵng → Hội An → Phố cổ → Thả đèn hoa đăng', 'Ngày 2: Làng rau Trà Quế → Học nấu ăn → Biển An Bàng', 'Ngày 3: Cù Lao Chàm → Lặn ngắm san hô → Trở về'],
    },
  },
  {
    id: 'trangan',
    title: 'Tràng An',
    category: 'Di Sản Hỗn Hợp',
    description: 'Non nước Ninh Bình kỳ vĩ — thế giới của những cánh đồng, sông nước và hang động huyền bí.',
    image: imgTrangAn,
    rating: 4.7,
    duration: '1-2 Ngày',
    location: 'Ninh Bình',
    badge: 'Thiên Nhiên',
    delay: '200ms',
    about: 'Quần thể danh thắng Tràng An sở hữu cảnh quan núi đá vôi karst ngập nước đẹp nhất Đông Nam Á. Được bao quanh bởi các vách đá dựng đứng, thung lũng sâu và hệ thống hang động xuyên thủy ngoạn mục, Tràng An là di sản hỗn hợp thế giới đầu tiên tại Việt Nam được UNESCO vinh danh vì cả giá trị văn hóa lẫn thiên nhiên kỳ vĩ.',
    bestTime: 'Tháng 1 - Tháng 3 (mùa lễ hội chùa chiền) & Tháng 5 - Tháng 6 (mùa lúa chín vàng rực Tam Cốc)',
    cuisine: 'Cơm cháy ruốc vàng giòn, Dê núi đá Ninh Bình tái chanh, Ốc núi luộc sả, Rượu cần Nho Quan.',
    localHighlights: [
      'Du ngoạn bằng thuyền chèo tay mộc mạc xuyên qua hàng chục hang xuyên thủy huyền ảo.',
      'Chinh phục đỉnh núi Múa ngắm trọn vẹn thung lũng lúa Tam Cốc uốn lượn thơ mộng.',
      'Chiêm bái chùa Bái Đính — ngôi đại tự sở hữu nhiều kỷ lục châu Á và Việt Nam.',
      'Tham quan cố đô Hoa Lư lịch sử tĩnh lặng, linh thiêng.',
    ],
    tour: {
      tourName: 'Tràng An Eco Adventure',
      price: '5,200,000',
      pricePer: 'VNĐ / người',
      highlights: [
        'Đi thuyền xuyên qua 9 hang động kỳ bí',
        'Leo núi Múa ngắm toàn cảnh Tam Cốc',
        'Thăm chùa Bái Đính — ngôi chùa lớn nhất Đông Nam Á',
        'Đạp xe xuyên cánh đồng lúa vàng',
        'Thưởng thức thịt dê núi đặc sản',
      ],
      includes: ['Xe đưa đón từ Hà Nội', 'Vé thuyền & tham quan', 'Bữa trưa đặc sản', 'Hướng dẫn viên', 'Bảo hiểm'],
      itinerary: ['Ngày 1: Hà Nội → Tràng An → Hang động → Chùa Bái Đính', 'Ngày 2: Núi Múa → Tam Cốc → Cánh đồng lúa → Trở về'],
    },
  },
  {
    id: 'phuquoc',
    title: 'Phú Quốc',
    category: 'Thiên Đường Nghỉ Dưỡng',
    description: 'Đảo ngọc với bãi biển xanh trong, cát trắng mướt mà và những resort đẳng cấp 5 sao.',
    image: imgPhuQuoc,
    rating: 4.9,
    duration: '3-5 Ngày',
    location: 'Kiên Giang',
    badge: 'Luxury',
    delay: '300ms',
    about: 'Đảo Ngọc Phú Quốc là hòn đảo lớn nhất Việt Nam nằm trong vịnh Thái Lan. Nơi đây nổi tiếng toàn cầu bởi những bãi biển cát trắng mịn tựa như kem, làn nước biển ấm trong vắt nhìn thấy đáy, hệ sinh thái rạn san hô đa sắc màu cùng các tổ hợp vui chơi giải trí nghỉ dưỡng siêu sang chuẩn quốc tế.',
    bestTime: 'Tháng 11 - Tháng 4 năm sau (mùa khô nhiệt đới, sóng biển êm ả)',
    cuisine: 'Gỏi cá trích Nam Đảo, Bún quậy Kiến Xây trứ danh, Nhum biển nướng mỡ hành, Còi biên mai.',
    localHighlights: [
      'Tắm biển tại Bãi Sao, Bãi Khem hoang sơ lọt top những bãi biển đẹp nhất hành tinh.',
      'Lặn biển bình khí ngắm rạn san hô rực rỡ tại quần đảo An Thới nguyên sơ.',
      'Trải nghiệm cáp treo vượt biển 3 dây Hòn Thơm dài nhất thế giới ngắm nhìn toàn cảnh từ cabin.',
      'Khám phá thế giới động vật bán hoang dã tại Safari Phú Quốc.',
    ],
    tour: {
      tourName: 'Phú Quốc Island Retreat',
      price: '15,800,000',
      pricePer: 'VNĐ / người',
      highlights: [
        'Nghỉ dưỡng tại Resort 5 sao mặt biển',
        'Lặn biển ngắm rạn san hô rực rỡ',
        'Khám phá VinWonders & Safari',
        'Ngắm hoàng hôn tại Sunset Sanato',
        'Trải nghiệm câu mực đêm trên biển',
        'Spa thư giãn hàng ngày',
      ],
      includes: ['Vé máy bay khứ hồi', 'Resort 5 sao', 'Tất cả bữa ăn', 'Xe & thuyền riêng', 'Hướng dẫn viên VIP'],
      itinerary: ['Ngày 1: Bay đến Phú Quốc → Check-in Resort → Hoàng hôn biển', 'Ngày 2: Lặn biển Nam đảo → Làng chài Hàm Ninh', 'Ngày 3: VinWonders → Safari → Câu mực đêm', 'Ngày 4: Spa & Tự do → Bay về'],
    },
  },
  {
    id: 'sapa',
    title: 'Sa Pa',
    category: 'Khám Phá Văn Hóa',
    description: 'Ruộng bậc thang tuyệt mỹ hòa quyện với nền văn hóa dân tộc Hmông phong phú giữa mây trời Tây Bắc.',
    image: imgSaPa,
    rating: 4.6,
    duration: '2-3 Ngày',
    location: 'Lào Cai',
    badge: 'Trekking',
    delay: '400ms',
    about: 'Sa Pa nằm ở độ cao 1.600m trên dãy Hoàng Liên Sơn hùng vĩ, nổi tiếng với biệt danh "Thị xã trong sương". Nơi đây quyến rũ lòng người bởi vẻ đẹp kỳ vĩ của những thửa ruộng bậc thang xếp tầng như nấc thang lên thiên đường, đỉnh Fansipan hùng vĩ quanh năm mây phủ và nền văn hóa rực rỡ của đồng bào Hmông, Dao, Tày.',
    bestTime: 'Tháng 3 - Tháng 5 (mùa hoa nở ngập tràn thung lũng) & Tháng 9 - Tháng 10 (mùa lúa chín vàng óng ánh)',
    cuisine: 'Lẩu cá hồi/cá tầm ôn đới nóng hổi, Gà đen hầm thuốc bắc, Thịt trâu gác bếp, Cơm lam nướng ống tre.',
    localHighlights: [
      'Đi bộ trekking qua thung lũng Mường Hoa chiêm ngưỡng ruộng bậc thang di sản.',
      'Chinh phục đỉnh Fansipan — Nóc nhà Đông Dương ở độ cao 3.143m bằng tuyến cáp treo hiện đại.',
      'Ghé thăm bản Cát Cát tìm hiểu nghề dệt thổ cẩm cổ truyền của người Hmông.',
      'Thư giãn cơ thể bằng bồn tắm lá thuốc bí truyền của người Dao Đỏ tại bản Tả Phìn.',
    ],
    tour: {
      tourName: 'Sa Pa Highland Trek',
      price: '7,800,000',
      pricePer: 'VNĐ / người',
      highlights: [
        'Trekking qua ruộng bậc thang tuyệt đẹp',
        'Homestay cùng gia đình người Hmông',
        'Chinh phục đỉnh Fansipan bằng cáp treo',
        'Chợ phiên Bắc Hà đầy sắc màu',
        'Thưởng thức thắng cố & cơm lam',
      ],
      includes: ['Tàu hỏa giường nằm', 'Homestay & Khách sạn', 'Bữa ăn đặc sản', 'Porter & Hướng dẫn viên', 'Vé cáp treo'],
      itinerary: ['Ngày 1: Hà Nội → Tàu đêm → Sa Pa', 'Ngày 2: Trek Cát Cát → Lao Chải → Tả Van', 'Ngày 3: Fansipan → Chợ phiên → Trở về'],
    },
  },
  {
    id: 'danang',
    title: 'Đà Nẵng',
    category: 'Thành Phố Biển',
    description: 'Thành phố đáng sống nhất Việt Nam với Cầu Vàng huyền thoại, bãi biển Mỹ Khê và ẩm thực tuyệt vời.',
    image: imgDaNang,
    rating: 4.8,
    duration: '3-4 Ngày',
    location: 'Đà Nẵng',
    badge: 'Hot',
    delay: '500ms',
    about: 'Đà Nẵng là thành phố biển đáng sống bậc nhất Việt Nam, nơi hội tụ hoàn hảo giữa núi rừng, sông ngòi và bờ biển dài thơ mộng. Sở hữu vị trí đắc địa gần 3 di sản thế giới (Huế, Hội An, Mỹ Sơn), Đà Nẵng thu hút du khách bởi hạ tầng du lịch hiện đại, an ninh tuyệt đối, bãi biển Mỹ Khê cát mịn và danh thắng Cầu Vàng nổi tiếng toàn cầu.',
    bestTime: 'Tháng 4 - Tháng 8 (mùa hè nắng rực rỡ, sóng êm lý tưởng nhất cho hoạt động tắm biển giải trí)',
    cuisine: 'Bánh tráng cuốn thịt heo hai đầu da, Mỳ Quảng ếch thơm nồng, Hải sản tươi sống nướng mỡ hành, Bê thui Cầu Mống.',
    localHighlights: [
      'Check-in bức hình để đời tại Cầu Vàng (Golden Bridge) nâng đỡ bởi đôi bàn tay đá khổng lồ trên đỉnh Bà Nà.',
      'Tự do tắm biển và lướt sóng tại bãi biển Mỹ Khê lọt top đẹp nhất hành tinh.',
      'Khám phá hệ thống hang động Phật giáo cổ kính sâu bên trong các ngọn núi Ngũ Hành Sơn.',
      'Thưởng lãm Cầu Rồng phun lửa và phun nước sống động vào dịp cuối tuần.',
    ],
    tour: {
      tourName: 'Đà Nẵng City & Beach',
      price: '11,200,000',
      pricePer: 'VNĐ / người',
      highlights: [
        'Cầu Vàng — Bàn tay khổng lồ Bà Nà Hills',
        'Bãi biển Mỹ Khê — Top 6 bãi biển đẹp nhất hành tinh',
        'Ngũ Hành Sơn & Làng đá Non Nước',
        'Show Ký Ức Hội An ánh sáng thực cảnh',
        'Ẩm thực đường phố Đà Nẵng',
        'Cầu Rồng phun lửa ban đêm',
      ],
      includes: ['Vé máy bay khứ hồi', 'Khách sạn 4 sao view biển', 'Tour Bà Nà Hills', 'Xe riêng', 'Hướng dẫn viên'],
      itinerary: ['Ngày 1: Bay đến → Cầu Rồng → Biển Mỹ Khê', 'Ngày 2: Bà Nà Hills → Cầu Vàng → Fantasy Park', 'Ngày 3: Ngũ Hành Sơn → Hội An → Show Ký Ức Hội An', 'Ngày 4: Tự do → Bay về'],
    },
  },
];

// === DESTINATION CARD COMPONENT ===
const DestinationCard = ({ data, onViewDetail }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0, scale: 1 });
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({ x: -(y - cy) / cy * 8, y: (x - cx) / cx * 8, scale: 1.02 });
    setShinePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0, scale: 1 });

  return (
    <div
      className="tilt-container reveal"
      style={{ transitionDelay: data.delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative rounded-[20px] overflow-hidden cursor-pointer group"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${tilt.scale}, ${tilt.scale}, 1)`,
          transition: tilt.scale === 1 ? 'transform 0.6s cubic-bezier(0.16,1,0.3,1)' : 'transform 0.08s linear',
          height: '480px',
          border: '1px solid rgba(201,168,76,0.12)',
          transformStyle: 'preserve-3d',
          boxShadow: tilt.scale > 1 ? '0 30px 70px -20px rgba(0,0,0,0.7), 0 0 40px -15px rgba(201,168,76,0.15)' : '0 10px 40px -15px rgba(0,0,0,0.5)',
        }}
        onClick={() => onViewDetail(data)}
      >
        {/* Anh nen card */}
        <img src={data.image} alt={data.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{ transform: tilt.scale > 1 ? 'scale(1.06)' : 'scale(1)' }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,8,15,0.97) 0%, rgba(4,8,15,0.5) 45%, rgba(4,8,15,0.1) 75%, transparent 100%)' }}
        />

        {/* Shine effect */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,255,255,0.08) 0%, transparent 55%)`,
            opacity: tilt.scale > 1 ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />

        {/* Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-md"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c', backdropFilter: 'blur(8px)' }}>
            {data.badge}
          </span>
        </div>

        {/* Noi dung */}
        <div className="absolute bottom-0 left-0 right-0 p-7 flex flex-col gap-2" style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-luxury-gold text-luxury-gold" />
              <span className="text-[11px] font-semibold text-luxury-gold-light">{data.rating}</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1 text-white/50">
              <Clock size={10} /><span className="text-[10px]">{data.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50">
              <MapPin size={10} /><span className="text-[10px]">{data.location}</span>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: 'rgba(201,168,76,0.7)' }}>{data.category}</span>
          <h3 className="font-serif text-white font-semibold leading-tight" style={{ fontSize: '1.65rem' }}>{data.title}</h3>
          <p className="text-white/45 text-xs font-light leading-relaxed line-clamp-2">{data.description}</p>
          <div className="flex items-center gap-2 text-luxury-gold text-[11px] font-semibold uppercase tracking-wider mt-1 transition-all duration-300 group-hover:gap-3">
            Xem chi tiết địa danh
            <div className="w-5 h-5 rounded-full border border-luxury-gold/40 flex items-center justify-center group-hover:bg-luxury-gold group-hover:border-luxury-gold transition-all duration-300">
              <ArrowRight size={10} className="group-hover:text-luxury-dark transition-colors duration-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// modal hien thi chi tiet tour cho tung dia diem
const TourDetailModal = ({ destination, onClose }) => {
  // khoi tao hook activeTab o dau component de dung quy tac hooks (khoi chay vo dieu kien)
  const [activeTab, setActiveTab] = useState('about'); 

  // neu khong co thong tin diem den thi tra ve null (dat sau hook de khong bi loi)
  if (!destination) return null;
  
  const { tour, title, image, rating, duration, location, category, about, bestTime, cuisine, localHighlights } = destination;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl overflow-hidden my-8"
        style={{
          background: 'linear-gradient(160deg, rgba(15,22,42,0.98) 0%, rgba(4,8,15,0.98) 100%)',
          border: '1px solid rgba(201,168,76,0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Nut dong */}
        <button onClick={onClose} className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <X size={20} />
        </button>

        {/* Banner anh */}
        <div className="relative h-72 md:h-80 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,22,42,1) 0%, rgba(15,22,42,0.4) 50%, transparent 100%)' }} />
          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c' }}>{category}</span>
              <div className="flex items-center gap-1"><Star size={12} className="fill-luxury-gold text-luxury-gold" /><span className="text-sm font-semibold text-luxury-gold-light">{rating}</span></div>
              <div className="flex items-center gap-1 text-white/50 text-xs"><Clock size={11} />{duration}</div>
              <div className="flex items-center gap-1 text-white/50 text-xs"><MapPin size={11} />{location}</div>
            </div>
            <h2 className="font-serif text-white leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 600 }}>{title}</h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-luxury-dark/40 px-8">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-4 px-4 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all duration-300 ${
              activeTab === 'about' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            Thông Tin Địa Danh
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`py-4 px-4 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all duration-300 ${
              activeTab === 'itinerary' ? 'border-luxury-gold text-luxury-gold' : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            Lịch Trình Tour Gợi Ý
          </button>
        </div>

        {/* Noi dung chi tiet */}
        <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cot trai: Tab Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'about' ? (
              // TAB 1: THONG TIN VE DIA DIEM & DAC SAC
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-gold font-semibold mb-4 flex items-center gap-2">
                    <Compass size={14} /> Giới thiệu chung
                  </h3>
                  <p className="text-white/70 text-sm font-light leading-relaxed text-justify" style={{ fontWeight: 300 }}>
                    {about}
                  </p>
                </div>

                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-emerald-light font-semibold mb-5 flex items-center gap-2">
                    <Star size={14} /> Điểm đặc sắc nổi bật
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {localHighlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl" style={{ background: 'rgba(15,157,138,0.03)', border: '1px solid rgba(15,157,138,0.06)' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-luxury-emerald-light" style={{ background: 'rgba(15,157,138,0.08)' }}>
                          <CheckCircle size={12} className="fill-current text-luxury-dark" />
                        </div>
                        <span className="text-white/60 text-xs font-light leading-relaxed" style={{ fontWeight: 300 }}>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // TAB 2: LICH TRINH TOUR CHI TIET
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-gold font-semibold mb-4">Tên Tour Trải Nghiệm</h3>
                  <p className="text-white font-medium text-lg mb-2">{tour.tourName}</p>
                  <p className="text-white/45 text-xs font-light">Lộ trình được tinh chỉnh bởi các chuyên gia bản địa của Vietnam Tourism để tối ưu hóa thời gian và trải nghiệm.</p>
                </div>

                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-emerald-light font-semibold mb-5">Lộ trình từng ngày</h3>
                  <div className="space-y-4">
                    {tour.itinerary.map((day, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: 'rgba(15,157,138,0.04)', border: '1px solid rgba(15,157,138,0.08)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-luxury-emerald-light text-xs font-bold" style={{ background: 'rgba(15,157,138,0.12)' }}>
                          <Calendar size={14} />
                        </div>
                        <div>
                          <p className="text-white text-xs uppercase tracking-widest font-semibold mb-1">Ngày {i + 1}</p>
                          <span className="text-white/65 text-sm font-light leading-relaxed" style={{ fontWeight: 300 }}>{day.split('→').slice(1).join(' → ') || day}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-luxury-gold font-semibold mb-4">Điểm nhấn của tour</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tour.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] text-white/50 font-light" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cot phai: Gia + Thong tin du lich nhanh */}
          <div className="space-y-6">
            {/* The dat tour */}
            <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(160deg, rgba(30,24,8,0.5) 0%, rgba(10,17,32,0.8) 100%)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 mb-2">Giá tour tham khảo</p>
              <div className="font-serif mb-1" style={{ fontSize: '2.1rem', fontWeight: 600, background: 'linear-gradient(135deg, #f0d080, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {tour.price}
              </div>
              <p className="text-white/35 text-xs">{tour.pricePer}</p>
              
              <a href="#lien-he" onClick={onClose}
                className="btn-glow mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-[0.18em] text-luxury-dark bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dim hover:scale-102 transition-transform shadow-lg shadow-luxury-gold/10">
                Đặt Lịch Tư Vấn
                <ArrowRight size={13} />
              </a>
            </div>

            {/* Quick Travel Guide (Cam nang nhanh) */}
            <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2 flex items-center gap-2"><Sun size={12} className="text-luxury-gold" /> Cẩm nang nhanh</h4>
              
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-white/30 text-[9px] uppercase tracking-wider mb-1">Thời điểm đẹp nhất</p>
                  <p className="text-white/70 font-light" style={{ fontWeight: 300 }}>{bestTime}</p>
                </div>
                
                <div>
                  <p className="text-white/30 text-[9px] uppercase tracking-wider mb-1">Ẩm thực không thể bỏ qua</p>
                  <p className="text-white/70 font-light leading-relaxed" style={{ fontWeight: 300 }}>{cuisine}</p>
                </div>
              </div>
            </div>

            {/* Tour bao gom */}
            <div className="px-1.5">
              <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-3.5 font-semibold">Gói tour bao gồm</h4>
              <ul className="space-y-2.5">
                {tour.includes.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-luxury-emerald-light shrink-0" />
                    <span className="text-white/55 text-xs font-light" style={{ fontWeight: 300 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === MAIN COMPONENT ===
export default function Destinations() {
  const [selectedDest, setSelectedDest] = useState(null);

  return (
    <>
      <section id="kham-pha">
        <div className="max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="text-center reveal" style={{ marginBottom: '72px' }}>
            <div className="flex justify-center mb-5">
              <span className="section-label">Bộ sưu tập kiệt tác</span>
            </div>
            <h2 className="font-serif text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.1 }}>
              Những Điểm Đến Kỳ Vĩ
            </h2>
            <p className="text-white/40 font-light text-sm max-w-lg mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              Từ bán đảo nhiệt đới đến di sản thế giới — mỗi điểm đến là một chương tuyệt vời. Nhấn vào các địa danh để xem cẩm nang du lịch và thông tin chi tiết.
            </p>
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', margin: '24px auto 0' }} />
          </div>

          {/* Grid 6 diem den */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESTINATIONS.map((item, idx) => (
              <DestinationCard key={idx} data={item} onViewDetail={setSelectedDest} />
            ))}
          </div>
        </div>
      </section>

      {/* Modal tour chi tiet */}
      {selectedDest && <TourDetailModal destination={selectedDest} onClose={() => setSelectedDest(null)} />}
    </>
  );
}

