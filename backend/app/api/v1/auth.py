from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pwdlib.exceptions import UnknownHashError

from app.auth.dependencies import get_current_user
from app.auth.jwt import create_access_token
from app.auth.password import hash_password, verify_password
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import Token, UserLogin, UserRegister, UserResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)) -> User:
    existing_user = db.scalar(select(User).where(User.email == user_in.email))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        ) from None
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)) -> Token:
    user = db.scalar(select(User).where(User.email == user_in.email))
    password_valid = False
    if user is not None:
        try:
            password_valid = verify_password(user_in.password, user.password_hash)
        except UnknownHashError:
            password_valid = False

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    access_token = create_access_token(user.id)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user
