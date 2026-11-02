import 'package:uuid/uuid.dart';
import '../../../core/database/database.dart';
import '../../../core/repository.dart';

class DatabaseSeeder {
  static Future<void> seedIfNeeded({
    required ProductRepository productRepository,
  }) async {
    final categories = await productRepository.getCategories();
    if (categories.isNotEmpty) return; // Already seeded

    final uuid = const Uuid();

    // 1. Seed Categories
    final catFood = Category(id: uuid.v4(), name: 'Makanan', isActive: true);
    final catBeverage = Category(id: uuid.v4(), name: 'Minuman', isActive: true);
    final catSnack = Category(id: uuid.v4(), name: 'Camilan', isActive: true);

    await productRepository.saveCategory(catFood);
    await productRepository.saveCategory(catBeverage);
    await productRepository.saveCategory(catSnack);

    // 2. Seed Products
    final products = [
      Product(
        id: uuid.v4(),
        code: 'FD001',
        name: 'Nasi Goreng Spesial',
        unit: 'Porsi',
        categoryId: catFood.id,
        stock: 50,
        price: 25000,
        isActive: true,
      ),
      Product(
        id: uuid.v4(),
        code: 'FD002',
        name: 'Mie Goreng Jawa',
        unit: 'Porsi',
        categoryId: catFood.id,
        stock: 30,
        price: 22000,
        isActive: true,
      ),
      Product(
        id: uuid.v4(),
        code: 'FD003',
        name: 'Ayam Goreng Penyet',
        unit: 'Porsi',
        categoryId: catFood.id,
        stock: 40,
        price: 28000,
        isActive: true,
      ),
      Product(
        id: uuid.v4(),
        code: 'BV001',
        name: 'Es Teh Manis',
        unit: 'Gelas',
        categoryId: catBeverage.id,
        stock: 100,
        price: 5000,
        isActive: true,
      ),
      Product(
        id: uuid.v4(),
        code: 'BV002',
        name: 'Jus Alpukat',
        unit: 'Gelas',
        categoryId: catBeverage.id,
        stock: 20,
        price: 12000,
        isActive: true,
      ),
      Product(
        id: uuid.v4(),
        code: 'BV003',
        name: 'Kopi Susu Gula Aren',
        unit: 'Cup',
        categoryId: catBeverage.id,
        stock: 45,
        price: 15000,
        isActive: true,
      ),
      Product(
        id: uuid.v4(),
        code: 'SN001',
        name: 'Kentang Goreng',
        unit: 'Porsi',
        categoryId: catSnack.id,
        stock: 25,
        price: 15000,
        isActive: true,
      ),
      Product(
        id: uuid.v4(),
        code: 'SN002',
        name: 'Roti Bakar Cokelat',
        unit: 'Porsi',
        categoryId: catSnack.id,
        stock: 15,
        price: 18000,
        isActive: true,
      ),
    ];

    for (final product in products) {
      await productRepository.saveProduct(product);
    }
  }
}
