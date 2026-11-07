from decimal import Decimal
from backend.app.core.database import SessionLocal, engine, Base
from backend.app.models.user import User
from backend.app.models.student import Student
from backend.app.models.wallet import Wallet
from backend.app.models.merchant import MerchantCategory, Merchant
from backend.app.core.security import hash_password

def seed_database():
    """Seeds initial merchant categories, merchants, and a demo student account."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed Categories if empty
        if db.query(MerchantCategory).count() == 0:
            print("Seeding Merchant Categories...")
            categories_data = [
                "Campus Canteen & Dining",
                "Bookstore & Stationery",
                "Hostel & Laundry Services",
                "Print & Photocopy Center",
                "Campus Pharmacy & Health"
            ]
            category_map = {}
            for name in categories_data:
                cat = MerchantCategory(name=name)
                db.add(cat)
                db.flush()
                category_map[name] = cat.category_id

            # 2. Seed Merchants
            print("Seeding Merchants...")
            merchants_data = [
                ("Central Cafeteria", "Campus Canteen & Dining"),
                ("Nescafe Corner", "Campus Canteen & Dining"),
                ("University Bookstore", "Bookstore & Stationery"),
                ("Student Stationery Hub", "Bookstore & Stationery"),
                ("Campus Laundromat", "Hostel & Laundry Services"),
                ("QuickPrint & Xerox Center", "Print & Photocopy Center"),
                ("MediCare Student Pharmacy", "Campus Pharmacy & Health"),
            ]
            for m_name, cat_name in merchants_data:
                merchant = Merchant(name=m_name, category_id=category_map[cat_name])
                db.add(merchant)

            db.commit()
            print("Categories and Merchants seeded successfully.")

        # 3. Seed Demo Student if not exists
        demo_email = "student@finpay.edu"
        demo_user = db.query(User).filter(User.email == demo_email).first()
        if not demo_user:
            print("Seeding Demo Student account (student@finpay.edu / password123)...")
            user = User(
                email=demo_email,
                password_hash=hash_password("password123"),
                is_active=True
            )
            db.add(user)
            db.flush()

            student = Student(
                user_id=user.user_id,
                full_name="Alex Mercer"
            )
            db.add(student)
            db.flush()

            # Seed wallet with 500.00 for testing
            wallet = Wallet(
                student_id=student.student_id,
                balance=Decimal("500.00")
            )
            db.add(wallet)
            db.commit()
            print("Demo student created with initial balance $500.00.")

        print("Database seed completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
