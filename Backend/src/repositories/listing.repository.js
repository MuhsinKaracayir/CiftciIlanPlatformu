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
      category: row.Category,
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
    category = null,
    location = null,
    minPrice = null,
    maxPrice = null,
    status = null,
    userId = null,
  }) {
    request.input('search', sql.NVarChar(200), search);
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
    this.#bindFilterInputs(request, { search, category, location, minPrice, maxPrice, status, userId });

    const query = `
      SELECT
        Id,
        Title,
        Description,
        Price,
        Category,
        Location,
        SellerName,
        SellerPhone,
        ImageUrl,
        UserId,
        Status,
        CreatedAt,
        UpdatedAt
      FROM dbo.Listings
      WHERE (@search IS NULL OR Title LIKE N'%' + @search + N'%' OR Description LIKE N'%' + @search + N'%')
        AND (@category IS NULL OR Category = @category)
        AND (@location IS NULL OR Location LIKE N'%' + @location + N'%')
        AND (@minPrice IS NULL OR Price >= @minPrice)
        AND (@maxPrice IS NULL OR Price <= @maxPrice)
        AND (@status IS NULL OR Status = @status)
        AND (@userId IS NULL OR UserId = @userId)
      ORDER BY CreatedAt DESC, Id DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY;
    `;

    const result = await request.query(query);
    return result.recordset.map((row) => this.#mapRow(row));
  }

  async count({
    search = null,
    category = null,
    location = null,
    minPrice = null,
    maxPrice = null,
    status = null,
    userId = null,
  } = {}) {
    const request = this.dbPool.request();
    this.#bindFilterInputs(request, { search, category, location, minPrice, maxPrice, status, userId });

    const query = `
      SELECT COUNT(1) AS TotalCount
      FROM dbo.Listings
      WHERE (@search IS NULL OR Title LIKE N'%' + @search + N'%' OR Description LIKE N'%' + @search + N'%')
        AND (@category IS NULL OR Category = @category)
        AND (@location IS NULL OR Location LIKE N'%' + @location + N'%')
        AND (@minPrice IS NULL OR Price >= @minPrice)
        AND (@maxPrice IS NULL OR Price <= @maxPrice)
        AND (@status IS NULL OR Status = @status)
        AND (@userId IS NULL OR UserId = @userId);
    `;

    const result = await request.query(query);
    return result.recordset[0]?.TotalCount || 0;
  }

  async findById(id) {
    const request = this.dbPool.request();
    request.input('id', sql.Int, id);

    const query = `
      SELECT
        Id,
        Title,
        Description,
        Price,
        Category,
        Location,
        SellerName,
        SellerPhone,
        ImageUrl,
        UserId,
        Status,
        CreatedAt,
        UpdatedAt
      FROM dbo.Listings
      WHERE Id = @id;
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async create({
    title,
    description,
    price,
    category,
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
    request.input('category', sql.NVarChar(100), category);
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
        Category,
        Location,
        SellerName,
        SellerPhone,
        ImageUrl,
        UserId,
        Status
      )
      OUTPUT INSERTED.*
      VALUES (
        @title,
        @description,
        @price,
        @category,
        @location,
        @sellerName,
        @sellerPhone,
        @imageUrl,
        @userId,
        @status
      );
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async update(
    id,
    {
      title,
      description,
      price,
      category,
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
    request.input('category', sql.NVarChar(100), category);
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
        Category = @category,
        Location = @location,
        SellerName = @sellerName,
        SellerPhone = @sellerPhone,
        ImageUrl = @imageUrl,
        Status = COALESCE(@status, Status),
        UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE Id = @id;
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
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
      OUTPUT INSERTED.*
      WHERE Id = @id;
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
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

