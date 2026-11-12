import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ciftci_mobil/core/theme/app_colors.dart';
import 'package:ciftci_mobil/features/auth/data/models/user_model.dart';
import 'package:ciftci_mobil/features/auth/presentation/providers/auth_provider.dart';
import 'package:ciftci_mobil/features/auth/presentation/widgets/profile_stat_card.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  final VoidCallback onNavigateToMyListings;
  final VoidCallback onNavigateToCreateListing;
  final VoidCallback onLogoutCompleted;

  const ProfileScreen({
    super.key,
    required this.onNavigateToMyListings,
    required this.onNavigateToCreateListing,
    required this.onLogoutCompleted,
  });

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  int _totalCount = 0;
  int _activeCount = 0;
  int _soldCount = 0;
  int _passiveCount = 0;
  bool _isLoadingStats = true;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    final UserModel? user = ref.read(authControllerProvider).user;
    if (user == null) {
      if (mounted) {
        setState(() {
          _isLoadingStats = false;
        });
      }
      return;
    }

    try {
      final dioClient = ref.read(dioClientProvider);
      final response = await dioClient.get(
        '/listings',
        queryParameters: {
          'userId': user.id,
          'status': 'all',
          'limit': 100,
        },
      );

      final dynamic body = response.data;
      if (body is Map<String, dynamic> && body['data'] is List) {
        final List<dynamic> items = body['data'] as List<dynamic>;

        int total = items.length;
        int active = 0;
        int sold = 0;
        int passive = 0;

        for (final item in items) {
          if (item is Map<String, dynamic>) {
            final String status = (item['status'] ?? '').toString();
            if (status == 'active') {
              active++;
            } else if (status == 'sold') {
              sold++;
            } else if (status == 'passive') {
              passive++;
            }
          }
        }

        if (mounted) {
          setState(() {
            _totalCount = total;
            _activeCount = active;
            _soldCount = sold;
            _passiveCount = passive;
            _isLoadingStats = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoadingStats = false;
        });
      }
    }
  }

  Future<void> _onRefresh() async {
    await Future.wait<void>([
      ref.read(authControllerProvider.notifier).refreshProfile(),
      _fetchStats(),
    ]);
  }

  Future<void> _confirmLogout() async {
    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text(
            'Oturumu Kapat',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
          ),
          content: const Text(
            'Hesabinizdan cikis yapmak istediginize emin misiniz?',
            style: TextStyle(fontSize: 14),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text(
                'Vazgec',
                style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Cikis Yap'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      await ref.read(authControllerProvider.notifier).logout();
      widget.onLogoutCompleted();
    }
  }

  @override
  Widget build(BuildContext context) {
    final AuthState authState = ref.watch(authControllerProvider);
    final UserModel? user = authState.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Profilim'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Cikis Yap',
            onPressed: _confirmLogout,
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.cherry800,
        backgroundColor: AppColors.surface,
        onRefresh: _onRefresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border, width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.textPrimary.withValues(alpha: 0.03),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: AppColors.cherry50,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.cherry200),
                      ),
                      child: const Icon(
                        Icons.person_rounded,
                        size: 36,
                        color: AppColors.cherry800,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.fullName ?? 'Kullanici',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.3,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.mail_outline_rounded, size: 14, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  user?.email ?? '',
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          if (user?.phone != null && user!.phone!.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                const Icon(Icons.phone_outlined, size: 14, color: AppColors.textSecondary),
                                const SizedBox(width: 4),
                                Text(
                                  user.phone!,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Ilan Istatistikleri',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              _isLoadingStats
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child: CircularProgressIndicator(color: AppColors.cherry800),
                      ),
                    )
                  : GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      childAspectRatio: 1.6,
                      children: [
                        ProfileStatCard(
                          label: 'Toplam Ilan',
                          value: _totalCount.toString(),
                          accentColor: AppColors.primary,
                          icon: Icons.format_list_bulleted_rounded,
                        ),
                        ProfileStatCard(
                          label: 'Aktif Ilan',
                          value: _activeCount.toString(),
                          accentColor: AppColors.statusActive,
                          icon: Icons.check_circle_outline_rounded,
                        ),
                        ProfileStatCard(
                          label: 'Satilan',
                          value: _soldCount.toString(),
                          accentColor: AppColors.statusSold,
                          icon: Icons.monetization_on_outlined,
                        ),
                        ProfileStatCard(
                          label: 'Pasif',
                          value: _passiveCount.toString(),
                          accentColor: AppColors.statusPassive,
                          icon: Icons.pause_circle_outline_rounded,
                        ),
                      ],
                    ),
              const SizedBox(height: 24),
              const Text(
                'Hesap Islemleri',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              ListTile(
                onTap: widget.onNavigateToMyListings,
                tileColor: AppColors.surface,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                  side: const BorderSide(color: AppColors.border),
                ),
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.cherry50,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.list_alt_rounded, color: AppColors.cherry800, size: 20),
                ),
                title: const Text(
                  'Ilanlarimi Yonet',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                ),
                trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              ListTile(
                onTap: widget.onNavigateToCreateListing,
                tileColor: AppColors.surface,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                  side: const BorderSide(color: AppColors.border),
                ),
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.cherry50,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.add_circle_outline_rounded, color: AppColors.cherry800, size: 20),
                ),
                title: const Text(
                  'Yeni Ilan Olustur',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                ),
                trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
              ),
              const SizedBox(height: 24),
              OutlinedButton.icon(
                onPressed: _confirmLogout,
                icon: const Icon(Icons.logout_rounded, color: AppColors.error, size: 18),
                label: const Text(
                  'Oturumu Kapat',
                  style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFFFECACA), width: 1.5),
                  backgroundColor: const Color(0xFFFEF2F2),
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
