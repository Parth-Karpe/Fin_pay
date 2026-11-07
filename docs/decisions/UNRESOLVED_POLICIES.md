# Unresolved Business Decisions & Isolation Strategy

As documented in the approved Lab 4 Detailed Design (`FinPay_Lab4_Detailed_Design_Filled(1).docx`), four business questions remain explicitly unresolved. The implementation complies strictly with the instruction to isolate these policies without inventing unauthorized business rules.

---

### Question 1: Cashback Policy
- **Open Issue**: What makes a payment eligible for cashback, and how is the cashback amount calculated?
- **Prohibited Actions**: Do not invent a fixed percentage, category-based percentages, minimum payment thresholds, maximum caps, or payment amount tiers.
- **Implemented Solution**:
  - Entity `CASHBACK` is fully modeled with `payment_id FK UNIQUE` (1:0..1 relationship).
  - Business logic is encapsulated in `CashbackService.evaluate_cashback_policy(...)`.
  - Configurable via `CASHBACK_ENABLED=false` (default). No artificial cashback is awarded to students unless an approved policy is activated.

---

### Question 2: Reconciliation Policy
- **Open Issue**: What exactly should monthly reconciliation match payments against?
- **Prohibited Actions**: Do not assume external bank statements, payment gateways, or third-party APIs.
- **Implemented Solution**:
  - Implements the complete record-management foundation via `RECONCILIATION_RUNS`.
  - Tracks `run_id`, unique `month` (`YYYY-MM`), execution timestamp `run_at`, `status`, and operational `notes`.
  - Actual matching logic remains pending confirmation.

---

### Question 3: Negative Wallet Balance Policy
- **Open Issue**: Can a student's wallet balance become negative, or must sufficient balance always be available?
- **Prohibited Actions**: Do not add an unconditional irreversible database-level non-negative constraint (`CHECK balance >= 0`).
- **Implemented Solution**:
  - Controlled dynamically at the service layer via application setting `ENFORCE_NON_NEGATIVE_BALANCE`.
  - When set to `true` (default), `makePayment` verifies `wallet.balance >= amount` and rolls back with `InsufficientBalanceException` if funds are inadequate.
  - Can be switched to `false` if student overdraft credit is approved in the future without schema migrations.

---

### Question 4: Additional Roles and Operator Permissions
- **Open Issue**: Are there roles beyond students, such as a dedicated operator who runs monthly reconciliation?
- **Prohibited Actions**: Do not invent arbitrary roles (e.g., ADMIN, AUDITOR) in JWT tokens without formal approval.
- **Implemented Solution**:
  - All users authenticate via standard JWT credentials.
  - Ownership verification is strictly enforced at the service layer (each student accesses only their own wallet and transaction history).
  - Monthly reconciliation endpoints are maintained on a separate resource path for operational management.
