import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.mark.asyncio
async def test_internal_moderate_endpoint():
    with patch("app.main.moderate_chapter") as mock_mod:
        mock_mod.return_value = AsyncMock(
            status="published",
            reason="Clean",
            confidence=0.95,
            flags=[],
        )
        with patch("app.main.fs.update_chapter") as mock_update:
            mock_update.return_value = AsyncMock()
            with patch("app.main.generate_embedding") as mock_embed:
                mock_embed.return_value = [0.1, 0.2, 0.3]

                response = client.post("/internal/moderate", json={
                    "chapter_id": "test-chapter",
                    "title": "Test",
                    "pages": ["Page 1", "Page 2", "Page 3"],
                })
                assert response.status_code == 200
                data = response.json()
                assert data["ok"] is True
                assert data["status"] == "published"


@pytest.mark.asyncio
async def test_internal_moderate_rejects_bad_content():
    with patch("app.main.moderate_chapter") as mock_mod:
        mock_mod.return_value = AsyncMock(
            status="rejected",
            reason="Hate speech detected",
            confidence=0.99,
            flags=["hate_speech"],
        )
        with patch("app.main.fs.update_chapter") as mock_update:
            mock_update.return_value = AsyncMock()

            response = client.post("/internal/moderate", json={
                "chapter_id": "bad-chapter",
                "title": "Bad",
                "pages": ["Hate content", "Page 2", "Page 3"],
            })
            assert response.status_code == 200
            data = response.json()
            assert data["ok"] is True
            assert data["status"] == "rejected"
