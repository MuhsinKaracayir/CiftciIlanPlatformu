import 'package:dio/dio.dart';
import 'package:ciftci_mobil/core/network/dio_client.dart';
import 'package:ciftci_mobil/core/storage/token_storage.dart';
import 'package:ciftci_mobil/features/auth/data/models/auth_response_model.dart';
import 'package:ciftci_mobil/features/auth/data/models/user_model.dart';

abstract class IAuthRepository {
  Future<AuthResponseModel> login({
    required String email,
    required String password,
  });

  Future<AuthResponseModel> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  });

  Future<UserModel> getMe();
  Future<void> logout();
  Future<bool> isAuthenticated();
  Future<UserModel?> getCachedUser();
}

class AuthRepository implements IAuthRepository {
  final DioClient _dioClient;
  final TokenStorage _tokenStorage;

  AuthRepository({
    required DioClient dioClient,
    required TokenStorage tokenStorage,
  })  : _dioClient = dioClient,
        _tokenStorage = tokenStorage;

  @override
  Future<AuthResponseModel> login({
    required String email,
    required String password,
  }) async {
    final Response<dynamic> response = await _dioClient.post(
      '/auth/login',
      data: {
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );

    final dynamic body = response.data;
    final Map<String, dynamic> dataMap = (body is Map<String, dynamic> && body['data'] is Map<String, dynamic>)
        ? body['data'] as Map<String, dynamic>
        : <String, dynamic>{};

    final AuthResponseModel authResponse = AuthResponseModel.fromJson(dataMap);

    await _tokenStorage.saveToken(authResponse.token);
    await _tokenStorage.saveUser(authResponse.user.toJson());

    return authResponse;
  }

  @override
  Future<AuthResponseModel> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  }) async {
    final Response<dynamic> response = await _dioClient.post(
      '/auth/register',
      data: {
        'fullName': fullName.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        'phone': phone != null && phone.trim().isNotEmpty ? phone.trim() : null,
      },
    );

    final dynamic body = response.data;
    final Map<String, dynamic> dataMap = (body is Map<String, dynamic> && body['data'] is Map<String, dynamic>)
        ? body['data'] as Map<String, dynamic>
        : <String, dynamic>{};

    final AuthResponseModel authResponse = AuthResponseModel.fromJson(dataMap);

    await _tokenStorage.saveToken(authResponse.token);
    await _tokenStorage.saveUser(authResponse.user.toJson());

    return authResponse;
  }

  @override
  Future<UserModel> getMe() async {
    final Response<dynamic> response = await _dioClient.get('/auth/me');

    final dynamic body = response.data;
    final Map<String, dynamic> dataMap = (body is Map<String, dynamic> && body['data'] is Map<String, dynamic>)
        ? body['data'] as Map<String, dynamic>
        : <String, dynamic>{};

    final UserModel user = UserModel.fromJson(dataMap);
    await _tokenStorage.saveUser(user.toJson());

    return user;
  }

  @override
  Future<void> logout() async {
    await _tokenStorage.clearAll();
  }

  @override
  Future<bool> isAuthenticated() async {
    return await _tokenStorage.hasToken();
  }

  @override
  Future<UserModel?> getCachedUser() async {
    final Map<String, dynamic>? userMap = await _tokenStorage.getUser();
    if (userMap != null) {
      return UserModel.fromJson(userMap);
    }
    return null;
  }
}
