import 'database.dart';
import '../repository.dart';

class LocalProductRepository implements ProductRepository {
  final AppDatabase _db;

  LocalProductRepository(this._db);

  @override
  Future<List<Product>> getProducts() {
    return _db.select(_db.products).get();
  }

  @override
  Future<Product?> getProductById(String id) {
    return (_db.select(_db.products)..where((tbl) => tbl.id.equals(id)))
        .getSingleOrNull();
  }

  @override
  Future<Product?> getProductByCode(String code) {
    return (_db.select(_db.products)..where((tbl) => tbl.code.equals(code)))
        .getSingleOrNull();
  }

  @override
  Future<void> saveProduct(Product product) {
    return _db.into(_db.products).insertOnConflictUpdate(product);
  }

  @override
  Future<void> deleteProduct(String id) {
    return (_db.delete(_db.products)..where((tbl) => tbl.id.equals(id))).go();
  }
}
