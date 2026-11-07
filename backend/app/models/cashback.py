from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Cashback(Base):
    __tablename__ = "cashback"
    __table_args__ = (
        CheckConstraint("amount >= 0", name="check_non_negative_cashback_amount"),
    )
    
    cashback_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.payment_id"), unique=True, nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships: PAYMENTS 1 : 0..1 CASHBACK
    payment = relationship("Payment", back_populates="cashback")
