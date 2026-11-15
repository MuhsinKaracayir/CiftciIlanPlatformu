import { AppError } from '../utils/AppError.js';

export class CategoryService {
  constructor(categoryRepository) {
    if (!categoryRepository) {
      throw new Error('CategoryService icin categoryRepository bagimliligi zorunludur.');
    }
    this.categoryRepository = categoryRepository;
  }

  async getAllCategories(query = {}) {
    const onlyActive = query.all !== 'true' && query.includeInactive !== 'true';
    return await this.categoryRepository.findAll({ onlyActive });
  }

  async getCategoryById(id) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw AppError.badRequest('Gecersiz kategori ID parametresi.');
    }

    const category = await this.categoryRepository.findById(parsedId);
    if (!category) {
      throw AppError.notFound(`ID degeri ${parsedId} olan kategori bulunamadi.`);
    }

    return category;
  }

  async createCategory({ name, description = null, parentCategoryId = null, isActive = true }) {
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      throw AppError.badRequest('Kategori adi 2 ile 100 karakter arasinda olmalidir.');
    }

    const trimmedName = name.trim();
    const existing = await this.categoryRepository.findByName(trimmedName);
    if (existing) {
      throw AppError.conflict(`'${trimmedName}' isimli bir kategori zaten mevcuttur.`);
    }

    let validParentId = null;
    if (parentCategoryId !== undefined && parentCategoryId !== null && parentCategoryId !== '') {
      const parsedParentId = Number(parentCategoryId);
      if (!Number.isInteger(parsedParentId) || parsedParentId <= 0) {
        throw AppError.badRequest('Gecersiz ust kategori ID degeri.');
      }
      const parent = await this.categoryRepository.findById(parsedParentId);
      if (!parent) {
        throw AppError.notFound(`Belirtilen ust kategori (ID: ${parsedParentId}) bulunamadi.`);
      }
      validParentId = parsedParentId;
    }

    return await this.categoryRepository.create({
      name: trimmedName,
      description: description ? String(description).trim() : null,
      parentCategoryId: validParentId,
      isActive: isActive !== false,
    });
  }

  async updateCategory(id, { name, description, parentCategoryId, isActive }) {
    const existing = await this.getCategoryById(id);

    let updatedName = undefined;
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        throw AppError.badRequest('Kategori adi 2 ile 100 karakter arasinda olmalidir.');
      }
      const trimmed = name.trim();
      if (trimmed.toLowerCase() !== existing.name.toLowerCase()) {
        const duplicate = await this.categoryRepository.findByName(trimmed);
        if (duplicate && duplicate.id !== existing.id) {
          throw AppError.conflict(`'${trimmed}' isimli baska bir kategori zaten mevcuttur.`);
        }
      }
      updatedName = trimmed;
    }

    let updatedParentId = undefined;
    if (parentCategoryId !== undefined) {
      if (parentCategoryId === null || parentCategoryId === '') {
        updatedParentId = null;
      } else {
        const parsedParentId = Number(parentCategoryId);
        if (!Number.isInteger(parsedParentId) || parsedParentId <= 0) {
          throw AppError.badRequest('Gecersiz ust kategori ID degeri.');
        }
        if (parsedParentId === existing.id) {
          throw AppError.badRequest('Bir kategori kendisini ust kategori olarak secemez.');
        }
        const parent = await this.categoryRepository.findById(parsedParentId);
        if (!parent) {
          throw AppError.notFound(`Belirtilen ust kategori (ID: ${parsedParentId}) bulunamadi.`);
        }
        updatedParentId = parsedParentId;
      }
    }

    return await this.categoryRepository.update(existing.id, {
      name: updatedName,
      description: description !== undefined ? (description ? String(description).trim() : null) : undefined,
      parentCategoryId: updatedParentId,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
    });
  }

  async deleteCategory(id) {
    const existing = await this.getCategoryById(id);

    const [listingCount, childCount] = await Promise.all([
      this.categoryRepository.countListingsByCategoryId(existing.id),
      this.categoryRepository.countChildrenByCategoryId(existing.id),
    ]);

    if (listingCount > 0 || childCount > 0) {
      await this.categoryRepository.softDeleteById(existing.id);
      return {
        softDeleted: true,
        message: `Kategoriye ait ${listingCount} ilan ve ${childCount} alt kategori bulundugundan kategori silinmedi, pasif duruma getirildi.`,
      };
    }

    await this.categoryRepository.deleteById(existing.id);
    return {
      softDeleted: false,
      message: 'Kategori basariyla silindi.',
    };
  }
}
