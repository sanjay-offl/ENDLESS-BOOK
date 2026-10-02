import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.agents.page_weaver import weave_pages, WeaveResult
from app.agents.moderator import moderate_chapter, ModerationVerdict


@pytest.mark.asyncio
async def test_page_weaver_returns_three_pages():
    with patch("app.agents.page_weaver.genai.Client") as mock_client:
        mock_model = AsyncMock()
        mock_response = MagicMock()
        mock_response.text = '{"title": "Test Title", "pages": ["Page one content.", "Page two content.", "Page three content."]}'
        mock_model.generate_content.return_value = mock_response
        mock_client.return_value.aio.models = mock_model

        result = await weave_pages("Some rough text about a childhood memory that is quite long and needs splitting.")
        assert isinstance(result, WeaveResult)
        assert result.title == "Test Title"
        assert len(result.pages) == 3


@pytest.mark.asyncio
async def test_moderator_clean_chapter():
    with patch("app.agents.moderator.genai.Client") as mock_client:
        mock_model = AsyncMock()
        mock_response = MagicMock()
        mock_response.text = '{"status": "published", "reason": "Clean content", "confidence": 0.95, "flags": []}'
        mock_model.generate_content.return_value = mock_response
        mock_client.return_value.aio.models = mock_model

        result = await moderate_chapter("A Nice Memory", ["Page 1", "Page 2", "Page 3"])
        assert isinstance(result, ModerationVerdict)
        assert result.status == "published"
        assert result.confidence > 0.9


@pytest.mark.asyncio
async def test_moderator_flags_personal_data():
    with patch("app.agents.moderator.genai.Client") as mock_client:
        mock_model = AsyncMock()
        mock_response = MagicMock()
        mock_response.text = '{"status": "needs_review", "reason": "Contains phone number", "confidence": 0.8, "flags": ["phone_number"]}'
        mock_model.generate_content.return_value = mock_response
        mock_client.return_value.aio.models = mock_model

        result = await moderate_chapter("Memory", ["Call me at 9876543210", "Page 2", "Page 3"])
        assert result.status == "needs_review"
        assert "phone_number" in result.flags
