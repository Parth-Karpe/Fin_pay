from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.wallet import WalletResponse, WalletTopUpRequest
from backend.app.services.wallet_service import WalletService

router = APIRouter(prefix="/wallet", tags=["Wallet"])

@router.get("", response_model=WalletResponse)
def get_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the wallet of the currently authenticated student.
    Enforces resource-ownership verification at the service layer.
    """
    return WalletService.get_wallet_by_user_id(db, current_user.user_id)

@router.post("/topup", response_model=WalletResponse)
def top_up_wallet(
    request: WalletTopUpRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows the authenticated student to add balance to their wallet for testing/payment.
    """
    return WalletService.top_up_wallet(db, current_user.user_id, request.amount)
