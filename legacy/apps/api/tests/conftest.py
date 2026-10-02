"""
Shared pytest fixtures.

The single most important job here is keeping the suite HERMETIC. Without it
`app.services.firestore.get_db()` lazily constructs a real
`google.cloud.firestore.AsyncClient`, which demands Application Default
Credentials and a real GCP project. Any test that did not happen to patch the
service layer therefore either raised DefaultCredentialsError or, worse,
silently read and wrote production data.

`fake_firestore` swaps the client for an in-memory stand-in that implements the
subset of the async Firestore surface the app actually uses, so tests can run
anywhere with no credentials and no network.
"""

import itertools
from typing import Any, Optional

import pytest

from app.services import firestore as fs


# ---------------------------------------------------------------------------
# Minimal in-memory Firestore
# ---------------------------------------------------------------------------
class FakeSnapshot:
    def __init__(self, doc_id: str, data: Optional[dict]):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self) -> Optional[dict]:
        return None if self._data is None else dict(self._data)


class FakeDocument:
    def __init__(self, store: dict, doc_id: str):
        self._store = store
        self.id = doc_id

    async def get(self) -> FakeSnapshot:
        return FakeSnapshot(self.id, self._store.get(self.id))

    async def set(self, data: dict, **_kwargs):
        self._store[self.id] = dict(data)

    async def update(self, data: dict):
        self._store.setdefault(self.id, {}).update(data)

    async def delete(self):
        self._store.pop(self.id, None)


class FakeQuery:
    def __init__(self, store: dict, filters: Optional[list] = None):
        self._store = store
        self._filters = filters or []
        self._order: Optional[tuple[str, bool]] = None
        self._limit: Optional[int] = None

    def where(self, field, op, value):
        return FakeQuery(self._store, self._filters + [(field, op, value)])

    def order_by(self, field, direction="ASCENDING"):
        self._order = (field, str(direction).upper().startswith("DESC"))
        return self

    def limit(self, n):
        self._limit = n
        return self

    async def get(self) -> list[FakeSnapshot]:
        rows = list(self._store.items())
        for field, op, value in self._filters:
            if op == "==":
                rows = [(k, v) for k, v in rows if v.get(field) == value]
        if self._order:
            field, desc = self._order
            rows.sort(key=lambda kv: (kv[1].get(field) is None, kv[1].get(field)),
                      reverse=desc)
        if self._limit is not None:
            rows = rows[: self._limit]
        return [FakeSnapshot(k, v) for k, v in rows]


class FakeCollection:
    def __init__(self, db: "FakeFirestore", path: str):
        self._db = db
        self._path = path
        self._store = db.data.setdefault(path, {})

    def document(self, doc_id: str) -> FakeDocument:
        return FakeDocument(self._store, doc_id)

    def where(self, field, op, value):
        return self._query().where(field, op, value)

    def order_by(self, field, direction="ASCENDING"):
        return self._query().order_by(field, direction)

    def limit(self, n):
        return self._query().limit(n)

    def _query(self) -> FakeQuery:
        return FakeQuery(self._store)

    async def get(self) -> list[FakeSnapshot]:
        return await self._query().get()

    async def add(self, data: dict):
        doc_id = next(self._db._ids)
        self._store[doc_id] = dict(data)
        # Matches the real client, which returns (timestamp, document_ref).
        return (None, FakeDocument(self._store, doc_id))


class FakeTransaction:
    def __init__(self):
        self.writes: list[tuple[str, dict]] = []

    async def get(self, ref: FakeDocument) -> FakeSnapshot:
        return await ref.get()

    def set(self, ref: FakeDocument, data: dict):
        self.writes.append((ref.id, data))
        ref._store[ref.id] = dict(data)


class FakeFirestore:
    def __init__(self):
        self.data: dict[str, dict] = {}
        self._ids = (f"gen-{i}" for i in itertools.count(1))

    def collection(self, name: str) -> FakeCollection:
        return FakeCollection(self, name)

    def transaction(self) -> FakeTransaction:
        return FakeTransaction()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def fake_firestore(monkeypatch):
    """Replace the Firestore client for every test in the session."""
    db = FakeFirestore()
    monkeypatch.setattr(fs, "get_db", lambda: db)
    monkeypatch.setattr(fs, "_db", db, raising=False)
    return db


@pytest.fixture(autouse=True)
def no_google_credentials(monkeypatch):
    """Fail loudly if any code path tries to build a real GCP client."""
    from google.auth.exceptions import DefaultCredentialsError

    def explode(*_args, **_kwargs):
        raise DefaultCredentialsError(
            "A test tried to reach Google Cloud. Patch the service layer or use "
            "the fake_firestore fixture."
        )

    monkeypatch.setattr(
        "google.auth.default", explode, raising=False
    )
