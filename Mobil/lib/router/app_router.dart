import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ciftci_mobil/features/auth/presentation/providers/auth_provider.dart';
import 'package:ciftci_mobil/features/auth/presentation/screens/login_screen.dart';
import 'package:ciftci_mobil/features/auth/presentation/screens/profile_screen.dart';
import 'package:ciftci_mobil/features/auth/presentation/screens/register_screen.dart';
import 'package:ciftci_mobil/features/listings/data/models/listing_model.dart';
import 'package:ciftci_mobil/features/listings/presentation/screens/create_listing_screen.dart';
import 'package:ciftci_mobil/features/listings/presentation/screens/home_screen.dart';
import 'package:ciftci_mobil/features/listings/presentation/screens/listing_detail_screen.dart';
import 'package:ciftci_mobil/features/listings/presentation/screens/my_listings_screen.dart';

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

final Provider<RouterNotifier> routerNotifierProvider = Provider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

final Provider<GoRouter> goRouterProvider = Provider<GoRouter>((ref) {
  final routerNotifier = ref.watch(routerNotifierProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: routerNotifier,
    redirect: (BuildContext context, GoRouterState state) {
      final authState = ref.read(authControllerProvider);
      final bool isAuthenticated = authState.status == AuthStatus.authenticated;
      final bool isAuthChecking =
          authState.status == AuthStatus.initial || authState.status == AuthStatus.loading;
      final String currentLocation = state.matchedLocation;

      final bool isGoingToLogin = currentLocation == '/login';
      final bool isGoingToRegister = currentLocation == '/register';
      final bool isGoingToProfile = currentLocation == '/profile';
      final bool isGoingToCreateListing = currentLocation == '/create-listing';
      final bool isGoingToMyListings = currentLocation == '/my-listings';

      if (isAuthChecking) {
        return null;
      }

      if (!isAuthenticated && (isGoingToProfile || isGoingToCreateListing || isGoingToMyListings)) {
        return '/login';
      }

      if (isAuthenticated && (isGoingToLogin || isGoingToRegister)) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => HomeScreen(
          onNavigateToProfile: () {
            context.push('/profile');
          },
          onNavigateToCreateListing: () {
            context.push('/create-listing');
          },
        ),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => LoginScreen(
          onNavigateToRegister: () => context.go('/register'),
          onLoginSuccess: () => context.go('/'),
        ),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => RegisterScreen(
          onNavigateToLogin: () => context.go('/login'),
          onRegisterSuccess: () => context.go('/'),
        ),
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => ProfileScreen(
          onNavigateToMyListings: () {
            context.push('/my-listings');
          },
          onNavigateToCreateListing: () {
            context.push('/create-listing');
          },
          onLogoutCompleted: () => context.go('/'),
        ),
      ),
      GoRoute(
        path: '/my-listings',
        name: 'my_listings',
        builder: (context, state) => const MyListingsScreen(),
      ),
      GoRoute(
        path: '/create-listing',
        name: 'create_listing',
        builder: (context, state) => const CreateListingScreen(),
      ),
      GoRoute(
        path: '/listings/:id',
        name: 'listing_detail',
        builder: (context, state) {
          final idString = state.pathParameters['id'] ?? '0';
          final int id = int.tryParse(idString) ?? 0;
          final listing = state.extra is ListingModel ? state.extra as ListingModel : null;
          return ListingDetailScreen(
            listingId: id,
            initialListing: listing,
          );
        },
      ),
    ],
  );
});
