from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class WalletResponse(BaseModel):
    wallet_id: int
    student_id: int
    balance: Decimal
    updated_at: datetime

    class Config:
        from_attributes = True

class WalletTopUpRequest(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Amount to deposit into student wallet")
