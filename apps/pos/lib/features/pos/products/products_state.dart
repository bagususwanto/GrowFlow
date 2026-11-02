import 'package:equatable/equatable.dart';
import '../../../core/database/database.dart';

enum ProductsStatus { initial, loading, success, failure }

class ProductsState extends Equatable {
  final ProductsStatus status;
  final List<Product> products;
  final List<Category> categories;
  final String? selectedCategoryId;
  final String searchQuery;
  final String? errorMessage;

  const ProductsState({
    this.status = ProductsStatus.initial,
    this.products = const [],
    this.categories = const [],
    this.selectedCategoryId,
    this.searchQuery = '',
    this.errorMessage,
  });

  List<Product> get filteredProducts {
    return products.where((product) {
      final matchesCategory = selectedCategoryId == null || product.categoryId == selectedCategoryId;
      final matchesSearch = product.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          product.code.toLowerCase().contains(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  ProductsState copyWith({
    ProductsStatus? status,
    List<Product>? products,
    List<Category>? categories,
    String? Function()? selectedCategoryId,
    String? searchQuery,
    String? errorMessage,
  }) {
    return ProductsState(
      status: status ?? this.status,
      products: products ?? this.products,
      categories: categories ?? this.categories,
      selectedCategoryId: selectedCategoryId != null ? selectedCategoryId() : this.selectedCategoryId,
      searchQuery: searchQuery ?? this.searchQuery,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        products,
        categories,
        selectedCategoryId,
        searchQuery,
        errorMessage,
      ];
}
