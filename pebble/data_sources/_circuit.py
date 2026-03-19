"""Simple per-source circuit breaker. Trips after N consecutive failures, auto-resets after cooldown."""

import logging
import time

logger = logging.getLogger("pebble.circuit")


class CircuitBreaker:
    """Trip after N consecutive failures. Auto-reset after cooldown."""

    def __init__(self, name: str, failure_threshold: int = 3, cooldown_seconds: float = 300):
        self.name = name
        self.failures = 0
        self.threshold = failure_threshold
        self.cooldown = cooldown_seconds
        self.tripped_at: float | None = None

    def is_open(self) -> bool:
        if self.tripped_at and (time.time() - self.tripped_at) > self.cooldown:
            self.reset()
        return self.failures >= self.threshold

    def record_failure(self) -> None:
        self.failures += 1
        if self.failures >= self.threshold and self.tripped_at is None:
            self.tripped_at = time.time()
            logger.warning("Circuit breaker OPEN for %s after %d failures", self.name, self.failures)

    def record_success(self) -> None:
        if self.failures > 0:
            self.failures = 0
            self.tripped_at = None

    def reset(self) -> None:
        logger.info("Circuit breaker RESET for %s", self.name)
        self.failures = 0
        self.tripped_at = None
