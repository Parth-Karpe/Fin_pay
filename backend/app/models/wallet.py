from decimal import Decimal
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Wallet(Base):
    __tablename__ = "wallets"
    
    wallet_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), unique=True, nullable=False, index=True)
    balance = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    student = relationship("Student", back_populates="wallet")
    # WALLETS 1 : N PAYMENTS
    payments = relationship("Payment", back_populates="wallet", cascade="all, delete-orphan")
