import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ciftci_mobil/core/network/dio_client.dart';
import 'package:ciftci_mobil/core/storage/token_storage.dart';
import 'package:ciftci_mobil/features/auth/data/models/user_model.dart';
import 'package:ciftci_mobil/features/auth/data/repositories/auth_repository.dart';

final Provider<TokenStorage> tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage();
});

final Provider<DioClient> dioClientProvider = Provider<DioClient>((ref) {
  final TokenStorage tokenStorage = ref.watch(tokenStorageProvider);
  return DioClient(tokenStorage: tokenStorage);
});

final Provider<IAuthRepository> authRepositoryProvider = Provider<IAuthRepository>((ref) {
  final DioClient dioClient = ref.watch(dioClientProvider);
  final TokenStorage tokenStorage = ref.watch(tokenStorageProvider);
  return AuthRepository(
    dioClient: dioClient,
    tokenStorage: tokenStorage,
  );
});

enum AuthStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? errorMessage;

  const AuthState({
    required this.status,
    this.user,
    this.errorMessage,
  });

  factory AuthState.initial() => const AuthState(status: AuthStatus.initial);

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    String? errorMessage,
    bool clearUser = false,
    bool clearError = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: clearUser ? null : (user ?? this.user),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class AuthController extends StateNotifier<AuthState> {
  final IAuthRepository _authRepository;

  AuthController({required IAuthRepository authRepository})
      : _authRepository = authRepository,
        super(AuthState.initial()) {
    checkInitialAuthStatus();
  }

  Future<void> checkInitialAuthStatus() async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final bool hasToken = await _authRepository.isAuthenticated();
      if (!hasToken) {
        state = state.copyWith(status: AuthStatus.unauthenticated, clearUser: true);
        return;
      }

      final UserModel? cachedUser = await _authRepository.getCachedUser();
      if (cachedUser != null) {
        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: cachedUser,
          clearError: true,
        );
      }

      final UserModel freshUser = await _authRepository.getMe();
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: freshUser,
        clearError: true,
      );
    } catch (_) {
      final UserModel? cachedUser = await _authRepository.getCachedUser();
      if (cachedUser != null) {
        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: cachedUser,
          clearError: true,
        );
      } else {
        await _authRepository.logout();
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          clearUser: true,
        );
      }
    }
  }

  Future<bool> login({required String email, required String password}) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);
    try {
      final response = await _authRepository.login(
        email: email,
        password: password,
      );
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: response.user,
        clearError: true,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);
    try {
      final response = await _authRepository.register(
        fullName: fullName,
        email: email,
        password: password,
        phone: phone,
      );
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: response.user,
        clearError: true,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  Future<void> refreshProfile() async {
    try {
      final UserModel freshUser = await _authRepository.getMe();
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: freshUser,
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> logout() async {
    state = state.copyWith(status: AuthStatus.loading);
    await _authRepository.logout();
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      clearUser: true,
      clearError: true,
    );
  }

  void handleUnauthorized() {
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      clearUser: true,
      errorMessage: 'Oturum sureniz doldu. Lutfen tekrar giris yapin.',
    );
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

final StateNotifierProvider<AuthController, AuthState> authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  final IAuthRepository authRepository = ref.watch(authRepositoryProvider);
  return AuthController(authRepository: authRepository);
});
