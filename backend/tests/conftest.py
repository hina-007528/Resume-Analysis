from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.main import app


class _Result:
    def __init__(self, data: list[dict[str, Any]]):
        self.data = data


class FakeTableQuery:
    def __init__(self, table: str, store: dict[str, list[dict[str, Any]]]):
        self.table = table
        self.store = store
        self._rows = list(store.get(table, []))
        self._pending_update: dict[str, Any] | None = None
        self._pending_insert: dict[str, Any] | None = None

    def select(self, _columns: str):
        return self

    def eq(self, key: str, value: Any):
        self._rows = [row for row in self._rows if row.get(key) == value]
        return self

    def is_(self, key: str, value: str):
        if value == "null":
            self._rows = [row for row in self._rows if row.get(key) is None]
        return self

    def order(self, _field: str, desc: bool = False):
        self._rows = sorted(self._rows, key=lambda r: r.get("created_at", ""), reverse=desc)
        return self

    def limit(self, n: int):
        self._rows = self._rows[:n]
        return self

    def single(self):
        self._rows = self._rows[:1]
        return self

    def insert(self, data: dict[str, Any]):
        self._pending_insert = data
        return self

    def update(self, data: dict[str, Any]):
        self._pending_update = data
        return self

    def delete(self):
        self._rows = []
        return self

    def execute(self):
        if self._pending_insert is not None:
            self.store.setdefault(self.table, []).append(self._pending_insert)
            return _Result([self._pending_insert])

        if self._pending_update is not None:
            for row in self.store.get(self.table, []):
                row.update(self._pending_update)
            return _Result(self.store.get(self.table, []))

        return _Result(self._rows)


class FakeSupabase:
    def __init__(self, seed: dict[str, list[dict[str, Any]]] | None = None):
        self.store = seed or {"analyses": [], "profiles": []}

    def table(self, name: str):
        return FakeTableQuery(name, self.store)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_pdf_path() -> Path:
    return Path(__file__).resolve().parents[1] / "test_resume.pdf"
