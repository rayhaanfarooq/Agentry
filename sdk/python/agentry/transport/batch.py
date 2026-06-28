from __future__ import annotations

import threading

from agentry.models import SDKInfo, TraceBatch, TraceRecord
from agentry.transport.base import Transport
from agentry.utils.logging import get_logger

logger = get_logger(__name__)


class BatchProcessor:
    def __init__(
        self,
        *,
        transport: Transport,
        batch_size: int,
        flush_interval_seconds: float,
        enabled: bool = True,
        auto_start: bool = True,
        sdk_version: str = "0.1.0",
    ) -> None:
        self.transport = transport
        self.batch_size = batch_size
        self.flush_interval_seconds = flush_interval_seconds
        self.enabled = enabled
        self.sdk_version = sdk_version
        self._buffer: list[TraceRecord] = []
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._flush_event = threading.Event()
        self._worker: threading.Thread | None = None

        if self.enabled and auto_start:
            self._worker = threading.Thread(
                target=self._run,
                name="agentry-batch-worker",
                daemon=True,
            )
            self._worker.start()

    def enqueue(self, trace: TraceRecord) -> None:
        if not self.enabled:
            return

        with self._lock:
            self._buffer.append(trace)
            should_flush = len(self._buffer) >= self.batch_size

        if should_flush:
            if self._worker is None:
                self.flush()
            else:
                self._flush_event.set()

    def flush(self) -> None:
        if not self.enabled:
            return

        with self._lock:
            if not self._buffer:
                return
            traces = list(self._buffer)
            self._buffer.clear()

        batch = TraceBatch(
            sdk=SDKInfo(version=self.sdk_version),
            traces=traces,
        )

        try:
            self.transport.send(batch)
        except Exception as error:
            logger.warning("Failed to flush Agentry traces: %s", error)

    def shutdown(self) -> None:
        if self._worker is not None:
            self._stop_event.set()
            self._flush_event.set()
            self._worker.join(timeout=self.flush_interval_seconds + 1)

        self.flush()

    def _run(self) -> None:
        while not self._stop_event.is_set():
            self._flush_event.wait(timeout=self.flush_interval_seconds)
            self._flush_event.clear()
            self.flush()
