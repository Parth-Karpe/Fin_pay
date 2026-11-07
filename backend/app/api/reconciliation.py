from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.reconciliation import ReconciliationRunCreate, ReconciliationRunResponse
from backend.app.services.reconciliation_service import ReconciliationService

router = APIRouter(prefix="/reconciliation", tags=["Reconciliation"])

@router.get("/runs", response_model=list[ReconciliationRunResponse])
def list_reconciliation_runs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the audit trail of monthly reconciliation executions.
    Preserves execution timestamp, status, and reconciliation notes.
    """
    return ReconciliationService.get_all_reconciliation_runs(db)

@router.post("/runs", response_model=ReconciliationRunResponse, status_code=status.HTTP_201_CREATED)
def record_reconciliation_run(
    request: ReconciliationRunCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Records a monthly reconciliation execution.
    Enforces uniqueness per month (YYYY-MM).
    Note: Reconciliation matching rules and administrative operator role remain open design questions.
    """
    return ReconciliationService.create_reconciliation_run(db, request)
