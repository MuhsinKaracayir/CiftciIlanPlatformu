import sql from 'mssql';

export class CategoryRepository {
  constructor(dbPool) {
    if (!dbPool) {
      throw new Error('CategoryRepository icin dbPool bagimliligi zorunludur.');
    }
    this.dbPool = dbPool;
  }

  #mapRow(row) {
    if (!row) {
      return null;
    }

    return {
      id: row.Id,
      name: row.Name,
      description: row.Description ?? null,
      parentCategoryId: row.ParentCategoryId ?? null,
      isActive: Boolean(row.IsActive),
      createdAt: row.CreatedAt,
      ...(row.ListingCount !== undefined && { listingCount: Number(row.ListingCount) }),
    };
  }

  async findAll({ onlyActive = true } = {}) {
    const request = this.dbPool.request();
    request.input('onlyActive', sql.Bit, onlyActive ? 1 : 0);

    const query = `
      SELECT
        C.Id,
        C.Name,
        C.Description,
        C.ParentCategoryId,
        C.IsActive,
        C.CreatedAt,
        COUNT(L.Id) AS ListingCount
      FROM dbo.Categories C
      LEFT JOIN dbo.Listings L ON C.Id = L.CategoryId AND L.Status = N'active'
      WHERE (@onlyActive = 0 OR C.IsActive = 1)
      GROUP BY C.Id, C.Name, C.Description, C.ParentCategoryId, C.IsActive, C.CreatedAt
      ORDER BY C.Name ASC;
    `;

    const result = await request.query(query);
    return result.recordset.map((row) => this.#mapRow(row));
  }

  async findById(id) {
    const request = this.dbPool.request();
    request.input('id', sql.Int, id);

    const query = `
      SELECT
        C.Id,
        C.Name,
        C.Description,
        C.ParentCategoryId,
        C.IsActive,
        C.CreatedAt,
        COUNT(L.Id) AS ListingCount
      FROM dbo.Categories C
      LEFT JOIN dbo.Listings L ON C.Id = L.CategoryId AND L.Status = N'active'
      WHERE C.Id = @id
      GROUP BY C.Id, C.Name, C.Description, C.ParentCategoryId, C.IsActive, C.CreatedAt;
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async findByName(name) {
    if (!name) {
      return null;
    }

    const request = this.dbPool.request();
    request.input('name', sql.NVarChar(100), name.trim());

    const query = `
      SELECT TOP 1
        Id,
        Name,
        Description,
        ParentCategoryId,
        IsActive,
        CreatedAt
      FROM dbo.Categories
      WHERE LOWER(Name) = LOWER(@name);
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async create({ name, description = null, parentCategoryId = null, isActive = true }) {
    const request = this.dbPool.request();
    request.input('name', sql.NVarChar(100), name.trim());
    request.input('description', sql.NVarChar(500), description ? description.trim() : null);
    request.input('parentCategoryId', sql.Int, parentCategoryId ?? null);
    request.input('isActive', sql.Bit, isActive ? 1 : 0);

    const query = `
      INSERT INTO dbo.Categories (
        Name,
        Description,
        ParentCategoryId,
        IsActive
      )
      OUTPUT INSERTED.*
      VALUES (
        @name,
        @description,
        @parentCategoryId,
        @isActive
      );
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async update(id, { name, description, parentCategoryId, isActive }) {
    const request = this.dbPool.request();
    request.input('id', sql.Int, id);
    request.input('name', sql.NVarChar(100), name !== undefined ? name.trim() : null);
    request.input('hasName', sql.Bit, name !== undefined ? 1 : 0);

    request.input('description', sql.NVarChar(500), description !== undefined ? (description ? description.trim() : null) : null);
    request.input('hasDescription', sql.Bit, description !== undefined ? 1 : 0);

    request.input('parentCategoryId', sql.Int, parentCategoryId !== undefined ? (parentCategoryId ?? null) : null);
    request.input('hasParentCategoryId', sql.Bit, parentCategoryId !== undefined ? 1 : 0);

    request.input('isActive', sql.Bit, isActive !== undefined ? (isActive ? 1 : 0) : null);
    request.input('hasIsActive', sql.Bit, isActive !== undefined ? 1 : 0);

    const query = `
      UPDATE dbo.Categories
      SET
        Name = CASE WHEN @hasName = 1 THEN @name ELSE Name END,
        Description = CASE WHEN @hasDescription = 1 THEN @description ELSE Description END,
        ParentCategoryId = CASE WHEN @hasParentCategoryId = 1 THEN @parentCategoryId ELSE ParentCategoryId END,
        IsActive = CASE WHEN @hasIsActive = 1 THEN @isActive ELSE IsActive END
      OUTPUT INSERTED.*
      WHERE Id = @id;
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async countListingsByCategoryId(categoryId) {
    const request = this.dbPool.request();
    request.input('categoryId', sql.Int, categoryId);

    const query = `
      SELECT COUNT(1) AS TotalCount
      FROM dbo.Listings
      WHERE CategoryId = @categoryId;
    `;

    const result = await request.query(query);
    return result.recordset[0]?.TotalCount || 0;
  }

  async countChildrenByCategoryId(categoryId) {
    const request = this.dbPool.request();
    request.input('categoryId', sql.Int, categoryId);

    const query = `
      SELECT COUNT(1) AS TotalCount
      FROM dbo.Categories
      WHERE ParentCategoryId = @categoryId;
    `;

    const result = await request.query(query);
    return result.recordset[0]?.TotalCount || 0;
  }

  async deleteById(id) {
    const request = this.dbPool.request();
    request.input('id', sql.Int, id);

    const query = `
      DELETE FROM dbo.Categories
      WHERE Id = @id;
    `;

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  }

  async softDeleteById(id) {
    const request = this.dbPool.request();
    request.input('id', sql.Int, id);

    const query = `
      UPDATE dbo.Categories
      SET IsActive = 0
      OUTPUT INSERTED.*
      WHERE Id = @id;
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }
}
