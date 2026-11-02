import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';

import 'core/database/database.dart';
import 'core/database/local_product_repository.dart';
import 'core/database/local_transaction_repository.dart';
import 'core/database/local_session_repository.dart';
import 'features/pos/cart/cart_bloc.dart';
import 'features/pos/pos_screen.dart';
import 'features/pos/products/products_bloc.dart';
import 'shared/utils/seeder.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Initialize SQLite Database
  final database = AppDatabase();

  // 2. Instantiate Local Repositories
  final productRepository = LocalProductRepository(database);
  final transactionRepository = LocalTransactionRepository(database);
  final sessionRepository = LocalSessionRepository(database);

  // 3. Seed dummy products & categories if DB is empty
  await DatabaseSeeder.seedIfNeeded(productRepository: productRepository);

  // 4. Buka session kasir jika belum ada yang aktif (karena session opsional tapi model merujuk padanya)
  final activeSession = await sessionRepository.getActiveSession();
  String sessionId;
  
  if (activeSession == null) {
    sessionId = const Uuid().v4();
    
    // Seed a mock local user first
    final mockUser = PosUser(
      id: 'cashier-1',
      name: 'Budi',
      email: 'budi@growflow.com',
      role: 'cashier',
    );
    await database.into(database.posUsers).insertOnConflictUpdate(mockUser);

    final newSession = PosSession(
      id: sessionId,
      warehouseId: 'wh-main',
      cashierId: 'cashier-1',
      openedAt: DateTime.now(),
    );
    await sessionRepository.openSession(newSession);
  } else {
    sessionId = activeSession.id;
  }

  runApp(MyApp(
    productRepository: productRepository,
    transactionRepository: transactionRepository,
    activeSessionId: sessionId,
  ));
}

class MyApp extends StatelessWidget {
  final LocalProductRepository productRepository;
  final LocalTransactionRepository transactionRepository;
  final String activeSessionId;

  const MyApp({
    super.key,
    required this.productRepository,
    required this.transactionRepository,
    required this.activeSessionId,
  });

  @override
  Widget build(BuildContext context) {
    // 5. Setup GoRouter basic route pointing to POS screen
    final router = GoRouter(
      initialLocation: '/pos',
      routes: [
        GoRoute(
          path: '/pos',
          builder: (context, state) => PosScreen(
            productRepository: productRepository,
            transactionRepository: transactionRepository,
            activeSessionId: activeSessionId,
          ),
        ),
      ],
    );

    return MultiBlocProvider(
      providers: [
        BlocProvider<ProductsBloc>(
          create: (context) => ProductsBloc(productRepository),
        ),
        BlocProvider<CartBloc>(
          create: (context) => CartBloc(productRepository),
        ),
      ],
      child: MaterialApp.router(
        title: 'GrowFlow POS',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.blue,
            primary: Colors.blue[700],
          ),
          useMaterial3: true,
        ),
        routerConfig: router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
