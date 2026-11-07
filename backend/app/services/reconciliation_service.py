from sqlalchemy.orm import Session
from backend.app.core.exceptions import ConflictException, ResourceNotFoundException
from backend.app.models.reconciliation import ReconciliationRun
from backend.app.schemas.reconciliation import ReconciliationRunCreate

class ReconciliationService:
    @staticmethod
    def create_reconciliation_run(db: Session, data: ReconciliationRunCreate) -> ReconciliationRun:
        """
        Maintains records of monthly reconciliation executions.
        Enforces UNIQUE month constraint as approved in data model.
        """
        existing = db.query(ReconciliationRun).filter(ReconciliationRun.month == data.month).first()
        if existing:
            raise ConflictException(f"A reconciliation run for month {data.month} already exists")

        run = ReconciliationRun(
            month=data.month,
            status=data.status,
            notes=data.notes
        )
        try:
            db.add(run)
            db.commit()
            db.refresh(run)
            return run
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_all_reconciliation_runs(db: Session) -> list[ReconciliationRun]:
        return db.query(ReconciliationRun).order_by(ReconciliationRun.run_at.desc()).all()

    @staticmethod
    def get_reconciliation_run_by_id(db: Session, run_id: int) -> ReconciliationRun:
        run = db.query(ReconciliationRun).filter(ReconciliationRun.run_id == run_id).first()
        if not run:
            raise ResourceNotFoundException("Reconciliation run")
        return run
