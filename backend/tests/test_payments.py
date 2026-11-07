from decimal import Decimal
import pytest
from pydantic import ValidationError
from backend.app.core.exceptions import ResourceNotFoundException, InsufficientBalanceException
from backend.app.models.user import User

def test_successful_payment(auth_student, api):
    # Initial balance is $200.00
    wallet = api.get_wallet()
    assert wallet.balance == Decimal("200.00")

    # Get merchant
    merchants = api.list_merchants()
    m_id = merchants[0].merchant_id

    # Pay $45.50
    payment = api.create_payment(merchant_id=m_id, amount=Decimal("45.50"))
    assert payment.amount == Decimal("45.50")
    assert payment.merchant_id == m_id

    # Check updated balance ($200.00 - $45.50 = $154.50)
    w_after = api.get_wallet()
    assert w_after.balance == Decimal("154.50")

def test_payment_zero_amount_rejected(auth_student, api):
    merchants = api.list_merchants()
    m_id = merchants[0].merchant_id
    with pytest.raises(ValidationError):
        api.create_payment(merchant_id=m_id, amount=Decimal("0.00"))

def test_payment_negative_amount_rejected(auth_student, api):
    merchants = api.list_merchants()
    m_id = merchants[0].merchant_id
    with pytest.raises(ValidationError):
        api.create_payment(merchant_id=m_id, amount=Decimal("-25.00"))

def test_payment_nonexistent_merchant_rejected(auth_student, api):
    with pytest.raises(ResourceNotFoundException):
        api.create_payment(merchant_id=999999, amount=Decimal("10.00"))

def test_insufficient_balance_rejected(auth_student, api):
    merchants = api.list_merchants()
    m_id = merchants[0].merchant_id

    # Balance is $200.00; attempt to pay $5000.00
    with pytest.raises(InsufficientBalanceException) as exc:
        api.create_payment(merchant_id=m_id, amount=Decimal("5000.00"))
    assert "Not enough balance" in str(exc.value.detail)

    # Balance must remain completely unchanged
    w = api.get_wallet()
    assert w.balance == Decimal("200.00")

def test_exact_balance_payment_succeeds(api, db):
    email = "exact@finpay.edu"
    reg = api.register(email, "password123", "Exact Balance Student")
    user = db.query(User).filter(User.user_id == reg.user_id).first()
    api.set_user(user)
    api.top_up_wallet(Decimal("30.00"))

    merchants = api.list_merchants()
    m_id = merchants[0].merchant_id

    api.create_payment(merchant_id=m_id, amount=Decimal("30.00"))

    wallet = api.get_wallet()
    assert wallet.balance == Decimal("0.00")

def test_payment_history_isolation(auth_student, api, db):
    merchants = api.list_merchants()
    m_id = merchants[0].merchant_id

    # Student 1 makes payment
    api.create_payment(merchant_id=m_id, amount=Decimal("15.00"))

    # Register Student 2
    reg2 = api.register("student2@finpay.edu", "password123", "Second Student")
    user2 = db.query(User).filter(User.user_id == reg2.user_id).first()
    api.set_user(user2)

    # Student 2 has 0 payments
    p2 = api.list_payments()
    assert len(p2) == 0

    # Student 1 sees their payment
    api.set_user(auth_student["user"])
    p1 = api.list_payments()
    assert len(p1) >= 1
