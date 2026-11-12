import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  PackageOpen,
  MapPin,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import listingService from '../api/services/listingService';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, formatPrice } from '../utils/imageUrl';
import toast from 'react-hot-toast';

const statusConfig = {
  active: {
    label: 'Aktif',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  sold: {
    label: 'Satıldı',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  passive: {
    label: 'Pasif',
    className: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};

export const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchMyListings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await listingService.getAll({
        userId: user.id,
        status: 'all',
        limit: 100,
      });
      if (response && response.success) {
        setListings(response.data || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'İlanlarınız yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleStatusChange = async (listingId, newStatus) => {
    setStatusUpdatingId(listingId);
    try {
      const response = await listingService.changeStatus(listingId, newStatus);
      if (response && response.success) {
        setListings((prev) =>
          prev.map((item) => (item.id === listingId ? { ...item, status: newStatus } : item))
        );
        toast.success('İlan durumu güncellendi.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Durum güncellenemedi.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await listingService.delete(deleteTarget.id);
      if (response && response.success) {
        setListings((prev) => prev.filter((item) => item.id !== deleteTarget.id));
        toast.success('İlan başarıyla silindi.');
        setDeleteTarget(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'İlan silinemedi.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Üst Başlık ve Aksiyon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">İlanlarım</h1>
          <p className="text-xs text-stone-500 mt-1">
            Eklediğiniz tüm tarım ve ürün ilanlarını buradan kolayca yönetin
          </p>
        </div>

        <Link
          to="/listings/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-cherry-800 hover:bg-cherry-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition transform active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Yeni İlan Ekle</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-3 mb-6 text-xs">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse flex flex-col md:flex-row items-center gap-4"
            >
              <div className="w-full md:w-48 aspect-video bg-stone-200 rounded-xl"></div>
              <div className="flex-1 space-y-2 w-full">
                <div className="h-4 bg-stone-200 rounded w-1/2"></div>
                <div className="h-6 bg-stone-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-cherry-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 mb-2">Henüz İlanınız Bulunmuyor</h3>
          <p className="text-stone-500 text-xs mb-6">
            Ürünlerinizi yüzlerce çiftçi ve alıcıyla buluşturmak için hemen ilk ilanınızı ekleyin.
          </p>
          <Link
            to="/listings/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cherry-800 hover:bg-cherry-900 text-white rounded-xl text-xs font-bold transition shadow"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Yeni İlan Oluştur</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((item) => {
            const imageUrl = getImageUrl(item.imageUrl);
            const statusInfo = statusConfig[item.status] || statusConfig.active;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:shadow-md"
              >
                {/* Sol Kısım: Görsel & Temel Bilgiler */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.querySelector('.item-fallback').style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`item-fallback w-full h-full ${imageUrl ? 'hidden' : 'flex'} items-center justify-center bg-stone-100 text-stone-400`}
                    >
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      {item.category && (
                        <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/listings/${item.id}`}
                      className="text-sm sm:text-base font-bold text-stone-900 hover:text-cherry-800 transition line-clamp-1"
                    >
                      {item.title}
                    </Link>

                    <div className="text-base sm:text-lg font-extrabold text-cherry-800 mt-1">
                      {formatPrice(item.price)}
                    </div>

                    {item.location && (
                      <div className="flex items-center text-xs text-stone-400 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sağ Kısım: Hızlı Yönetim Kontrolleri */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  {/* Hızlı Durum Değiştirici */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-stone-500">Durum:</span>
                    <select
                      value={item.status}
                      disabled={statusUpdatingId === item.id}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-800 cursor-pointer disabled:opacity-50"
                    >
                      <option value="active">Aktif</option>
                      <option value="sold">Satıldı</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>

                  {/* İlanı Görüntüle */}
                  <Link
                    to={`/listings/${item.id}`}
                    className="p-2 text-stone-600 hover:text-cherry-800 hover:bg-stone-100 rounded-lg transition"
                    title="İlanı İncele"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>

                  {/* Düzenle */}
                  <Link
                    to={`/listings/${item.id}/edit`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Düzenle</span>
                  </Link>

                  {/* Sil */}
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="İlanı Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-cherry-800 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900">İlanı Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                "{deleteTarget.title}" başlıklı ilan kalıcı olarak silinecektir.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {deleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;
