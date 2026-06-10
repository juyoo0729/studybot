"""SM-2 간격 반복 알고리즘 (순수 함수, 외부 라이브러리 없음)."""
from datetime import date, timedelta

DEFAULT_EASINESS = 2.5
MIN_EASINESS = 1.3


def new_state(today: date) -> dict:
    """새 문제의 초기 SM-2 상태."""
    return {
        "easiness": DEFAULT_EASINESS,
        "interval": 0,
        "repetitions": 0,
        "next_review": today.isoformat(),
    }


def quality_from_result(question_type: str, correct: bool) -> int:
    """채점 결과를 SM-2 quality(0~5)로 변환.

    객관식: 정답 5 / 오답 2
    단답형: 정답 5 / 오답 1
    """
    if correct:
        return 5
    return 2 if question_type == "multiple_choice" else 1


def update(state: dict, quality: int, today: date) -> dict:
    """표준 SM-2 공식으로 상태를 갱신한 새 dict를 반환."""
    easiness = state.get("easiness", DEFAULT_EASINESS)
    interval = state.get("interval", 0)
    repetitions = state.get("repetitions", 0)

    if quality < 3:
        repetitions = 0
        interval = 1
    else:
        repetitions += 1
        if repetitions == 1:
            interval = 1
        elif repetitions == 2:
            interval = 6
        else:
            interval = round(interval * easiness)

    easiness = max(MIN_EASINESS, easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    return {
        "easiness": easiness,
        "interval": interval,
        "repetitions": repetitions,
        "next_review": (today + timedelta(days=interval)).isoformat(),
    }
