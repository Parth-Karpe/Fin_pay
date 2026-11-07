from sqlalchemy import Column, Integer, String, DateTime, Text, func
from backend.app.core.database import Base

class ReconciliationRun(Base):
    __tablename__ = "reconciliation_runs"
    
    run_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    month = Column(String(7), unique=True, nullable=False, index=True) # e.g. "2026-11"
    run_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = Column(String(50), nullable=False) # e.g. "COMPLETED", "IN_PROGRESS", "FAILED"
    notes = Column(Text, nullable=True)
