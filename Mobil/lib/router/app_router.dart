import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ciftci_mobil/features/auth/presentation/providers/auth_provider.dart';
import 'package:ciftci_mobil/features/auth/presentation/screens/login_screen.dart';
import 'package:ciftci_mobil/features/auth/presentation/screens/profile_screen.dart';
import 'package:ciftci_mobil/features/auth/presentation/screens/register_screen.dart';

class RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  RouterNotifier(this._ref) {
    _ref.listen<AuthState>(
      authControllerProvider,
      (previous, next) {
        if (previous?.status != next.status) {
          notifyListeners();
        }
      },
    );
  }
}

final routerNotifierProvider = Provider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

final goRouterProvider = Provider<GoRouter>((ref) {
  final routerNotifier = ref.watch(routerNotifierProvider);
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/profile',
    refreshListenable: routerNotifier,
    redirect: (BuildContext context, GoRouterState state) {
      final bool isAuthenticated = authState.status == AuthStatus.authenticated;
      final bool isAuthChecking =
          authState.status == AuthStatus.initial || authState.status == AuthStatus.loading;
      final String currentLocation = state.matchedLocation;

      final bool isGoingToLogin = currentLocation == '/login';
      final bool isGoingToRegister = currentLocation == '/register';

      if (isAuthChecking) {
        return null;
      }

      if (!isAuthenticated) {
        if (isGoingToLogin || isGoingToRegister) {
          return null;
        }
        return '/login';
      }

      if (isGoingToLogin || isGoingToRegister) {
        return '/profile';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => LoginScreen(
          onNavigateToRegister: () => context.go('/register'),
          onLoginSuccess: () => context.go('/profile'),
        ),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => RegisterScreen(
          onNavigateToLogin: () => context.go('/login'),
          onRegisterSuccess: () => context.go('/profile'),
        ),
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => ProfileScreen(
          onNavigateToMyListings: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Ilanlar modulu bir sonraki adimda eklenecektir.'),
              ),
            );
          },
          onNavigateToCreateListing: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Ilan ekleme ekrani bir sonraki adimda eklenecektir.'),
              ),
            );
          },
          onLogoutCompleted: () => context.go('/login'),
        ),
      ),
    ],
  );
});
