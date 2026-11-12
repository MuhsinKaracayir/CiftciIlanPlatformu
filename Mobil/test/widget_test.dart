import 'package:flutter_test/flutter_test.dart';
import 'package:ciftci_mobil/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CiftciMobilApp());
    expect(find.byType(CiftciMobilApp), findsOneWidget);
  });
}
