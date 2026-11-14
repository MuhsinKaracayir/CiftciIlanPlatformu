import 'listing_enums.dart';

class ListingModel {
  final int id;
  final String title;
  final String description;
  final double price;
  final String category;
  final String location;
  final String sellerName;
  final String sellerPhone;
  final String? imageUrl;
  final int? userId;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  ListingStatus get statusEnum => ListingStatus.fromString(status);
  ListingCategory get categoryEnum => ListingCategory.fromString(category);

  const ListingModel({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.category,
    required this.location,
    required this.sellerName,
    required this.sellerPhone,
    this.imageUrl,
    this.userId,
    required this.status,
    this.createdAt,
    this.updatedAt,
  });

  factory ListingModel.fromJson(Map<String, dynamic> json) {
    final dynamic rawPrice = json['price'] ?? json['Price'] ?? 0;
    final double parsedPrice = rawPrice is num
        ? rawPrice.toDouble()
        : (double.tryParse(rawPrice.toString()) ?? 0.0);

    return ListingModel(
      id: json['id'] is int ? json['id'] as int : int.parse(json['id'].toString()),
      title: (json['title'] ?? json['Title'] ?? '') as String,
      description: (json['description'] ?? json['Description'] ?? '') as String,
      price: parsedPrice,
      category: (json['category'] ?? json['Category'] ?? 'Diğer') as String,
      location: (json['location'] ?? json['Location'] ?? '') as String,
      sellerName: (json['sellerName'] ?? json['SellerName'] ?? '') as String,
      sellerPhone: (json['sellerPhone'] ?? json['SellerPhone'] ?? '') as String,
      imageUrl: (json['imageUrl'] ?? json['ImageUrl']) as String?,
      userId: json['userId'] != null
          ? (json['userId'] is int ? json['userId'] as int : int.tryParse(json['userId'].toString()))
          : (json['UserId'] != null
              ? (json['UserId'] is int ? json['UserId'] as int : int.tryParse(json['UserId'].toString()))
              : null),
      status: (json['status'] ?? json['Status'] ?? 'active') as String,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : (json['CreatedAt'] != null
              ? DateTime.tryParse(json['CreatedAt'].toString())
              : null),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : (json['UpdatedAt'] != null
              ? DateTime.tryParse(json['UpdatedAt'].toString())
              : null),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'price': price,
      'category': category,
      'location': location,
      'sellerName': sellerName,
      'sellerPhone': sellerPhone,
      'imageUrl': imageUrl,
      'userId': userId,
      'status': status,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  ListingModel copyWith({
    int? id,
    String? title,
    String? description,
    double? price,
    String? category,
    String? location,
    String? sellerName,
    String? sellerPhone,
    String? imageUrl,
    int? userId,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ListingModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      price: price ?? this.price,
      category: category ?? this.category,
      location: location ?? this.location,
      sellerName: sellerName ?? this.sellerName,
      sellerPhone: sellerPhone ?? this.sellerPhone,
      imageUrl: imageUrl ?? this.imageUrl,
      userId: userId ?? this.userId,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

