import pytest
from backend.app.core.exceptions import ConflictException

def test_create_and_list_reconciliation_runs(auth_student, api):
    # 1. Create run for 2026-10
    run = api.record_reconciliation_run(
        month="2026-10",
        status="COMPLETED",
        notes="October reconciliation execution record."
    )
    assert run.month == "2026-10"
    assert run.status == "COMPLETED"

    # 2. Duplicate month should raise ConflictException (409)
    with pytest.raises(ConflictException):
        api.record_reconciliation_run(
            month="2026-10",
            status="COMPLETED",
            notes="Duplicate attempt"
        )

    # 3. List runs
    runs = api.list_reconciliation_runs()
    assert any(r.month == "2026-10" for r in runs)
