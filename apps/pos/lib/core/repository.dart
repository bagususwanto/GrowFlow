import 'database/database.dart';

// Abstract contract for Product data operations.
// This allows swapping between Local (SQLite) and Remote (ERP API) implementations.
abstract class ProductRepository {
  Future<List<Product>> getProducts();
  Future<Product?> getProductById(String id);
  Future<Product?> getProductByCode(String code);
  Future<void> saveProduct(Product product);
  Future<void> deleteProduct(String id);
  
  Future<List<Category>> getCategories();
  Future<void> saveCategory(Category category);
}

// Abstract contract for Transaction and POS sales operations.
abstract class TransactionRepository {
  Future<List<Transaction>> getTransactions();
  Future<Transaction?> getTransactionById(String id);
  Future<List<TransactionItem>> getTransactionItems(String transactionId);
  Future<List<Payment>> getTransactionPayments(String transactionId);
  
  Future<void> saveTransaction({
    required Transaction transaction,
    required List<TransactionItem> items,
    required List<Payment> payments,
  });

  Future<void> holdTransaction(String id);
  Future<void> resumeTransaction(String id);
  Future<void> refundTransaction({
    required Refund refund,
    required List<RefundItem> items,
  });
  
  Future<void> voidTransaction(String id);
}

// Abstract contract for Session operations.
abstract class SessionRepository {
  Future<PosSession?> getActiveSession();
  Future<void> openSession(PosSession session);
  Future<void> closeSession(String id, double closingCash);
}
