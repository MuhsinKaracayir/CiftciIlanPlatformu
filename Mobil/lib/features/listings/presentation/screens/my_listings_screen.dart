import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ciftci_mobil/core/network/dio_client.dart';
import 'package:ciftci_mobil/core/theme/app_colors.dart';
import 'package:ciftci_mobil/core/utils/currency_formatter.dart';
import 'package:ciftci_mobil/core/utils/image_url_helper.dart';
import 'package:ciftci_mobil/features/auth/presentation/providers/auth_provider.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_enums.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_model.dart';
import 'package:ciftci_mobil/features/listings/data/repositories/listing_repository.dart';
import 'package:ciftci_mobil/features/listings/presentation/providers/listing_provider.dart';

class MyListingsScreen extends ConsumerStatefulWidget {
  const MyListingsScreen({super.key});

  @override
  ConsumerState<MyListingsScreen> createState() => _MyListingsScreenState();
}

class _MyListingsScreenState extends ConsumerState<MyListingsScreen> {
  List<ListingModel> _allListings = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _selectedFilter = 'all'; // all, active, sold, passive

  @override
  void initState() {
    super.initState();
    _fetchMyListings();
  }

  Future<void> _fetchMyListings() async {
    final user = ref.read(authControllerProvider).user;
    if (user == null) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Kullanıcı oturumu bulunamadı.';
        });
      }
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.get(
        '/listings',
        queryParameters: {
          'userId': user.id,
          'status': 'all',
          'limit': 100,
        },
      );

      final dynamic body = response.data;
      final List<ListingModel> items = [];

      if (body is Map<String, dynamic> && body['data'] is List) {
        for (final item in body['data'] as List<dynamic>) {
          if (item is Map<String, dynamic>) {
            items.add(ListingModel.fromJson(item));
          }
        }
      }

      if (mounted) {
        setState(() {
          _allListings = items;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'İlanlarınız yüklenirken bir hata oluştu.';
        });
      }
    }
  }

  List<ListingModel> get _filteredListings {
    if (_selectedFilter == 'all') {
      return _allListings;
    }
    return _allListings.where((item) => item.status.toLowerCase() == _selectedFilter).toList();
  }

  Future<void> _handleChangeStatus(ListingModel listing, String newStatus) async {
    if (listing.status.toLowerCase() == newStatus.toLowerCase()) return;

    try {
      final repository = ref.read(listingRepositoryProvider);
      final updated = await repository.changeListingStatus(listing.id, newStatus);

      setState(() {
        _allListings = _allListings.map((item) {
          return item.id == listing.id ? updated : item;
        }).toList();
      });

      // Ana sayfa listesini de tazele
      ref.read(listingControllerProvider.notifier).fetchListings(refresh: true);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('İlan durumu "${ListingStatus.fromString(newStatus).label}" olarak güncellendi.'),
            backgroundColor: AppColors.statusActive,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('İlan durumu güncellenirken bir hata oluştu.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _handleDelete(ListingModel listing) async {
    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text(
            'İlanı Sil',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
          ),
          content: Text(
            '"${listing.title}" başlıklı ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            style: const TextStyle(fontSize: 14),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text(
                'Vazgeç',
                style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Sil'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      try {
        final repository = ref.read(listingRepositoryProvider);
        await repository.deleteListing(listing.id);

        setState(() {
          _allListings.removeWhere((item) => item.id == listing.id);
        });

        // Ana sayfa listesini de tazele
        ref.read(listingControllerProvider.notifier).fetchListings(refresh: true);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('İlan başarıyla silindi.'),
              backgroundColor: AppColors.cherry800,
            ),
          );
        }
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('İlan silinirken bir hata oluştu.'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final listings = _filteredListings;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('İlanlarımı Yönet'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, size: 26),
            tooltip: 'Yeni İlan Ver',
            onPressed: () async {
              await context.push('/create-listing');
              _fetchMyListings();
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.cherry800,
        backgroundColor: AppColors.surface,
        onRefresh: _fetchMyListings,
        child: Column(
          children: [
            // Filtre Sekmeleri
            Container(
              color: AppColors.surface,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  _buildFilterChip('all', 'Tümü (${_allListings.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'active',
                    'Aktif (${_allListings.where((e) => e.status.toLowerCase() == 'active').length})',
                  ),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'sold',
                    'Satıldı (${_allListings.where((e) => e.status.toLowerCase() == 'sold').length})',
                  ),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'passive',
                    'Pasif (${_allListings.where((e) => e.status.toLowerCase() == 'passive').length})',
                  ),
                ],
              ),
            ),
            const Divider(height: 1, thickness: 1, color: AppColors.border),

            // İçerik Alanı
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.cherry800),
                    )
                  : _errorMessage != null
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
                                const SizedBox(height: 12),
                                Text(
                                  _errorMessage!,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton(
                                  onPressed: _fetchMyListings,
                                  child: const Text('Tekrar Dene'),
                                ),
                              ],
                            ),
                          ),
                        )
                      : listings.isEmpty
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(32),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(18),
                                      decoration: BoxDecoration(
                                        color: AppColors.cherry50,
                                        borderRadius: BorderRadius.circular(24),
                                      ),
                                      child: const Icon(
                                        Icons.inventory_2_outlined,
                                        size: 48,
                                        color: AppColors.cherry800,
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      _selectedFilter == 'all'
                                          ? 'Henüz bir ilanınız bulunmuyor'
                                          : 'Bu durumda ilanınız bulunmuyor',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    const Text(
                                      'Ürünlerinizi pazarda sergilemek için hemen yeni bir ilan ekleyin.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                    ),
                                    const SizedBox(height: 20),
                                    ElevatedButton.icon(
                                      onPressed: () async {
                                        await context.push('/create-listing');
                                        _fetchMyListings();
                                      },
                                      icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
                                      label: const Text('Yeni İlan Ver'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.cherry800,
                                        foregroundColor: Colors.white,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: listings.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final listing = listings[index];
                                return _buildListingItem(listing);
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String filterKey, String label) {
    final bool isSelected = _selectedFilter == filterKey;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedFilter = filterKey;
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.cherry800 : AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? AppColors.cherry800 : AppColors.border,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected ? Colors.white : AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildListingItem(ListingModel listing) {
    final String? resolvedImageUrl = ImageUrlHelper.resolve(listing.imageUrl);
    final Color statusColor = listing.statusEnum.color;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          context.push('/listings/${listing.id}', extra: listing);
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Görsel
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: 80,
                      height: 80,
                      color: AppColors.surfaceVariant,
                      child: resolvedImageUrl != null
                          ? CachedNetworkImage(
                              imageUrl: resolvedImageUrl,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => const Center(
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.cherry800,
                                ),
                              ),
                              errorWidget: (context, url, error) => const Icon(
                                Icons.image_outlined,
                                color: AppColors.textMuted,
                                size: 28,
                              ),
                            )
                          : const Icon(
                              Icons.image_outlined,
                              color: AppColors.textMuted,
                              size: 28,
                            ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Bilgiler
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: statusColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                listing.statusEnum.label,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: statusColor,
                                ),
                              ),
                            ),
                            Text(
                              '#${listing.id}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          listing.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          CurrencyFormatter.format(listing.price),
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.cherry800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const Divider(height: 1, thickness: 0.5, color: AppColors.border),
              const SizedBox(height: 8),

              // Alt Aksiyon Butonları
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        listing.location,
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      // Durum Değiştirme Menüsü
                      PopupMenuButton<String>(
                        tooltip: 'Durumu Güncelle',
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        onSelected: (newStatus) => _handleChangeStatus(listing, newStatus),
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'active',
                            child: Row(
                              children: [
                                Icon(Icons.check_circle_outline_rounded, color: AppColors.statusActive, size: 18),
                                SizedBox(width: 8),
                                Text('Aktif Yap'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'sold',
                            child: Row(
                              children: [
                                Icon(Icons.monetization_on_outlined, color: AppColors.statusSold, size: 18),
                                SizedBox(width: 8),
                                Text('Satıldı Yap'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'passive',
                            child: Row(
                              children: [
                                Icon(Icons.pause_circle_outline_rounded, color: AppColors.statusPassive, size: 18),
                                SizedBox(width: 8),
                                Text('Pasif Yap'),
                              ],
                            ),
                          ),
                        ],
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.tune_rounded, size: 14, color: AppColors.textSecondary),
                              SizedBox(width: 4),
                              Text(
                                'Durum',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Sil Butonu
                      InkWell(
                        onTap: () => _handleDelete(listing),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFFECACA)),
                          ),
                          child: const Icon(
                            Icons.delete_outline_rounded,
                            size: 18,
                            color: AppColors.error,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
