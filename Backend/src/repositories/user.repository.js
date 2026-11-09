import sql from 'mssql';

export class UserRepository {
  constructor(dbPool) {
    if (!dbPool) {
      throw new Error('UserRepository icin dbPool bagimliligi zorunludur.');
    }
    this.dbPool = dbPool;
  }

  #mapRow(row) {
    if (!row) {
      return null;
    }

    return {
      id: row.Id,
      fullName: row.FullName,
      email: row.Email,
      passwordHash: row.PasswordHash,
      phone: row.Phone,
      role: row.Role,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
    };
  }

  async create({ fullName, email, passwordHash, phone = null, role = 'user' }) {
    const request = this.dbPool.request();

    request.input('fullName', sql.NVarChar(120), fullName);
    request.input('email', sql.NVarChar(150), email.toLowerCase().trim());
    request.input('passwordHash', sql.NVarChar(255), passwordHash);
    request.input('phone', sql.NVarChar(30), phone ? phone.trim() : null);
    request.input('role', sql.NVarChar(20), role);

    const query = `
      INSERT INTO dbo.Users (
        FullName,
        Email,
        PasswordHash,
        Phone,
        Role
      )
      OUTPUT INSERTED.*
      VALUES (
        @fullName,
        @email,
        @passwordHash,
        @phone,
        @role
      );
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async findByEmail(email) {
    if (!email) {
      return null;
    }

    const request = this.dbPool.request();
    request.input('email', sql.NVarChar(150), email.toLowerCase().trim());

    const query = `
      SELECT TOP 1 *
      FROM dbo.Users
      WHERE Email = @email;
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async findById(id) {
    if (!id) {
      return null;
    }

    const request = this.dbPool.request();
    request.input('id', sql.Int, id);

    const query = `
      SELECT TOP 1 *
      FROM dbo.Users
      WHERE Id = @id;
    `;

    const result = await request.query(query);
    return this.#mapRow(result.recordset[0]);
  }

  async existsByEmail(email) {
    if (!email) {
      return false;
    }

    const request = this.dbPool.request();
    request.input('email', sql.NVarChar(150), email.toLowerCase().trim());

    const query = `
      SELECT TOP 1 1 AS [Exists]
      FROM dbo.Users
      WHERE Email = @email;
    `;

    const result = await request.query(query);
    return result.recordset.length > 0;
  }
}

