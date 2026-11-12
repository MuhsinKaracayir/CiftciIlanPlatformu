import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Tag,
  Phone,
  User,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
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
    className: 'bg-emerald-600 text-white',
  },
  sold: {
    label: 'Satıldı',
    className: 'bg-amber-600 text-white',
  },
  passive: {
    label: 'Pasif',
    className: 'bg-slate-500 text-white',
  },
};

export const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listingService.getById(id);
        if (response && response.success) {
          setListing(response.data);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'İlan detayları yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const isOwner = Boolean(
    isAuthenticated &&
    user &&
    listing &&
    (user.id === listing.userId || user.role === 'admin')
  );

  const handleStatusChange = async (newStatus) => {
    if (!listing || listing.status === newStatus) return;
    setStatusUpdating(true);
    try {
      const response = await listingService.changeStatus(listing.id, newStatus);
      if (response && response.success) {
        setListing((prev) => ({ ...prev, status: newStatus }));
        toast.success(`İlan durumu '${statusConfig[newStatus]?.label || newStatus}' olarak güncellendi.`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Durum güncellenirken bir hata oluştu.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await listingService.delete(listing.id);
      if (response && response.success) {
        toast.success('İlan başarıyla silindi.');
        navigate('/my-listings');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'İlan silinemedi.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cherry-200 border-t-cherry-800"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">İlan Bulunamadı</h2>
          <p className="text-stone-600 text-sm mb-6">{error || 'İstediğiniz ilan mevcut değil veya kaldırılmış.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-cherry-800 hover:bg-cherry-900 text-white rounded-xl text-xs font-bold transition shadow"
          >
            İlanlara Dön
          </button>
        </div>
      </div>
    );
  }

  const fullImageUrl = getImageUrl(listing.imageUrl);
  const currentStatus = statusConfig[listing.status] || statusConfig.active;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Üst Bar: Geri Dön ve İlan Sahibi İşlemleri */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-cherry-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Geri Dön</span>
        </button>

        {isOwner && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-500 font-medium mr-1">İlan Sahibi Yönetimi:</span>

            {/* Durum Seçici */}
            <select
              value={listing.status}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-stone-100 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cherry-800 cursor-pointer disabled:opacity-50"
            >
              <option value="active">Aktif</option>
              <option value="sold">Satıldı</option>
              <option value="passive">Pasif</option>
            </select>

            {/* Düzenle Butonu */}
            <Link
              to={`/listings/${listing.id}/edit`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Düzenle</span>
            </Link>

            {/* Sil Butonu */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition border border-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Sil</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Kolon: Görsel ve Açıklama */}
        <div className="lg:col-span-8 space-y-6">
          {/* Büyük Görsel Alanı */}
          <div className="relative rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm aspect-video">
            {fullImageUrl ? (
              <img
                src={fullImageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.querySelector('.detail-fallback').style.display = 'flex';
                }}
              />
            ) : null}

            <div
              className={`detail-fallback w-full h-full ${fullImageUrl ? 'hidden' : 'flex'} flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-stone-200 text-stone-400`}
            >
              <ImageIcon className="h-16 w-16 text-stone-300 mb-2" />
              <span className="text-sm font-medium text-stone-400">Görsel Bulunmuyor</span>
            </div>

            {/* Rozetler */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-md tracking-wide ${currentStatus.className}`}>
                {currentStatus.label}
              </span>
              {listing.category && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/95 text-cherry-900 shadow-md backdrop-blur-sm border border-cherry-100 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-cherry-700" />
                  {listing.category}
                </span>
              )}
            </div>
          </div>

          {/* Açıklama Kartı */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
              İlan Açıklaması
            </h2>
            <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
              {listing.description || 'Bu ilan için detaylı bir açıklama belirtilmemiştir.'}
            </div>

            {/* Ek Detaylar */}
            <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap items-center gap-6 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-stone-400" />
                <span>
                  İlan Tarihi:{' '}
                  {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('tr-TR') : '-'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-stone-400" />
                <span>İlan No: #{listing.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Fiyat ve Satıcı Bilgileri */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fiyat Kartı */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
            <h1 className="text-2xl font-extrabold text-stone-900 leading-tight">
              {listing.title}
            </h1>

            <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl">
              <span className="text-xs font-medium text-rose-800 block mb-1">İstenen Fiyat</span>
              <div className="text-3xl font-black text-cherry-800 tracking-tight">
                {formatPrice(listing.price)}
              </div>
            </div>

            {listing.location && (
              <div className="flex items-center text-sm text-stone-600 pt-2">
                <MapPin className="h-4 w-4 mr-2 text-cherry-700 flex-shrink-0" />
                <span className="font-medium">{listing.location}</span>
              </div>
            )}
          </div>

          {/* Satıcı Bilgileri Kartı */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
              <User className="h-4 w-4 text-cherry-800" />
              <span>Satıcı Bilgileri</span>
            </h3>

            <div>
              <div className="text-base font-bold text-stone-800">
                {listing.sellerName || 'Çiftçi / Üretici'}
              </div>
              <div className="text-xs text-stone-400 mt-0.5">Doğrulanmış İlan Sahibi</div>
            </div>

            {listing.sellerPhone ? (
              <div className="space-y-2 pt-2">
                <a
                  href={`tel:${listing.sellerPhone}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cherry-800 hover:bg-cherry-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition"
                >
                  <Phone className="h-4 w-4" />
                  <span>{listing.sellerPhone}</span>
                </a>
                <p className="text-[11px] text-stone-400 text-center">
                  Güvenliğiniz için kapora ödemesi yapmadan önce ürünü yerinde kontrol ediniz.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-500 text-center">
                Satıcı telefon numarası paylaşılmadı.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-cherry-800 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900">İlanı Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Bu işlem geri alınamaz. İlan ve ilişkili tüm bilgiler kalıcı olarak silinecektir.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDelete}
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

export default ListingDetail;
