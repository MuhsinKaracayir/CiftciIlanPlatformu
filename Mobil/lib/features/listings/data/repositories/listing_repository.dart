import 'dart:io';
import 'package:dio/dio.dart';
import 'package:ciftci_mobil/core/network/dio_client.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_model.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_pagination_model.dart';

abstract class IListingRepository {
  Future<({List<ListingModel> items, ListingPaginationModel pagination})> getListings({
    int page = 1,
    int limit = 12,
    String? search,
    String? category,
    String? location,
    double? minPrice,
    double? maxPrice,
    String? status = 'active',
    int? userId,
  });

  Future<ListingModel> getListingById(int id);

  Future<ListingModel> createListing({
    required String title,
    required String description,
    required double price,
    required String category,
    required String location,
    String? sellerName,
    String? sellerPhone,
    String? imagePath,
  });

  Future<void> deleteListing(int id);

  Future<ListingModel> changeListingStatus(int id, String status);
}

class ListingRepository implements IListingRepository {
  final DioClient _dioClient;

  ListingRepository({required DioClient dioClient}) : _dioClient = dioClient;

  @override
  Future<({List<ListingModel> items, ListingPaginationModel pagination})> getListings({
    int page = 1,
    int limit = 12,
    String? search,
    String? category,
    String? location,
    double? minPrice,
    double? maxPrice,
    String? status = 'active',
    int? userId,
  }) async {
    final Map<String, dynamic> queryParameters = {
      'page': page,
      'limit': limit,
    };

    if (search != null && search.trim().isNotEmpty) {
      queryParameters['search'] = search.trim();
    }
    if (category != null && category.trim().isNotEmpty && category != 'Tüm Kategoriler' && category != 'Tümü') {
      queryParameters['category'] = category.trim();
    }
    if (location != null && location.trim().isNotEmpty) {
      queryParameters['location'] = location.trim();
    }
    if (minPrice != null && minPrice >= 0) {
      queryParameters['minPrice'] = minPrice;
    }
    if (maxPrice != null && maxPrice >= 0) {
      queryParameters['maxPrice'] = maxPrice;
    }
    if (status != null && status.isNotEmpty) {
      queryParameters['status'] = status;
    }
    if (userId != null) {
      queryParameters['userId'] = userId;
    }

    final Response<dynamic> response = await _dioClient.get(
      '/listings',
      queryParameters: queryParameters,
    );

    final dynamic body = response.data;
    final List<ListingModel> items = [];
    ListingPaginationModel pagination = const ListingPaginationModel(
      page: 1,
      limit: 12,
      totalItems: 0,
      totalPages: 1,
    );

    if (body is Map<String, dynamic>) {
      if (body['data'] is List) {
        for (final item in body['data'] as List<dynamic>) {
          if (item is Map<String, dynamic>) {
            items.add(ListingModel.fromJson(item));
          }
        }
      }
      if (body['meta'] is Map<String, dynamic>) {
        pagination = ListingPaginationModel.fromJson(body['meta'] as Map<String, dynamic>);
      }
    }

    return (items: items, pagination: pagination);
  }

  @override
  Future<ListingModel> getListingById(int id) async {
    final Response<dynamic> response = await _dioClient.get('/listings/$id');
    final dynamic body = response.data;
    final Map<String, dynamic> dataMap = (body is Map<String, dynamic> && body['data'] is Map<String, dynamic>)
        ? body['data'] as Map<String, dynamic>
        : <String, dynamic>{};

    return ListingModel.fromJson(dataMap);
  }

  @override
  Future<ListingModel> createListing({
    required String title,
    required String description,
    required double price,
    required String category,
    required String location,
    String? sellerName,
    String? sellerPhone,
    String? imagePath,
  }) async {
    final Map<String, dynamic> formMap = {
      'title': title,
      'description': description,
      'price': price,
      'category': category,
      'location': location,
    };

    if (sellerName != null && sellerName.trim().isNotEmpty) {
      formMap['sellerName'] = sellerName.trim();
    }
    if (sellerPhone != null && sellerPhone.trim().isNotEmpty) {
      formMap['sellerPhone'] = sellerPhone.trim();
    }
    if (imagePath != null && imagePath.trim().isNotEmpty) {
      final file = File(imagePath);
      final filename = file.path.split(Platform.pathSeparator).last;
      formMap['image'] = await MultipartFile.fromFile(
        file.path,
        filename: filename,
      );
    }

    final formData = FormData.fromMap(formMap);

    final Response<dynamic> response = await _dioClient.post(
      '/listings',
      data: formData,
    );

    final dynamic body = response.data;
    final Map<String, dynamic> dataMap = (body is Map<String, dynamic> && body['data'] is Map<String, dynamic>)
        ? body['data'] as Map<String, dynamic>
        : <String, dynamic>{};

    return ListingModel.fromJson(dataMap);
  }

  @override
  Future<void> deleteListing(int id) async {
    await _dioClient.delete('/listings/$id');
  }

  @override
  Future<ListingModel> changeListingStatus(int id, String status) async {
    final Response<dynamic> response = await _dioClient.patch(
      '/listings/$id/status',
      data: {'status': status},
    );

    final dynamic body = response.data;
    final Map<String, dynamic> dataMap = (body is Map<String, dynamic> && body['data'] is Map<String, dynamic>)
        ? body['data'] as Map<String, dynamic>
        : <String, dynamic>{};

    return ListingModel.fromJson(dataMap);
  }
}

