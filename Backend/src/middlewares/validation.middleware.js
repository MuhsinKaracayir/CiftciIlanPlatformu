import fs from 'node:fs/promises';
import { AppError } from '../utils/AppError.js';

async function cleanupTempUploadedFile(file) {
  if (!file?.path) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('[Validation Cleanup Hatasi]: Gecici resim silinemedi:', err.message);
    }
  }
}

function normalizeListingBody(body = {}) {
  return {
    title: body.title ?? body.Title,
    description: body.description ?? body.Description,
    price: body.price ?? body.Price,
    category: body.category ?? body.Category,
    location: body.location ?? body.Location,
    sellerName: body.sellerName ?? body.SellerName,
    sellerPhone: body.sellerPhone ?? body.SellerPhone,
    status: body.status ?? body.Status,
    removeImage: body.removeImage ?? body.RemoveImage,
  };
}

export function validateIdParam(req, res, next) {
  const rawId = req.params.id;

  if (!/^\d+$/.test(rawId)) {
    return next(AppError.badRequest('Gecersiz ilan ID parametresi; pozitif tam sayi olmalidir.'));
  }

  const parsedId = Number(rawId);

  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    return next(AppError.badRequest('Gecersiz ilan ID parametresi; pozitif tam sayi olmalidir.'));
  }

  return next();
}

export async function validateCreateListing(req, res, next) {
  const normalized = normalizeListingBody(req.body);
  const resolvedSellerName = req.user?.fullName || normalized.sellerName;
  const resolvedSellerPhone = req.user?.phone || normalized.sellerPhone;
  const errors = [];

  if (typeof normalized.title !== 'string' || normalized.title.trim().length < 3 || normalized.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Ilan basligi (Title) 3 ile 200 karakter arasinda olmalidir.' });
  }

  if (typeof normalized.description !== 'string' || normalized.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Ilan aciklamasi (Description) en az 10 karakter olmalidir.' });
  }

  const rawPrice = normalized.price;
  const parsedPrice = rawPrice !== undefined && rawPrice !== null && String(rawPrice).trim() !== ''
    ? Number(rawPrice)
    : NaN;

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    errors.push({ field: 'price', message: 'Fiyat (Price) 0 veya daha buyuk gecerli bir sayi olmalidir.' });
  }

  if (typeof normalized.category !== 'string' || normalized.category.trim().length < 2 || normalized.category.trim().length > 100) {
    errors.push({ field: 'category', message: 'Kategori (Category) 2 ile 100 karakter arasinda olmalidir.' });
  }

  if (typeof normalized.location !== 'string' || normalized.location.trim().length < 2 || normalized.location.trim().length > 150) {
    errors.push({ field: 'location', message: 'Konum (Location) 2 ile 150 karakter arasinda olmalidir.' });
  }

  if (!resolvedSellerName || typeof resolvedSellerName !== 'string' || resolvedSellerName.trim().length < 2 || resolvedSellerName.trim().length > 120) {
    errors.push({ field: 'sellerName', message: 'Gecerli bir kullanici ad soyad bilgisi bulunamadi.' });
  }

  if (!resolvedSellerPhone || typeof resolvedSellerPhone !== 'string' || resolvedSellerPhone.trim().length < 7 || resolvedSellerPhone.trim().length > 30) {
    errors.push({ field: 'sellerPhone', message: 'Hesabinizda kayitli gecerli bir telefon numarasi bulunamadi. Ilan olusturabilmek icin lutfen profilinizden telefon numaranizi ekleyiniz.' });
  }

  if (errors.length > 0) {
    await cleanupTempUploadedFile(req.file);
    return next(AppError.badRequest('Ilan olusturma dogrulama hatasi.', errors));
  }

  req.body = {
    title: normalized.title.trim(),
    description: normalized.description.trim(),
    price: parsedPrice,
    category: normalized.category.trim(),
    location: normalized.location.trim(),
    sellerName: resolvedSellerName.trim(),
    sellerPhone: resolvedSellerPhone.trim(),
  };

  return next();
}


export async function validateUpdateListing(req, res, next) {
  const normalized = normalizeListingBody(req.body);
  const updatableKeys = [
    'title',
    'description',
    'price',
    'category',
    'location',
    'sellerName',
    'sellerPhone',
    'status',
    'removeImage',
  ];

  const hasAnyBodyField = updatableKeys.some((key) => normalized[key] !== undefined);
  const hasUploadedFile = Boolean(req.file);

  if (!hasAnyBodyField && !hasUploadedFile) {
    return next(
      AppError.badRequest('Guncelleme icin en az bir alan veya yeni bir ilan resmi gonderilmelidir.')
    );
  }

  const errors = [];
  const sanitized = {};

  if (normalized.title !== undefined) {
    if (typeof normalized.title !== 'string' || normalized.title.trim().length < 3 || normalized.title.trim().length > 200) {
      errors.push({ field: 'title', message: 'Ilan basligi (Title) 3 ile 200 karakter arasinda olmalidir.' });
    } else {
      sanitized.title = normalized.title.trim();
    }
  }

  if (normalized.description !== undefined) {
    if (typeof normalized.description !== 'string' || normalized.description.trim().length < 10) {
      errors.push({ field: 'description', message: 'Ilan aciklamasi (Description) en az 10 karakter olmalidir.' });
    } else {
      sanitized.description = normalized.description.trim();
    }
  }

  if (normalized.price !== undefined) {
    const parsedPrice = String(normalized.price).trim() !== '' ? Number(normalized.price) : NaN;
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      errors.push({ field: 'price', message: 'Fiyat (Price) 0 veya daha buyuk gecerli bir sayi olmalidir.' });
    } else {
      sanitized.price = parsedPrice;
    }
  }

  if (normalized.category !== undefined) {
    if (typeof normalized.category !== 'string' || normalized.category.trim().length < 2 || normalized.category.trim().length > 100) {
      errors.push({ field: 'category', message: 'Kategori (Category) 2 ile 100 karakter arasinda olmalidir.' });
    } else {
      sanitized.category = normalized.category.trim();
    }
  }

  if (normalized.location !== undefined) {
    if (typeof normalized.location !== 'string' || normalized.location.trim().length < 2 || normalized.location.trim().length > 150) {
      errors.push({ field: 'location', message: 'Konum (Location) 2 ile 150 karakter arasinda olmalidir.' });
    } else {
      sanitized.location = normalized.location.trim();
    }
  }

  if (normalized.sellerName !== undefined) {
    if (typeof normalized.sellerName !== 'string' || normalized.sellerName.trim().length < 2 || normalized.sellerName.trim().length > 120) {
      errors.push({ field: 'sellerName', message: 'Satici adi (SellerName) 2 ile 120 karakter arasinda olmalidir.' });
    } else {
      sanitized.sellerName = normalized.sellerName.trim();
    }
  }

  if (normalized.sellerPhone !== undefined) {
    if (typeof normalized.sellerPhone !== 'string' || normalized.sellerPhone.trim().length < 7 || normalized.sellerPhone.trim().length > 30) {
      errors.push({ field: 'sellerPhone', message: 'Satici telefonu (SellerPhone) 7 ile 30 karakter arasinda olmalidir.' });
    } else {
      sanitized.sellerPhone = normalized.sellerPhone.trim();
    }
  }

  if (normalized.status !== undefined) {
    const validStatuses = ['active', 'sold', 'passive'];
    const cleanStatus = typeof normalized.status === 'string' ? normalized.status.trim().toLowerCase() : '';
    if (!validStatuses.includes(cleanStatus)) {
      errors.push({ field: 'status', message: `Ilan durumu (Status) yalnizca 'active', 'sold' veya 'passive' olabilir.` });
    } else {
      sanitized.status = cleanStatus;
    }
  }

  if (normalized.removeImage !== undefined) {
    sanitized.removeImage = normalized.removeImage === true || normalized.removeImage === 'true';
  }

  if (errors.length > 0) {
    await cleanupTempUploadedFile(req.file);
    return next(AppError.badRequest('Ilan guncelleme dogrulama hatasi.', errors));
  }

  req.body = sanitized;
  return next();
}

export function validateChangeStatus(req, res, next) {
  const rawStatus = req.body?.status;
  const validStatuses = ['active', 'sold', 'passive'];

  if (typeof rawStatus !== 'string' || !validStatuses.includes(rawStatus.trim().toLowerCase())) {
    return next(
      AppError.badRequest(
        `Gecersiz veya eksik ilan durumu. 'status' alani 'active', 'sold' veya 'passive' olmalidir.`
      )
    );
  }

  req.body.status = rawStatus.trim().toLowerCase();
  return next();
}

