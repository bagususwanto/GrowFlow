import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'database.g.dart';

// -------------------------------------------------------------
// 1. Core Master Data Tables
// -------------------------------------------------------------

class Categories extends Table {
  TextColumn get id => text()();
  TextColumn get name => text().withLength(min: 1, max: 255)();
  TextColumn get description => text().nullable()();
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();

  @override
  Set<Column> get primaryKey => {id};
}

class Products extends Table {
  TextColumn get id => text()();
  TextColumn get code => text().withLength(min: 1, max: 50)();
  TextColumn get name => text().withLength(min: 1, max: 255)();
  TextColumn get unit => text().withLength(min: 1, max: 50)();
  TextColumn get categoryId => text().nullable().references(Categories, #id)();
  IntColumn get stock => integer().withDefault(const Constant(0))();
  RealColumn get price => real().withDefault(const Constant(0.0))();
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();

  @override
  Set<Column> get primaryKey => {id};
}

// -------------------------------------------------------------
// 2. POS Operations Tables
// -------------------------------------------------------------

class PosUsers extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get email => text()();
  TextColumn get role => text()(); // e.g. cashier, manager
  TextColumn get token => text().nullable()(); // Saved session token for connected mode

  @override
  Set<Column> get primaryKey => {id};
}

class PosSessions extends Table {
  TextColumn get id => text()();
  TextColumn get warehouseId => text()();
  TextColumn get cashierId => text().references(PosUsers, #id)();
  DateTimeColumn get openedAt => dateTime()();
  DateTimeColumn get closedAt => dateTime().nullable()();
  RealColumn get openingCash => real().nullable()();
  RealColumn get closingCash => real().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class Transactions extends Table {
  TextColumn get id => text()(); // localId UUID
  TextColumn get sessionId => text().nullable().references(PosSessions, #id)();
  TextColumn get salesOrderId => text().nullable()(); // Linked ERP SO
  TextColumn get salesInvoiceId => text().nullable()(); // Linked ERP Invoice
  RealColumn get totalAmount => real()();
  RealColumn get discountAmount => real().withDefault(const Constant(0.0))();
  TextColumn get status => text()(); // ACTIVE, HELD, COMPLETED, VOIDED, REFUNDED, SYNC_CONFLICT
  DateTimeColumn get transactedAt => dateTime()();
  DateTimeColumn get syncedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class TransactionItems extends Table {
  TextColumn get id => text()();
  TextColumn get transactionId => text().references(Transactions, #id)();
  TextColumn get productId => text().references(Products, #id)();
  IntColumn get qty => integer()();
  RealColumn get unitPrice => real()();
  RealColumn get discount => real().withDefault(const Constant(0.0))();
  RealColumn get totalPrice => real()();

  @override
  Set<Column> get primaryKey => {id};
}

class Payments extends Table {
  TextColumn get id => text()();
  TextColumn get transactionId => text().references(Transactions, #id)();
  TextColumn get method => text()(); // CASH, QRIS, CARD, EWALLET
  RealColumn get amount => real()();
  DateTimeColumn get paidAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

// -------------------------------------------------------------
// 3. Refund & Return Tables
// -------------------------------------------------------------

class Refunds extends Table {
  TextColumn get id => text()(); // localId UUID
  TextColumn get transactionId => text().references(Transactions, #id)();
  TextColumn get reason => text().nullable()();
  RealColumn get totalRefund => real()();
  DateTimeColumn get refundedAt => dateTime()();
  DateTimeColumn get syncedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class RefundItems extends Table {
  TextColumn get id => text()();
  TextColumn get refundId => text().references(Refunds, #id)();
  TextColumn get productId => text().references(Products, #id)();
  IntColumn get qty => integer()();
  RealColumn get unitPrice => real()();
  RealColumn get totalPrice => real()();

  @override
  Set<Column> get primaryKey => {id};
}

// -------------------------------------------------------------
// 4. Synchronization Queue
// -------------------------------------------------------------

class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get endpoint => text()(); // e.g. /pos/transactions
  TextColumn get method => text()(); // POST, PATCH, etc.
  TextColumn get payload => text()(); // JSON string
  DateTimeColumn get createdAt => dateTime()();
  IntColumn get attempts => integer().withDefault(const Constant(0))();
  TextColumn get lastError => text().nullable()();
}

// -------------------------------------------------------------
// 5. Database Class & Connection Setup
// -------------------------------------------------------------

@DriftDatabase(tables: [
  Categories,
  Products,
  PosUsers,
  PosSessions,
  Transactions,
  TransactionItems,
  Payments,
  Refunds,
  RefundItems,
  SyncQueue,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'growflow_pos.sqlite'));
    return NativeDatabase(file);
  });
}
