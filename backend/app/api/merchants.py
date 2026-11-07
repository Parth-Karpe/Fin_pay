from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.merchant import MerchantCategoryResponse, MerchantResponse
from backend.app.services.merchant_service import MerchantService

router = APIRouter(tags=["Merchants"])

@router.get("/merchant-categories", response_model=list[MerchantCategoryResponse])
def list_merchant_categories(db: Session = Depends(get_db)):
    """
    List all available merchant categories.
    """
    return MerchantService.get_all_categories(db)

@router.get("/merchants", response_model=list[MerchantResponse])
def list_merchants(
    category_id: Optional[int] = Query(None, description="Filter merchants by category ID"),
    db: Session = Depends(get_db)
):
    """
    List available merchants from backend database (with optional category filtering).
    """
    merchants = MerchantService.get_all_merchants(db, category_id)
    return [
        MerchantResponse(
            merchant_id=m.merchant_id,
            category_id=m.category_id,
            name=m.name,
            category_name=m.category.name if m.category else None
        )
        for m in merchants
    ]

@router.get("/merchants/{merchant_id}", response_model=MerchantResponse)
def get_merchant(merchant_id: int, db: Session = Depends(get_db)):
    """
    Retrieve single merchant details.
    """
    m = MerchantService.get_merchant_by_id(db, merchant_id)
    return MerchantResponse(
        merchant_id=m.merchant_id,
        category_id=m.category_id,
        name=m.name,
        category_name=m.category.name if m.category else None
    )
