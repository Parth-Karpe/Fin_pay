from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.student import Student
from backend.app.schemas.cashback import CashbackResponse
from backend.app.services.cashback_service import CashbackService
from backend.app.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/cashback", tags=["Cashback"])

@router.get("", response_model=list[CashbackResponse])
def get_student_cashback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Displays actual cashback records associated with the authenticated student's payments.
    Does not display fabricated or artificial figures.
    """
    student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
    if not student:
        raise ResourceNotFoundException("Student profile")

    cashback_records = CashbackService.get_cashback_for_student(db, student.student_id)
    return [
        CashbackResponse(
            cashback_id=c.cashback_id,
            payment_id=c.payment_id,
            amount=c.amount,
            created_at=c.created_at
        )
        for c in cashback_records
    ]
