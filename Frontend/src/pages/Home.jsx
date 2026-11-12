import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PackageOpen, AlertCircle } from 'lucide-react';
import listingService from '../api/services/listingService';
import ListingCard from '../components/ListingCard';
import FilterBar from '../components/FilterBar';

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentFilters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
    status: 'active',
  };

  const fetchListings = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.getAll(filters);
      if (response && response.success) {
        setListings(response.data || []);
        if (response.meta) {
          setPagination(response.meta);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'İlanlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(currentFilters);
  }, [searchParams, fetchListings]);

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cherry-950 via-cherry-900 to-rose-900 text-white p-8 md:p-12 mb-8 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider text-rose-200 uppercase mb-3">
            Doğrudan Üreticiden Tüketiciye
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Türkiye'nin En Güvenilir Tarım Pazar Yeri
          </h1>
          <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
            Traktörden tohuma, büyükbaştan taze hasada binlerce çiftçi ilanını hemen inceleyin veya kendi ürününüzü anında satın.
          </p>
        </div>
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-rose-700/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Filtreleme Çubuğu */}
      <FilterBar initialFilters={currentFilters} onFilterChange={handleFilterChange} />

      {/* İlanlar Bölümü */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900">
            Aktif İlanlar{' '}
            <span className="text-sm font-normal text-stone-500">
              ({pagination.totalItems} ilan bulundu)
            </span>
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse space-y-4"
              >
                <div className="aspect-video bg-stone-200 rounded-xl"></div>
                <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                <div className="h-6 bg-stone-200 rounded w-1/2"></div>
                <div className="h-3 bg-stone-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-rose-50 text-cherry-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Aramaya Uygun İlan Bulunamadı</h3>
            <p className="text-stone-500 text-sm mb-6">
              Arama kriterlerinizi değiştirerek veya filtreleri temizleyerek tekrar deneyebilirsiniz.
            </p>
            <button
              onClick={() => handleFilterChange({})}
              className="px-5 py-2.5 bg-cherry-800 hover:bg-cherry-900 text-white rounded-xl text-xs font-bold transition shadow"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Sayfalama (Pagination) */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Önceki Sayfa"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-semibold text-stone-600 px-4 py-2 bg-white rounded-xl border border-stone-200">
              Sayfa {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Sonraki Sayfa"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
