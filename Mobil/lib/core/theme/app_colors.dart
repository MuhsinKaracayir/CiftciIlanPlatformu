import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Cherry Paleti (React Frontend tailwind.config.js dosyasindan birebir)
  static const Color cherry50 = Color(0xFFFFF1F2);
  static const Color cherry100 = Color(0xFFFFE4E6);
  static const Color cherry200 = Color(0xFFFECDD3);
  static const Color cherry300 = Color(0xFFFDA4AF);
  static const Color cherry400 = Color(0xFFFB7185);
  static const Color cherry500 = Color(0xFFF43F5E);
  static const Color cherry600 = Color(0xFFE11D48);
  static const Color cherry700 = Color(0xFFBE123C);
  static const Color cherry800 = Color(0xFF9F1239);
  static const Color cherry900 = Color(0xFF881337);
  static const Color cherry950 = Color(0xFF4C0519);

  // Ana Tema Renkleri
  static const Color primary = cherry900;
  static const Color primaryContainer = cherry50;
  static const Color secondary = cherry600;
  static const Color secondaryContainer = cherry100;

  // Yuzey ve Arka Plan (React Frontend index.css: #fafaf9)
  static const Color background = Color(0xFFFAFAF9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F4);
  static const Color border = Color(0xFFE7E5E4);

  // Metin Renkleri (Stone Paleti)
  static const Color textPrimary = Color(0xFF1C1917);
  static const Color textSecondary = Color(0xFF78716C);
  static const Color textMuted = Color(0xFFA8A29E);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Durum Renkleri (Frontend ListingCard.jsx durum rozetleri)
  static const Color statusActive = Color(0xFF059669);
  static const Color statusSold = Color(0xFFD97706);
  static const Color statusPassive = Color(0xFF64748B);

  // Geri Bildirim Renkleri
  static const Color success = Color(0xFF059669);
  static const Color warning = Color(0xFFD97706);
  static const Color error = Color(0xFFDC2626);
  static const Color info = Color(0xFF0284C7);
}

