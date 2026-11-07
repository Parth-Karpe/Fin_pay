from typing import Optional
from sqlalchemy.orm import Session
from backend.app.core.exceptions import ResourceNotFoundException
from backend.app.models.merchant import Merchant, MerchantCategory

class MerchantService:
    @staticmethod
    def get_all_categories(db: Session) -> list[MerchantCategory]:
        return db.query(MerchantCategory).order_by(MerchantCategory.name).all()

    @staticmethod
    def get_all_merchants(db: Session, category_id: Optional[int] = None) -> list[Merchant]:
        query = db.query(Merchant)
        if category_id:
            query = query.filter(Merchant.category_id == category_id)
        return query.order_by(Merchant.name).all()

    @staticmethod
    def get_merchant_by_id(db: Session, merchant_id: int) -> Merchant:
        merchant = db.query(Merchant).filter(Merchant.merchant_id == merchant_id).first()
        if not merchant:
            raise ResourceNotFoundException(f"Merchant with ID {merchant_id}")
        return merchant
