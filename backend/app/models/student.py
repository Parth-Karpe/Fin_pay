from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Student(Base):
    __tablename__ = "students"
    
    student_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="student")
    # STUDENTS 1 : 1 WALLETS
    wallet = relationship("Wallet", back_populates="student", uselist=False, cascade="all, delete-orphan")
