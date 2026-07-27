import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Map, Image as ImageIcon, Loader2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ContentView() {
  const [activeTab, setActiveTab] = useState('tours');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/${activeTab}`);
      if (!res.ok) throw new Error('Failed to fetch ' + activeTab);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentItem({});
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    try {
      const token = localStorage.getItem('touris_token');
      const res = await fetch(`${BACKEND_URL}/api/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      alert('Lỗi khi xóa: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('touris_token');
      const method = currentItem.id ? 'PUT' : 'POST';
      const url = currentItem.id 
        ? `${BACKEND_URL}/api/${activeTab}/${currentItem.id}`
        : `${BACKEND_URL}/api/${activeTab}`;
        
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentItem)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      await fetchItems();
      setIsEditing(false);
    } catch (err) {
      alert('Lỗi lưu: ' + err.message);
    }
  };

  const renderForm = () => {
    const isTour = activeTab === 'tours';
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
        <h3 className="text-lg font-sans font-bold text-slate-800 mb-6">
          {currentItem.id ? `Sửa ${isTour ? 'Tour' : 'Điểm đến'}` : `Thêm ${isTour ? 'Tour' : 'Điểm đến'} mới`}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên / Tiêu đề *</label>
            <input required type="text" value={currentItem.title || ''} onChange={e => setCurrentItem({...currentItem, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Địa điểm *</label>
            <input required type="text" value={currentItem.location || ''} onChange={e => setCurrentItem({...currentItem, location: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Thời gian (VD: 3N2Đ) *</label>
            <input required type="text" value={currentItem.duration || ''} onChange={e => setCurrentItem({...currentItem, duration: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{isTour ? 'Giá' : 'Giá từ'} *</label>
            <input required type="text" value={currentItem.price || currentItem.tour_price || ''} onChange={e => setCurrentItem(isTour ? {...currentItem, price: e.target.value} : {...currentItem, tour_price: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Đánh giá (1-5)</label>
            <input type="number" step="0.1" max="5" min="1" value={currentItem.rating || ''} onChange={e => setCurrentItem({...currentItem, rating: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">URL Hình ảnh</label>
            <input type="text" value={currentItem.image_url || ''} onChange={e => setCurrentItem({...currentItem, image_url: e.target.value})} placeholder="https://..." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          {isTour && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Số khách tối đa</label>
                <input type="text" value={currentItem.max_guests || ''} onChange={e => setCurrentItem({...currentItem, max_guests: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Ngày khởi hành (YYYY-MM-DD)</label>
                <input type="date" value={currentItem.start_date ? currentItem.start_date.split('T')[0] : ''} onChange={e => setCurrentItem({...currentItem, start_date: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
              </div>
            </>
          )}
          {!isTour && (
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700">Danh mục (Category)</label>
               <input type="text" value={currentItem.category || ''} onChange={e => setCurrentItem({...currentItem, category: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
             </div>
          )}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
            <textarea rows="3" value={currentItem.description || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
          </div>
          
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium">
              Hủy
            </button>
            <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm font-medium">
              Lưu thay đổi
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
          <p className="text-slate-500 mt-1">Cập nhật thông tin Tour, Khuyến mãi & Điểm đến</p>
        </div>
        <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm font-medium">
          <Plus size={18} />
          Thêm {activeTab === 'tours' ? 'Tour' : 'Điểm đến'}
        </button>
      </div>

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

      {loading && !isEditing ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin text-teal-500 mb-4" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hình ảnh</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiêu đề / Địa điểm</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      Chưa có nội dung nào.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{item.title || item.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                          <Map size={12} /> {item.location || item.subtitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {item.duration}
                      </td>
                      <td className="px-6 py-4 font-bold text-teal-600">
                        {item.price || item.tour_price}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(item)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Chỉnh sửa">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
