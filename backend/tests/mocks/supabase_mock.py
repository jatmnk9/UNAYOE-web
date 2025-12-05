"""
Mocks para el cliente de Supabase.
Simula operaciones de base de datos para pruebas.
"""
from typing import Any, Dict, List, Optional
from unittest.mock import MagicMock


class MockSupabaseResponse:
    """Mock de respuesta de Supabase."""

    def __init__(self, data: List[Dict[str, Any]] = None, error: Optional[str] = None):
        self.data = data if data is not None else []
        self.error = error


class MockSupabaseTable:
    """Mock de operaciones de tabla de Supabase."""

    def __init__(self, table_name: str, mock_data: Dict[str, List[Dict[str, Any]]] = None):
        self.table_name = table_name
        self.mock_data = mock_data or {}
        self._query_filters = {}
        self._order_by = None
        self._limit_value = None

    def select(self, columns: str = "*"):
        """Mock del método select."""
        return self

    def insert(self, data: Dict[str, Any]):
        """Mock del método insert."""
        if self.table_name not in self.mock_data:
            self.mock_data[self.table_name] = []
        self.mock_data[self.table_name].append(data)
        return self

    def update(self, data: Dict[str, Any]):
        """Mock del método update."""
        return self

    def delete(self):
        """Mock del método delete."""
        return self

    def eq(self, column: str, value: Any):
        """Mock del método eq (equal)."""
        self._query_filters[column] = value
        return self

    def order(self, column: str, desc: bool = False):
        """Mock del método order."""
        self._order_by = (column, desc)
        return self

    def limit(self, count: int):
        """Mock del método limit."""
        self._limit_value = count
        return self

    def execute(self):
        """Mock del método execute que retorna los datos."""
        data = self.mock_data.get(self.table_name, [])

        # Aplicar filtros si existen
        if self._query_filters:
            filtered_data = []
            for item in data:
                match = all(
                    item.get(key) == value
                    for key, value in self._query_filters.items()
                )
                if match:
                    filtered_data.append(item)
            data = filtered_data

        # Aplicar limit si existe
        if self._limit_value:
            data = data[:self._limit_value]

        return MockSupabaseResponse(data=data)


class MockSupabaseClient:
    """Mock completo del cliente de Supabase."""

    def __init__(self):
        self.mock_data = {
            "notas": [],
            "recomendaciones": [],
            "likes_recomendaciones": [],
            "usuarios": []
        }

    def table(self, table_name: str) -> MockSupabaseTable:
        """Retorna un mock de tabla."""
        return MockSupabaseTable(table_name, self.mock_data)

    def reset_data(self):
        """Resetea todos los datos mock."""
        for table in self.mock_data:
            self.mock_data[table] = []

    def seed_data(self, table_name: str, data: List[Dict[str, Any]]):
        """Agrega datos iniciales a una tabla."""
        self.mock_data[table_name] = data


def get_mock_supabase_client() -> MockSupabaseClient:
    """
    Factory function para obtener cliente mock de Supabase.

    Returns:
        MockSupabaseClient: Cliente mock de Supabase
    """
    return MockSupabaseClient()
