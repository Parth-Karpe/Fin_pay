from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel

class StudentResponse(BaseModel):
    student_id: int
    user_id: int
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class StudentProfileResponse(BaseModel):
    student_id: int
    user_id: int
    email: str
    full_name: str
    wallet_id: int
    balance: Decimal
    created_at: datetime

    class Config:
        from_attributes = True
