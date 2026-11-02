import 'package:equatable/equatable.dart';
import '../../../core/database/database.dart';
import '../../../core/repository.dart';

abstract class CartEvent extends Equatable {
  const CartEvent();

  @override
  List<Object?> get props => [];
}

class AddProductEvent extends CartEvent {
  final Product product;

  const AddProductEvent(this.product);

  @override
  List<Object?> get props => [product];
}

class RemoveProductEvent extends CartEvent {
  final Product product;

  const RemoveProductEvent(this.product);

  @override
  List<Object?> get props => [product];
}

class UpdateQtyEvent extends CartEvent {
  final Product product;
  final int qty;

  const UpdateQtyEvent(this.product, this.qty);

  @override
  List<Object?> get props => [product, qty];
}

class SetGlobalDiscountEvent extends CartEvent {
  final double discount;

  const SetGlobalDiscountEvent(this.discount);

  @override
  List<Object?> get props => [discount];
}

class SetItemDiscountEvent extends CartEvent {
  final Product product;
  final double discount;

  const SetItemDiscountEvent(this.product, this.discount);

  @override
  List<Object?> get props => [product, discount];
}

class ClearCartEvent extends CartEvent {}

class HoldCurrentCartEvent extends CartEvent {
  final TransactionRepository repository;
  final String sessionId;

  const HoldCurrentCartEvent({required this.repository, required this.sessionId});

  @override
  List<Object?> get props => [repository, sessionId];
}

class ResumeCartEvent extends CartEvent {
  final TransactionRepository repository;
  final String transactionId;

  const ResumeCartEvent({required this.repository, required this.transactionId});

  @override
  List<Object?> get props => [repository, transactionId];
}

class CheckoutCashEvent extends CartEvent {
  final TransactionRepository repository;
  final String sessionId;
  final double cashPaid;

  const CheckoutCashEvent({
    required this.repository,
    required this.sessionId,
    required this.cashPaid,
  });

  @override
  List<Object?> get props => [repository, sessionId, cashPaid];
}
