import 'package:drift/drift.dart';
import 'database.dart';
import '../repository.dart';

class LocalTransactionRepository implements TransactionRepository {
  final AppDatabase _db;

  LocalTransactionRepository(this._db);

  @override
  Future<List<Transaction>> getTransactions() {
    return _db.select(_db.transactions).get();
  }

  @override
  Future<Transaction?> getTransactionById(String id) {
    return (_db.select(_db.transactions)..where((tbl) => tbl.id.equals(id)))
        .getSingleOrNull();
  }

  @override
  Future<List<TransactionItem>> getTransactionItems(String transactionId) {
    return (_db.select(_db.transactionItems)
          ..where((tbl) => tbl.transactionId.equals(transactionId)))
        .get();
  }

  @override
  Future<List<Payment>> getTransactionPayments(String transactionId) {
    return (_db.select(_db.payments)
          ..where((tbl) => tbl.transactionId.equals(transactionId)))
        .get();
  }

  @override
  Future<void> saveTransaction({
    required Transaction transaction,
    required List<TransactionItem> items,
    required List<Payment> payments,
  }) async {
    await _db.transaction(() async {
      await _db.into(_db.transactions).insertOnConflictUpdate(transaction);
      
      // Update/insert items
      for (final item in items) {
        await _db.into(_db.transactionItems).insertOnConflictUpdate(item);
        
        // If completed transaction, decrement local stock in standalone mode
        if (transaction.status == 'COMPLETED') {
          final product = await (_db.select(_db.products)
                ..where((tbl) => tbl.id.equals(item.productId)))
              .getSingleOrNull();
          if (product != null) {
            final newStock = product.stock - item.qty;
            await _db.into(_db.products).insertOnConflictUpdate(
                  product.copyWith(stock: newStock),
                );
          }
        }
      }
      
      // Insert payments
      for (final payment in payments) {
        await _db.into(_db.payments).insertOnConflictUpdate(payment);
      }
    });
  }

  @override
  Future<void> holdTransaction(String id) async {
    final transaction = await getTransactionById(id);
    if (transaction != null) {
      await _db.into(_db.transactions).insertOnConflictUpdate(
            transaction.copyWith(status: 'HELD'),
          );
    }
  }

  @override
  Future<void> resumeTransaction(String id) async {
    final transaction = await getTransactionById(id);
    if (transaction != null) {
      await _db.into(_db.transactions).insertOnConflictUpdate(
            transaction.copyWith(status: 'ACTIVE'),
          );
    }
  }

  @override
  Future<void> refundTransaction({
    required Refund refund,
    required List<RefundItem> items,
  }) async {
    await _db.transaction(() async {
      // 1. Save refund header
      await _db.into(_db.refunds).insertOnConflictUpdate(refund);

      // 2. Process refund items & return stock
      for (final item in items) {
        await _db.into(_db.refundItems).insertOnConflictUpdate(item);

        // Standalone mode: increment product stock back
        final product = await (_db.select(_db.products)
              ..where((tbl) => tbl.id.equals(item.productId)))
            .getSingleOrNull();
        if (product != null) {
          final newStock = product.stock + item.qty;
          await _db.into(_db.products).insertOnConflictUpdate(
                product.copyWith(stock: newStock),
              );
        }
      }

      // 3. Update original transaction status
      final tx = await getTransactionById(refund.transactionId);
      if (tx != null) {
        await _db.into(_db.transactions).insertOnConflictUpdate(
              tx.copyWith(status: 'REFUNDED'),
            );
      }
    });
  }

  @override
  Future<void> voidTransaction(String id) async {
    final transaction = await getTransactionById(id);
    if (transaction != null) {
      await _db.into(_db.transactions).insertOnConflictUpdate(
            transaction.copyWith(status: 'VOIDED'),
          );
    }
  }
}
