export class CategoryController {
  constructor(categoryService) {
    if (!categoryService) {
      throw new Error('CategoryController icin categoryService bagimliligi zorunludur.');
    }
    this.categoryService = categoryService;
  }

  getAll = async (req, res) => {
    const categories = await this.categoryService.getAllCategories(req.query);

    res.status(200).json({
      success: true,
      data: categories,
    });
  };

  getById = async (req, res) => {
    const id = Number(req.params.id);
    const category = await this.categoryService.getCategoryById(id);

    res.status(200).json({
      success: true,
      data: category,
    });
  };

  create = async (req, res) => {
    const createdCategory = await this.categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: 'Kategori basariyla olusturuldu.',
      data: createdCategory,
    });
  };

  update = async (req, res) => {
    const id = Number(req.params.id);
    const updatedCategory = await this.categoryService.updateCategory(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Kategori basariyla guncellendi.',
      data: updatedCategory,
    });
  };

  remove = async (req, res) => {
    const id = Number(req.params.id);
    const result = await this.categoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        softDeleted: result.softDeleted,
      },
    });
  };
}
