import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  X,
  ArrowLeft,
  Tag,
  MapPin,
  Banknote,
  AlertCircle,
  CheckCircle,
  Phone,
  User,
} from 'lucide-react';
import listingService from '../api/services/listingService';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Tarım Ürünleri',
  'Hayvancılık',
  'Traktör & Ekipman',
  'Tohum & Fidan',
  'Yem & Gübre',
  'Bahçe & Sera',
  'Diğer',
];

export const ListingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
    location: '',
    sellerName: user?.fullName || '',
    sellerPhone: user?.phone || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    if (user && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        sellerName: prev.sellerName || user.fullName || '',
        sellerPhone: prev.sellerPhone || user.phone || '',
      }));
    }
  }, [user, isEditMode]);

  useEffect(() => {
    if (isEditMode) {
      const fetchListing = async () => {
        setFetching(true);
        try {
          const response = await listingService.getById(id);
          if (response && response.success && response.data) {
            const item = response.data;
            setFormData({
              title: item.title || '',
              description: item.description || '',
              price: item.price !== undefined ? String(item.price) : '',
              category: item.category || CATEGORIES[0],
              location: item.location || '',
              sellerName: item.sellerName || user?.fullName || '',
              sellerPhone: item.sellerPhone || user?.phone || '',
            });
            if (item.imageUrl) {
              setExistingImageUrl(getImageUrl(item.imageUrl));
            }
          }
        } catch (err) {
          const msg = err?.response?.data?.message || 'İlan bilgileri yüklenemedi.';
          setErrorMessages([msg]);
          toast.error(msg);
        } finally {
          setFetching(false);
        }
      };

      fetchListing();
    }
  }, [id, isEditMode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessages.length > 0) {
      setErrorMessages([]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçiniz.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Görsel boyutu en fazla 5MB olabilir.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = [];

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      clientErrors.push('İlan başlığı en az 3 karakter olmalıdır.');
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      clientErrors.push('İlan açıklaması en az 10 karakter olmalıdır.');
    }

    if (formData.price === '' || Number(formData.price) < 0 || Number.isNaN(Number(formData.price))) {
      clientErrors.push('Geçerli bir fiyat giriniz (0 veya daha büyük).');
    }

    if (!formData.location.trim() || formData.location.trim().length < 2) {
      clientErrors.push('Konum / Şehir bilgisi en az 2 karakter olmalıdır.');
    }

    const resolvedSellerName = (isEditMode ? formData.sellerName : user?.fullName) || user?.fullName || '';
    const resolvedSellerPhone = (isEditMode ? formData.sellerPhone : user?.phone) || user?.phone || '';

    if (!resolvedSellerName.trim() || resolvedSellerName.trim().length < 2) {
      clientErrors.push('İlan oluşturmak için geçerli bir kullanıcı ad-soyad bilgisi bulunamadı.');
    }

    if (!resolvedSellerPhone.trim() || resolvedSellerPhone.trim().length < 7) {
      clientErrors.push('İlan verebilmek için profilinizde kayıtlı geçerli bir telefon numarası bulunmalıdır.');
    }

    if (clientErrors.length > 0) {
      setErrorMessages(clientErrors);
      toast.error('Lütfen formdaki eksik veya hatalı alanları düzeltiniz.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setErrorMessages([]);

    const payload = new FormData();
    payload.append('title', formData.title.trim());
    payload.append('description', formData.description.trim());
    payload.append('price', String(formData.price));
    payload.append('category', formData.category);
    payload.append('location', formData.location.trim());
    payload.append('sellerName', resolvedSellerName.trim());
    payload.append('sellerPhone', resolvedSellerPhone.trim());

    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      if (isEditMode) {
        const response = await listingService.update(id, payload);
        if (response && response.success) {
          toast.success('İlan başarıyla güncellendi.');
          navigate(`/listings/${id}`);
        }
      } else {
        const response = await listingService.create(payload);
        if (response && response.success) {
          toast.success('İlanınız başarıyla yayınlandı.');
          const createdId = response.data?.id;
          if (createdId) {
            navigate(`/listings/${createdId}`);
          } else {
            navigate('/my-listings');
          }
        }
      }
    } catch (err) {
      const responseData = err?.response?.data;
      if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const serverErrors = responseData.errors.map((e) => e.message || `${e.field} hatalı`);
        setErrorMessages(serverErrors);
        toast.error('Doğrulama hatası oluştu.');
      } else {
        const defaultMsg = responseData?.message || err.message || 'İşlem başarısız oldu.';
        setErrorMessages([defaultMsg]);
        toast.error(defaultMsg);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cherry-200 border-t-cherry-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Geri Dön Butonu */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-cherry-900 transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Geri Dön</span>
      </button>

      {/* Form Kartı */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 sm:p-8">
        <div className="border-b border-stone-100 pb-5 mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            {isEditMode ? 'İlanı Düzenle' : 'Yeni Tarım İlanı Oluştur'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Ürününüzün detaylarını eksiksiz girerek daha fazla alıcıya ulaşın
          </p>
        </div>

        {/* Hata Kutusu */}
        {errorMessages.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-red-900">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span>Lütfen aşağıdaki doğrulama hatalarını gideriniz:</span>
            </div>
            <ul className="list-disc list-inside pl-1 space-y-1 text-red-700">
              {errorMessages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Başlık */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              İlan Başlığı <span className="text-red-500">*</span>
              <span className="font-normal text-stone-400 ml-1.5">(En az 3 karakter)</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Örn: 2020 Model Traktör veya 5 Ton Organik Domates"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition"
              required
            />
          </div>

          {/* Kategori ve Fiyat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Kategori <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Fiyat (₺) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Konum */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Konum / Şehir <span className="text-red-500">*</span>
              <span className="font-normal text-stone-400 ml-1.5">(En az 2 karakter)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Örn: Konya / Karatay"
                className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition"
                required
              />
            </div>
          </div>

          {/* İletişim Bilgileri (Profil Bilgilerinden Otomatik Alınır) */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
              <span className="text-xs font-bold text-stone-800">İletişim Bilgileri (Hesabınızdan Alınmaktadır)</span>
              <span className="text-[11px] text-stone-500">Alıcılar bu bilgiler üzerinden size ulaşacaktır</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-cherry-800" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block font-medium">İlan Sahibi</span>
                  <span className="font-bold text-stone-800 truncate block">
                    {(isEditMode ? formData.sellerName : user?.fullName) || user?.fullName || 'Belirtilmedi'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-cherry-800" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block font-medium">İletişim Telefonu</span>
                  <span className="font-bold text-stone-800 truncate block">
                    {((isEditMode ? formData.sellerPhone : user?.phone) || user?.phone) ? (
                      ((isEditMode ? formData.sellerPhone : user?.phone) || user?.phone)
                    ) : (
                      <span className="text-red-500 font-semibold">Kayıtlı telefon numarası yok</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {!(isEditMode ? formData.sellerPhone || user?.phone : user?.phone) && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>İlan verebilmek için profilinizde kayıtlı bir telefon numarası bulunmalıdır.</span>
                <Link
                  to="/profile"
                  className="font-bold underline text-amber-950 hover:text-black transition flex-shrink-0"
                >
                  Profil Sayfasına Git
                </Link>
              </div>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Detaylı Açıklama <span className="text-red-500">*</span>
                <span className="font-normal text-stone-400 ml-1.5">(En az 10 karakter)</span>
              </label>
              <span className={`text-[11px] ${formData.description.trim().length >= 10 ? 'text-emerald-600 font-semibold' : 'text-stone-400'}`}>
                {formData.description.trim().length} / 10 min
              </span>
            </div>
            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ürünün durumunu, hasat tarihini, teslimat şeklini ve ölçüm birimini detaylı şekilde belirtiniz..."
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition leading-relaxed"
              required
            ></textarea>
          </div>

          {/* Resim Yükleme ve Önizleme */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Ürün Görseli <span className="font-normal text-stone-400">(Opsiyonel)</span>
            </label>

            {imagePreview || existingImageUrl ? (
              <div className="relative aspect-video w-full max-w-md rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 mb-3 group">
                <img
                  src={imagePreview || existingImageUrl}
                  alt="Önizleme"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
                  title="Görseli Kaldır"
                >
                  <X className="h-4 w-4" />
                </button>
                {imagePreview && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md">
                    Yeni Seçildi
                  </span>
                )}
              </div>
            ) : null}

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 rounded-2xl hover:border-cherry-700 bg-stone-50/50 hover:bg-rose-50/20 cursor-pointer transition">
              <Upload className="h-8 w-8 text-cherry-800 mb-2" />
              <span className="text-xs font-bold text-stone-700">
                {imagePreview || existingImageUrl ? 'Farklı bir fotoğraf seç' : 'Fotoğraf yüklemek için tıklayın'}
              </span>
              <span className="text-[11px] text-stone-400 mt-0.5">PNG, JPG, WEBP (En fazla 5MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Kaydet Butonu */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-cherry-800 hover:bg-cherry-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>{isEditMode ? 'Değişiklikleri Kaydet' : 'İlanı Yayınla'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingForm;
