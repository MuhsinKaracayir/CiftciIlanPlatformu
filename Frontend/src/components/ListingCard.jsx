import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tag, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { getImageUrl, formatPrice } from '../utils/imageUrl';

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

export const ListingCard = ({ listing }) => {
  const { id, title, price, category, location, imageUrl, status } = listing;
  const fullImageUrl = getImageUrl(imageUrl);
  const currentStatus = statusConfig[status] || statusConfig.active;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col border border-stone-200/80 group">
      {/* Resim Alanı */}
      <div className="relative aspect-video w-full bg-stone-100 overflow-hidden">
        {fullImageUrl ? (
          <img
            src={fullImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.querySelector('.image-fallback').style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback Alanı */}
        <div
          className={`image-fallback w-full h-full ${fullImageUrl ? 'hidden' : 'flex'} flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-stone-200 text-stone-400`}
        >
          <ImageIcon className="h-10 w-10 text-stone-300 mb-1" />
          <span className="text-xs font-medium text-stone-400">Görsel Bulunmuyor</span>
        </div>

        {/* Rozetler (Sağ Üst) */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
          <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full shadow-md tracking-wide ${currentStatus.className}`}
          >
            {currentStatus.label}
          </span>
          {category && (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-white/95 text-cherry-900 shadow-md backdrop-blur-sm border border-cherry-100 flex items-center gap-1">
              <Tag className="w-3 h-3 text-cherry-700" />
              {category}
            </span>
          )}
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-stone-900 group-hover:text-cherry-800 transition line-clamp-1 mb-1.5">
            {title}
          </h3>

          <div className="text-xl font-extrabold text-cherry-800 mb-3 tracking-tight">
            {formatPrice(price)}
          </div>

          {location && (
            <div className="flex items-center text-xs text-stone-500 mb-4">
              <MapPin className="h-3.5 w-3.5 mr-1 text-stone-400 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Detay Butonu */}
        <div className="pt-3 border-t border-stone-100">
          <Link
            to={`/listings/${id}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-50 hover:bg-cherry-700 text-stone-700 hover:text-white rounded-xl text-xs font-bold transition-colors duration-200"
          >
            <span>Detayları Gör</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
