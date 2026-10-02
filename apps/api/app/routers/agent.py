from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.models.schemas import WeaveRequest, WeaveResponse
from app.agents.page_weaver import weave_pages

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/weave", response_model=WeaveResponse)
async def weave(request: WeaveRequest, user: dict = Depends(get_current_user)):
    try:
        result = await weave_pages(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Page Weaver failed: {str(e)}")
