import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../utils/AppError.js';

export class ListingService {
  constructor(listingRepository, uploadsDir = path.resolve(process.cwd(), 'uploads')) {
    if (!listingRepository) {
      throw new Error('ListingService için listingRepository bağımlılığı zorunludur.');
    }
    this.listingRepository = listingRepository;
    this.uploadsDir = uploadsDir;
  }

  async #deleteImageFromDisk(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return;
    }

    const safeFileName = path.basename(imageUrl);
    if (!safeFileName) {
      return;
    }

    const absoluteFilePath = path.join(this.uploadsDir, safeFileName);

    try {
      await fs.unlink(absoluteFilePath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error(`[ListingService]: Eski resim dosyası silinemedi (${safeFileName}):`, err.message);
      }
    }
  }

  #verifyListingOwnership(existingListing, currentUser) {
    if (!currentUser) {
      throw AppError.unauthorized('Bu işlemi gerçekleştirmek için giriş yapmanız gerekmektedir.');
    }

    const isAdmin = currentUser.role === 'admin';
    const isOwner =
      existingListing.userId !== null &&
      existingListing.userId !== undefined &&
      existingListing.userId === currentUser.id;

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden(
        'Bu işlem için yetkiniz bulunmamaktadır (Yalnızca ilan sahibi veya yönetici gerçekleştirebilir).'
      );
    }
  }

  async getAllListings(query = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;

    const search = typeof query.search === 'string' && query.search.trim() !== ''
      ? query.search.trim()
      : null;

    const category = typeof query.category === 'string' && query.category.trim() !== ''
      ? query.category.trim()
      : null;

    const location = typeof query.location === 'string' && query.location.trim() !== ''
      ? query.location.trim()
      : null;

    const parsedMinPrice = query.minPrice !== undefined && query.minPrice !== '' ? Number(query.minPrice) : NaN;
    const minPrice = Number.isFinite(parsedMinPrice) && parsedMinPrice >= 0 ? parsedMinPrice : null;

    const parsedMaxPrice = query.maxPrice !== undefined && query.maxPrice !== '' ? Number(query.maxPrice) : NaN;
    const maxPrice = Number.isFinite(parsedMaxPrice) && parsedMaxPrice >= 0 ? parsedMaxPrice : null;

    const validStatuses = new Set(['active', 'sold', 'passive']);
    let status = null;

    if (typeof query.status === 'string') {
      const trimmedStatus = query.status.trim().toLowerCase();
      if (trimmedStatus === 'all') {
        status = null;
      } else if (validStatuses.has(trimmedStatus)) {
        status = trimmedStatus;
      }
    } else {
      // Varsayılan olarak yalnızca aktif ilanlar gösterilir
      status = 'active';
    }

    const parsedUserId = query.userId !== undefined && query.userId !== '' ? Number(query.userId) : NaN;
    const userId = Number.isInteger(parsedUserId) && parsedUserId > 0 ? parsedUserId : null;

    const filterParams = { search, category, location, minPrice, maxPrice, status, userId };

    const [items, totalItems] = await Promise.all([
      this.listingRepository.findAll({ offset, limit, ...filterParams }),
      this.listingRepository.count(filterParams),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  async getListingById(id) {
    const listing = await this.listingRepository.findById(id);

    if (!listing) {
      throw AppError.notFound(`ID değeri ${id} olan ilan bulunamadı.`);
    }

    return listing;
  }

  async createListing(payload, uploadedImageUrl = null, currentUser = null) {
    const sellerName = currentUser?.fullName || payload.sellerName || 'İsimsiz Çiftçi';
    const sellerPhone = currentUser?.phone || payload.sellerPhone || '05000000000';
    const userId = currentUser?.id ?? null;

    try {
      return await this.listingRepository.create({
        title: payload.title,
        description: payload.description,
        price: payload.price,
        category: payload.category,
        location: payload.location,
        sellerName,
        sellerPhone,
        imageUrl: uploadedImageUrl,
        userId,
      });
    } catch (err) {
      if (uploadedImageUrl) {
        await this.#deleteImageFromDisk(uploadedImageUrl);
      }
      throw err;
    }
  }

  async updateListing(id, payload, uploadedImageUrl = null, currentUser = null) {
    const existingListing = await this.listingRepository.findById(id);

    if (!existingListing) {
      if (uploadedImageUrl) {
        await this.#deleteImageFromDisk(uploadedImageUrl);
      }
      throw AppError.notFound(`ID değeri ${id} olan ilan bulunamadı.`);
    }

    try {
      this.#verifyListingOwnership(existingListing, currentUser);
    } catch (err) {
      if (uploadedImageUrl) {
        await this.#deleteImageFromDisk(uploadedImageUrl);
      }
      throw err;
    }

    let nextImageUrl = existingListing.imageUrl;

    if (uploadedImageUrl) {
      nextImageUrl = uploadedImageUrl;
    } else if (payload.removeImage === true) {
      nextImageUrl = null;
    }

    const mergedData = {
      title: payload.title ?? existingListing.title,
      description: payload.description ?? existingListing.description,
      price: payload.price ?? existingListing.price,
      category: payload.category ?? existingListing.category,
      location: payload.location ?? existingListing.location,
      sellerName: payload.sellerName ?? existingListing.sellerName,
      sellerPhone: payload.sellerPhone ?? existingListing.sellerPhone,
      status: payload.status ?? existingListing.status,
      imageUrl: nextImageUrl,
    };

    let updatedListing;

    try {
      updatedListing = await this.listingRepository.update(id, mergedData);
    } catch (err) {
      if (uploadedImageUrl) {
        await this.#deleteImageFromDisk(uploadedImageUrl);
      }
      throw err;
    }

    const shouldDeleteOldImage =
      existingListing.imageUrl &&
      existingListing.imageUrl !== nextImageUrl;

    if (shouldDeleteOldImage) {
      await this.#deleteImageFromDisk(existingListing.imageUrl);
    }

    return updatedListing;
  }

  async deleteListing(id, currentUser = null) {
    const existingListing = await this.listingRepository.findById(id);

    if (!existingListing) {
      throw AppError.notFound(`ID değeri ${id} olan ilan bulunamadı.`);
    }

    this.#verifyListingOwnership(existingListing, currentUser);

    const isDeleted = await this.listingRepository.deleteById(id);

    if (!isDeleted) {
      throw AppError.notFound(`ID değeri ${id} olan ilan bulunamadı.`);
    }

    if (existingListing.imageUrl) {
      await this.#deleteImageFromDisk(existingListing.imageUrl);
    }
  }

  async changeListingStatus(id, newStatus, currentUser = null) {
    const validStatuses = ['active', 'sold', 'passive'];
    const normalizedStatus = typeof newStatus === 'string' ? newStatus.trim().toLowerCase() : null;

    if (!validStatuses.includes(normalizedStatus)) {
      throw AppError.badRequest(
        `Geçersiz ilan durumu: '${newStatus}'. Geçerli durumlar: ${validStatuses.join(', ')}`
      );
    }

    const existingListing = await this.listingRepository.findById(id);

    if (!existingListing) {
      throw AppError.notFound(`ID değeri ${id} olan ilan bulunamadı.`);
    }

    this.#verifyListingOwnership(existingListing, currentUser);

    return await this.listingRepository.updateStatus(id, normalizedStatus);
  }
}

