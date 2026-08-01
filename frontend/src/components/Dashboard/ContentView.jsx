import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Map, Image as ImageIcon, Loader2, Star, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import imgHaLong from '../../assets/images/places/halong-bay.webp';
import imgHoiAn from '../../assets/images/places/hoi-an.webp';
import imgTrangAn from '../../assets/images/places/trang-an.webp';
import imgPhuQuoc from '../../assets/images/places/phu-quoc.webp';
import imgSaPa from '../../assets/images/places/sapa.webp';
import imgDaNang from '../../assets/images/places/da-nang.webp';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://touris-vietnam-api.vercel.app';

const DESTINATION_PRESET_IMAGES = [
  { label: 'Hạ Long', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', local: imgHaLong },
  { label: 'Hội An', url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80', local: imgHoiAn },
  { label: 'Tràng An', url: 'https://images.unsplash.com/photo-1596401057633-531022261759?auto=format&fit=crop&w=800&q=80', local: imgTrangAn },
  { label: 'Phú Quốc', url: 'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=80', local: imgPhuQuoc },
  { label: 'Sa Pa', url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80', local: imgSaPa },
  { label: 'Đà Nẵng', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80', local: imgDaNang }
];

export default function ContentView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tours');
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // 1. TanStack Query: Tải danh sách Tour/Điểm đến với cơ chế cache tức thì 5 phút
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['content', activeTab],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_URL}/api/${activeTab}`);
      if (!res.ok) throw new Error('Failed to fetch ' + activeTab);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. TanStack Mutation: Xóa sản phẩm
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = sessionStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Lỗi không thể xóa');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', activeTab] });
      setDeleteConfirmItem(null);
    },
    onError: (err) => {
      alert('Lỗi khi xóa: ' + err.message);
    }
  });

  // 3. TanStack Mutation: Thêm mới hoặc Cập nhật sản phẩm
  const saveMutation = useMutation({
    mutationFn: async (item) => {
      const token = sessionStorage.getItem('touris_token');
      const method = item.id ? 'PUT' : 'POST';
      const url = item.id 
        ? `${BACKEND_URL}/api/${activeTab}/${item.id}`
        : `${BACKEND_URL}/api/${activeTab}`;
        
      const payload = {
        ...item,
        image_url: item.image_url || getDisplayImage(item)
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', activeTab] });
      setIsEditing(false);
    },
    onError: (err) => {
      alert('Lỗi lưu: ' + err.message);
    }
  });

  const getDisplayImage = (item) => {
    if (!item) return imgHaLong;
    if (item.image_url && item.image_url.trim() !== '') {
      return item.image_url;
    }
    const key = (item.title || item.name || item.location || item.code || '').toLowerCase();
    if (key.includes('hạ long') || key.includes('halong')) return imgHaLong;
    if (key.includes('hội an') || key.includes('hoian')) return imgHoiAn;
    if (key.includes('tràng an') || key.includes('trangan')) return imgTrangAn;
    if (key.includes('phú quốc') || key.includes('phuquoc')) return imgPhuQuoc;
    if (key.includes('sa pa') || key.includes('sapa')) return imgSaPa;
    if (key.includes('đà nẵng') || key.includes('danang')) return imgDaNang;
    
    return imgHaLong;
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentItem({
      image_url: ''
    });
    setIsEditing(true);
  };

  const handleDelete = (item) => {
    setDeleteConfirmItem(item);
  };

  const confirmDelete = () => {
    if (deleteConfirmItem) {
      deleteMutation.mutate(deleteConfirmItem.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(currentItem);
  };

  const renderForm = () => {
    const isTour = activeTab === 'tours';
    const previewImg = currentItem.image_url || getDisplayImage(currentItem);

    return (
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-sans font-bold text-slate-800 flex items-center gap-2">
            <Edit2 size={18} className="text-teal-600" />
            {currentItem.id ? `Chỉnh sửa ${isTour ? 'Tour' : 'Điểm đến'}` : `Thêm ${isTour ? 'Tour' : 'Điểm đến'} mới`}
          </h3>
          <span className="text-xs text-slate-400">* Trường thông tin bắt buộc</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên / Tiêu đề *</label>
            <input required type="text" value={currentItem.title || currentItem.name || ''} onChange={e => setCurrentItem(isTour ? {...currentItem, name: e.target.value, title: e.target.value} : {...currentItem, title: e.target.value})} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Địa điểm *</label>
            <input required type="text" value={currentItem.location || currentItem.subtitle || ''} onChange={e => setCurrentItem(isTour ? {...currentItem, subtitle: e.target.value, location: e.target.value} : {...currentItem, location: e.target.value})} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Thời gian (VD: 3N2Đ, 2-3 Ngày) *</label>
            <input required type="text" value={currentItem.duration || ''} onChange={e => setCurrentItem({...currentItem, duration: e.target.value})} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{isTour ? 'Giá Tour' : 'Giá từ'} *</label>
            <input required type="text" value={currentItem.price || currentItem.tour_price || ''} onChange={e => setCurrentItem(isTour ? {...currentItem, price: e.target.value} : {...currentItem, tour_price: e.target.value})} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Đánh giá (1.0 - 5.0)</label>
            <input type="number" step="0.1" max="5" min="1" value={currentItem.rating || '4.9'} onChange={e => setCurrentItem({...currentItem, rating: e.target.value})} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>

          {/* IMAGE URL WITH PREVIEW & PRESETS */}
          <div className="space-y-2 col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <label className="text-sm font-semibold text-slate-800 flex items-center justify-between">
              <span>Hình ảnh đại diện Tour / Điểm đến</span>
              <span className="text-xs text-teal-600 font-normal">Tự động đồng bộ với Landing Page</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-28 h-20 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
                <img 
                  src={previewImg} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = imgHaLong; }}
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <input 
                  type="text" 
                  value={currentItem.image_url || ''} 
                  onChange={e => setCurrentItem({...currentItem, image_url: e.target.value})} 
                  placeholder="Dán link ảnh (https://...) hoặc chọnPreset bên dưới" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-xs bg-white" 
                />
                
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium mr-1">Gán ảnh Landing Page:</span>
                  {DESTINATION_PRESET_IMAGES.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setCurrentItem({...currentItem, image_url: p.url})}
                      className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                    >
                      📷 {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isTour && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Số khách tối đa</label>
                <input type="text" value={currentItem.max_guests || '20 người'} onChange={e => setCurrentItem({...currentItem, max_guests: e.target.value})} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Thời gian đơn vị</label>
                <input type="text" value={currentItem.unit || 'người'} onChange={e => setCurrentItem({...currentItem, unit: e.target.value})} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
              </div>
            </>
          )}

          {!isTour && (
             <div className="space-y-2 col-span-1 md:col-span-2">
               <label className="text-sm font-medium text-slate-700">Danh mục (Category / Badge)</label>
               <input type="text" value={currentItem.category || currentItem.badge || 'UNESCO HERITAGE'} onChange={e => setCurrentItem({...currentItem, category: e.target.value, badge: e.target.value})} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
             </div>
          )}

          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
            <textarea rows="3" value={currentItem.description || currentItem.about || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value, about: e.target.value})} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
              Hủy
            </button>
            <button type="submit" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors shadow-md font-medium text-sm">
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-sans font-bold text-slate-800">Quản lý Tour & Sản phẩm</h2>
          <p className="text-slate-500 mt-1">Cập nhật danh mục Tour, Khuyến mãi & Điểm đến yêu thích (Đồng bộ với Landing Page)</p>
        </div>
        <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all shadow-md font-medium">
          <Plus size={18} />
          Thêm {activeTab === 'tours' ? 'Tour' : 'Điểm đến'}
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => { setActiveTab('tours'); setIsEditing(false); }}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${activeTab === 'tours' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Map size={18} /> Tours Khuyến Mãi
        </button>
        <button 
          onClick={() => { setActiveTab('destinations'); setIsEditing(false); }}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${activeTab === 'destinations' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <ImageIcon size={18} /> Điểm Đến Yêu Thích
        </button>
      </div>

      {isEditing && renderForm()}

      {isLoading && !isEditing ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin text-teal-500 mb-4" />
          <p>Đang tải dữ liệu sản phẩm...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hình ảnh</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề / Địa điểm</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      Chưa có nội dung nào trong danh mục này.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const displayImg = getDisplayImage(item);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="w-16 h-12 rounded-xl bg-slate-200 overflow-hidden shadow-sm border border-slate-200 flex items-center justify-center relative group-hover:shadow transition-all">
                            <img 
                              src={displayImg} 
                              alt={item.title || item.name || ''} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                              onError={(e) => {
                                e.target.src = imgHaLong;
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            {item.title || item.name}
                            {item.badge && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-700 rounded border border-teal-200">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Map size={12} className="text-teal-600" /> {item.location || item.subtitle || 'Việt Nam'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {item.duration || '2-3 Ngày'}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-teal-600">
                          {item.price || item.tour_price}
                          {item.unit && <span className="text-[11px] font-normal text-slate-400"> / {item.unit}</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2 transition-opacity">
                            <button onClick={() => handleEdit(item)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors border border-transparent hover:border-sky-200" title="Chỉnh sửa">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200" title="Xóa">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pop-up Xác Nhận Xóa Nhỏ Gọn & Hiện Đại */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Xác nhận xóa?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa <strong className="text-slate-800">"{deleteConfirmItem.title || deleteConfirmItem.name}"</strong>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <span>Xóa vĩnh viễn</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
