"""StudyBot — 고정 워크플로우형 학습 앱 (Streamlit 진입점, 단계 라우팅)."""
import os

import streamlit as st
from dotenv import load_dotenv

from ui import concepts, dashboard, note_input, quiz, result

load_dotenv()

st.set_page_config(page_title="StudyBot", page_icon="📘", layout="centered")

STEP_LABELS = ["① 노트", "② 개념", "③ 퀴즈 생성", "④ 풀기", "⑤ 결과"]

_DEFAULTS = {
    "step": 0,
    "note_text": "",
    "note_id": None,
    "concepts": [],
    "selected_concepts": [],
    "quiz_queue": [],
    "quiz_pos": 0,
    "answered": False,
    "last_correct": None,
    "session_results": [],
    "review_mode": False,
    "session_saved": False,
}


def _init_state() -> None:
    for key, value in _DEFAULTS.items():
        st.session_state.setdefault(key, value)


def _render_sidebar() -> None:
    with st.sidebar:
        st.markdown("### 🔑 Gemini API Key")
        st.markdown(
            '<a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio에서 발급받기</a>',
            unsafe_allow_html=True,
        )
        env_key = os.getenv("GEMINI_API_KEY", "")
        api_key = st.text_input(
            "Gemini API Key",
            value=env_key if env_key.startswith("AIza") else "",
            type="password",
            placeholder="AIza...",
        )
        st.session_state["api_key"] = api_key.strip()
        st.caption("키는 세션 안에서만 사용되며 저장되지 않습니다.")


def _render_progress(step: int) -> None:
    """현재 단계를 굵게 표시한 진행바: ① 노트 → ② 개념 → ③ 퀴즈 생성 → ④ 풀기 → ⑤ 결과"""
    parts = []
    for i, label in enumerate(STEP_LABELS, start=1):
        parts.append(f"**:blue[{label}]**" if i == step else f":gray[{label}]")
    st.markdown(" → ".join(parts))
    st.divider()


def main() -> None:
    _init_state()
    _render_sidebar()

    step = st.session_state["step"]
    if step >= 1:
        _render_progress(step)

    if step == 0:
        dashboard.render()
    elif step == 1:
        note_input.render()
    elif step == 2:
        concepts.render()
    elif step in (3, 4):
        quiz.render()
    elif step == 5:
        result.render()


main()
