from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.student import Student
from backend.app.models.wallet import Wallet
from backend.app.schemas.student import StudentProfileResponse
from backend.app.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/me", response_model=StudentProfileResponse)
def get_current_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the authenticated student's profile and wallet overview.
    Strictly verifies ownership: identifies student linked to authenticated user.
    """
    student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
    if not student:
        raise ResourceNotFoundException("Student profile")

    wallet = db.query(Wallet).filter(Wallet.student_id == student.student_id).first()
    if not wallet:
        raise ResourceNotFoundException("Wallet")

    return StudentProfileResponse(
        student_id=student.student_id,
        user_id=current_user.user_id,
        email=current_user.email,
        full_name=student.full_name,
        wallet_id=wallet.wallet_id,
        balance=wallet.balance,
        created_at=student.created_at
    )
