import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:ciftci_mobil/core/theme/app_colors.dart';
import 'package:ciftci_mobil/core/utils/currency_formatter.dart';
import 'package:ciftci_mobil/core/utils/image_url_helper.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_model.dart';
import 'package:ciftci_mobil/features/listings/presentation/providers/listing_provider.dart';

class ListingDetailScreen extends ConsumerStatefulWidget {
  final int listingId;
  final ListingModel? initialListing;

  const ListingDetailScreen({
    super.key,
    required this.listingId,
    this.initialListing,
  });

  @override
  ConsumerState<ListingDetailScreen> createState() => _ListingDetailScreenState();
}

class _ListingDetailScreenState extends ConsumerState<ListingDetailScreen> {
  ListingModel? _listing;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _listing = widget.initialListing;
    if (_listing == null) {
      _fetchListingDetail();
    }
  }

  Future<void> _fetchListingDetail() async {
    setState(() {
      _errorMessage = null;
    });

    try {
      final repository = ref.read(listingRepositoryProvider);
      final fetchedListing = await repository.getListingById(widget.listingId);
      if (mounted) {
        setState(() {
          _listing = fetchedListing;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'İlan detayları yüklenirken bir hata oluştu.';
        });
      }
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '';
    try {
      return DateFormat('dd.MM.yyyy HH:mm').format(date);
    } catch (_) {
      return '';
    }
  }

  void _copyPhoneNumber(String phone) {
    Clipboard.setData(ClipboardData(text: phone));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Telefon numarası kopyalandı: $phone'),
        duration: const Duration(seconds: 2),
        backgroundColor: AppColors.cherry900,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_listing == null) {
      if (_errorMessage != null) {
        return Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            title: const Text('İlan Detayı'),
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
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline_rounded, size: 56, color: AppColors.error),
                  const SizedBox(height: 16),
                  Text(
                    _errorMessage!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _fetchListingDetail,
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.cherry800),
                    child: const Text('Tekrar Dene'),
                  ),
                ],
              ),
            ),
          ),
        );
      }

      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('İlan Detayı'),
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
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.cherry800),
        ),
      );
    }

    final listing = _listing!;
    final String? resolvedImageUrl = ImageUrlHelper.resolve(listing.imageUrl);
    final Color statusColor = listing.statusEnum.color;
    final String formattedDate = _formatDate(listing.createdAt);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('İlan Detayı'),
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
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Yenile',
            onPressed: _fetchListingDetail,
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.cherry800,
        backgroundColor: AppColors.surface,
        onRefresh: _fetchListingDetail,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Görsel Alanı
              Container(
                color: AppColors.surfaceVariant,
                width: double.infinity,
                height: 280,
                child: resolvedImageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: resolvedImageUrl,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => const Center(
                          child: CircularProgressIndicator(color: AppColors.cherry800, strokeWidth: 2),
                        ),
                        errorWidget: (context, url, error) => _buildFallbackImage(),
                      )
                    : _buildFallbackImage(),
              ),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 2. Fiyat ve Durum Rozeti
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            CurrencyFormatter.format(listing.price),
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              color: AppColors.cherry800,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: statusColor,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            listing.statusEnum.label,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // 3. İlan Başlığı
                    Text(
                      listing.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 4. Kategori ve Konum Bilgileri
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        children: [
                          _buildInfoRow(
                            icon: Icons.category_outlined,
                            label: 'Kategori',
                            value: listing.category,
                          ),
                          const Divider(height: 16, thickness: 0.5, color: AppColors.border),
                          _buildInfoRow(
                            icon: Icons.location_on_outlined,
                            label: 'Konum',
                            value: listing.location,
                          ),
                          if (formattedDate.isNotEmpty) ...[
                            const Divider(height: 16, thickness: 0.5, color: AppColors.border),
                            _buildInfoRow(
                              icon: Icons.calendar_today_outlined,
                              label: 'İlan Tarihi',
                              value: formattedDate,
                            ),
                          ],
                          const Divider(height: 16, thickness: 0.5, color: AppColors.border),
                          _buildInfoRow(
                            icon: Icons.tag_rounded,
                            label: 'İlan No',
                            value: '#${listing.id}',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // 5. Satıcı Bilgileri Kartı
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.cherry50,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.cherry200),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.person_pin_rounded, color: AppColors.cherry800, size: 22),
                              SizedBox(width: 8),
                              Text(
                                'Satıcı Bilgileri',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.cherry950,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.cherry200),
                                ),
                                child: const Icon(Icons.person_outline_rounded, color: AppColors.cherry800),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      listing.sellerName,
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      listing.sellerPhone,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              OutlinedButton.icon(
                                onPressed: () => _copyPhoneNumber(listing.sellerPhone),
                                icon: const Icon(Icons.copy_rounded, size: 16, color: AppColors.cherry800),
                                label: const Text(
                                  'Kopyala',
                                  style: TextStyle(color: AppColors.cherry800, fontSize: 12, fontWeight: FontWeight.w700),
                                ),
                                style: OutlinedButton.styleFrom(
                                  minimumSize: const Size(0, 36),
                                  side: const BorderSide(color: AppColors.cherry800),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // 6. Ürün Açıklaması
                    const Text(
                      'İlan Açıklaması',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(
                        listing.description.isNotEmpty
                            ? listing.description
                            : 'Bu ilan için herhangi bir açıklama girilmemiştir.',
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textPrimary,
                          height: 1.6,
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _buildFallbackImage() {
    return Container(
      color: AppColors.cherry50,
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_outlined, size: 56, color: AppColors.cherry300),
            SizedBox(height: 8),
            Text(
              'Görsel Bulunmuyor',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

