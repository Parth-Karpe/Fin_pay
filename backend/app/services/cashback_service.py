from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.models.payment import Payment
from backend.app.models.cashback import Cashback
from backend.app.models.wallet import Wallet
from backend.app.models.student import Student

class CashbackService:
    @staticmethod
    def evaluate_cashback_policy(payment_amount: Decimal, merchant_id: int) -> Optional[Decimal]:
        """
        Evaluates cashback eligibility and amount according to approved business policy.
        
        CRITICAL DESIGN RULE:
        The cashback policy is explicitly unresolved in the approved detailed design.
        No arbitrary percentage, category rule, or amount threshold is invented.
        Unless CASHBACK_ENABLED is set and an explicit rule is confirmed, no cashback is generated.
        """
        if not settings.CASHBACK_ENABLED:
            return None
            
        # Placeholder for approved future cashback business logic
        return None

    @staticmethod
    def get_cashback_for_student(db: Session, student_id: int) -> list[Cashback]:
        """
        Retrieves actual cashback records associated with the authenticated student's payments.
        """
        records = (
            db.query(Cashback)
            .join(Payment, Cashback.payment_id == Payment.payment_id)
            .join(Wallet, Payment.wallet_id == Wallet.wallet_id)
            .filter(Wallet.student_id == student_id)
            .order_by(Cashback.created_at.desc())
            .all()
        )
        return records
