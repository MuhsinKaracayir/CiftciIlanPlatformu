import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  static const String _tokenKey = 'jwt_token';
  static const String _userKey = 'authenticated_user';

  final FlutterSecureStorage _storage;

  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
              ),
              iOptions: IOSOptions(
                accessibility: KeychainAccessibility.first_unlock,
              ),
            );

  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  Future<bool> hasToken() async {
    final String? token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> saveUser(Map<String, dynamic> userMap) async {
    final String userJson = jsonEncode(userMap);
    await _storage.write(key: _userKey, value: userJson);
  }

  Future<Map<String, dynamic>?> getUser() async {
    final String? rawJson = await _storage.read(key: _userKey);
    if (rawJson == null || rawJson.isEmpty) {
      return null;
    }
    try {
      final dynamic decoded = jsonDecode(rawJson);
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<void> deleteUser() async {
    await _storage.delete(key: _userKey);
  }

  Future<void> clearAll() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
  }
}

