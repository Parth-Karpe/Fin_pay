from decimal import Decimal
from sqlalchemy.orm import Session
from backend.app.core.exceptions import (
    ResourceNotFoundException,
    UnauthorizedAccessException,
    InvalidPaymentAmountException
)
from backend.app.models.student import Student
from backend.app.models.wallet import Wallet

class WalletService:
    @staticmethod
    def get_wallet_by_user_id(db: Session, user_id: int) -> Wallet:
        """
        Retrieves the wallet belonging strictly to the authenticated user's student profile.
        Service-layer ownership verification:
        1. Identifies user.
        2. Locates student profile.
        3. Locates wallet for student.
        """
        student = db.query(Student).filter(Student.user_id == user_id).first()
        if not student:
            raise ResourceNotFoundException("Student profile")

        wallet = db.query(Wallet).filter(Wallet.student_id == student.student_id).first()
        if not wallet:
            raise ResourceNotFoundException("Wallet")

        return wallet

    @staticmethod
    def verify_wallet_ownership(db: Session, user_id: int, wallet_id: int) -> Wallet:
        """
        Explicitly verifies that the target wallet_id belongs to the authenticated user.
        Never relies on frontend claims.
        """
        wallet = WalletService.get_wallet_by_user_id(db, user_id)
        if wallet.wallet_id != wallet_id:
            raise UnauthorizedAccessException("You are not authorized to access or modify this wallet")
        return wallet

    @staticmethod
    def top_up_wallet(db: Session, user_id: int, amount: Decimal) -> Wallet:
        """
        Allows student to add funds to their verified personal wallet.
        """
        if amount <= 0:
            raise InvalidPaymentAmountException("Deposit amount must be greater than zero")

        wallet = WalletService.get_wallet_by_user_id(db, user_id)
        
        try:
            wallet.balance = wallet.balance + amount
            db.commit()
            db.refresh(wallet)
            return wallet
        except Exception:
            db.rollback()
            raise
