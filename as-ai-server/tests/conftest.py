"""
Shared test fixtures.

Keep the test suite hermetic: it must never call the live Claude API, so it
behaves identically on a developer laptop (key set or not) and on CI (no key).
The Claude path is validated manually via `python demo.py`, not in unit tests —
unit tests shouldn't depend on a paid network service or a developer's env.

This autouse fixture removes ANTHROPIC_API_KEY for the duration of each test,
which forces intent extraction down the deterministic offline path.
"""

import pytest


@pytest.fixture(autouse=True)
def _force_offline_extraction(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
