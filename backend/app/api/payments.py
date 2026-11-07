from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.payment import PaymentCreateRequest, PaymentResponse
from backend.app.schemas.cashback import CashbackResponse
from backend.app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])

def _to_payment_response(p) -> PaymentResponse:
    cashback_dto = None
    if p.cashback:
        cashback_dto = CashbackResponse(
            cashback_id=p.cashback.cashback_id,
            payment_id=p.cashback.payment_id,
            amount=p.cashback.amount,
            created_at=p.cashback.created_at
        )

    return PaymentResponse(
        payment_id=p.payment_id,
        wallet_id=p.wallet_id,
        merchant_id=p.merchant_id,
        merchant_name=p.merchant.name if p.merchant else "Unknown Merchant",
        category_name=p.merchant.category.name if (p.merchant and p.merchant.category) else None,
        amount=p.amount,
        paid_at=p.paid_at,
        cashback=cashback_dto
    )

@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    request: PaymentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes makePayment within an atomic transaction.
    Enforces balance validation, row-locking, and payment history preservation.
    """
    payment = PaymentService.make_payment(
        db=db,
        user=current_user,
        merchant_id=request.merchant_id,
        amount=request.amount
    )
    return _to_payment_response(payment)

@router.get("", response_model=list[PaymentResponse])
def list_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves payment transaction history strictly for the authenticated student.
    """
    payments = PaymentService.get_student_payments(db, current_user)
    return [_to_payment_response(p) for p in payments]

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves specific payment detail ensuring student-wallet ownership.
    """
    payment = PaymentService.get_payment_by_id(db, current_user, payment_id)
    return _to_payment_response(payment)
