IF DB_ID(N'FarmerClassifiedsDb') IS NULL
BEGIN
    CREATE DATABASE FarmerClassifiedsDb;
END
GO

USE FarmerClassifiedsDb;
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id           INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Users PRIMARY KEY,
        FullName     NVARCHAR(120) NOT NULL,
        Email        NVARCHAR(150) NOT NULL
            CONSTRAINT UQ_Users_Email UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Phone        NVARCHAR(30) NULL,
        Role         NVARCHAR(20) NOT NULL
            CONSTRAINT DF_Users_Role DEFAULT (N'user'),
        CreatedAt    DATETIME2(3) NOT NULL
            CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt    DATETIME2(3) NOT NULL
            CONSTRAINT DF_Users_UpdatedAt DEFAULT (SYSUTCDATETIME())
    );

    CREATE NONCLUSTERED INDEX IX_Users_Email
        ON dbo.Users (Email);
END
GO

IF OBJECT_ID(N'dbo.Listings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Listings (
        Id          INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Listings PRIMARY KEY,
        Title       NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        Price       DECIMAL(18, 2) NOT NULL
            CONSTRAINT CK_Listings_Price CHECK (Price >= 0),
        Category    NVARCHAR(100) NOT NULL,
        Location    NVARCHAR(150) NOT NULL,
        SellerName  NVARCHAR(120) NOT NULL,
        SellerPhone NVARCHAR(30) NOT NULL,
        ImageUrl    NVARCHAR(500) NULL,
        UserId      INT NULL
            CONSTRAINT FK_Listings_Users REFERENCES dbo.Users(Id) ON DELETE SET NULL,
        Status      NVARCHAR(20) NOT NULL
            CONSTRAINT DF_Listings_Status DEFAULT (N'active')
            CONSTRAINT CK_Listings_Status CHECK (Status IN (N'active', N'sold', N'passive')),
        CreatedAt   DATETIME2(3) NOT NULL
            CONSTRAINT DF_Listings_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt   DATETIME2(3) NOT NULL
            CONSTRAINT DF_Listings_UpdatedAt DEFAULT (SYSUTCDATETIME())
    );

    CREATE NONCLUSTERED INDEX IX_Listings_UserId
        ON dbo.Listings (UserId);

    CREATE NONCLUSTERED INDEX IX_Listings_Status
        ON dbo.Listings (Status);

    CREATE NONCLUSTERED INDEX IX_Listings_Category
        ON dbo.Listings (Category);

    CREATE NONCLUSTERED INDEX IX_Listings_Location
        ON dbo.Listings (Location);

    CREATE NONCLUSTERED INDEX IX_Listings_CreatedAt
        ON dbo.Listings (CreatedAt DESC);
END
GO

-- Ornek baslangic ilanlari
IF NOT EXISTS (SELECT 1 FROM dbo.Listings)
BEGIN
    INSERT INTO dbo.Listings (
        Title,
        Description,
        Price,
        Category,
        Location,
        SellerName,
        SellerPhone,
        ImageUrl
    )
    OUTPUT INSERTED.*
    VALUES
        (
            N'[Örnek / Sahte İlan] Satılık 5 Ton Organik Buğday',
            N'Bu bir deneme ve test amaçlı örnek ilandır. Sistemi test etmek amacıyla ilan üzerinde düzenleme ve silme işlemlerini deneyimleyebilirsiniz.',
            62500.00,
            N'Tahıl',
            N'Konya / Çumra',
            N'Örnek Satıcı (Test)',
            N'05550000001',
            NULL
        ),
        (
            N'[Örnek / Sahte İlan] 2021 Model Az Kullanılmış Traktör',
            N'Bu bir deneme ve test amaçlı örnek ilandır. 1200 saatte temsili tarla traktörü ilanı.',
            1450000.00,
            N'Traktör',
            N'Adana / Ceyhan',
            N'Örnek Satıcı (Test)',
            N'05550000002',
            NULL
        ),
        (
            N'[Örnek / Sahte İlan] Damızlık Simental Düve',
            N'Bu bir deneme ve test amaçlı örnek ilandır. Sağlık kontrolleri ve aşıları tam temsili damızlık düve ilanı.',
            135000.00,
            N'Hayvancılık',
            N'Kars / Merkez',
            N'Örnek Satıcı (Test)',
            N'05550000003',
            NULL
        );
END
GO

USE FarmerClassifiedsDb;

SELECT 
    Id, 
    FullName, 
    Email, 
    Phone, 
    Role, 
    CreatedAt 
FROM dbo.Users;