from fastapi import HTTPException, Request, Header
from firebase_admin import auth, initialize_app, credentials
import firebase_admin

try:
    firebase_admin.get_app()
except ValueError:
    initialize_app()


async def verify_token(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await verify_token(auth_header)


async def require_founder(user: dict = None) -> dict:
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    role = user.get("role", "member")
    if role != "founder":
        raise HTTPException(status_code=403, detail="Founder access required")
    return user
