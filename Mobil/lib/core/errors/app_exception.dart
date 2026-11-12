class AppException implements Exception {
  final String message;
  final int? statusCode;
  final List<dynamic>? details;

  const AppException({
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  const NetworkException({
    super.message = 'Internet baglantisi kurulamadi. Lutfen ag ayarlarinizi kontrol edin.',
  });
}

class UnauthorizedException extends AppException {
  const UnauthorizedException({
    super.message = 'Oturum sureniz doldu veya gecersiz yetki. Lutfen tekrar giris yapin.',
    super.statusCode = 401,
  });
}

class ForbiddenException extends AppException {
  const ForbiddenException({
    super.message = 'Bu islemi gerceklestirmek icin yetkiniz bulunmuyor.',
    super.statusCode = 403,
  });
}

class NotFoundException extends AppException {
  const NotFoundException({
    super.message = 'Talep edilen kaynak bulunamadi.',
    super.statusCode = 404,
  });
}

class ValidationException extends AppException {
  const ValidationException({
    required super.message,
    super.details,
    super.statusCode = 400,
  });
}

class ServerException extends AppException {
  const ServerException({
    super.message = 'Sunucu tarafinda bir hata olustu. Lutfen daha sonra tekrar deneyin.',
    super.statusCode = 500,
  });
}

