from decimal import Decimal
import pytest
from pydantic import ValidationError

def test_get_wallet_ownership(auth_student, api):
    wallet = api.get_wallet()
    assert wallet.student_id == auth_student["student_id"]
    assert wallet.balance == Decimal("200.00")

def test_wallet_topup(auth_student, api):
    wallet = api.top_up_wallet(Decimal("50.00"))
    assert wallet.balance == Decimal("250.00")

def test_wallet_topup_invalid_amount_fails(auth_student, api):
    with pytest.raises(ValidationError):
        api.top_up_wallet(Decimal("-10.00"))
