import 'package:drift/drift.dart';
import 'database.dart';
import '../repository.dart';

class LocalSessionRepository implements SessionRepository {
  final AppDatabase _db;

  LocalSessionRepository(this._db);

  @override
  Future<PosSession?> getActiveSession() {
    return (_db.select(_db.posSessions)..where((tbl) => tbl.closedAt.isNull()))
        .getSingleOrNull();
  }

  @override
  Future<void> openSession(PosSession session) {
    return _db.into(_db.posSessions).insertOnConflictUpdate(session);
  }

  @override
  Future<void> closeSession(String id, double closingCash) async {
    final session = await (_db.select(_db.posSessions)
          ..where((tbl) => tbl.id.equals(id)))
        .getSingleOrNull();
    if (session != null) {
      await _db.into(_db.posSessions).insertOnConflictUpdate(
            session.copyWith(
              closedAt: Value(DateTime.now()),
              closingCash: Value(closingCash),
            ),
          );
    }
  }
}
