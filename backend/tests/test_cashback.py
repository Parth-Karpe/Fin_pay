def test_student_cashback_empty_when_no_policy_awarded(auth_student, api):
    records = api.list_cashback()
    assert isinstance(records, list)
    # No arbitrary fake cashback generated without approval
    assert len(records) == 0
