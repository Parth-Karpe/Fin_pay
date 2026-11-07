import pytest
from backend.app.core.exceptions import ConflictException, InvalidCredentialsException

def test_registration_success(api):
    res = api.register("newstudent@finpay.edu", "mypassword123", "Jordan Lee")
    assert res.email == "newstudent@finpay.edu"
    assert res.full_name == "Jordan Lee"
    assert hasattr(res, "access_token")
    assert not hasattr(res, "password_hash")

def test_duplicate_email_registration_fails(api):
    email = "duplicate@finpay.edu"
    api.register(email, "password123", "First User")
    with pytest.raises(ConflictException) as excinfo:
        api.register(email, "password456", "Second User")
    assert "already exists" in str(excinfo.value.detail)

def test_login_success(api):
    email = "logintest@finpay.edu"
    pwd = "secretpassword"
    api.register(email, pwd, "Login Tester")
    res = api.login(email, pwd)
    assert res.email == email
    assert res.token_type == "bearer"
    assert len(res.access_token) > 10

def test_login_incorrect_password_fails(api):
    email = "wrongpwd@finpay.edu"
    api.register(email, "correctpassword", "Tester")
    with pytest.raises(InvalidCredentialsException):
        api.login(email, "WRONGpassword")

def test_get_current_student_profile(auth_student, api):
    profile = api.get_me()
    assert profile.email == auth_student["email"]
    assert profile.balance == 200.00
