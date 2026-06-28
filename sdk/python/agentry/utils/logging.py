from __future__ import annotations

import logging

logging.getLogger("agentry").addHandler(logging.NullHandler())


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
