## Mobil Uygulama Test ve Çalıştırma Rehberi

Mobil uygulamanın test edilmesi ve çalıştırılması için Flutter geliştirme ortamı gereklidir.

### 1. Ön Gereksinimler
* Bilgisayarınızda **Flutter SDK** (3.x veya üzeri) kurulu olmalıdır.
* **Android Studio** (Android SDK ve Android Virtual Device / AVD kurulu olmalı) veya **VS Code** (Flutter/Dart eklentileriyle).


### 2. Cihaz / Emülatör Hazırlığı
* **Android Emülatör ile Test:** Android Studio üzerinden bir sanal cihaz (AVD) başlatın.
* **Fiziksel Telefon ile Test:** Telefonunuzda *Geliştirici Seçenekleri* altından **USB Hata Ayıklama (USB Debugging)** modunu açıp telefonu USB kablosuyla bilgisayara bağlayın.
* Terminalde cihazın algılandığını kontrol edin:
  ```bash
  flutter devices
  ```

---

### 3. API Bağlantı Yapılandırması
Mobil uygulamanın haberleşeceği backend adresini ihtiyacınıza göre belirleyin:
* **Canlı Sunucu ile Test (Varsayılan):**
  Uygulama varsayılan olarak Render üzerindeki canlı API'ye (`https://ciftciilanplatformu.onrender.com/api/v1`) ayarlıdır. Herhangi bir kod değişikliği yapmadan doğrudan test edebilirsiniz.
* **Yerel Backend ile Test:**
  Yerel makinenizdeki backend'e (`localhost:3000`) bağlanmak isterseniz `lib/core/network/dio_client.dart` dosyasını açıp IP adresini güncelleyin:
  * **Android Emülatör için:** `http://10.0.2.2:3000/api/v1` *(10.0.2.2, emülatörün bilgisayarın localhost'una erişim köprüsüdür).*
  * **Fiziksel Cihaz için:** Bilgisayar ve telefon aynı Wi-Fi ağına bağlı olmalı ve bilgisayarınızın yerel IP adresi yazılmalıdır (Örn: `http://192.168.1.XX:3000/api/v1`).

---

### 4. Uygulamayı Başlatma
1. `Mobil` klasöründeyken bağımlılıkları indirin:
   ```bash
   flutter pub get
   ```
2. Uygulamayı derleyip cihazda başlatın:
   ```bash
   flutter run
   ```

---

### 5. Manuel Test Senaryoları
Uygulama açıldıktan sonra aşağıdaki temel akışları test edebilirsiniz:
* **Kimlik Doğrulama:** Kayıt olma (`/register`), giriş yapma (`/login`) ve token saklama mekanizması.
* **İlan Akışı:** Ana sayfada ilanların listelenmesi, arama çubuğu ve kategori filtreleme butonları.
* **İlan Detayı:** İlan görseli, fiyat, satıcı bilgileri ve açıklama görüntüleme.
* **Yeni İlan Ekleme:** Galeriden fotoğraf seçimi, kategori seçimi ve yeni ilan kaydetme.
* **Profil ve İlan Yönetimi:** Kullanıcıya ait aktif ilanları listeleme ve çıkış yapma.
