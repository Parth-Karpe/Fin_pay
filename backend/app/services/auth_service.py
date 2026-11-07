from decimal import Decimal
from sqlalchemy.orm import Session
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.core.exceptions import (
    ConflictException,
    InvalidCredentialsException,
    InactiveUserException,
    ResourceNotFoundException
)
from backend.app.models.user import User
from backend.app.models.student import Student
from backend.app.models.wallet import Wallet
from backend.app.schemas.user import UserRegisterRequest, TokenResponse

class AuthService:
    @staticmethod
    def register_user(db: Session, request: UserRegisterRequest) -> TokenResponse:
        """
        Registers a new user, automatically creating their associated student profile 
        and student wallet in a single atomic database transaction.
        """
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise ConflictException("An account with this email already exists")

        # Hash password securely
        pwd_hash = hash_password(request.password)

        try:
            # 1. Create User
            user = User(
                email=request.email,
                password_hash=pwd_hash,
                is_active=True
            )
            db.add(user)
            db.flush() # flush to generate user.user_id

            # 2. Create Student profile (USERS 1 : 0..1 STUDENTS)
            student = Student(
                user_id=user.user_id,
                full_name=request.full_name
            )
            db.add(student)
            db.flush() # flush to generate student.student_id

            # 3. Create Student Wallet (STUDENTS 1 : 1 WALLETS) with initial balance 0.00
            wallet = Wallet(
                student_id=student.student_id,
                balance=Decimal("0.00")
            )
            db.add(wallet)
            
            db.commit()
            db.refresh(user)
            db.refresh(student)
        except Exception:
            db.rollback()
            raise

        token = create_access_token(subject=user.user_id)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user.user_id,
            email=user.email,
            student_id=student.student_id,
            full_name=student.full_name
        )

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> TokenResponse:
        """
        Validates login credentials, verifies active status, and returns a signed JWT.
        """
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            raise InvalidCredentialsException()

        if not user.is_active:
            raise InactiveUserException()

        student = db.query(Student).filter(Student.user_id == user.user_id).first()
        if not student:
            raise ResourceNotFoundException("Student profile")

        token = create_access_token(subject=user.user_id)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user.user_id,
            email=user.email,
            student_id=student.student_id,
            full_name=student.full_name
        )
