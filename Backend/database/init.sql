IF DB_ID(N'FarmerClassifiedsDb') IS NULL
BEGIN
    CREATE DATABASE FarmerClassifiedsDb;
END
GO

USE FarmerClassifiedsDb;
GO

-- 1. Kategoriler tablosu
IF OBJECT_ID(N'dbo.Categories', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories (
        Id               INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Categories PRIMARY KEY,
        Name             NVARCHAR(100) NOT NULL
            CONSTRAINT UQ_Categories_Name UNIQUE,
        Description      NVARCHAR(500) NULL,
        ParentCategoryId INT NULL
            CONSTRAINT FK_Categories_Parent FOREIGN KEY REFERENCES dbo.Categories(Id) ON DELETE NO ACTION,
        IsActive         BIT NOT NULL
            CONSTRAINT DF_Categories_IsActive DEFAULT (1),
        CreatedAt        DATETIME2(3) NOT NULL
            CONSTRAINT DF_Categories_CreatedAt DEFAULT (SYSUTCDATETIME())
    );

    CREATE NONCLUSTERED INDEX IX_Categories_ParentCategoryId
        ON dbo.Categories (ParentCategoryId);
END
GO

-- 2. Kullanıcılar tablosu
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
            CONSTRAINT DF_Users_Role DEFAULT (N'user')
            CONSTRAINT CK_Users_Role CHECK (Role IN (N'user', N'admin')),
        CreatedAt    DATETIME2(3) NOT NULL
            CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt    DATETIME2(3) NOT NULL
            CONSTRAINT DF_Users_UpdatedAt DEFAULT (SYSUTCDATETIME())
    );

    CREATE NONCLUSTERED INDEX IX_Users_Email
        ON dbo.Users (Email);
END
GO

-- 3. İlanlar tablosu
IF OBJECT_ID(N'dbo.Listings', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Listings (
        Id          INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Listings PRIMARY KEY,
        Title       NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NOT NULL,
        Price       DECIMAL(18, 2) NOT NULL
            CONSTRAINT CK_Listings_Price CHECK (Price >= 0),
        CategoryId  INT NOT NULL
            CONSTRAINT FK_Listings_Categories FOREIGN KEY REFERENCES dbo.Categories(Id) ON DELETE NO ACTION,
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

    CREATE NONCLUSTERED INDEX IX_Listings_CategoryId
        ON dbo.Listings (CategoryId);

    CREATE NONCLUSTERED INDEX IX_Listings_UserId
        ON dbo.Listings (UserId);

    CREATE NONCLUSTERED INDEX IX_Listings_Status
        ON dbo.Listings (Status);

    CREATE NONCLUSTERED INDEX IX_Listings_CreatedAt
        ON dbo.Listings (CreatedAt DESC);
END
GO

-- 4. Başlangıç kategorileri
IF NOT EXISTS (SELECT 1 FROM dbo.Categories)
BEGIN
    INSERT INTO dbo.Categories (Name, Description)
    VALUES 
        (N'Tarım Ürünleri', N'Tahıl, bakliyat, sebze, meyve ve hasat ürünleri'),
        (N'Traktör', N'Sıfır ve ikinci el traktör modelleri'),
        (N'Tarım Makineleri & Ekipman', N'Pulluk, mibzer, römork, ilaçlama makineleri'),
        (N'Hayvancılık', N'Büyükbaş, küçükbaş ve kümes hayvanları'),
        (N'Yem ve Gübre', N'Saman, balya, karma yem, organik ve kimyasal gübreler'),
        (N'Tohum ve Fide', N'Sertifikalı tohumlar, meyve ve sebze fideleri'),
        (N'Bahçe & Sera', N'Sera ekipmanları, bahçe bakım ve sulama sistemleri'),
        (N'Diğer', N'Diğer tarım ve köy ürünleri');
END
GO

-- 5. Kullanıcılar (19 Kullanıcı)
IF NOT EXISTS (SELECT 1 FROM dbo.Users)
BEGIN
    INSERT INTO dbo.Users (FullName, Email, PasswordHash, Phone, Role)
    VALUES 
        (N'Ahmet Yılmaz',   N'ahmet.yilmaz@ciftci.com',   N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05321112233', N'user'),
        (N'Mehmet Kaya',    N'mehmet.kaya@ciftci.com',    N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05332223344', N'user'),
        (N'Mustafa Demir',  N'mustafa.demir@ciftci.com',  N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05353334455', N'user'),
        (N'Ali Öztürk',     N'ali.ozturk@ciftci.com',     N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05424445566', N'user'),
        (N'Hüseyin Koç',    N'huseyin.koc@ciftci.com',    N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05445556677', N'user'),
        (N'Kemal Şen',      N'kemal.sen@ciftci.com',      N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05466667788', N'user'),
        (N'İsmail Aydın',   N'ismail.aydin@ciftci.com',   N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05517778899', N'user'),
        (N'Osman Çelik',    N'osman.celik@ciftci.com',    N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05538889900', N'user'),
        (N'Ramazan Güler',  N'ramazan.guler@ciftci.com',  N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05559990011', N'user'),
        (N'Murat Arslan',   N'murat.arslan@ciftci.com',   N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05371110022', N'user'),
        (N'Bekir Şahin',    N'bekir.sahin@ciftci.com',    N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05382221133', N'user'),
        (N'Fatih Kurt',     N'fatih.kurt@ciftci.com',     N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05393332244', N'user'),
        (N'Halil Doğan',    N'halil.dogan@ciftci.com',    N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05414443355', N'user'),
        (N'Yusuf Aksoy',    N'yusuf.aksoy@ciftci.com',    N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05435554466', N'user'),
        (N'Selim Yıldız',   N'selim.yildiz@ciftci.com',   N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05456665577', N'user'),
        (N'İbrahim Polat',  N'ibrahim.polat@ciftci.com',  N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05527776688', N'user'),
        (N'Hakan Eren',     N'hakan.eren@ciftci.com',     N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05548887799', N'user'),
        (N'Metin Çetin',    N'metin.cetin@ciftci.com',    N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05569998800', N'user'),
        (N'Sistem Admini',  N'admin@ciftci.com',          N'$2a$10$wT0vA9g4w0rM6o1cR6xHwe9Vv5F7K8K4v2rP0Z8G1xY0W1v9Z8G1x', N'05550000000', N'admin');
END
GO

-- 6. İlanlar (18 İlan)
IF NOT EXISTS (SELECT 1 FROM dbo.Listings)
BEGIN
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
    SELECT 
        D.Title,
        D.Description,
        D.Price,
        C.Id AS CategoryId,
        D.Location,
        D.SellerName,
        D.SellerPhone,
        D.ImageUrl,
        U.Id AS UserId,
        D.Status
    FROM (
        VALUES
        -- 1. Tarım Ürünleri
        (
            N'Tarım Ürünleri',
            N'Satılık 1. Sınıf Ekmeklik Buğday (10 Ton)',
            N'Hasat yeni tamamlandı, nem oranı %12, protein oranı yüksek ekmeklik buğday. Çuvallı veya dökme teslim edilebilir.',
            95000.00,
            N'Konya / Karatay',
            N'Ahmet Yılmaz',
            N'ahmet.yilmaz@ciftci.com',
            N'05321112233',
            NULL,
            N'active'
        ),
        (
            N'Tarım Ürünleri',
            N'Doğal Yayla Domatesi Toptan Satış (5 Ton)',
            N'Açık tarla yetiştiriciliği, sofralık ve salçalık kullanıma uygun sert ve lezzetli yayla domatesi.',
            60000.00,
            N'Antalya / Elmalı',
            N'Mehmet Kaya',
            N'mehmet.kaya@ciftci.com',
            N'05332223344',
            NULL,
            N'active'
        ),
        (
            N'Tarım Ürünleri',
            N'Kabuklu Kuru Ceviz (Chandler) - 500 Kg',
            N'Bu sezonun yeni mahsulü, iç randımanı yüksek, ince kabuklu yerli üretim Chandler ceviz.',
            85000.00,
            N'Denizli / Çivril',
            N'Mustafa Demir',
            N'mustafa.demir@ciftci.com',
            N'05353334455',
            NULL,
            N'active'
        ),

        -- 2. Traktör
        (
            N'Traktör',
            N'2020 Model New Holland TD110D 4WD',
            N'1850 saatte, tüm periyodik bakımları yetkili serviste yapılmış, kabin klimalı ve powershuttle şanzıman.',
            1850000.00,
            N'Bursa / Yenişehir',
            N'Ali Öztürk',
            N'ali.ozturk@ciftci.com',
            N'05424445566',
            NULL,
            N'active'
        ),
        (
            N'Traktör',
            N'2018 Model Massey Ferguson 5450 Dyna-4',
            N'Orijinal 3200 saatte, lastikler %85, ön hidrolik kollu, masrafsız temiz çiftçi traktörü.',
            2100000.00,
            N'Tekirdağ / Çorlu',
            N'Hüseyin Koç',
            N'huseyin.koc@ciftci.com',
            N'05445556677',
            NULL,
            N'active'
        ),
        (
            N'Traktör',
            N'1998 Model Tümosan 74-80 Temiz Bahçe Tipi',
            N'Motor ve şanzıman yürüyen aksamı kusursuz, muayenesi yeni yapıldı, takasa uygundur.',
            480000.00,
            N'Balıkesir / Gönen',
            N'Kemal Şen',
            N'kemal.sen@ciftci.com',
            N'05466667788',
            NULL,
            N'active'
        ),

        -- 3. Tarım Makineleri & Ekipman
        (
            N'Tarım Makineleri & Ekipman',
            N'5''li 14 Numara Otomatik Yaylı Pulluk (Ünlü)',
            N'Az kullanılmış, aşınma parçaları orijinal, eğilme bükülme yoktur, tarlaya hazır durumdadır.',
            115000.00,
            N'Eskişehir / Alpu',
            N'İsmail Aydın',
            N'ismail.aydin@ciftci.com',
            N'05517778899',
            NULL,
            N'active'
        ),
        (
            N'Tarım Makineleri & Ekipman',
            N'24 Sıralı Baltalı Hububat Ekim Mibzeri',
            N'Gübreli ve tohumlu kombine ekim mibzeri, tohum ayar diski sağlam, kapalı hangarda muhafaza edildi.',
            175000.00,
            N'Yozgat / Yerköy',
            N'Osman Çelik',
            N'osman.celik@ciftci.com',
            N'05538889900',
            NULL,
            N'active'
        ),
        (
            N'Tarım Makineleri & Ekipman',
            N'1000 Litre Asılır Tip Tarla İlaçlama Pülverizatörü',
            N'15 metre hidrolik kollu, İtalyan pompa, memeler ve hat filtreleri sıfır ayarında.',
            78000.00,
            N'Manisa / Akhisar',
            N'Ramazan Güler',
            N'ramazan.guler@ciftci.com',
            N'05559990011',
            NULL,
            N'active'
        ),

        -- 4. Hayvancılık
        (
            N'Hayvancılık',
            N'Gebe Simmental Süt İneği (2. Doğuma 2 Ay Kaldı)',
            N'Günde 28-30 litre süt verimi garantili, pedigrili, tüberküloz ve brusella testleri temiz.',
            160000.00,
            N'Kars / Susuz',
            N'Murat Arslan',
            N'murat.arslan@ciftci.com',
            N'05371110022',
            NULL,
            N'active'
        ),
        (
            N'Hayvancılık',
            N'Satılık 20 Baş Damızlık Kangal Akkaraman Koyun',
            N'Kuzulamış ve gebe koyunlar, aşıları yapılmış, mera yaylımına alışkın sağlıklı sürü.',
            250000.00,
            N'Sivas / Kangal',
            N'Bekir Şahin',
            N'bekir.sahin@ciftci.com',
            N'05382221133',
            NULL,
            N'active'
        ),
        (
            N'Hayvancılık',
            N'3 Aylık Sütten Kesilmiş Holstein Erkek Buzağılar (5 Adet)',
            N'Sağlıklı, karma aşıları eksiksiz, besi için ideal 5 adet toplu buzağı satışı.',
            195000.00,
            N'Afyonkarahisar / Sandıklı',
            N'Fatih Kurt',
            N'fatih.kurt@ciftci.com',
            N'05393332244',
            NULL,
            N'active'
        ),

        -- 5. Yem ve Gübre
        (
            N'Yem ve Gübre',
            N'Yonca Balyası (1. ve 2. Biçim Yeşil Yapraklı)',
            N'Ortalama 25 kg ağırlığında, kuru depolanmış, yağmur görmemiş yüksek proteinli yonca (400 Adet).',
            56000.00,
            N'Aksaray / Eskil',
            N'Halil Doğan',
            N'halil.dogan@ciftci.com',
            N'05414443355',
            NULL,
            N'active'
        ),
        (
            N'Yem ve Gübre',
            N'Presli Kuru Saman Balyası (Tır Bazında Teslimat)',
            N'Buğday samanı, 25-28 kg balyalar, tır üstü veya adrese teslim seçenekleriyle.',
            42000.00,
            N'Edirne / Uzunköprü',
            N'Yusuf Aksoy',
            N'yusuf.aksoy@ciftci.com',
            N'05435554466',
            NULL,
            N'active'
        ),
        (
            N'Yem ve Gübre',
            N'Yanmış Elenmiş Organik Büyükbaş Çiftlik Gübresi (30 Ton)',
            N'2 yıl fermente edilmiş, yabancı ot tohumu içermeyen, sera ve bahçe için elenmiş doğal gübre.',
            35000.00,
            N'İzmir / Ödemiş',
            N'Selim Yıldız',
            N'selim.yildiz@ciftci.com',
            N'05456665577',
            NULL,
            N'active'
        ),

        -- 6. Tohum ve Fide
        (
            N'Tohum ve Fide',
            N'Sertifikalı Kırmızı Mercimek Tohumu (Fırat-87) - 2 Ton',
            N'Çimlenme oranı %98, sertifikalı, mantar ve böcek ilaçlaması yapılmış ekime hazır tohumluk.',
            68000.00,
            N'Şanlıurfa / Hilvan',
            N'İbrahim Polat',
            N'ibrahim.polat@ciftci.com',
            N'05527776688',
            NULL,
            N'active'
        ),
        (
            N'Tohum ve Fide',
            N'Aşılı Ceviz Fidanı (Chandler ve Fernor) - 500 Adet',
            N'2 yaşında, mavi sertifikalı, kök sistemi güçlü, hemen dikime hazır tüplü fidan.',
            45000.00,
            N'Balıkesir / Bandırma',
            N'Hakan Eren',
            N'hakan.eren@ciftci.com',
            N'05548887799',
            NULL,
            N'active'
        ),
        (
            N'Tohum ve Fide',
            N'Kapya Biber Viyol Fidesi (10.000 Adet)',
            N'Torfta yetiştirilmiş, hastalıksız, dikime hazır profesyonel fide viyolleri.',
            32000.00,
            N'Çanakkale / Yenice',
            N'Metin Çetin',
            N'metin.cetin@ciftci.com',
            N'05569998800',
            NULL,
            N'active'
        )
    ) AS D (CategoryName, Title, Description, Price, Location, SellerName, SellerEmail, SellerPhone, ImageUrl, Status)
    INNER JOIN dbo.Categories C ON C.Name = D.CategoryName
    INNER JOIN dbo.Users U ON U.Email = D.SellerEmail;
END
GO

-- 7. Detaylı İlan Görünümü (View)
IF OBJECT_ID(N'dbo.vw_ListingDetails', N'V') IS NOT NULL
    DROP VIEW dbo.vw_ListingDetails;
GO

CREATE VIEW dbo.vw_ListingDetails
AS
SELECT 
    L.Id AS ListingId,
    L.Title AS ListingTitle,
    L.Description AS ListingDescription,
    L.Price AS Price,
    L.Location AS Location,
    L.ImageUrl AS ImageUrl,
    L.Status AS ListingStatus,
    L.CreatedAt AS ListingCreatedAt,
    L.UpdatedAt AS ListingUpdatedAt,
    DATEDIFF(DAY, L.CreatedAt, SYSUTCDATETIME()) AS DaysSincePublished,
    C.Id AS CategoryId,
    C.Name AS CategoryName,
    C.Description AS CategoryDescription,
    U.Id AS SellerUserId,
    COALESCE(U.FullName, L.SellerName) AS SellerName,
    COALESCE(U.Phone, L.SellerPhone) AS SellerPhone,
    U.Email AS SellerEmail,
    U.Role AS SellerRole,
    U.CreatedAt AS SellerMemberSince
FROM dbo.Listings L
INNER JOIN dbo.Categories C ON L.CategoryId = C.Id
LEFT JOIN dbo.Users U ON L.UserId = U.Id;
GO
