from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.user import UserRegisterRequest, UserLoginRequest, TokenResponse
from backend.app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new user, student profile, and student wallet in one atomic transaction.
    """
    return AuthService.register_user(db, request)

@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates a user and issues a signed JWT token.
    """
    return AuthService.authenticate_user(db, request.email, request.password)
