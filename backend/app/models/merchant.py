from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class MerchantCategory(Base):
    __tablename__ = "merchant_categories"
    
    category_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    
    # MERCHANT_CATEGORIES 1 : N MERCHANTS
    merchants = relationship("Merchant", back_populates="category", cascade="all, delete-orphan")

class Merchant(Base):
    __tablename__ = "merchants"
    
    merchant_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    category_id = Column(Integer, ForeignKey("merchant_categories.category_id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    
    # Relationships
    category = relationship("MerchantCategory", back_populates="merchants")
    # MERCHANTS 1 : N PAYMENTS
    payments = relationship("Payment", back_populates="merchant", cascade="all, delete-orphan")
