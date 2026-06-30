from __future__ import annotations

import httpx

from runloop.config import RunloopSettings
from runloop.models import TraceBatch
from runloop.transport.retry import RetryPolicy


class TransportError(RuntimeError):
    """Raised when a batch cannot be delivered to Runloop."""


class RetryableTransportError(TransportError):
    """Raised when an upload can be retried safely."""


class HTTPTransport:
    def __init__(
        self,
        *,
        settings: RunloopSettings,
        client: httpx.Client | None = None,
        retry_policy: RetryPolicy | None = None,
    ) -> None:
        self.settings = settings
        self._client = client
        self.retry_policy = retry_policy or RetryPolicy.from_settings(settings)

    def send(self, batch: TraceBatch) -> None:
        self.retry_policy.execute(lambda: self._send_once(batch))

    def _send_once(self, batch: TraceBatch) -> None:
        payload = batch.model_dump(mode="json")
        headers = {
            "Authorization": f"Bearer {self.settings.api_key}",
            "Content-Type": "application/json",
            "X-Runloop-SDK": "python",
            "X-Runloop-SDK-Version": batch.sdk.version,
        }

        if self._client is None:
            with httpx.Client(timeout=self.settings.request_timeout_seconds) as client:
                response = client.post(
                    self.settings.traces_endpoint,
                    json=payload,
                    headers=headers,
                )
        else:
            response = self._client.post(
                self.settings.traces_endpoint,
                json=payload,
                headers=headers,
            )

        self._raise_for_response(response)

    def _raise_for_response(self, response: httpx.Response) -> None:
        if response.status_code == 429 or response.status_code >= 500:
            raise RetryableTransportError(
                f"Runloop returned retryable HTTP {response.status_code}."
            )

        if response.is_error:
            response_text = response.text.strip()
            if response_text:
                raise TransportError(
                    f"Runloop returned HTTP {response.status_code}: {response_text}"
                )
            raise TransportError(f"Runloop returned HTTP {response.status_code}.")
