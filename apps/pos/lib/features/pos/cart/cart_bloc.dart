import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';
import '../../../core/database/database.dart';
import '../../../core/repository.dart';
import 'cart_event.dart';
import 'cart_state.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  final ProductRepository _productRepository;
  final Uuid _uuid = const Uuid();

  CartBloc(this._productRepository) : super(const CartState()) {
    on<AddProductEvent>(_onAddProduct);
    on<RemoveProductEvent>(_onRemoveProduct);
    on<UpdateQtyEvent>(_onUpdateQty);
    on<SetGlobalDiscountEvent>(_onSetGlobalDiscount);
    on<SetItemDiscountEvent>(_onSetItemDiscount);
    on<ClearCartEvent>(_onClearCart);
    on<HoldCurrentCartEvent>(_onHoldCart);
    on<ResumeCartEvent>(_onResumeCart);
    on<CheckoutCashEvent>(_onCheckoutCash);
  }

  void _onAddProduct(AddProductEvent event, Emitter<CartState> emit) {
    final existingIndex = state.items.indexWhere((item) => item.product.id == event.product.id);
    List<CartItem> updatedItems;

    if (existingIndex >= 0) {
      final existingItem = state.items[existingIndex];
      updatedItems = List<CartItem>.from(state.items)
        ..[existingIndex] = existingItem.copyWith(quantity: existingItem.quantity + 1);
    } else {
      updatedItems = List<CartItem>.from(state.items)..add(CartItem(product: event.product, quantity: 1));
    }

    emit(state.copyWith(items: updatedItems));
  }

  void _onRemoveProduct(RemoveProductEvent event, Emitter<CartState> emit) {
    final updatedItems = state.items.where((item) => item.product.id != event.product.id).toList();
    emit(state.copyWith(items: updatedItems));
  }

  void _onUpdateQty(UpdateQtyEvent event, Emitter<CartState> emit) {
    if (event.qty <= 0) {
      add(RemoveProductEvent(event.product));
      return;
    }

    final index = state.items.indexWhere((item) => item.product.id == event.product.id);
    if (index >= 0) {
      final updatedItems = List<CartItem>.from(state.items)
        ..[index] = state.items[index].copyWith(quantity: event.qty);
      emit(state.copyWith(items: updatedItems));
    }
  }

  void _onSetGlobalDiscount(SetGlobalDiscountEvent event, Emitter<CartState> emit) {
    emit(state.copyWith(globalDiscount: event.discount));
  }

  void _onSetItemDiscount(SetItemDiscountEvent event, Emitter<CartState> emit) {
    final index = state.items.indexWhere((item) => item.product.id == event.product.id);
    if (index >= 0) {
      final updatedItems = List<CartItem>.from(state.items)
        ..[index] = state.items[index].copyWith(discount: event.discount);
      emit(state.copyWith(items: updatedItems));
    }
  }

  void _onClearCart(ClearCartEvent event, Emitter<CartState> emit) {
    emit(const CartState());
  }

  Future<void> _onHoldCart(HoldCurrentCartEvent event, Emitter<CartState> emit) async {
    if (state.items.isEmpty) return;

    final txId = state.activeTransactionId ?? _uuid.v4();
    final transaction = Transaction(
      id: txId,
      sessionId: event.sessionId,
      totalAmount: state.total,
      discountAmount: state.globalDiscount,
      status: 'HELD',
      transactedAt: DateTime.now(),
    );

    final items = state.items.map((item) => TransactionItem(
      id: _uuid.v4(),
      transactionId: txId,
      productId: item.product.id,
      qty: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      totalPrice: item.totalPrice,
    )).toList();

    await event.repository.saveTransaction(
      transaction: transaction,
      items: items,
      payments: const [],
    );

    emit(const CartState());
  }

  Future<void> _onResumeCart(ResumeCartEvent event, Emitter<CartState> emit) async {
    final transaction = await event.repository.getTransactionById(event.transactionId);
    if (transaction == null) return;

    final dbItems = await event.repository.getTransactionItems(event.transactionId);
    final List<CartItem> cartItems = [];

    for (final dbItem in dbItems) {
      final product = await _productRepository.getProductById(dbItem.productId);
      if (product != null) {
        cartItems.add(CartItem(
          product: product,
          quantity: dbItem.qty,
          discount: dbItem.discount,
        ));
      }
    }

    emit(CartState(
      items: cartItems,
      globalDiscount: transaction.discountAmount,
      activeTransactionId: transaction.id,
    ));
  }

  Future<void> _onCheckoutCash(CheckoutCashEvent event, Emitter<CartState> emit) async {
    if (state.items.isEmpty) return;

    final txId = state.activeTransactionId ?? _uuid.v4();
    final transaction = Transaction(
      id: txId,
      sessionId: event.sessionId,
      totalAmount: state.total,
      discountAmount: state.globalDiscount,
      status: 'COMPLETED',
      transactedAt: DateTime.now(),
    );

    final items = state.items.map((item) => TransactionItem(
      id: _uuid.v4(),
      transactionId: txId,
      productId: item.product.id,
      qty: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      totalPrice: item.totalPrice,
    )).toList();

    final payments = [
      Payment(
        id: _uuid.v4(),
        transactionId: txId,
        method: 'CASH',
        amount: event.cashPaid,
        paidAt: DateTime.now(),
      )
    ];

    await event.repository.saveTransaction(
      transaction: transaction,
      items: items,
      payments: payments,
    );

    emit(const CartState());
  }
}
