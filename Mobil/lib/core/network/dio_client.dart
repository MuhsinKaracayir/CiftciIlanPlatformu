import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../errors/app_exception.dart';
import '../storage/token_storage.dart';
import 'auth_interceptor.dart';

class DioClient {
  static const String _androidBaseUrl = 'http://10.0.2.2:3000/api/v1';
  static const String _defaultBaseUrl = 'http://localhost:3000/api/v1';

  final Dio _dio;
  final TokenStorage _tokenStorage;

  DioClient({
    required TokenStorage tokenStorage,
    String? baseUrl,
    void Function()? onUnauthorized,
  })  : _tokenStorage = tokenStorage,
        _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl ?? _resolveBaseUrl(),
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
            sendTimeout: const Duration(seconds: 15),
            headers: const {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          ),
        ) {
    _dio.interceptors.add(
      AuthInterceptor(
        tokenStorage: _tokenStorage,
        onUnauthorized: onUnauthorized,
      ),
    );

    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          request: true,
          requestHeader: true,
          requestBody: true,
          responseHeader: false,
          responseBody: true,
          error: true,
        ),
      );
    }
  }

  Dio get dio => _dio;

  static String _resolveBaseUrl() {
    if (kIsWeb) {
      return _defaultBaseUrl;
    }
    if (Platform.isAndroid) {
      return _androidBaseUrl;
    }
    return _defaultBaseUrl;
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  AppException _handleDioError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return const NetworkException();
    }

    final Response<dynamic>? response = error.response;
    if (response != null) {
      final int statusCode = response.statusCode ?? 500;
      final dynamic responseData = response.data;

      String message = 'Beklenmeyen bir hata olustu.';
      List<dynamic>? errors;

      if (responseData is Map<String, dynamic>) {
        if (responseData['message'] is String) {
          message = responseData['message'] as String;
        }
        if (responseData['errors'] is List) {
          errors = responseData['errors'] as List<dynamic>;
        }
      }

      switch (statusCode) {
        case 400:
          return ValidationException(
            message: message,
            details: errors,
            statusCode: 400,
          );
        case 401:
          return UnauthorizedException(
            message: message,
            statusCode: 401,
          );
        case 403:
          return ForbiddenException(
            message: message,
            statusCode: 403,
          );
        case 404:
          return NotFoundException(
            message: message,
            statusCode: 404,
          );
        default:
          return ServerException(
            message: message,
            statusCode: statusCode,
          );
      }
    }

    return AppException(
      message: error.message ?? 'Bilinmeyen bir ag hatasi olustu.',
    );
  }
}

