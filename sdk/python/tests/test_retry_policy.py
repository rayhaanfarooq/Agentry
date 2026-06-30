from pytest import MonkeyPatch
from runloop.transport import RetryPolicy


def test_retry_policy_retries_until_success(monkeypatch: MonkeyPatch) -> None:
    calls = {"count": 0}
    delays: list[float] = []

    def fake_sleep(delay: float) -> None:
        delays.append(delay)

    def flaky_operation() -> str:
        calls["count"] += 1
        if calls["count"] < 3:
            raise RuntimeError("temporary")
        return "ok"

    monkeypatch.setattr("runloop.transport.retry.time.sleep", fake_sleep)

    policy = RetryPolicy(
        max_attempts=3,
        initial_backoff_seconds=0.1,
        max_backoff_seconds=1.0,
    )

    result = policy.execute(flaky_operation)

    assert result == "ok"
    assert calls["count"] == 3
    assert delays == [0.1, 0.2]
