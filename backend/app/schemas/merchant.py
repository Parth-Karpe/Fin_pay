from typing import Optional
from pydantic import BaseModel

class MerchantCategoryResponse(BaseModel):
    category_id: int
    name: str

    class Config:
        from_attributes = True

class MerchantResponse(BaseModel):
    merchant_id: int
    category_id: int
    name: str
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
