# FinPay - Development Status Tracker

## Overview
- **System**: FinPay (Student Digital Wallet & Payment Management System)
- **Authoritative Reference**: `FinPay_Lab4_Detailed_Design_Filled(1).docx`, Lab 3 ADR-001 (`table.md`)
- **Architecture**: Modular Monolith (ADR-001 Accepted)
- **Database**: Relational Single Source of Truth (SQLite Simple DB by default; PostgreSQL supported)
- **Authentication**: JWT token-based authentication + router auth + service-level resource ownership checks

---

## Progress Summary

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 0** | Repository & Architecture Inspection | **Completed** |
| **Phase 1** | Database Implementation (8 Entities, Constraints, 3NF Normalization) | **Completed** |
| **Phase 2** | Backend Foundation (FastAPI, DB Session, Error Handling, OpenAPI) | **Completed** |
| **Phase 3** | Authentication & Student Management (JWT, Bcrypt, Profile Isolation) | **Completed** |
| **Phase 4** | Merchant & Wallet Modules (Listing, Categories, Ownership Checks) | **Completed** |
| **Phase 5** | Payment Processing (`makePayment`, Atomic Tx, Row Lock, Concurrency) | **Completed** |
| **Phase 6** | Cashback & Reconciliation Foundation (Record Management, Unresolved Isolation) | **Completed** |
| **Phase 7** | Frontend Implementation (React, Dashboard, Wallet, Pay, History, Cashback) | **Completed** |
| **Phase 8** | Integration & Security Testing (26 Automated Test Cases Passed) | **Completed** |
| **Phase 9** | Documentation & Final Delivery (ERD, API Specs, Setup Guides, README) | **Completed** |

---

## Files Created / Modified

### Backend Core & Models
- `backend/app/core/config.py`: Environment configuration and policy settings.
- `backend/app/core/database.py`: SQLAlchemy engine, session maker, SQLite foreign key pragma listener.
- `backend/app/core/security.py`: Bcrypt password hashing and JWT token creation/verification.
- `backend/app/core/exceptions.py`: Custom HTTP exceptions.
- `backend/app/models/user.py`: `User` entity (email unique, password_hash, is_active).
- `backend/app/models/student.py`: `Student` entity (user_id FK unique).
- `backend/app/models/wallet.py`: `Wallet` entity (student_id FK unique, Numeric 12,2 balance).
- `backend/app/models/merchant.py`: `MerchantCategory` and `Merchant` entities.
- `backend/app/models/payment.py`: `Payment` entity with `amount > 0` check constraint.
- `backend/app/models/cashback.py`: `Cashback` entity with `payment_id FK unique` (1:0..1).
- `backend/app/models/reconciliation.py`: `ReconciliationRun` entity with `month unique`.
- `backend/app/models/__init__.py`: Consolidated model exports.

### Backend Schemas & Services
- `backend/app/schemas/`: Pydantic request/response models with password hash exclusion.
- `backend/app/services/auth_service.py`: User registration (atomic creation of user, student, wallet) and login.
- `backend/app/services/wallet_service.py`: Service-level ownership checks and wallet balance management.
- `backend/app/services/merchant_service.py`: Categories and merchants query service.
- `backend/app/services/payment_service.py`: Atomic `makePayment` algorithm with balance deduction, payment creation, locking, and rollback.
- `backend/app/services/cashback_service.py`: Isolated cashback policy interface and record queries.
- `backend/app/services/reconciliation_service.py`: Monthly reconciliation run tracking and duplicate month prevention.

### Backend API Routers & Main
- `backend/app/api/deps.py`: `get_current_user` JWT bearer dependency.
- `backend/app/api/auth.py`: `/auth/register` and `/auth/login`.
- `backend/app/api/students.py`: `/students/me`.
- `backend/app/api/wallet.py`: `/wallet` and `/wallet/topup`.
- `backend/app/api/merchants.py`: `/merchants` and `/merchant-categories`.
- `backend/app/api/payments.py`: `/payments` (make payment, history, detail).
- `backend/app/api/cashback.py`: `/cashback`.
- `backend/app/api/reconciliation.py`: `/reconciliation/runs`.
- `backend/app/main.py`: FastAPI application, CORS, static frontend mount, OpenAPI docs.
- `backend/seed/seed_data.py`: Seed script for categories, merchants, and demo student.

### Frontend Application
- `frontend/src/services/api.js`: Centralized REST API client with JWT bearer header injection.
- `frontend/src/context/AuthContext.jsx`: Authentication, session, and wallet state management.
- `frontend/src/components/Navbar.jsx`: Navigation bar with balance indicator and student profile.
- `frontend/src/pages/AuthPage.jsx`: Student login and registration with quick demo account fill.
- `frontend/src/pages/Dashboard.jsx`: Student dashboard with balance card, quick actions, and recent transactions.
- `frontend/src/pages/WalletPage.jsx`: Personal wallet overview, balance deposit modal, and ownership status.
- `frontend/src/pages/MerchantsPage.jsx`: Live merchant directory with category filters.
- `frontend/src/pages/PaymentPage.jsx`: Atomic payment form with balance check and receipt modal.
- `frontend/src/pages/HistoryPage.jsx`: Filterable payment history table isolated to the student.
- `frontend/src/pages/CashbackPage.jsx`: Authentic cashback records view with policy transparency.
- `frontend/src/pages/ReconciliationPage.jsx`: Monthly reconciliation run log management.
- `frontend/src/App.jsx`: Main application container.
- `frontend/src/index.css`: Responsive Fintech design system.
- `frontend/dist/`: Production build bundle.

### Documentation & Tests
- `backend/tests/`: 26 automated unit, integration, and security tests.
- `docs/database/ERD.md`: Full Mermaid ER diagram and table constraints.
- `docs/api/API_REFERENCE.md`: Complete OpenAPI endpoint reference.
- `docs/decisions/UNRESOLVED_POLICIES.md`: The 4 unresolved business questions.
- `.env.example`: Environment variables template.
- `README.md`: Comprehensive project guide and setup instructions.

---

## Test Execution Summary
- **Test Framework**: Pytest 8.4
- **Executed Tests**: 26
- **Passed Tests**: 26 (100% Pass Rate)
- **Execution Time**: 1.86s
- **Coverage Areas**:
  - Registration & Login (valid, duplicate, bad password, inactive user).
  - Password Hash Security (never leaked).
  - Student Profile & Service-Layer Wallet Ownership.
  - Merchant & Category Retrieval.
  - Payment Processing (`makePayment`, zero amount, negative amount, insufficient funds, exact balance, history isolation).
  - Atomic Transaction Rollback.
  - Cashback Linkage.
  - Reconciliation Run Uniqueness (`month` format & conflict).
  - Cross-User Access Prevention.

---

## Unresolved Business Decisions (Handled Safely as Specified)
1. **Cashback Policy**: Eligibility criteria and amount calculation formula are isolated in `CashbackService`. No arbitrary cashback percentage is awarded.
2. **Reconciliation Policy**: Audit record management implemented (`RECONCILIATION_RUNS`). No external bank or payment gateway matching is assumed.
3. **Negative Wallet Balance**: Configurable via `ENFORCE_NON_NEGATIVE_BALANCE=true` at the service layer without hardcoded irreversible DB check constraints.
4. **Additional Roles**: No unapproved administrative roles are added.

---

## Acceptance Criteria Verification
- [x] Simple relational database operational (SQLite default, PostgreSQL supported).
- [x] All eight approved entities implemented in 3NF.
- [x] All approved relationships and constraints enforced.
- [x] Registration works.
- [x] Login works with bcrypt and JWT.
- [x] Protected endpoints work.
- [x] Student-wallet ownership enforced at service layer.
- [x] Merchant listing works from database.
- [x] Wallet information retrieved correctly.
- [x] Payment processing (`makePayment`) works atomically.
- [x] Concurrent payment processing protected via row locking.
- [x] Transaction history works and is strictly isolated.
- [x] Cashback records linked correctly (1:0..1).
- [x] Reconciliation run records maintained with unique month constraint.
- [x] Frontend and backend fully integrated.
- [x] Automated tests execute successfully (26 passed).
- [x] Security-sensitive information protected.
- [x] Documentation complete.
- [x] No unresolved business rule silently invented.
