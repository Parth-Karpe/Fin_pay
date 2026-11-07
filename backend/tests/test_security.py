from decimal import Decimal
import pytest
from fastapi import HTTPException
from backend.app.core.security import decode_access_token
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.core.exceptions import ResourceNotFoundException

class MockCredentials:
    def __init__(self, token):
        self.credentials = token

def test_token_decoding_and_expiration(auth_student):
    token = auth_student["token"]
    payload = decode_access_token(token)
    assert payload is not None
    assert int(payload["sub"]) == auth_student["user"].user_id
    assert "exp" in payload

def test_invalid_token_rejected(db):
    with pytest.raises(HTTPException) as exc:
        get_current_user(MockCredentials("invalid.token.here"), db)
    assert exc.value.status_code == 401

def test_missing_credentials_rejected(db):
    with pytest.raises(HTTPException) as exc:
        get_current_user(None, db)
    assert exc.value.status_code == 401

def test_inactive_user_rejected(auth_student, db):
    user = auth_student["user"]
    user.is_active = False
    db.commit()

    with pytest.raises(HTTPException) as exc:
        get_current_user(MockCredentials(auth_student["token"]), db)
    assert exc.value.status_code == 403
    assert "inactive" in exc.value.detail

    # Restore active
    user.is_active = True
    db.commit()

def test_cross_user_payment_tampering_prevented(api, db):
    # User 1
    u1_reg = api.register("u1_sec@finpay.edu", "password123", "User One")
    u1 = db.query(User).filter(User.user_id == u1_reg.user_id).first()
    api.set_user(u1)
    api.top_up_wallet(Decimal("100.00"))

    # User 2
    u2_reg = api.register("u2_sec@finpay.edu", "password123", "User Two")
    u2 = db.query(User).filter(User.user_id == u2_reg.user_id).first()
    api.set_user(u2)

    # User 1 creates a payment
    merchants = api.list_merchants()
    m_id = merchants[0].merchant_id
    api.set_user(u1)
    p1 = api.create_payment(merchant_id=m_id, amount=Decimal("20.00"))

    # User 2 attempts to access User 1's payment directly
    api.set_user(u2)
    with pytest.raises(ResourceNotFoundException):
        api.get_payment(p1.payment_id)
