import 'package:flutter/material.dart';
import 'package:ciftci_mobil/core/theme/app_colors.dart';

enum ListingStatus {
  active('active', 'Aktif', AppColors.statusActive),
  sold('sold', 'Satıldı', AppColors.statusSold),
  passive('passive', 'Pasif', AppColors.statusPassive);

  final String value;
  final String label;
  final Color color;

  const ListingStatus(this.value, this.label, this.color);

  static ListingStatus fromString(String? value) {
    if (value == null) return ListingStatus.active;
    return ListingStatus.values.firstWhere(
      (s) => s.value.toLowerCase() == value.toLowerCase(),
      orElse: () => ListingStatus.active,
    );
  }
}

enum ListingCategory {
  tarimUrunleri('Tarım Ürünleri', Icons.eco_rounded),
  hayvancilik('Hayvancılık', Icons.pets_rounded),
  traktorEkipman('Traktör & Ekipman', Icons.agriculture_rounded),
  tohumFidan('Tohum & Fidan', Icons.yard_rounded),
  yemGubre('Yem & Gübre', Icons.inventory_2_rounded),
  bahceSera('Bahçe & Sera', Icons.grass_rounded),
  diger('Diğer', Icons.category_rounded);

  final String label;
  final IconData icon;

  const ListingCategory(this.label, this.icon);

  static ListingCategory fromString(String? value) {
    if (value == null) return ListingCategory.diger;
    return ListingCategory.values.firstWhere(
      (c) => c.label.toLowerCase() == value.toLowerCase() || c.name.toLowerCase() == value.toLowerCase(),
      orElse: () => ListingCategory.diger,
    );
  }

  static List<String> get allLabels => values.map((c) => c.label).toList();
}
