import React, { useState, useEffect } from 'react';
import { Search, MapPin, Tag, Banknote, RotateCcw, Filter } from 'lucide-react';

const CATEGORIES = [
  'Tüm Kategoriler',
  'Tarım Ürünleri',
  'Hayvancılık',
  'Traktör & Ekipman',
  'Tohum & Fidan',
  'Yem & Gübre',
  'Bahçe & Sera',
  'Diğer',
];

export const FilterBar = ({ initialFilters = {}, onFilterChange }) => {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [location, setLocation] = useState(initialFilters.location || '');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');

  useEffect(() => {
    setSearch(initialFilters.search || '');
    setCategory(initialFilters.category || '');
    setLocation(initialFilters.location || '');
    setMinPrice(initialFilters.minPrice || '');
    setMaxPrice(initialFilters.maxPrice || '');
  }, [initialFilters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      search: search.trim(),
      category: category === 'Tüm Kategoriler' ? '' : category,
      location: location.trim(),
      minPrice: minPrice ? Number(minPrice) : '',
      maxPrice: maxPrice ? Number(maxPrice) : '',
      page: 1,
    });
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({
      search: '',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      page: 1,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/90 p-5 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Üst Satır: Arama, Kategori, Konum */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Arama */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İlan başlığı veya açıklamada ara..."
              className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition"
            />
          </div>

          {/* Kategori */}
          <div className="md:col-span-4 relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === 'Tüm Kategoriler' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Konum */}
          <div className="md:col-span-3 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Şehir / Konum"
              className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Alt Satır: Fiyat Filtresi ve Butonlar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
              <Banknote className="h-3.5 w-3.5 text-stone-400" />
              Fiyat Aralığı:
            </span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="En az (₺)"
              min="0"
              className="w-28 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition"
            />
            <span className="text-stone-400 text-xs">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="En çok (₺)"
              min="0"
              className="w-28 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Sıfırla</span>
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-cherry-800 hover:bg-cherry-900 shadow-md hover:shadow-lg transition transform active:scale-95"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filtrele</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FilterBar;
