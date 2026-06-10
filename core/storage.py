"""로컬 JSON 파일 저장소 — DB 없이 data/ 폴더만 사용."""
import json
from datetime import date
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

NOTES = "notes.json"
QUESTIONS = "questions.json"
SESSIONS = "sessions.json"


def _path(name: str) -> Path:
    return DATA_DIR / name


def load(name: str) -> list:
    path = _path(name)
    if not path.exists():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def save(name: str, items: list) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    _path(name).write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def new_id(prefix: str, items: list, today: date) -> str:
    """예: q_20260610_001 — 같은 날짜의 기존 id 개수 + 1로 일련번호 부여."""
    stamp = today.strftime("%Y%m%d")
    base = f"{prefix}_{stamp}_"
    seq = sum(1 for item in items if str(item.get("id", "")).startswith(base)) + 1
    return f"{base}{seq:03d}"


def upsert_question(question: dict) -> None:
    """id가 같은 문제를 교체하거나 새로 추가."""
    questions = load(QUESTIONS)
    for i, q in enumerate(questions):
        if q.get("id") == question["id"]:
            questions[i] = question
            break
    else:
        questions.append(question)
    save(QUESTIONS, questions)


def due_questions(today: date) -> list:
    """next_review <= 오늘 인 복습 대상 문제 목록."""
    today_iso = today.isoformat()
    return [
        q for q in load(QUESTIONS)
        if q.get("sm2", {}).get("next_review", "") <= today_iso
    ]
