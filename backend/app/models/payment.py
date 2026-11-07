from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        CheckConstraint("amount > 0", name="check_positive_payment_amount"),
    )
    
    payment_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.wallet_id"), nullable=False, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.merchant_id"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    paid_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    wallet = relationship("Wallet", back_populates="payments")
    merchant = relationship("Merchant", back_populates="payments")
    # PAYMENTS 1 : 0..1 CASHBACK
    cashback = relationship("Cashback", back_populates="payment", uselist=False, cascade="all, delete-orphan")
