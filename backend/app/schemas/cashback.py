from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel

class CashbackResponse(BaseModel):
    cashback_id: int
    payment_id: int
    amount: Decimal
    created_at: datetime

    class Config:
        from_attributes = True
