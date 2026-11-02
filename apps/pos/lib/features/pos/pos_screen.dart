import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/repository.dart';
import 'cart/cart_bloc.dart';
import 'cart/cart_widget.dart';
import 'products/product_grid.dart';
import 'products/products_bloc.dart';
import 'products/products_event.dart';
import 'products/products_state.dart';

class PosScreen extends StatefulWidget {
  final ProductRepository productRepository;
  final TransactionRepository transactionRepository;
  final String activeSessionId;

  const PosScreen({
    super.key,
    required this.productRepository,
    required this.transactionRepository,
    required this.activeSessionId,
  });

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Load products and categories from Local DB when screen starts
    context.read<ProductsBloc>().add(LoadProductsEvent());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        title: Row(
          children: [
            const Icon(Icons.storefront, color: Colors.blue, size: 28),
            const SizedBox(width: 8),
            const Text(
              'GrowFlow POS',
              style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 20),
            ),
            const SizedBox(width: 24),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                children: [
                  Icon(Icons.person_outline, size: 16, color: Colors.blue),
                  SizedBox(width: 4),
                  Text(
                    'Kasir: Budi (Standalone)',
                    style: TextStyle(color: Colors.blue, fontWeight: FontWeight.w600, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync, color: Colors.grey),
            onPressed: () {
              context.read<ProductsBloc>().add(LoadProductsEvent());
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.grey),
            onPressed: () {
              // Navigasi ke settings nantinya
            },
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Row(
        children: [
          // Left side: Catalog Area
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Search & Category Filters Bar
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                  child: Row(
                    children: [
                      // Search Input
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Cari nama produk atau scan barcode...',
                            prefixIcon: const Icon(Icons.search),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear),
                                    onPressed: () {
                                      _searchController.clear();
                                      context.read<ProductsBloc>().add(const SearchProductsEvent(''));
                                    },
                                  )
                                : null,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(color: Colors.grey[300]!),
                            ),
                            contentPadding: const EdgeInsets.symmetric(vertical: 0),
                          ),
                          onChanged: (query) {
                            context.read<ProductsBloc>().add(SearchProductsEvent(query));
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                // Category List chips
                _CategoryFilterBar(),
                const Divider(height: 1),
                // Product Grid View
                const Expanded(
                  child: ProductGrid(),
                ),
              ],
            ),
          ),
          // Right side: Checkout Cart Sidebar
          CartWidget(
            transactionRepository: widget.transactionRepository,
            activeSessionId: widget.activeSessionId,
          ),
        ],
      ),
    );
  }
}

class _CategoryFilterBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocBuilder<ProductsBloc, ProductsState>(
      builder: (context, state) {
        if (state.categories.isEmpty) return const SizedBox.shrink();

        return Container(
          height: 60,
          color: Colors.white,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            scrollDirection: Axis.horizontal,
            itemCount: state.categories.length + 1,
            itemBuilder: (context, index) {
              final isAll = index == 0;
              final category = isAll ? null : state.categories[index - 1];
              final isSelected = isAll
                  ? state.selectedCategoryId == null
                  : state.selectedCategoryId == category?.id;

              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: FilterChip(
                  label: Text(isAll ? 'Semua Kategori' : category!.name),
                  selected: isSelected,
                  onSelected: (selected) {
                    context
                        .read<ProductsBloc>()
                        .add(SelectCategoryEvent(isAll ? null : category!.id));
                  },
                  selectedColor: theme.colorScheme.primaryContainer,
                  labelStyle: TextStyle(
                    color: isSelected ? theme.colorScheme.primary : Colors.black87,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected ? theme.colorScheme.primary : Colors.grey[300]!,
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
