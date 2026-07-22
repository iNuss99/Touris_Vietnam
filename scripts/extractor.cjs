const fs=require('fs');
let c=fs.readFileSync('src/i18n/translations.js','utf8');
c=c.replace('export default translations;','module.exports = translations;');
fs.writeFileSync('temp_extractor.cjs',c);
const t=require('./temp_extractor.cjs');
const tours=t.vi.destinations.items;
let out='DỮ LIỆU CÁC TOUR DU LỊCH (KNOWLEDGE BASE CHO BOTPRESS)\n\n';
tours.forEach(x=>{
  out+=`Tên Tour: ${x.tour.tourName}\nĐịa điểm: ${x.title} (${x.location})\nGiá: ${x.tour.price} ${x.tour.pricePer}\nThời gian: ${x.duration}\nLịch trình:\n - ${x.tour.itinerary.join('\n - ')}\nĐiểm nổi bật:\n - ${x.tour.highlights.join('\n - ')}\nBao gồm:\n - ${x.tour.includes.join('\n - ')}\nThời điểm lý tưởng: ${x.bestTime}\nĐặc sản: ${x.cuisine}\n\n----------------------------\n\n`;
});
fs.writeFileSync('DuLieuTour_Botpress.txt',out);
fs.unlinkSync('temp_extractor.cjs');
console.log('Done!');
