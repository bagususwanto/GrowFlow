import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/repository.dart';
import 'products_event.dart';
import 'products_state.dart';

class ProductsBloc extends Bloc<ProductsEvent, ProductsState> {
  final ProductRepository _productRepository;

  ProductsBloc(this._productRepository) : super(const ProductsState()) {
    on<LoadProductsEvent>(_onLoadProducts);
    on<SelectCategoryEvent>(_onSelectCategory);
    on<SearchProductsEvent>(_onSearchProducts);
  }

  Future<void> _onLoadProducts(LoadProductsEvent event, Emitter<ProductsState> emit) async {
    emit(state.copyWith(status: ProductsStatus.loading));
    try {
      final products = await _productRepository.getProducts();
      final categories = await _productRepository.getCategories();
      emit(state.copyWith(
        status: ProductsStatus.success,
        products: products,
        categories: categories,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: ProductsStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  void _onSelectCategory(SelectCategoryEvent event, Emitter<ProductsState> emit) {
    emit(state.copyWith(
      selectedCategoryId: () => event.categoryId,
    ));
  }

  void _onSearchProducts(SearchProductsEvent event, Emitter<ProductsState> emit) {
    emit(state.copyWith(
      searchQuery: event.query,
    ));
  }
}
