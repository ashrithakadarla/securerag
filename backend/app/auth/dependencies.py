from collections.abc import Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.jwt import decode_access_token
from app.core.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise CREDENTIALS_EXCEPTION

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            raise CREDENTIALS_EXCEPTION
        user_id = int(user_id)
    except jwt.PyJWTError:
        raise CREDENTIALS_EXCEPTION from None
    except (TypeError, ValueError):
        raise CREDENTIALS_EXCEPTION from None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise CREDENTIALS_EXCEPTION

    return user


def require_role(required_role: str) -> Callable[..., User]:
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_checker
