import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:ciftci_mobil/core/theme/app_colors.dart';
import 'package:ciftci_mobil/features/auth/presentation/providers/auth_provider.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_enums.dart';
import 'package:ciftci_mobil/features/listings/presentation/providers/listing_provider.dart';

class CreateListingScreen extends ConsumerStatefulWidget {
  const CreateListingScreen({super.key});

  @override
  ConsumerState<CreateListingScreen> createState() => _CreateListingScreenState();
}

class _CreateListingScreenState extends ConsumerState<CreateListingScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  ListingCategory _selectedCategory = ListingCategory.tarimUrunleri;
  XFile? _selectedImage;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).user;
    if (user?.phone != null && user!.phone!.isNotEmpty) {
      _phoneController.text = user.phone!;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _locationController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _selectedImage = image;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Görsel seçilirken bir hata oluştu.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _removeImage() {
    setState(() {
      _selectedImage = null;
    });
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final double? parsedPrice = double.tryParse(_priceController.text.replaceAll(',', '.').trim());
    if (parsedPrice == null || parsedPrice < 0) {
      setState(() {
        _errorMessage = 'Lütfen geçerli bir fiyat giriniz.';
      });
      return;
    }

    final user = ref.read(authControllerProvider).user;
    final String sellerPhone = _phoneController.text.trim().isNotEmpty
        ? _phoneController.text.trim()
        : (user?.phone ?? '');

    if (sellerPhone.isEmpty) {
      setState(() {
        _errorMessage = 'İlan verebilmek için lütfen bir telefon numarası giriniz.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(listingRepositoryProvider);
      await repository.createListing(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        price: parsedPrice,
        category: _selectedCategory.label,
        location: _locationController.text.trim(),
        sellerName: user?.fullName,
        sellerPhone: sellerPhone,
        imagePath: _selectedImage?.path,
      );

      // Ana sayfadaki ilan listesini tazele
      await ref.read(listingControllerProvider.notifier).fetchListings(refresh: true);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('İlanınız başarıyla oluşturuldu.'),
            backgroundColor: AppColors.statusActive,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.read(authControllerProvider).user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Yeni İlan Ver'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Geri',
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/');
            }
          },
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFECACA)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded, size: 20, color: AppColors.error),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: AppColors.error,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Görsel Seçme Kartı
                GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    height: 180,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _selectedImage != null ? AppColors.cherry800 : AppColors.border,
                        width: _selectedImage != null ? 2 : 1,
                      ),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: _selectedImage != null
                        ? Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.file(
                                File(_selectedImage!.path),
                                fit: BoxFit.cover,
                              ),
                              Positioned(
                                top: 8,
                                right: 8,
                                child: InkWell(
                                  onTap: _removeImage,
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: const BoxDecoration(
                                      color: Colors.black54,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.close_rounded, color: Colors.white, size: 18),
                                  ),
                                ),
                              ),
                            ],
                          )
                        : const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.add_photo_alternate_outlined, size: 44, color: AppColors.cherry800),
                              SizedBox(height: 8),
                              Text(
                                'İlan Görseli Yükle (İsteğe Bağlı)',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Galeriden fotoğraf seçmek için tıklayın',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
                const SizedBox(height: 20),

                // İlan Başlığı
                TextFormField(
                  controller: _titleController,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'İlan Başlığı *',
                    hintText: 'Örn: 2021 Model Traktör / Organik Buğday',
                    prefixIcon: Icon(Icons.title_rounded, color: AppColors.textMuted),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().length < 3) {
                      return 'İlan başlığı en az 3 karakter olmalıdır.';
                    }
                    if (value.trim().length > 200) {
                      return 'İlan başlığı en fazla 200 karakter olabilir.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Kategori Seçimi
                DropdownButtonFormField<ListingCategory>(
                  value: _selectedCategory,
                  decoration: const InputDecoration(
                    labelText: 'Kategori *',
                    prefixIcon: Icon(Icons.category_outlined, color: AppColors.textMuted),
                  ),
                  items: ListingCategory.values.map((cat) {
                    return DropdownMenuItem<ListingCategory>(
                      value: cat,
                      child: Row(
                        children: [
                          Icon(cat.icon, size: 18, color: AppColors.textSecondary),
                          const SizedBox(width: 8),
                          Text(cat.label),
                        ],
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedCategory = val;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),

                // Fiyat
                TextFormField(
                  controller: _priceController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Fiyat (TL) *',
                    hintText: 'Örn: 125000',
                    prefixIcon: Icon(Icons.currency_lira_rounded, color: AppColors.textMuted),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Lütfen bir fiyat giriniz.';
                    }
                    final double? parsed = double.tryParse(value.replaceAll(',', '.').trim());
                    if (parsed == null || parsed < 0) {
                      return 'Geçerli bir fiyat giriniz (0 veya daha büyük).';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Konum
                TextFormField(
                  controller: _locationController,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Konum (İl / İlçe) *',
                    hintText: 'Örn: Konya / Çumra',
                    prefixIcon: Icon(Icons.location_on_outlined, color: AppColors.textMuted),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().length < 2) {
                      return 'Konum bilgisi en az 2 karakter olmalıdır.';
                    }
                    if (value.trim().length > 150) {
                      return 'Konum bilgisi en fazla 150 karakter olabilir.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Telefon Numarası
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    labelText: 'İletişim Telefon Numarası *',
                    hintText: '0555 123 4567',
                    prefixIcon: const Icon(Icons.phone_outlined, color: AppColors.textMuted),
                    helperText: user?.phone != null && user!.phone!.isNotEmpty
                        ? 'Profilinizdeki kayıtlı numara kullanılıyor.'
                        : null,
                  ),
                  validator: (value) {
                    if (value == null || value.trim().length < 7) {
                      return 'Lütfen geçerli bir telefon numarası giriniz.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Açıklama
                TextFormField(
                  controller: _descriptionController,
                  maxLines: 5,
                  textInputAction: TextInputAction.newline,
                  decoration: const InputDecoration(
                    labelText: 'İlan Açıklaması *',
                    hintText: 'Ürünün durumu, teslimat şartları ve özellikleri hakkında detaylı bilgi veriniz...',
                    alignLabelWithHint: true,
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(bottom: 80),
                      child: Icon(Icons.description_outlined, color: AppColors.textMuted),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().length < 10) {
                      return 'İlan açıklaması en az 10 karakter olmalıdır.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 28),

                // Kaydet Butonu
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.cherry800,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_circle_outline_rounded, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'İlanı Yayınla',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
