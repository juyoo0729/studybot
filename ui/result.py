"""STEP 5 — 결과 요약 + SM-2 복습 스케줄 안내."""
from collections import Counter
from datetime import date

import streamlit as st

from core import storage
from ui.dashboard import reset_flow


def _format_korean_date(iso_date: str) -> str:
    y, m, d = iso_date.split("-")
    return f"{int(m)}월 {int(d)}일"


def _save_session_once(results: list) -> None:
    if st.session_state["session_saved"]:
        return
    sessions = storage.load(storage.SESSIONS)
    sessions.append({
        "date": date.today().isoformat(),
        "mode": "review" if st.session_state["review_mode"] else "new",
        "score": sum(1 for r in results if r["correct"]),
        "total": len(results),
        "wrong_concepts": [r["concept"] for r in results if not r["correct"]],
    })
    storage.save(storage.SESSIONS, sessions)
    st.session_state["session_saved"] = True


def render() -> None:
    st.subheader("⑤ 결과")
    results = st.session_state["session_results"]
    if not results:
        st.info("결과가 없습니다.")
        if st.button("← 대시보드로"):
            st.session_state["step"] = 0
            st.rerun()
        return

    _save_session_once(results)

    score = sum(1 for r in results if r["correct"])
    st.metric("점수", f"{score} / {len(results)}")

    wrong = [r for r in results if not r["correct"]]
    if wrong:
        st.markdown("#### ❌ 오답 노트")
        for r in wrong:
            with st.container(border=True):
                st.markdown(f"**{r['question']}**")
                st.markdown(f"정답: **{r['correct_answer']}** · 개념: `{r['concept']}`")
                if r["explanation"]:
                    st.caption(f"💡 {r['explanation']}")
    else:
        st.success("🎉 전부 정답입니다!")

    st.markdown("#### 📅 다음 복습 예정")
    schedule = Counter(r["next_review"] for r in results)
    for review_date in sorted(schedule):
        st.markdown(f"- {schedule[review_date]}문제 → **{_format_korean_date(review_date)}**")

    st.divider()
    if st.button("🏠 대시보드로 돌아가기", type="primary", use_container_width=True):
        reset_flow()
        st.session_state["step"] = 0
        st.rerun()
