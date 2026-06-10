"""STEP 0 — 오늘의 학습 대시보드."""
from collections import Counter
from datetime import date

import streamlit as st

from core import storage

_FLOW_KEYS = [
    "note_text", "note_id", "concepts", "selected_concepts",
    "quiz_queue", "quiz_pos", "answered", "last_correct",
    "session_results", "review_mode", "session_saved",
]


def reset_flow() -> None:
    """새 학습/복습을 시작하기 전에 흐름 상태 초기화."""
    st.session_state.update({
        "note_text": "", "note_id": None, "concepts": [], "selected_concepts": [],
        "quiz_queue": [], "quiz_pos": 0, "answered": False, "last_correct": None,
        "session_results": [], "review_mode": False, "session_saved": False,
    })


def render() -> None:
    st.title("📘 StudyBot v3")
    st.caption("노트를 붙여넣으면 퀴즈가 되고, SM-2가 복습 일정을 관리합니다.")

    today = date.today()
    notes = storage.load(storage.NOTES)
    questions = storage.load(storage.QUESTIONS)
    due = storage.due_questions(today)

    history = [h for q in questions for h in q.get("history", [])]
    attempts = len(history)
    correct = sum(1 for h in history if h.get("correct"))
    accuracy = f"{correct / attempts * 100:.0f}%" if attempts else "—"

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("오늘 복습할 문제", f"{len(due)}개")
    c2.metric("총 노트", f"{len(notes)}개")
    c3.metric("총 문제", f"{len(questions)}개")
    c4.metric("정답률", accuracy)

    wrong_tags = Counter(
        q.get("tag", "기타")
        for q in questions
        for h in q.get("history", [])
        if not h.get("correct")
    )
    if wrong_tags:
        top3 = " · ".join(f"`{tag}` ({n}회)" for tag, n in wrong_tags.most_common(3))
        st.markdown(f"**약점 태그 Top 3:** {top3}")

    st.divider()

    col_new, col_review = st.columns(2)
    if col_new.button("📝 새 노트 학습 시작", use_container_width=True, type="primary"):
        reset_flow()
        st.session_state["step"] = 1
        st.rerun()

    review_clicked = col_review.button(
        f"🔁 오늘의 복습 시작 ({len(due)}문제)",
        use_container_width=True,
        disabled=not due,
    )
    if review_clicked:
        reset_flow()
        st.session_state["quiz_queue"] = due
        st.session_state["review_mode"] = True
        st.session_state["step"] = 4
        st.rerun()

    if not due:
        st.caption("오늘 복습할 문제가 없습니다. 새 노트로 학습을 시작해 보세요!")
