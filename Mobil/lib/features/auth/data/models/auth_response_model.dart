import 'user_model.dart';

class AuthResponseModel {
  final UserModel user;
  final String token;

  const AuthResponseModel({
    required this.user,
    required this.token,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> userData =
        json['user'] is Map<String, dynamic> ? json['user'] as Map<String, dynamic> : <String, dynamic>{};
    final String tokenValue = (json['token'] ?? '') as String;

    return AuthResponseModel(
      user: UserModel.fromJson(userData),
      token: tokenValue,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'token': token,
    };
  }
}

