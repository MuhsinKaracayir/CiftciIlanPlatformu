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
      console.error('[Validation Cleanup Hatası]: Geçici resim silinemedi:', err.message);
    }
  }
}

function normalizeListingBody(body = {}) {
  return {
    title: body.title ?? body.Title,
    description: body.description ?? body.Description,
    price: body.price ?? body.Price,
    categoryId: body.categoryId ?? body.CategoryId ?? body.category_id,
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
    return next(AppError.badRequest('Geçersiz ID parametresi; pozitif tam sayı olmalıdır.'));
  }

  const parsedId = Number(rawId);

  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    return next(AppError.badRequest('Geçersiz ID parametresi; pozitif tam sayı olmalıdır.'));
  }

  return next();
}

export async function validateCreateListing(req, res, next) {
  const normalized = normalizeListingBody(req.body);
  const resolvedSellerName = req.user?.fullName || normalized.sellerName;
  const resolvedSellerPhone = req.user?.phone || normalized.sellerPhone;
  const errors = [];

  if (typeof normalized.title !== 'string' || normalized.title.trim().length < 3 || normalized.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'İlan başlığı (Title) 3 ile 200 karakter arasında olmalıdır.' });
  }

  if (typeof normalized.description !== 'string' || normalized.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'İlan açıklaması (Description) en az 10 karakter olmalıdır.' });
  }

  const rawPrice = normalized.price;
  const parsedPrice = rawPrice !== undefined && rawPrice !== null && String(rawPrice).trim() !== ''
    ? Number(rawPrice)
    : NaN;

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    errors.push({ field: 'price', message: 'Fiyat (Price) 0 veya daha büyük geçerli bir sayı olmalıdır.' });
  }

  // Kategori doğrulaması: Sayısal categoryId veya metin olarak geçerli bir category adı kabul edilir
  const rawCategoryId = normalized.categoryId;
  const parsedCategoryId = rawCategoryId !== undefined && rawCategoryId !== null && String(rawCategoryId).trim() !== ''
    ? Number(rawCategoryId)
    : NaN;
  const hasValidCategoryId = Number.isInteger(parsedCategoryId) && parsedCategoryId > 0;

  const rawCategoryName = typeof normalized.category === 'string' ? normalized.category.trim() : null;
  const hasValidCategoryName = Boolean(rawCategoryName && rawCategoryName.length >= 2 && rawCategoryName.length <= 100);

  if (!hasValidCategoryId && !hasValidCategoryName) {
    errors.push({
      field: 'categoryId',
      message: 'Geçerli bir kategori belirtilmelidir (sayısal categoryId veya geçerli bir kategori adı).',
    });
  }

  if (typeof normalized.location !== 'string' || normalized.location.trim().length < 2 || normalized.location.trim().length > 150) {
    errors.push({ field: 'location', message: 'Konum (Location) 2 ile 150 karakter arasında olmalıdır.' });
  }

  if (!resolvedSellerName || typeof resolvedSellerName !== 'string' || resolvedSellerName.trim().length < 2 || resolvedSellerName.trim().length > 120) {
    errors.push({ field: 'sellerName', message: 'Geçerli bir kullanıcı ad soyad bilgisi bulunamadı.' });
  }

  if (!resolvedSellerPhone || typeof resolvedSellerPhone !== 'string' || resolvedSellerPhone.trim().length < 7 || resolvedSellerPhone.trim().length > 30) {
    errors.push({ field: 'sellerPhone', message: 'Hesabınızda kayıtlı geçerli bir telefon numarası bulunamadı. İlan oluşturabilmek için lütfen profilinizden telefon numaranızı ekleyiniz.' });
  }

  if (errors.length > 0) {
    await cleanupTempUploadedFile(req.file);
    return next(AppError.badRequest('İlan oluşturma doğrulama hatası.', errors));
  }

  req.body = {
    title: normalized.title.trim(),
    description: normalized.description.trim(),
    price: parsedPrice,
    categoryId: hasValidCategoryId ? parsedCategoryId : null,
    category: hasValidCategoryName ? rawCategoryName : null,
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
    'categoryId',
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
      AppError.badRequest('Güncelleme için en az bir alan veya yeni bir ilan resmi gönderilmelidir.')
    );
  }

  const errors = [];
  const sanitized = {};

  if (normalized.title !== undefined) {
    if (typeof normalized.title !== 'string' || normalized.title.trim().length < 3 || normalized.title.trim().length > 200) {
      errors.push({ field: 'title', message: 'İlan başlığı (Title) 3 ile 200 karakter arasında olmalıdır.' });
    } else {
      sanitized.title = normalized.title.trim();
    }
  }

  if (normalized.description !== undefined) {
    if (typeof normalized.description !== 'string' || normalized.description.trim().length < 10) {
      errors.push({ field: 'description', message: 'İlan açıklaması (Description) en az 10 karakter olmalıdır.' });
    } else {
      sanitized.description = normalized.description.trim();
    }
  }

  if (normalized.price !== undefined) {
    const parsedPrice = String(normalized.price).trim() !== '' ? Number(normalized.price) : NaN;
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      errors.push({ field: 'price', message: 'Fiyat (Price) 0 veya daha büyük geçerli bir sayı olmalıdır.' });
    } else {
      sanitized.price = parsedPrice;
    }
  }

  if (normalized.categoryId !== undefined || normalized.category !== undefined) {
    const rawCatId = normalized.categoryId;
    const parsedCatId = rawCatId !== undefined && rawCatId !== null && String(rawCatId).trim() !== ''
      ? Number(rawCatId)
      : NaN;
    const isValidId = Number.isInteger(parsedCatId) && parsedCatId > 0;

    const rawCatName = typeof normalized.category === 'string' ? normalized.category.trim() : null;
    const isValidName = Boolean(rawCatName && rawCatName.length >= 2 && rawCatName.length <= 100);

    if (isValidId) {
      sanitized.categoryId = parsedCatId;
    } else if (isValidName) {
      sanitized.category = rawCatName;
    } else {
      errors.push({
        field: 'categoryId',
        message: 'Kategori bilgisi geçerli bir sayısal ID veya geçerli bir kategori adı olmalıdır.',
      });
    }
  }

  if (normalized.location !== undefined) {
    if (typeof normalized.location !== 'string' || normalized.location.trim().length < 2 || normalized.location.trim().length > 150) {
      errors.push({ field: 'location', message: 'Konum (Location) 2 ile 150 karakter arasında olmalıdır.' });
    } else {
      sanitized.location = normalized.location.trim();
    }
  }

  if (normalized.sellerName !== undefined) {
    if (typeof normalized.sellerName !== 'string' || normalized.sellerName.trim().length < 2 || normalized.sellerName.trim().length > 120) {
      errors.push({ field: 'sellerName', message: 'Satıcı adı (SellerName) 2 ile 120 karakter arasında olmalıdır.' });
    } else {
      sanitized.sellerName = normalized.sellerName.trim();
    }
  }

  if (normalized.sellerPhone !== undefined) {
    if (typeof normalized.sellerPhone !== 'string' || normalized.sellerPhone.trim().length < 7 || normalized.sellerPhone.trim().length > 30) {
      errors.push({ field: 'sellerPhone', message: 'Satıcı telefonu (SellerPhone) 7 ile 30 karakter arasında olmalıdır.' });
    } else {
      sanitized.sellerPhone = normalized.sellerPhone.trim();
    }
  }

  if (normalized.status !== undefined) {
    const validStatuses = ['active', 'sold', 'passive'];
    const cleanStatus = typeof normalized.status === 'string' ? normalized.status.trim().toLowerCase() : '';
    if (!validStatuses.includes(cleanStatus)) {
      errors.push({ field: 'status', message: `İlan durumu (Status) yalnızca 'active', 'sold' veya 'passive' olabilir.` });
    } else {
      sanitized.status = cleanStatus;
    }
  }

  if (normalized.removeImage !== undefined) {
    sanitized.removeImage = normalized.removeImage === true || normalized.removeImage === 'true';
  }

  if (errors.length > 0) {
    await cleanupTempUploadedFile(req.file);
    return next(AppError.badRequest('İlan güncelleme doğrulama hatası.', errors));
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
        `Geçersiz veya eksik ilan durumu. 'status' alanı 'active', 'sold' veya 'passive' olmalıdır.`
      )
    );
  }

  req.body.status = rawStatus.trim().toLowerCase();
  return next();
}
