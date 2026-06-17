"""
Structured JSON logging with rotating files.

Log levels:
  DEBUG  — verbose internal state (query lists, cache keys, Duffel payloads)
  INFO   — request lifecycle, search summaries, cache hits/misses
  WARNING — recoverable errors (Duffel 422, provider timeout on one leg)
  ERROR  — unhandled exceptions, failed searches

Files (under LOG_DIR, default /var/log/goflyto or ./logs):
  app.jsonl     — all levels, JSON, 50 MB × 10 rotations  (primary)
  error.jsonl   — WARNING+, JSON, 10 MB × 5 rotations     (alerts / oncall)

Each log line is a self-contained JSON object:
  {"ts":"2026-06-17T12:34:56.789Z","level":"info","logger":"goflyto.optimizer",
   "request_id":"abc123","event":"search_complete","origins":["CMN"],...}
"""

import logging
import logging.handlers
import os
import sys
from pathlib import Path

import structlog

# ── Config ────────────────────────────────────────────────────────────────────

_LOG_DIR = Path(os.getenv("LOG_DIR", Path(__file__).parent.parent.parent / "logs"))
_LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG").upper()


def _ensure_log_dir() -> Path:
    _LOG_DIR.mkdir(parents=True, exist_ok=True)
    return _LOG_DIR


# ── Shared processors ─────────────────────────────────────────────────────────

_SHARED_PROCESSORS: list = [
    structlog.contextvars.merge_contextvars,
    structlog.stdlib.add_logger_name,
    structlog.stdlib.add_log_level,
    structlog.processors.TimeStamper(fmt="iso", utc=True, key="ts"),
    structlog.processors.StackInfoRenderer(),
    structlog.processors.ExceptionRenderer(),
]


# ── Bootstrap (call once at startup) ─────────────────────────────────────────

def configure() -> None:
    log_dir = _ensure_log_dir()
    level = getattr(logging, _LOG_LEVEL, logging.DEBUG)

    # --- stdlib root handler: app.jsonl (all levels) -------------------------
    app_handler = logging.handlers.RotatingFileHandler(
        log_dir / "app.jsonl",
        maxBytes=50 * 1024 * 1024,   # 50 MB
        backupCount=10,
        encoding="utf-8",
    )
    app_handler.setLevel(logging.DEBUG)

    # --- stdlib handler: error.jsonl (WARNING+) ------------------------------
    err_handler = logging.handlers.RotatingFileHandler(
        log_dir / "error.jsonl",
        maxBytes=10 * 1024 * 1024,   # 10 MB
        backupCount=5,
        encoding="utf-8",
    )
    err_handler.setLevel(logging.WARNING)

    # --- stdout (plain key=value for local dev tailing) ----------------------
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setLevel(logging.DEBUG)

    # Formatter that renders structlog's pre-processed event dict as JSON
    json_formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            structlog.processors.JSONRenderer(),
        ],
        foreign_pre_chain=_SHARED_PROCESSORS,
    )
    console_formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            structlog.dev.ConsoleRenderer(colors=False),
        ],
        foreign_pre_chain=_SHARED_PROCESSORS,
    )

    app_handler.setFormatter(json_formatter)
    err_handler.setFormatter(json_formatter)
    stdout_handler.setFormatter(console_formatter)

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    root.addHandler(app_handler)
    root.addHandler(err_handler)
    root.addHandler(stdout_handler)

    # Silence noisy third-party loggers
    for name in ("httpx", "httpcore", "uvicorn.access"):
        logging.getLogger(name).setLevel(logging.WARNING)

    # Wire structlog to go through stdlib so all output is unified
    structlog.configure(
        processors=_SHARED_PROCESSORS + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name)
