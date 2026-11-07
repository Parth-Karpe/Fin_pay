from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReconciliationRunCreate(BaseModel):
    month: str = Field(..., pattern=r"^\d{4}-(0[1-9]|1[0-2])$", description="Month in YYYY-MM format")
    status: str = Field(default="COMPLETED", description="Status of reconciliation run")
    notes: Optional[str] = None

class ReconciliationRunResponse(BaseModel):
    run_id: int
    month: str
    run_at: datetime
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True
