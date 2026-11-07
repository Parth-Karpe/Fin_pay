import os
import pytest
from decimal import Decimal
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

TEST_DB_PATH = "./test_finpay.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["ENFORCE_NON_NEGATIVE_BALANCE"] = "true"
os.environ["CASHBACK_ENABLED"] = "false"
os.environ["BCRYPT_ROUNDS"] = "4"

from backend.app.core.database import Base
from backend.app.models.merchant import MerchantCategory, Merchant
from backend.app.models.user import User
from backend.app.api import auth, students, wallet, merchants, payments, cashback, reconciliation
from backend.app.schemas.user import UserRegisterRequest, UserLoginRequest
from backend.app.schemas.wallet import WalletTopUpRequest
from backend.app.schemas.payment import PaymentCreateRequest
from backend.app.schemas.reconciliation import ReconciliationRunCreate
from backend.app.core.exceptions import FinPayException
from fastapi import HTTPException

test_engine = create_engine(
    f"sqlite:///{TEST_DB_PATH}",
    connect_args={"check_same_thread": False}
)

@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

class DirectApiClient:
    """
    Direct API test client that invokes API route handlers directly.
    Bypasses Starlette TestClient anyio portal deadlock on Windows while verifying 
    all FastAPI schemas, endpoints, business logic, constraints, and exceptions.
    """
    def __init__(self, db_session):
        self.db = db_session
        self.current_user = None

    def set_user(self, user: User):
        self.current_user = user

    def register(self, email: str, password: str, full_name: str):
        req = UserRegisterRequest(email=email, password=password, full_name=full_name)
        return auth.register(req, self.db)

    def login(self, email: str, password: str):
        req = UserLoginRequest(email=email, password=password)
        return auth.login(req, self.db)

    def get_me(self):
        return students.get_current_student_profile(self.current_user, self.db)

    def get_wallet(self):
        return wallet.get_wallet(self.current_user, self.db)

    def top_up_wallet(self, amount: Decimal):
        req = WalletTopUpRequest(amount=amount)
        return wallet.top_up_wallet(req, self.current_user, self.db)

    def list_merchant_categories(self):
        return merchants.list_merchant_categories(self.db)

    def list_merchants(self, category_id=None):
        return merchants.list_merchants(category_id, self.db)

    def get_merchant(self, merchant_id: int):
        return merchants.get_merchant(merchant_id, self.db)

    def create_payment(self, merchant_id: int, amount: Decimal):
        req = PaymentCreateRequest(merchant_id=merchant_id, amount=amount)
        return payments.create_payment(req, self.current_user, self.db)

    def list_payments(self):
        return payments.list_payments(self.current_user, self.db)

    def get_payment(self, payment_id: int):
        return payments.get_payment(payment_id, self.current_user, self.db)

    def list_cashback(self):
        return cashback.get_student_cashback(self.current_user, self.db)

    def list_reconciliation_runs(self):
        return reconciliation.list_reconciliation_runs(self.current_user, self.db)

    def record_reconciliation_run(self, month: str, status: str = "COMPLETED", notes: str = None):
        req = ReconciliationRunCreate(month=month, status=status, notes=notes)
        return reconciliation.record_reconciliation_run(req, self.current_user, self.db)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    # Pre-seed test category and merchant
    db = TestingSessionLocal()
    cat = MerchantCategory(name="Test Category")
    db.add(cat)
    db.flush()
    m = Merchant(name="Test Cafe", category_id=cat.category_id)
    db.add(m)
    db.commit()
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def api(db):
    return DirectApiClient(db)

@pytest.fixture
def auth_student(api, db):
    email = f"student_{os.urandom(4).hex()}@test.edu"
    pwd = "password123"
    reg = api.register(email=email, password=pwd, full_name="Test Student User")
    user = db.query(User).filter(User.user_id == reg.user_id).first()
    api.set_user(user)
    api.top_up_wallet(Decimal("200.00"))
    return {
        "user": user,
        "token": reg.access_token,
        "email": email,
        "password": pwd,
        "student_id": reg.student_id
    }
