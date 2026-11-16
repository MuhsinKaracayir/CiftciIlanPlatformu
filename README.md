# Çiftçi İlan Platformu

Tarım makineleri, ekipmanları, tohum, gübre ve zirai ürünlerin alım satımını sağlayan; Web, Mobil ve REST API bileşenlerinden oluşan çok katmanlı ilan platformu.

---

## Proje Mimarisi ve Teknolojiler

* **Backend:** Node.js (v20+), Express.js, MS SQL Server, Katmanlı Mimari (N-Tier Architecture), Bağımlılık Enjeksiyonu (DI), JWT Kimlik Doğrulama
* **Frontend:** React 18, Vite, Tailwind CSS, Axios, Lucide React
* **Mobil:** Flutter (Dart), Dio, Provider, Güvenli Depolama (Flutter Secure Storage)
* **Veritabanı:** Microsoft SQL Server 2022
* **Konteynerizasyon:** Docker & Docker Compose

---

## Kurulum ve Çalıştırma Yöntemleri

### Yöntem 1: Docker ile Çalıştırma (Önerilen / Tek Komut)

Tüm sistemi (Veritabanı, Backend ve Frontend) tek bir komutla ayağa kaldırmak için sisteminizde Docker Desktop kurulu olması yeterlidir.

1. Depoyu klonlayın ve proje kök dizinine geçin:
   ```bash
   git clone https://github.com/MuhsinKaracayir/CiftciIlanPlatformu.git
   cd CiftciIlanPlatformu
   ```

2. Docker konteynerlerini derleyip başlatın:
   ```bash
   docker compose up --build
   ```

3. Hizmetler hazır olduğunda tarayıcınızdan erişebilirsiniz:
   * **Web Arayüzü (Frontend):** `http://localhost:5173` veya `http://localhost:80`
   * **REST API (Backend):** `http://localhost:3000`
   * **Veritabanı (MS SQL):** `localhost:1433` (Kullanıcı: `sa`, Şifre: `YourStrong!Password123`)

*Not: Veritabanı tabloları ve test verileri ilk çalıştırmada `init.sql` scripti tarafından otomatik olarak yüklenir.*

---

### Yöntem 2: Manuel (Yerel) Çalıştırma

Docker kullanmadan çalıştırmak isterseniz aşağıdaki adımları sırasıyla uygulayabilirsiniz:

#### 1. Veritabanı Kurulumu
* Bilgisayarınızda MS SQL Server veya SQL Express kurulu ve çalışır durumda olmalıdır.
* `Backend/database/init.sql` dosyasını SQL Server Management Studio (SSMS) veya `sqlcmd` aracılığıyla çalıştırarak `FarmerClassifiedsDb` veritabanını ve tablolarını oluşturun.

#### 2. Backend (REST API)
* `Backend` klasörüne geçin ve bağımlılıkları yükleyin:
  ```bash
  cd Backend
  npm install
  ```
* `Backend/.env` dosyası repo içerisinde hazır olarak yer almaktadır. Yerel SQL Server şifreniz varsayılandan farklıysa bu dosyayı güncelleyin.
* Sunucuyu başlatın:
  ```bash
  npm run dev
  # veya
  npm start
  ```
  API `http://localhost:3000` portundan hizmet vermeye başlayacaktır.

#### 3. Frontend (Web)
* `Frontend` klasörüne geçin ve bağımlılıkları yükleyin:
  ```bash
  cd ../Frontend
  npm install
  ```
* Yerel backend sunucunuza bağlanmak için `Frontend/.env` dosyasındaki adresi düzenleyin:
  ```env
  VITE_API_BASE_URL=http://localhost:3000
  ```
* Uygulamayı geliştirici modunda başlatın:
  ```bash
  npm run dev
  ```
  Arayüze `http://localhost:5173` adresinden erişebilirsiniz.

#### 4. Mobil (Flutter)
* `Mobil` klasörüne geçin ve paketleri indirin:
  ```bash
  cd ../Mobil
  flutter pub get
  ```
* Bir emülatör veya fiziksel cihaz bağlayarak uygulamayı başlatın:
  ```bash
  flutter run
  ```
* *Not: Mobil uygulamanın varsayılan API adresi Render üzerindeki canlı sunucudur. Yerel backend ile test etmek için Android emülatörde `Mobil/lib/core/network/dio_client.dart` dosyasındaki taban adresi `http://10.0.2.2:3000/api/v1` olarak güncelleyebilirsiniz.*
