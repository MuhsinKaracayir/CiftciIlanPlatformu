import sql from 'mssql';

export class ListingRepository {
  constructor(dbPool) {
    if (!dbPool) {
      throw new Error('ListingRepository icin dbPool bagimliligi zorunludur.');
    }
    this.dbPool = dbPool;
  }

  #mapRow(row) {
    if (!row) {
      return null;
    }

    return {
      id: row.Id,
      title: row.Title,
      description: row.Description,
      price: Number(row.Price),
      categoryId: row.CategoryId,
      categoryName: row.CategoryName ?? null,
      category: row.CategoryName ?? null,
      location: row.Location,
      sellerName: row.SellerName,
      sellerPhone: row.SellerPhone,
      imageUrl: row.ImageUrl,
      userId: row.UserId ?? null,
      status: row.Status || 'active',
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
    };
  }

  #bindFilterInputs(request, {
    search = null,
    categoryId = null,
    category = null,
    location = null,
    minPrice = null,
    maxPrice = null,
    status = null,
    userId = null,
  }) {
    request.input('search', sql.NVarChar(200), search);
    request.input('categoryId', sql.Int, categoryId);
    request.input('category', sql.NVarChar(100), category);
    request.input('location', sql.NVarChar(150), location);
    request.input('minPrice', sql.Decimal(18, 2), minPrice);
    request.input('maxPrice', sql.Decimal(18, 2), maxPrice);
    request.input('status', sql.NVarChar(20), status);
    request.input('userId', sql.Int, userId);
  }

  async findAll({
    offset = 0,
    limit = 10,
    search = null,
    categoryId = null,
    category = null,
    location = null,
    minPrice = null,
    maxPrice = null,
    status = null,
    userId = null,
  } = {}) {
    const request = this.dbPool.request();
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);
    this.#bindFilterInputs(request, { search, categoryId, category, location, minPrice, maxPrice, status, userId });

    const query = `
      SELECT
        L.Id,
        L.Title,
        L.Description,
        L.Price,
        L.CategoryId,
        C.Name AS CategoryName,
        L.Location,
        L.SellerName,
        L.SellerPhone,
        L.ImageUrl,
        L.UserId,
        L.Status,
        L.CreatedAt,
        L.UpdatedAt
      FROM dbo.Listings L
      INNER JOIN dbo.Categories C ON L.CategoryId = C.Id
      WHERE (@search IS NULL OR L.Title LIKE N'%' + @search + N'%' OR L.Description LIKE N'%' + @search + N'%')
        AND (@categoryId IS NULL OR L.CategoryId = @categoryId)
        AND (@category IS NULL OR LOWER(C.Name) = LOWER(@category))
        AND (@location IS NULL OR L.Location LIKE N'%' + @location + N'%')
        AND (@minPrice IS NULL OR L.Price >= @minPrice)
        AND (@maxPrice IS NULL OR L.Price <= @maxPrice)
        AND (@status IS NULL OR L.Status = @status)
        AND (@userId IS NULL OR L.UserId = @userId)
      ORDER BY L.CreatedAt DESC, L.Id DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY;
    `;

    const result = await request.query(query);
    return result.recordset.map((row) => this.#mapRow(row));
  }

  async count({
    search = null,
    categoryId = null,
    category = null,
    location = null,
    minPrice = null,
    maxPrice = null,
    status = null,
    userId = null,
  } = {}) {
    const request = this.dbPool.request();
    this.#bindFilterInputs(request, { search, categoryId, category, location, minPrice, maxPrice, status, userId });

    const query = `
      SELECT COUNT(1) AS TotalCount
      FROM dbo.Listings L
      INNER JOIN dbo.Categories C ON L.CategoryId = C.Id
      WHERE (@search IS NULL OR L.Title LIKE N'%' + @search + N'%' OR L.Description LIKE N'%' + @search + N'%')
        AND (@categoryId IS NULL OR L.CategoryId = @categoryId)
        AND (@category IS NULL OR LOWER(C.Name) = LOWER(@category))
        AND (@location IS NULL OR L.Location LIKE N'%' + @location + N'%')
        AND (@minPrice IS NULL OR L.Price >= @minPrice)
        AND (@maxPrice IS NULL OR L.Price <= @maxPrice)
        AND (@status IS NULL OR L.Status = @status)
        AND (@userId IS NULL OR L.UserId = @userId);
    `;

    const result = await request.query(query);
    return result.recordset[0]?.TotalCount || 0;
  }

  async findById(id) {
    const request = this.dbPool.request();
    request.input('id', sql.Int, id);

    const query = `
      SELECT
        L.Id,
        L.Title,
        L.Description,
        L.Price,
        L.CategoryId,
        C.Name AS CategoryName,
        L.Location,
        L.SellerName,
        L.SellerPhone,
        L.ImageUrl,
        L.UserId,
        L.Status,
        L.CreatedAt,
        L.UpdatedAt
      FROM dbo.Listings L
      INNER JOIN dbo.Categories C ON L.CategoryId = C.Id
      WHERE L.Id = @id;
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async create({
    title,
    description,
    price,
    categoryId,
    location,
    sellerName,
    sellerPhone,
    imageUrl,
    userId = null,
    status = 'active',
  }) {
    const request = this.dbPool.request();
    request.input('title', sql.NVarChar(200), title);
    request.input('description', sql.NVarChar(sql.MAX), description);
    request.input('price', sql.Decimal(18, 2), price);
    request.input('categoryId', sql.Int, categoryId);
    request.input('location', sql.NVarChar(150), location);
    request.input('sellerName', sql.NVarChar(120), sellerName);
    request.input('sellerPhone', sql.NVarChar(30), sellerPhone);
    request.input('imageUrl', sql.NVarChar(500), imageUrl ?? null);
    request.input('userId', sql.Int, userId ?? null);
    request.input('status', sql.NVarChar(20), status || 'active');

    const query = `
      INSERT INTO dbo.Listings (
        Title,
        Description,
        Price,
        CategoryId,
        Location,
        SellerName,
        SellerPhone,
        ImageUrl,
        UserId,
        Status
      )
      OUTPUT INSERTED.Id
      VALUES (
        @title,
        @description,
        @price,
        @categoryId,
        @location,
        @sellerName,
        @sellerPhone,
        @imageUrl,
        @userId,
        @status
      );
    `;

    const result = await request.query(query);
    const insertedId = result.recordset[0]?.Id;
    return await this.findById(insertedId);
  }

  async update(
    id,
    {
      title,
      description,
      price,
      categoryId,
      location,
      sellerName,
      sellerPhone,
      imageUrl,
      status,
    }
  ) {
    const request = this.dbPool.request();
    request.input('id', sql.Int, id);
    request.input('title', sql.NVarChar(200), title);
    request.input('description', sql.NVarChar(sql.MAX), description);
    request.input('price', sql.Decimal(18, 2), price);
    request.input('categoryId', sql.Int, categoryId);
    request.input('location', sql.NVarChar(150), location);
    request.input('sellerName', sql.NVarChar(120), sellerName);
    request.input('sellerPhone', sql.NVarChar(30), sellerPhone);
    request.input('imageUrl', sql.NVarChar(500), imageUrl ?? null);
    request.input('status', sql.NVarChar(20), status ?? null);

    const query = `
      UPDATE dbo.Listings
      SET
        Title = @title,
        Description = @description,
        Price = @price,
        CategoryId = @categoryId,
        Location = @location,
        SellerName = @sellerName,
        SellerPhone = @sellerPhone,
        ImageUrl = @imageUrl,
        Status = COALESCE(@status, Status),
        UpdatedAt = SYSUTCDATETIME()
      WHERE Id = @id;
    `;

    await request.query(query);
    return await this.findById(id);
  }

  async updateStatus(id, status) {
    const request = this.dbPool.request();
    request.input('id', sql.Int, id);
    request.input('status', sql.NVarChar(20), status);

    const query = `
      UPDATE dbo.Listings
      SET
        Status = @status,
        UpdatedAt = SYSUTCDATETIME()
      WHERE Id = @id;
    `;

    await request.query(query);
    return await this.findById(id);
  }

  async deleteById(id) {
    const request = this.dbPool.request();
    request.input('id', sql.Int, id);

    const query = `
      DELETE FROM dbo.Listings
      WHERE Id = @id;
    `;

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  }
}
