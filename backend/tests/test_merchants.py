import pytest
from backend.app.core.exceptions import ResourceNotFoundException

def test_list_categories(api):
    categories = api.list_merchant_categories()
    assert len(categories) >= 1
    assert any(c.name == "Test Category" for c in categories)

def test_list_merchants(api):
    merchants = api.list_merchants()
    assert len(merchants) >= 1
    assert any(m.name == "Test Cafe" for m in merchants)

def test_get_merchant_by_id(api):
    merchants = api.list_merchants()
    m_id = merchants[0].merchant_id
    merchant = api.get_merchant(m_id)
    assert merchant.merchant_id == m_id

def test_get_nonexistent_merchant_fails(api):
    with pytest.raises(ResourceNotFoundException):
        api.get_merchant(999999)
