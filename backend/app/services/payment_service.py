from decimal import Decimal
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.exceptions import (
    ResourceNotFoundException,
    InsufficientBalanceException,
    InvalidPaymentAmountException
)
from backend.app.models.user import User
from backend.app.models.student import Student
from backend.app.models.wallet import Wallet
from backend.app.models.merchant import Merchant
from backend.app.models.payment import Payment
from backend.app.models.cashback import Cashback
from backend.app.services.cashback_service import CashbackService

class PaymentService:
    @staticmethod
    def make_payment(db: Session, user: User, merchant_id: int, amount: Decimal) -> Payment:
        """
        Executes makePayment(user, merchant_id, amount) inside a single atomic database transaction.
        Preserves complete financial integrity:
        1. Wallet balance deduction
        2. Payment record creation
        3. Cashback record creation (if approved policy applies)
        Succeed or fail together. Concurrency protection via row locking.
        """
        # 1. Validate amount
        if amount <= Decimal("0.00"):
            raise InvalidPaymentAmountException("Payment amount must be greater than zero")

        try:
            # 2. Find wallet belonging to authenticated user's student
            student = db.query(Student).filter(Student.user_id == user.user_id).first()
            if not student:
                raise ResourceNotFoundException("Student profile")

            # Acquire row-level lock where supported (PostgreSQL FOR UPDATE)
            wallet_query = db.query(Wallet).filter(Wallet.student_id == student.student_id)
            if not settings.DATABASE_URL.startswith("sqlite"):
                wallet_query = wallet_query.with_for_update()
            
            wallet = wallet_query.first()
            if not wallet:
                raise ResourceNotFoundException("Wallet")

            # 3. Find merchant
            merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()
            if not merchant:
                raise ResourceNotFoundException("Merchant")

            # 4. Check balance under approved policy (configurable unresolved decision)
            if settings.ENFORCE_NON_NEGATIVE_BALANCE and wallet.balance < amount:
                raise InsufficientBalanceException("Not enough balance")

            # 5. Deduct wallet balance
            wallet.balance = wallet.balance - amount

            # 6. Insert payment record
            payment = Payment(
                wallet_id=wallet.wallet_id,
                merchant_id=merchant.merchant_id,
                amount=amount
            )
            db.add(payment)
            db.flush() # Generate payment.payment_id

            # 7. Check approved cashback policy (strictly unresolved - no arbitrary awards)
            cashback_amount = CashbackService.evaluate_cashback_policy(amount, merchant_id)
            if cashback_amount is not None and cashback_amount > Decimal("0.00"):
                cashback = Cashback(
                    payment_id=payment.payment_id,
                    amount=cashback_amount
                )
                db.add(cashback)

            # 8. Commit atomic transaction
            db.commit()
            db.refresh(payment)
            return payment

        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_payment_by_id(db: Session, user: User, payment_id: int) -> Payment:
        """
        Retrieves a payment ensuring ownership verification (belongs to user's wallet).
        """
        student = db.query(Student).filter(Student.user_id == user.user_id).first()
        if not student:
            raise ResourceNotFoundException("Student profile")

        wallet = db.query(Wallet).filter(Wallet.student_id == student.student_id).first()
        if not wallet:
            raise ResourceNotFoundException("Wallet")

        payment = (
            db.query(Payment)
            .filter(Payment.payment_id == payment_id, Payment.wallet_id == wallet.wallet_id)
            .first()
        )
        if not payment:
            raise ResourceNotFoundException("Payment")

        return payment

    @staticmethod
    def get_student_payments(db: Session, user: User) -> list[Payment]:
        """
        Retrieves all payments strictly belonging to the authenticated user's wallet.
        """
        student = db.query(Student).filter(Student.user_id == user.user_id).first()
        if not student:
            return []

        wallet = db.query(Wallet).filter(Wallet.student_id == student.student_id).first()
        if not wallet:
            return []

        return (
            db.query(Payment)
            .filter(Payment.wallet_id == wallet.wallet_id)
            .order_by(Payment.paid_at.desc())
            .all()
        )
