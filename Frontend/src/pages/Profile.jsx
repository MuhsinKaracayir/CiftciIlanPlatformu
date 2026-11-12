import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ListOrdered,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import listingService from '../api/services/listingService';

export const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
    passive: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      try {
        const response = await listingService.getAll({
          userId: user.id,
          status: 'all',
          limit: 100,
        });

        if (response && response.success && Array.isArray(response.data)) {
          const items = response.data;
          setStats({
            total: items.length,
            active: items.filter((i) => i.status === 'active').length,
            sold: items.filter((i) => i.status === 'sold').length,
            passive: items.filter((i) => i.status === 'passive').length,
          });
        }
      } catch (err) {
        console.error('İstatistikler yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Sade ve Modern Üst Profil Kartı (Bordo Banner Kaldırıldı) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          {/* Sol Kısım: Avatar ve Kullanıcı Bilgisi */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 shadow-inner">
              <User className="h-10 w-10 sm:h-12 sm:w-12 text-cherry-800" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {user?.fullName || 'Kullanıcı'}
                </h1>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  title="Doğrulanmış Hesap"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Doğrulanmış</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-semibold">
                  {user?.role === 'admin' ? 'Yönetici (Admin)' : 'Üretici / Çiftçi'}
                </span>
                <span>Hesap No: #{user?.id}</span>
              </div>
            </div>
          </div>

          {/* Sağ Kısım: Hızlı Eylemler (Yeni İlan, İlanlarım) */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              to="/listings/new"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cherry-800 hover:bg-cherry-900 text-white rounded-xl text-xs font-bold transition shadow"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Yeni İlan</span>
            </Link>
            <Link
              to="/my-listings"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
            >
              <ListOrdered className="h-4 w-4" />
              <span>İlanlarım</span>
            </Link>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <Mail className="h-4 w-4 text-stone-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-stone-400 block font-medium">E-Posta</span>
              <span className="font-bold text-stone-800 truncate block">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <Phone className="h-4 w-4 text-stone-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-stone-400 block font-medium">Telefon</span>
              <span className="font-bold text-stone-800 truncate block">{user?.phone || 'Belirtilmedi'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-100">
            <Calendar className="h-4 w-4 text-stone-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-stone-400 block font-medium">Üyelik Tarihi</span>
              <span className="font-bold text-stone-800 truncate block">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Bugün'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistik Kutuları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm text-center">
          <div className="text-2xl font-black text-stone-800">
            {loading ? '-' : stats.total}
          </div>
          <span className="text-xs font-semibold text-stone-500 mt-1 block">Toplam İlan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm text-center">
          <div className="text-2xl font-black text-emerald-600">
            {loading ? '-' : stats.active}
          </div>
          <span className="text-xs font-semibold text-emerald-800 mt-1 block">Yayındaki İlan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm text-center">
          <div className="text-2xl font-black text-amber-600">
            {loading ? '-' : stats.sold}
          </div>
          <span className="text-xs font-semibold text-amber-800 mt-1 block">Satılan Ürün</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-black text-slate-500">
            {loading ? '-' : stats.passive}
          </div>
          <span className="text-xs font-semibold text-slate-600 mt-1 block">Pasif İlan</span>
        </div>
      </div>

      {/* Hızlı Bilgi Paneli */}
      <div className="bg-rose-50/70 border border-rose-200/60 rounded-3xl p-6 flex items-start gap-4">
        <div className="p-2.5 bg-cherry-900 text-white rounded-2xl flex-shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-cherry-900">Üretici İpuçları</h4>
          <p className="text-xs text-cherry-950 mt-1 leading-relaxed">
            İlanlarınıza net ve yüksek kaliteli ürün fotoğrafları eklemeniz, alıcıların güvenini kazanmanızı ve ilanınızın çok daha hızlı alıcı bulmasını sağlar. Ayrıca açıklamalarınızda teslimat şekli ve ölçüm birimini (kilo, ton, adet) belirtmeyi unutmayınız.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
