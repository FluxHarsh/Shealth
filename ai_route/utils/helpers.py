from typing import Optional
from models.schemas import QAItem, Vitals


def format_qa(qa: list[QAItem]) -> str:
    lines = []
    for i, item in enumerate(qa, 1):
        lines.append(f"Q{i} [{item.category or 'general'}]: {item.question}")
        if item.answer:
            lines.append(f"A{i}: {item.answer}")
    return "\n".join(lines)