"""SM-2 및 채점 로직 단위 테스트."""
from datetime import date

from core import sm2
from core.grader import grade, grade_multiple_choice, grade_short_answer, normalize

TODAY = date(2026, 6, 10)


# ── SM-2 ─────────────────────────────────────────────────────────────────────

def test_new_state_defaults():
    state = sm2.new_state(TODAY)
    assert state == {"easiness": 2.5, "interval": 0, "repetitions": 0, "next_review": "2026-06-10"}


def test_quality_mapping():
    assert sm2.quality_from_result("multiple_choice", True) == 5
    assert sm2.quality_from_result("multiple_choice", False) == 2
    assert sm2.quality_from_result("short_answer", True) == 5
    assert sm2.quality_from_result("short_answer", False) == 1


def test_first_correct_answer_schedules_next_day():
    state = sm2.update(sm2.new_state(TODAY), quality=5, today=TODAY)
    assert state["repetitions"] == 1
    assert state["interval"] == 1
    assert state["next_review"] == "2026-06-11"
    assert state["easiness"] == 2.6


def test_second_correct_answer_schedules_six_days():
    state = sm2.new_state(TODAY)
    state = sm2.update(state, quality=5, today=TODAY)
    state = sm2.update(state, quality=5, today=date(2026, 6, 11))
    assert state["repetitions"] == 2
    assert state["interval"] == 6
    assert state["next_review"] == "2026-06-17"


def test_third_correct_answer_multiplies_by_easiness():
    state = sm2.new_state(TODAY)
    state = sm2.update(state, quality=5, today=TODAY)          # interval 1
    state = sm2.update(state, quality=5, today=TODAY)          # interval 6
    easiness_before = state["easiness"]
    state = sm2.update(state, quality=5, today=TODAY)
    assert state["repetitions"] == 3
    assert state["interval"] == round(6 * easiness_before)


def test_wrong_answer_resets_progress():
    state = sm2.new_state(TODAY)
    state = sm2.update(state, quality=5, today=TODAY)
    state = sm2.update(state, quality=5, today=TODAY)
    state = sm2.update(state, quality=2, today=TODAY)
    assert state["repetitions"] == 0
    assert state["interval"] == 1
    assert state["next_review"] == "2026-06-11"


def test_easiness_never_drops_below_floor():
    state = sm2.new_state(TODAY)
    for _ in range(10):
        state = sm2.update(state, quality=1, today=TODAY)
    assert state["easiness"] == 1.3


def test_easiness_decreases_on_low_quality():
    state = sm2.update(sm2.new_state(TODAY), quality=2, today=TODAY)
    # 2.5 + 0.1 - 3 * (0.08 + 3 * 0.02) = 2.18
    assert abs(state["easiness"] - 2.18) < 1e-9


# ── 채점 ─────────────────────────────────────────────────────────────────────

def test_normalize_strips_case_space_punctuation():
    assert normalize("  LangGraph 노드! ") == "langgraph노드"
    assert normalize("SM-2") == "sm2"


def test_multiple_choice_grading():
    assert grade_multiple_choice(2, 2) is True
    assert grade_multiple_choice(0, 2) is False


def test_short_answer_accepts_any_keyword():
    assert grade_short_answer("어텐션 메커니즘입니다", "어텐션", ["attention"]) is True
    assert grade_short_answer("Attention!", "어텐션", ["attention"]) is True
    assert grade_short_answer("모르겠어요", "어텐션", ["attention"]) is False


def test_short_answer_empty_input_is_wrong():
    assert grade_short_answer("   ", "정답", []) is False


def test_grade_dispatch():
    mc = {"type": "multiple_choice", "answer_index": 1}
    sa = {"type": "short_answer", "answer": "역전파", "accepted_keywords": ["backprop"]}
    assert grade(mc, 1) is True
    assert grade(mc, 3) is False
    assert grade(sa, "역전파 알고리즘") is True
    assert grade(sa, "순전파") is False
