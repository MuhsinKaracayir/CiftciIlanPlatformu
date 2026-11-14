import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ciftci_mobil/core/theme/app_colors.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_enums.dart';
import 'package:ciftci_mobil/features/listings/presentation/providers/listing_provider.dart';
import 'package:ciftci_mobil/features/listings/presentation/widgets/category_filter_bar.dart';
import 'package:ciftci_mobil/features/listings/presentation/widgets/home_empty_state.dart';
import 'package:ciftci_mobil/features/listings/presentation/widgets/home_hero_banner.dart';
import 'package:ciftci_mobil/features/listings/presentation/widgets/home_search_bar.dart';
import 'package:ciftci_mobil/features/listings/presentation/widgets/listing_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  final VoidCallback? onNavigateToProfile;
  final VoidCallback? onNavigateToCreateListing;

  const HomeScreen({
    super.key,
    this.onNavigateToProfile,
    this.onNavigateToCreateListing,
  });

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  static final List<String> _categories = [
    'Tümü',
    ...ListingCategory.allLabels,
  ];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      ref.read(listingControllerProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final ListingState listingState = ref.watch(listingControllerProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.eco_rounded, size: 20, color: AppColors.cherry200),
            ),
            const SizedBox(width: 8),
            const Text('Çiftçi Pazarı'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, size: 26),
            tooltip: 'Yeni İlan Ver',
            onPressed: () {
              if (widget.onNavigateToCreateListing != null) {
                widget.onNavigateToCreateListing!();
              } else {
                context.push('/create-listing');
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.account_circle_outlined, size: 26),
            tooltip: 'Profilim',
            onPressed: () {
              if (widget.onNavigateToProfile != null) {
                widget.onNavigateToProfile!();
              } else {
                context.push('/profile');
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.cherry800,
        backgroundColor: AppColors.surface,
        onRefresh: () async {
          await ref.read(listingControllerProvider.notifier).fetchListings(refresh: true);
        },
        child: CustomScrollView(
          controller: _scrollController,
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            const SliverToBoxAdapter(child: HomeHeroBanner()),
            SliverToBoxAdapter(
              child: HomeSearchBar(
                controller: _searchController,
                onSubmitted: (value) {
                  ref.read(listingControllerProvider.notifier).setSearchQuery(value.trim());
                },
                onClear: () {
                  ref.read(listingControllerProvider.notifier).setSearchQuery('');
                },
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 14)),
            SliverToBoxAdapter(
              child: CategoryFilterBar(
                categories: _categories,
                selectedCategory: listingState.selectedCategory,
                onSelected: (category) {
                  ref.read(listingControllerProvider.notifier).selectCategory(category);
                },
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 16)),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Aktif İlanlar',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${listingState.pagination.totalItems} ilan bulundu',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 12)),
            if (listingState.isLoading)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.cherry800),
                ),
              )
            else if (listingState.errorMessage != null)
              SliverFillRemaining(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
                        const SizedBox(height: 12),
                        Text(
                          listingState.errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            ref.read(listingControllerProvider.notifier).fetchListings(refresh: true);
                          },
                          child: const Text('Tekrar Dene'),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else if (listingState.listings.isEmpty)
              const SliverFillRemaining(
                child: HomeEmptyState(),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.68,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final listing = listingState.listings[index];
                      return ListingCard(
                        listing: listing,
                        onTap: () {
                          context.push(
                            '/listings/${listing.id}',
                            extra: listing,
                          );
                        },
                      );
                    },
                    childCount: listingState.listings.length,
                  ),
                ),
              ),
            if (listingState.isLoadingMore)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(
                    child: CircularProgressIndicator(color: AppColors.cherry800, strokeWidth: 2),
                  ),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }
}
