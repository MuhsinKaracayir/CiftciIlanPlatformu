import 'dart:io';
import 'package:flutter/foundation.dart';

class ImageUrlHelper {
  ImageUrlHelper._();

  static const String _androidHost = 'https://ciftciilanplatformu.onrender.com';
  static const String _defaultHost = 'https://ciftciilanplatformu.onrender.com';

  static String get baseUrl {
    if (kIsWeb) {
      return _defaultHost;
    }
    if (Platform.isAndroid) {
      return _androidHost;
    }
    return _defaultHost;
  }

  static String? resolve(String? rawUrl) {
    if (rawUrl == null || rawUrl.trim().isEmpty) {
      return null;
    }

    final String trimmed = rawUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    if (trimmed.startsWith('/uploads/')) {
      return '$baseUrl$trimmed';
    }

    if (trimmed.startsWith('/')) {
      return '$baseUrl$trimmed';
    }

    return '$baseUrl/uploads/$trimmed';
  }
}

