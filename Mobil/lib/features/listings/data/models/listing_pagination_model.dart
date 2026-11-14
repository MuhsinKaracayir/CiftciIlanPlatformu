class ListingPaginationModel {
  final int page;
  final int limit;
  final int totalItems;
  final int totalPages;

  const ListingPaginationModel({
    required this.page,
    required this.limit,
    required this.totalItems,
    required this.totalPages,
  });

  factory ListingPaginationModel.fromJson(Map<String, dynamic> json) {
    return ListingPaginationModel(
      page: json['page'] is int ? json['page'] as int : (int.tryParse(json['page'].toString()) ?? 1),
      limit: json['limit'] is int ? json['limit'] as int : (int.tryParse(json['limit'].toString()) ?? 10),
      totalItems: json['totalItems'] is int
          ? json['totalItems'] as int
          : (int.tryParse(json['totalItems'].toString()) ?? 0),
      totalPages: json['totalPages'] is int
          ? json['totalPages'] as int
          : (int.tryParse(json['totalPages'].toString()) ?? 1),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'page': page,
      'limit': limit,
      'totalItems': totalItems,
      'totalPages': totalPages,
    };
  }
}

