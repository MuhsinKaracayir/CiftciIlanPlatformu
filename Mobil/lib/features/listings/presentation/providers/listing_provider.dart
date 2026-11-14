import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ciftci_mobil/core/network/dio_client.dart';
import 'package:ciftci_mobil/features/auth/presentation/providers/auth_provider.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_model.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_pagination_model.dart';
import 'package:ciftci_mobil/features/listings/data/repositories/listing_repository.dart';

final Provider<IListingRepository> listingRepositoryProvider = Provider<IListingRepository>((ref) {
  final DioClient dioClient = ref.watch(dioClientProvider);
  return ListingRepository(dioClient: dioClient);
});

class ListingState {
  final List<ListingModel> listings;
  final ListingPaginationModel pagination;
  final bool isLoading;
  final bool isLoadingMore;
  final String? errorMessage;
  final String selectedCategory;
  final String searchQuery;

  const ListingState({
    required this.listings,
    required this.pagination,
    required this.isLoading,
    this.isLoadingMore = false,
    this.errorMessage,
    this.selectedCategory = 'Tümü',
    this.searchQuery = '',
  });

  factory ListingState.initial() => const ListingState(
        listings: [],
        pagination: ListingPaginationModel(page: 1, limit: 12, totalItems: 0, totalPages: 1),
        isLoading: true,
        isLoadingMore: false,
        selectedCategory: 'Tümü',
        searchQuery: '',
      );

  ListingState copyWith({
    List<ListingModel>? listings,
    ListingPaginationModel? pagination,
    bool? isLoading,
    bool? isLoadingMore,
    String? errorMessage,
    bool clearError = false,
    String? selectedCategory,
    String? searchQuery,
  }) {
    return ListingState(
      listings: listings ?? this.listings,
      pagination: pagination ?? this.pagination,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      selectedCategory: selectedCategory ?? this.selectedCategory,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class ListingController extends StateNotifier<ListingState> {
  final IListingRepository _listingRepository;

  ListingController({required IListingRepository listingRepository})
      : _listingRepository = listingRepository,
        super(ListingState.initial()) {
    fetchListings();
  }

  Future<void> fetchListings({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(isLoading: true, clearError: true);
    }

    try {
      final result = await _listingRepository.getListings(
        page: 1,
        limit: 12,
        search: state.searchQuery.isNotEmpty ? state.searchQuery : null,
        category: state.selectedCategory != 'Tümü' ? state.selectedCategory : null,
        status: 'active',
      );

      state = state.copyWith(
        listings: result.items,
        pagination: result.pagination,
        isLoading: false,
        isLoadingMore: false,
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isLoadingMore: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> selectCategory(String category) async {
    if (state.selectedCategory == category) return;
    state = state.copyWith(selectedCategory: category, isLoading: true, clearError: true);
    await fetchListings();
  }

  Future<void> setSearchQuery(String query) async {
    state = state.copyWith(searchQuery: query, isLoading: true, clearError: true);
    await fetchListings();
  }

  Future<void> loadMore() async {
    if (state.isLoadingMore || state.pagination.page >= state.pagination.totalPages) {
      return;
    }

    state = state.copyWith(isLoadingMore: true);
    final int nextPage = state.pagination.page + 1;

    try {
      final result = await _listingRepository.getListings(
        page: nextPage,
        limit: 12,
        search: state.searchQuery.isNotEmpty ? state.searchQuery : null,
        category: state.selectedCategory != 'Tümü' ? state.selectedCategory : null,
        status: 'active',
      );

      state = state.copyWith(
        listings: [...state.listings, ...result.items],
        pagination: result.pagination,
        isLoadingMore: false,
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingMore: false,
        errorMessage: e.toString(),
      );
    }
  }
}

final StateNotifierProvider<ListingController, ListingState> listingControllerProvider =
    StateNotifierProvider<ListingController, ListingState>((ref) {
  final IListingRepository repository = ref.watch(listingRepositoryProvider);
  return ListingController(listingRepository: repository);
});

