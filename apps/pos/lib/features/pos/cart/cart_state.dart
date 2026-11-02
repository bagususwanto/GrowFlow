import 'package:equatable/equatable.dart';
import '../../../core/database/database.dart';

class CartItem extends Equatable {
  final Product product;
  final int quantity;
  final double discount; // discount per item

  const CartItem({
    required this.product,
    required this.quantity,
    this.discount = 0.0,
  });

  double get unitPrice => product.price;
  double get totalPrice => (unitPrice - discount) * quantity;

  CartItem copyWith({
    Product? product,
    int? quantity,
    double? discount,
  }) {
    return CartItem(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      discount: discount ?? this.discount,
    );
  }

  @override
  List<Object?> get props => [product, quantity, discount];
}

class CartState extends Equatable {
  final List<CartItem> items;
  final double globalDiscount; // global discount on overall cart
  final String? activeTransactionId;

  const CartState({
    this.items = const [],
    this.globalDiscount = 0.0,
    this.activeTransactionId,
  });

  double get subtotal => items.fold(0.0, (sum, item) => sum + item.totalPrice);
  double get total => (subtotal - globalDiscount) < 0 ? 0.0 : (subtotal - globalDiscount);

  CartState copyWith({
    List<CartItem>? items,
    double? globalDiscount,
    String? activeTransactionId,
  }) {
    return CartState(
      items: items ?? this.items,
      globalDiscount: globalDiscount ?? this.globalDiscount,
      activeTransactionId: activeTransactionId ?? this.activeTransactionId,
    );
  }

  @override
  List<Object?> get props => [items, globalDiscount, activeTransactionId];
}
