from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field
from backend.app.schemas.cashback import CashbackResponse

class PaymentCreateRequest(BaseModel):
    merchant_id: int
    amount: Decimal = Field(..., gt=0, description="Payment amount must be greater than zero")

class PaymentResponse(BaseModel):
    payment_id: int
    wallet_id: int
    merchant_id: int
    merchant_name: str
    category_name: Optional[str] = None
    amount: Decimal
    paid_at: datetime
    cashback: Optional[CashbackResponse] = None

    class Config:
        from_attributes = True
