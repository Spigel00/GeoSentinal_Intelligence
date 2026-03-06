"""Client for fetching rainfall/weather-like data from data.gov.in resources."""

from __future__ import annotations

import json
import os
import time
from typing import Any, Dict, List, Optional
from urllib import error, parse, request


class WeatherClient:
    """HTTP client wrapper around data.gov.in rainfall dataset API."""

    def __init__(self) -> None:
        self.base_url = os.getenv(
            "INDIAN_WEATHER_BASE_URL",
            "https://api.data.gov.in/resource/6c05cd1b-ed59-40c2-bc31-e314f39c6971",
        )
        self.api_key = os.getenv("INDIAN_WEATHER_API_KEY", "")
        self.timeout_seconds = float(os.getenv("INDIAN_WEATHER_TIMEOUT_SECONDS", "8"))
        self.max_retries = int(os.getenv("INDIAN_WEATHER_MAX_RETRIES", "2"))
        self.retry_backoff_seconds = float(os.getenv("INDIAN_WEATHER_RETRY_BACKOFF_SECONDS", "0.5"))

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def get_current_weather(self, lat: float, lon: float, state_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch latest rainfall record for a state.

        Args:
            lat: Latitude of region (kept for response context)
            lon: Longitude of region (kept for response context)
            state_name: State filter used against data.gov.in dataset
        """
        params = {
            "api-key": self.api_key,
            "format": "json",
            "limit": "1",
            "sort[Date]": "desc",
        }
        if state_name:
            params["filters[State]"] = state_name

        url = f"{self.base_url}?{parse.urlencode(params)}"

        req = request.Request(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                ),
            },
            method="GET",
        )

        last_error: Optional[RuntimeError] = None
        for attempt in range(self.max_retries + 1):
            try:
                with request.urlopen(req, timeout=self.timeout_seconds) as response:
                    response_body = response.read().decode("utf-8")
                    parsed: Dict[str, Any] = json.loads(response_body)
                    records = parsed.get("records", [])
                    if not records:
                        raise RuntimeError(
                            f"No rainfall records found for state '{state_name or 'UNKNOWN'}'"
                        )

                    latest = records[0]
                    return {
                        "source": "data.gov.in",
                        "dataset": parsed.get("title"),
                        "query": {
                            "state": state_name,
                            "lat": lat,
                            "lon": lon,
                        },
                        "latest_record": {
                            "State": latest.get("State"),
                            "District": latest.get("District"),
                            "Date": latest.get("Date"),
                            "Year": latest.get("Year"),
                            "Month": latest.get("Month"),
                            "Avg_rainfall": latest.get("Avg_rainfall"),
                            "Agency_name": latest.get("Agency_name"),
                        },
                        "total": parsed.get("total"),
                    }
            except error.HTTPError as exc:
                body: Optional[str] = None
                try:
                    body = exc.read().decode("utf-8")
                except Exception:
                    body = None
                # HTTP errors are unlikely to succeed by retrying immediately.
                raise RuntimeError(f"Weather API HTTP {exc.code}: {body or exc.reason}") from exc
            except error.URLError as exc:
                last_error = RuntimeError(f"Weather API connection error: {exc.reason}")
            except TimeoutError:
                last_error = RuntimeError("Weather API request timed out")
            except json.JSONDecodeError:
                raise RuntimeError("Weather API returned invalid JSON")

            if attempt < self.max_retries:
                time.sleep(self.retry_backoff_seconds * (attempt + 1))

        if last_error:
            raise last_error
        raise RuntimeError("Weather API request failed")
